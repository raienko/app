import { useMemo } from "react";

import useUnits from "./units";

/**
 * The sizes styleguide's generic scale — named steps for the Figma px
 * values components pass to `units()`, so two components that mean the
 * same thing (e.g. "the standard gap between stacked fields") share one
 * named value instead of each separately hardcoding `units(12)` and
 * drifting out of sync later. Matches exactly the distinct values already
 * in real use across the component set at the time this was written, not
 * invented ahead of need — same reasoning as `THEME_PREFERENCES` deriving
 * from `Object.keys(colors)` rather than being hand-typed.
 *
 * Keyed `x<value>` (`spacing.x8`, not `spacing[8]` or `spacing.sm`) — a
 * numeric-value key says exactly what step you're getting without a name
 * to look up first (`spacing.x10`, not a step in the scale, is a `tsc`
 * error instead of a silent typo), and the `x` prefix is only there
 * because a bare number can't be a dot-accessible property name.
 *
 * Not exported directly — see `useSizes()` below for why.
 */
const RAW_SPACING = {
  x1: 1,
  x2: 2,
  x4: 4,
  x8: 8,
  x12: 12,
  x16: 16,
  x20: 20,
  x24: 24,
  x28: 28,
  x32: 32,
  x36: 36,
  x40: 40,
} as const;

/** Same idea as `RAW_SPACING`, for `borderRadius`. */
const RAW_RADIUS = {
  x4: RAW_SPACING.x4,
  x8: RAW_SPACING.x8,
  x12: RAW_SPACING.x12,
  x16: RAW_SPACING.x16,
} as const;

/**
 * Named, purpose-specific sizes — where the generic scale above means
 * nothing beyond its own number (many components share step 16 without
 * meaning the same thing by it), each of these means exactly one thing, so
 * it gets a name instead of a step.
 *
 * Named by what the size *is for*, not by which component happens to use it
 * first — `elementHeightMd`, not `inputHeight`, because a future Button or
 * Select sized to match Input's touch target is reusing the same concept,
 * not borrowing Input's own measurement. Same for `elementWidthSm`/`Lg`:
 * Accordion and Modal don't mean different things by their own width/
 * maxWidth, they're just two components that happened to need two
 * different tiers of "how wide should a self-contained element be" first.
 * A size that's genuinely specific to one element's own shape (the drag
 * handle's exact grabber-pill dimensions, say) still gets a specific name —
 * genericizing a name doesn't make the measurement itself any more general.
 *
 * Add an entry here once a measurement has a clear, reusable purpose worth
 * naming — not for every bespoke number a component happens to have. A
 * value that's genuinely one component's own business (padding tuned to
 * that component's own visual balance, say) still belongs local to it.
 */
export const NAMED_SIZES = {
  /** Standard interactive-element touch-target height (currently: Input's minimum height — the standard 44pt minimum; expected to be shared by future form controls sized to match). */
  elementHeightMd: 44,
  /** Modal's bottom-sheet/actions drag handle grabber pill — specific to that one element's own shape, not a reusable step (see the doc comment above). */
  grabberWidth: 36,
  grabberHeight: 4,
  /** Smaller tier of "how wide should a self-contained element be" (currently: Accordion's fixed content width — see its own container comment for why it's fixed at all). */
  elementWidthSm: 260,
  /** Larger tier of the same — Modal's `popup`/`bottomSheet`/`actions` content, capped so it doesn't stretch edge-to-edge on a wide screen. */
  elementWidthLg: 360,
} as const;

type Scaled<T extends Record<string, number>> = { [K in keyof T]: number };

function scale<T extends Record<string, number>>(
  units: ReturnType<typeof useUnits>,
  raw: T,
): Scaled<T> {
  return Object.fromEntries(
    Object.entries(raw).map(([key, value]) => [key, units(value)]),
  ) as Scaled<T>;
}

export type Sizes = {
  spacing: Scaled<typeof RAW_SPACING>;
  radius: Scaled<typeof RAW_RADIUS>;
  sizes: Scaled<typeof NAMED_SIZES>;
};

/**
 * The sizes styleguide, reactive and already scaled — `spacing.x8`,
 * `radius.x12`, `sizes.elementHeightMd` are all real, final pixel values with
 * no `units()` wrapping needed at the call site (that's the whole reason
 * `RAW_SPACING`/`RAW_RADIUS` above aren't exported directly — using them
 * unscaled would silently skip the device scaling every other size in the
 * app gets).
 *
 * `createStyles` (see create-styles.ts) calls this internally and hands
 * its three groups straight to the style factory — most call sites never
 * call this directly. Reach for it yourself only for a size needed outside
 * a style object entirely, e.g. an `Icon`'s `size` prop (`Accordion`'s
 * chevron and the Home screen's header icon both do this, passing
 * `spacing.x20` — the same step `Screen`'s padding uses, not a coincidence
 * worth a separate icon-size scale over).
 *
 * What's deliberately excluded from both groups: a measurement that
 * doesn't represent a reusable step or a reusable named purpose — a
 * hairline `borderWidth`, `Counter`'s button `minWidth` tuned to that
 * component's own two buttons, font sizes (their own, not-yet-written
 * styleguide) — stays a plain number owned by its component. Nothing was
 * rounded or forced to fit either scale just to reuse it.
 */
export function useSizes(): Sizes {
  const units = useUnits();
  return useMemo(
    () => ({
      spacing: scale(units, RAW_SPACING),
      radius: scale(units, RAW_RADIUS),
      sizes: scale(units, NAMED_SIZES),
    }),
    [units],
  );
}
