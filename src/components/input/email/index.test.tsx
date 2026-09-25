import { fireEvent, render, screen } from "@/root/testing";

import Component from "./index";

describe(`${Component.displayName} smoke test`, () => {
  it("calls onChange with the typed text", async () => {
    const onChange = jest.fn();
    await render(
      <Component value="" onChange={onChange} placeholder="Email" />,
    );

    await fireEvent.changeText(
      screen.getByPlaceholderText("Email"),
      "ada@example.com",
    );

    expect(onChange).toHaveBeenCalledWith("ada@example.com");
  });

  it("uses the email-address keyboard", async () => {
    await render(
      <Component value="" onChange={() => {}} placeholder="Email" />,
    );

    expect(screen.getByPlaceholderText("Email").props.keyboardType).toBe(
      "email-address",
    );
  });
});
