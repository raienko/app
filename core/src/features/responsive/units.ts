import { useMemo } from "react";
import { Dimensions, useWindowDimensions } from "react-native";

import { BASE_WIDTH, MAX_SCALE, MIN_SCALE, SCALE_MODERATION } from "./config";

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/** Pure — exported mainly for testing. See createUnits/useUnits below. */
export function scaleFactorForWidth(width: number): number {
  const rawScale = width / BASE_WIDTH;
  const moderated = 1 + (rawScale - 1) * SCALE_MODERATION;
  return clamp(moderated, MIN_SCALE, MAX_SCALE);
}

/**
 * Creates a units(value) function for a given width. Exported for testing —
 * components should use useUnits() so values update as the window resizes
 * (rotation, foldable unfold/fold, browser/desktop resize).
 */
export function createUnits(width: number) {
  const scale = scaleFactorForWidth(width);
  return (value: number): number => Math.round(value * scale);
}

/**
 * units(value): pass a Figma px value, get back that value scaled for the
 * device's CURRENT width — 12 in Figma is units(12). Reads
 * Dimensions.get("window") imperatively at call time, so it works anywhere —
 * module scope, inside or outside a component, event handlers, a
 * module-scope StyleSheet.create — no hook required.
 *
 * The tradeoff: it's a snapshot, not reactive. A value computed once at
 * import time (e.g. in a module-scope StyleSheet.create) will NOT update
 * later if the window resizes, rotates, or a foldable unfolds — nothing
 * re-runs that code. For a value that live-updates on resize, call this
 * inside a component via useUnits() instead, which re-renders on change.
 */
export function units(value: number): number {
  const { width } = Dimensions.get("window");
  return createUnits(width)(value);
}

/**
 * Reactive units(value): pass a Figma px value, get back that value scaled
 * for the current device — 12 in Figma is units(12). Re-renders the calling
 * component when the window resizes (rotation, foldable unfold/fold,
 * desktop/browser resize) via useWindowDimensions.
 *
 * Because it's reactive, values built with it can't live in a module-scope
 * StyleSheet.create (that only runs once, at import time). Compute styles
 * that use units() inside the component instead, e.g.
 * useMemo(() => StyleSheet.create({ padding: units(12) }), [units]) — or,
 * to keep the style *definition* outside the component while it still
 * reacts to resize, use createStyles() from ./create-styles.
 *
 * If you don't need resize-reactivity at all, use the plain units() export
 * instead — it works directly in a module-scope StyleSheet.create.
 */
export default function useUnits() {
  const { width } = useWindowDimensions();
  return useMemo(() => createUnits(width), [width]);
}
