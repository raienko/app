import { render, screen } from "@/root/testing";

import Component from "./index";

describe(`${Component.name} smoke test`, () => {
  it("renders the given value", async () => {
    await render(<Component value="hello" />);

    expect(screen.getByText("hello")).toBeTruthy();
  });

  it("defaults to the body type", async () => {
    await render(<Component value="hello" />);

    const { fontSize } = screen
      .getByText("hello")
      .props.style.find(
        (entry: { fontSize?: number }) => entry?.fontSize !== undefined,
      );
    expect(typeof fontSize).toBe("number");
  });

  it("renders a larger fontSize for largeTitle than for caption2", async () => {
    await render(
      <>
        <Component value="big" type="largeTitle" />
        <Component value="small" type="caption2" />
      </>,
    );

    const bigSize = screen
      .getByText("big")
      .props.style.find(
        (entry: { fontSize?: number }) => entry?.fontSize !== undefined,
      ).fontSize;
    const smallSize = screen
      .getByText("small")
      .props.style.find(
        (entry: { fontSize?: number }) => entry?.fontSize !== undefined,
      ).fontSize;

    expect(bigSize).toBeGreaterThan(smallSize);
  });
});
