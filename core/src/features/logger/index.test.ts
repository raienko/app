import logger, { createLogger, type Logger } from "./index";

const METHODS: (keyof Logger)[] = [
  "log",
  "warn",
  "error",
  "success",
  "out",
  "in",
  "failed",
];

describe("logger", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it.each(METHODS)(
    "styles and forwards %s values through console.log",
    (type) => {
      const consoleLog = jest
        .spyOn(console, "log")
        .mockImplementation(() => {});
      const details = { requestId: "example" };

      logger[type]("message", details);

      expect(consoleLog).toHaveBeenCalledWith(
        expect.stringMatching(/^%c .+ %c$/),
        expect.stringContaining("background:"),
        expect.any(String),
        "message",
        details,
      );
    },
  );

  it("does nothing when debug logging is disabled", () => {
    const consoleLog = jest.spyOn(console, "log").mockImplementation(() => {});
    const disabled = createLogger(false);

    for (const method of METHODS) disabled[method]("hidden");

    expect(consoleLog).not.toHaveBeenCalled();
  });

  /**
   * `%c` only means anything to a browser-style console. In the Metro
   * terminal it prints literally, so the icon is the only thing separating
   * one level from another there.
   */
  it("puts a distinct icon in every badge", () => {
    const consoleLog = jest.spyOn(console, "log").mockImplementation(() => {});

    for (const method of METHODS) logger[method]("message");

    const icons = consoleLog.mock.calls.map(
      ([badge]) => String(badge).replace(/%c/g, "").trim().split(" ")[0],
    );
    expect(new Set(icons).size).toBe(METHODS.length);
    expect(icons.every((icon) => /\p{Extended_Pictographic}/u.test(icon))).toBe(
      true,
    );
  });

  it("names the level in the badge, not in the message", () => {
    const consoleLog = jest.spyOn(console, "log").mockImplementation(() => {});

    logger.success("Profile saved");

    const [badge, , , message] = consoleLog.mock.calls[0];
    expect(badge).toContain("SUCCESS");
    // Left as its own argument so DevTools keeps values expandable rather
    // than flattening them into the format string.
    expect(message).toBe("Profile saved");
  });

  it("gives every method a distinct label and badge color", () => {
    const consoleLog = jest.spyOn(console, "log").mockImplementation(() => {});

    for (const method of METHODS) logger[method]("message");

    const labels = consoleLog.mock.calls.map(([label]) => label);
    const styles = consoleLog.mock.calls.map(([, style]) => style);
    expect(new Set(labels).size).toBe(METHODS.length);
    expect(new Set(styles).size).toBe(METHODS.length);
  });
});
