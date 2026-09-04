import { useTheme } from "@/features/theme";
import { render, renderHook } from "@/root/testing";

import Component, { type AvatarSize } from "./index";

/**
 * Split from ./index.test.tsx for the reason `Badge` and `Tag` split
 * theirs: past a certain number of renders in one file this harness stops
 * resolving queries against freshly rendered trees, and Jest isolates
 * modules, so a second file starts clean.
 */
type View = Awaited<ReturnType<typeof render>>;

function flatten(style: unknown): Record<string, unknown>[] {
  if (Array.isArray(style)) return style.flatMap(flatten);
  if (style && typeof style === "object")
    return [style as Record<string, unknown>];
  return [];
}

/** The avatar's element children: the circle, then the status dot. */
function partsOf(view: View) {
  return view
    .getByTestId("avatar", { includeHiddenElements: true })
    .children.filter((child) => typeof child !== "string");
}

function styleOf(part: ReturnType<typeof partsOf>[number]) {
  return Object.assign({}, ...flatten(part.props.style)) as Record<
    string,
    unknown
  >;
}

/** The circle itself, which is the avatar's first child. */
function surfaceStyle(view: View) {
  return styleOf(partsOf(view)[0]);
}

const SIZES: AvatarSize[] = ["small", "medium", "large"];

describe("Avatar sizing and theming", () => {
  it.each(SIZES)("draws %s as a circle", async (size) => {
    const view = await render(
      <Component testID="avatar" name="Ada" size={size} />,
    );
    const style = surfaceStyle(view);

    expect(style.width).toBe(style.height);
    // A radius of exactly half the box is what makes it round rather than
    // merely rounded.
    expect(style.borderRadius).toBe((style.width as number) / 2);
  });

  it("grows with the size", async () => {
    const small = await render(
      <Component testID="avatar" name="Ada" size="small" />,
    );
    const large = await render(
      <Component testID="avatar" name="Ada" size="large" />,
    );

    expect(surfaceStyle(large).width).toBeGreaterThan(
      surfaceStyle(small).width as number,
    );
  });

  // Same reason `Button`'s `secondary` and `ImageFallback` carry one: a
  // `backgroundElement` fill is invisible against another raised surface.
  it("paints the circle from the raised-surface tokens, with an edge", async () => {
    const { result } = await renderHook(() => useTheme());
    const view = await render(<Component testID="avatar" name="Ada" />);
    const style = surfaceStyle(view);

    expect(style.backgroundColor).toBe(result.current.colors.backgroundElement);
    expect(style.borderColor).toBe(result.current.colors.border);
    expect(style.borderWidth).toBeGreaterThan(0);
  });

  // Everything inside is clipped to the circle, which is exactly why the
  // status dot is a sibling of the surface rather than a child of it.
  it("clips the picture to the circle", async () => {
    const view = await render(<Component testID="avatar" name="Ada" />);

    expect(surfaceStyle(view).overflow).toBe("hidden");
  });

  it("scales the status dot with the avatar", async () => {
    const dotOf = (view: View) => styleOf(partsOf(view)[1]);

    const small = await render(
      <Component
        testID="avatar"
        name="Ada"
        size="small"
        status="success"
        statusLabel="Online"
      />,
    );
    const large = await render(
      <Component
        testID="avatar"
        name="Ada"
        size="large"
        status="success"
        statusLabel="Online"
      />,
    );

    expect(dotOf(large).width).toBeGreaterThan(dotOf(small).width as number);
    expect(dotOf(small).position).toBe("absolute");
  });
});
