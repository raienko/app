import { fireEvent, render, screen } from "@/root/testing";
import { LocalValue } from "@/features/storage";

import Component from "./theme";

describe("ThemeSection", () => {
  beforeEach(() => {
    new LocalValue("theme-preference").setValue("light");
  });

  it("switches the configured provider palette without changing core defaults", async () => {
    await render(<Component />);

    expect(screen.getByTestId("configured-primary-swatch").props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ backgroundColor: "#1d4ed8" }),
      ]),
    );

    await fireEvent.press(screen.getByTestId("palette-violet"));

    expect(screen.getByTestId("configured-primary-swatch").props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ backgroundColor: "#6d28d9" }),
      ]),
    );

    await fireEvent.press(screen.getByTestId("palette-core"));

    expect(screen.getByTestId("configured-primary-swatch").props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ backgroundColor: "#1d4ed8" }),
      ]),
    );
  });
});
