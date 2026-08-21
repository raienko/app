import { fireEvent, render, screen } from "@/root/testing";

import Component from "./index";

describe(`${Component.displayName} smoke test`, () => {
  it("calls onChange with the typed text", async () => {
    const onChange = jest.fn();
    await render(<Component value="" onChange={onChange} placeholder="Type" />);

    fireEvent.changeText(screen.getByPlaceholderText("Type"), "hello");

    expect(onChange).toHaveBeenCalledWith("hello");
  });

  it("passes secureTextEntry through to the underlying field", async () => {
    await render(
      <Component
        value=""
        onChange={() => {}}
        placeholder="Password"
        secureTextEntry
      />,
    );

    expect(screen.getByPlaceholderText("Password").props.secureTextEntry).toBe(
      true,
    );
  });
});
