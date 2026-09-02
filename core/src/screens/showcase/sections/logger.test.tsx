import { fireEvent, render, screen } from "@/root/testing";

import Component from "./logger";

const METHODS = ["log", "warn", "error", "success", "out", "in", "failed"];

describe(`${Component.name} smoke test`, () => {
  it("showcases every logger method", async () => {
    const consoleLog = jest.spyOn(console, "log").mockImplementation(() => {});
    await render(<Component />);

    for (const method of METHODS) {
      await fireEvent.press(screen.getByRole("button", { name: method }));
    }

    expect(consoleLog).toHaveBeenCalledTimes(METHODS.length);
    consoleLog.mockRestore();
  });
});
