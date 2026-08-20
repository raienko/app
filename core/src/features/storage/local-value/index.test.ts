import { act, renderHook } from "@testing-library/react-native";

import LocalValue from "./index";

describe(`${LocalValue.name} smoke test`, () => {
  it("returns undefined for a key that was never set", () => {
    const value = new LocalValue<string>("unset-key");

    expect(value.getValue()).toBeUndefined();
  });

  it("stores and retrieves a value", () => {
    const value = new LocalValue<{ count: number }>("object-key");

    value.setValue({ count: 1 });

    expect(value.getValue()).toEqual({ count: 1 });
  });

  it("clears the value on reset", () => {
    const value = new LocalValue<string>("reset-key");
    value.setValue("hello");

    value.reset();

    expect(value.getValue()).toBeUndefined();
  });

  it("reflects updates reactively through use()", async () => {
    const value = new LocalValue<number>("reactive-key");
    const { result } = await renderHook(() => value.use());

    expect(result.current).toBeUndefined();

    await act(async () => {
      value.setValue(42);
    });

    expect(result.current).toBe(42);
  });
});
