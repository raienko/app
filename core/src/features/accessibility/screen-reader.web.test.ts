import readScreenReaderEnabled from "./screen-reader.web";

describe("web screen-reader detection", () => {
  it("reports unknown browser state as disabled", async () => {
    await expect(readScreenReaderEnabled()).resolves.toBe(false);
  });
});
