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
});
