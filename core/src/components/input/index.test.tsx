import { fireEvent, render, screen, waitFor } from "@/root/testing";

import Component from "./index";

describe(`${Component.displayName} smoke test`, () => {
  it("defaults to the text variation when type is omitted", async () => {
    const onChange = jest.fn();
    await render(<Component value="" onChange={onChange} placeholder="Type" />);

    await fireEvent.changeText(screen.getByPlaceholderText("Type"), "hello");

    expect(onChange).toHaveBeenCalledWith("hello");
  });

  it("routes to the numeric variation when type='numeric'", async () => {
    const onChange = jest.fn();
    await render(
      <Component
        type="numeric"
        value={null}
        onChange={onChange}
        placeholder="Age"
      />,
    );

    await fireEvent.changeText(screen.getByPlaceholderText("Age"), "12abc");

    expect(onChange).toHaveBeenCalledWith(12);
  });

  it("routes to the email variation when type='email'", async () => {
    const onChange = jest.fn();
    await render(
      <Component
        type="email"
        value=""
        onChange={onChange}
        placeholder="Email"
      />,
    );

    await fireEvent.changeText(
      screen.getByPlaceholderText("Email"),
      "ada@example.com",
    );

    expect(onChange).toHaveBeenCalledWith("ada@example.com");
    expect(screen.getByPlaceholderText("Email").props.keyboardType).toBe(
      "email-address",
    );
  });

  it("routes to the select variation when type='select'", async () => {
    const onChange = jest.fn();
    await render(
      <Component
        type="select"
        label="Country"
        value={null}
        onChange={onChange}
        options={[
          { value: "uk", label: "United Kingdom" },
          { value: "jp", label: "Japan" },
        ]}
      />,
    );

    await fireEvent.press(screen.getByLabelText("Country"));
    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Japan" })).toBeTruthy();
    });
    await fireEvent.press(screen.getByRole("button", { name: "Japan" }));

    expect(onChange).toHaveBeenCalledWith("jp");
  });

  it("routes to the datetime variation when type='datetime'", async () => {
    const onChange = jest.fn();
    await render(
      <Component
        type="datetime"
        mode="date"
        label="Starts"
        value={new Date(2026, 7, 27)}
        onChange={onChange}
      />,
    );

    await fireEvent.press(screen.getByLabelText("Starts"));
    await waitFor(() => {
      expect(screen.getByTestId("calendar")).toBeTruthy();
    });
    await fireEvent.press(screen.getByRole("button", { name: "Done" }));

    expect(onChange).toHaveBeenCalledWith(new Date(2026, 7, 27));
  });

  it("routes to the password variation when type='password'", async () => {
    const onChange = jest.fn();
    await render(
      <Component
        type="password"
        label="Password"
        value=""
        onChange={onChange}
      />,
    );

    const field = screen.getByLabelText("Password");
    expect(field.props.secureTextEntry).toBe(true);

    await fireEvent.changeText(field, "hunter2");

    expect(onChange).toHaveBeenCalledWith("hunter2");
  });
});
