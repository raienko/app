import { fireEvent, render, screen } from "@/root/testing";

import Component from "./index";

describe(`${Component.name} smoke test`, () => {
  it("renders the given value", async () => {
    await render(<Component value="press me" onPress={() => {}} />);

    expect(screen.getByText("press me")).toBeTruthy();
  });

  it("calls onPress when pressed", async () => {
    const onPress = jest.fn();
    await render(<Component value="press me" onPress={onPress} />);

    fireEvent.press(screen.getByText("press me"));

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  // A plain Pressable has no role of its own — without this every button in
  // the app announces as an anonymous group, which is exactly what shipped
  // before the accessibility feature landed.
  it("announces as a button, labelled by its own text", async () => {
    await render(<Component value="press me" onPress={() => {}} />);

    expect(screen.getByRole("button", { name: "press me" })).toBeTruthy();
  });

  it("exposes selected state", async () => {
    await render(<Component value="picked" selected onPress={() => {}} />);

    expect(screen.getByRole("button").props.accessibilityState.selected).toBe(
      true,
    );
  });

  it("exposes disabled state and blocks onPress", async () => {
    const onPress = jest.fn();
    await render(<Component value="nope" disabled onPress={onPress} />);

    expect(screen.getByRole("button").props.accessibilityState.disabled).toBe(
      true,
    );

    fireEvent.press(screen.getByText("nope"));
    expect(onPress).not.toHaveBeenCalled();
  });
});
