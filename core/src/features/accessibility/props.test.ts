import { controlA11yProps, fieldA11yProps } from "./props";

describe("controlA11yProps", () => {
  it("always marks the element as a button", () => {
    expect(controlA11yProps().accessibilityRole).toBe("button");
  });

  it("omits state entirely when nothing was passed", () => {
    // A plain button reporting `selected: false` would have a screen reader
    // announce a selection state the control doesn't actually have.
    expect(controlA11yProps()).not.toHaveProperty("accessibilityState");
  });

  it("emits only the state keys it was given", () => {
    expect(controlA11yProps({ expanded: false }).accessibilityState).toEqual({
      expanded: false,
    });
    expect(
      controlA11yProps({ disabled: true, selected: false }).accessibilityState,
    ).toEqual({ disabled: true, selected: false });
  });

  // react-native-web 0.21 renders only the aria-* form, so state set solely
  // through accessibilityState reaches native but produces nothing in the
  // DOM. Both spellings have to be present.
  it("mirrors state to aria-* for the web renderer", () => {
    const props = controlA11yProps({ expanded: true, disabled: false });

    expect(props["aria-expanded"]).toBe(true);
    expect(props["aria-disabled"]).toBe(false);
    expect(props).not.toHaveProperty("aria-selected");
  });

  it("omits the label when the element labels itself through its children", () => {
    expect(controlA11yProps()).not.toHaveProperty("accessibilityLabel");
    expect(controlA11yProps({ label: "Dismiss" }).accessibilityLabel).toBe(
      "Dismiss",
    );
  });
});

describe("fieldA11yProps", () => {
  it("labels the field and always reports disabled state", () => {
    const props = fieldA11yProps({ label: "Email", disabled: false });

    expect(props.accessibilityLabel).toBe("Email");
    expect(props.accessibilityState).toEqual({ disabled: false });
  });

  // RN has no "invalid" accessibility state, so the message rides along as
  // a hint — otherwise the red border is the only signal there is.
  it("surfaces an error as the field's hint", () => {
    const props = fieldA11yProps({
      label: "Email",
      error: "Enter a valid email",
    });

    expect(props.accessibilityHint).toBe("Enter a valid email");
  });

  it("has no hint when there is no error", () => {
    expect(fieldA11yProps({ label: "Email" })).not.toHaveProperty(
      "accessibilityHint",
    );
  });
});
