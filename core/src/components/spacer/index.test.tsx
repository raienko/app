import { useSizes, useUnits } from "@/features/responsive";
import { render, renderHook, screen } from "@/root/testing";

import Component from "./index";

function flattenStyle(style: unknown): Record<string, unknown> {
  if (Array.isArray(style))
    return Object.assign({}, ...style.map(flattenStyle));
  if (style && typeof style === "object")
    return style as Record<string, unknown>;
  return {};
}

/**
 * Every query here has to opt into hidden elements: the spacer is hidden
 * from assistive technology, and testing-library's default queries filter
 * exactly those out. That's the behaviour under test, not a workaround —
 * see the "not reachable" case below, which asserts the same thing from the
 * other side.
 */
function spacer() {
  return screen.getByTestId("spacer", { includeHiddenElements: true });
}

function spacerStyle() {
  return flattenStyle(spacer().props.style);
}

describe(`${Component.name} smoke test`, () => {
  it("takes only height by default — a vertical gap of 16pt", async () => {
    const { result } = await renderHook(() => useSizes());
    await render(<Component testID="spacer" />);

    expect(spacerStyle()).toEqual({
      width: undefined,
      height: result.current.spacing.x16,
    });
  });

  it("takes only width when horizontal", async () => {
    const { result } = await renderHook(() => useSizes());
    await render(
      <Component testID="spacer" direction="horizontal" size="x8" />,
    );

    expect(spacerStyle()).toEqual({
      width: result.current.spacing.x8,
      height: undefined,
    });
  });

  it("takes both axes when asked for both", async () => {
    const { result } = await renderHook(() => useSizes());
    await render(<Component testID="spacer" direction="both" size="x24" />);

    expect(spacerStyle()).toEqual({
      width: result.current.spacing.x24,
      height: result.current.spacing.x24,
    });
  });

  // The unused axis stays unset rather than 0, so a vertical spacer dropped
  // into a row container doesn't force a 0-sized box into the layout.
  it("leaves the unused axis unset rather than zeroed", async () => {
    await render(<Component testID="spacer" />);

    expect(spacerStyle().width).toBeUndefined();
  });

  it("scales a raw px size through units(), like every other size", async () => {
    const { result } = await renderHook(() => useUnits());
    await render(<Component testID="spacer" size={10} />);

    expect(spacerStyle().height).toBe(result.current(10));
  });

  it("is invisible to assistive technology on every platform", async () => {
    await render(<Component testID="spacer" />);
    const { props } = spacer();

    expect(props.accessible).toBe(false);
    expect(props.accessibilityElementsHidden).toBe(true);
    expect(props.importantForAccessibility).toBe("no-hide-descendants");
    expect(props["aria-hidden"]).toBe(true);
  });

  // The other side of the same fact: a query that respects accessibility —
  // which is what a screen reader does — doesn't see the spacer at all, so
  // it's never a stop between the two elements it separates.
  it("is not reachable as an accessibility element", async () => {
    await render(<Component testID="spacer" />);

    expect(screen.queryByTestId("spacer")).toBeNull();
  });

  it("merges a caller's style over its own", async () => {
    await render(
      <Component testID="spacer" style={{ backgroundColor: "red" }} />,
    );

    expect(spacerStyle().backgroundColor).toBe("red");
  });
});
