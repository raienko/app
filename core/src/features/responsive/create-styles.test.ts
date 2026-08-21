import { renderHook } from "@testing-library/react-native";

import createStyles from "./create-styles";

describe(`${createStyles.name} smoke test`, () => {
  it("passes units and breakpoint through to the factory", async () => {
    const factory = jest.fn(({ units, breakpoint }) => ({
      text: { fontSize: units(14) },
      breakpoint,
    }));
    const useStyles = createStyles(factory);

    const { result } = await renderHook(() => useStyles());

    expect(factory).toHaveBeenCalledWith(
      expect.objectContaining({
        units: expect.any(Function),
        breakpoint: expect.any(String),
      }),
    );
    expect(typeof result.current.text.fontSize).toBe("number");
  });

  it("memoizes the result across re-renders with unchanged dimensions", async () => {
    const factory = jest.fn(({ units }) => ({ text: { fontSize: units(14) } }));
    const useStyles = createStyles(factory);

    const { result, rerender } = await renderHook(() => useStyles());
    const first = result.current;

    await rerender({});
    const second = result.current;

    expect(second).toBe(first);
    expect(factory).toHaveBeenCalledTimes(1);
  });
});
