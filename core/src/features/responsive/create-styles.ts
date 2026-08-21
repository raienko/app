import { useMemo } from "react";
import { StyleSheet } from "react-native";

import { useIsRtl } from "@/features/localization";

import { useBreakpoint, type Breakpoint } from "./breakpoint";
import useUnits from "./units";

type Responsive = {
  units: ReturnType<typeof useUnits>;
  breakpoint: Breakpoint;
  isRTL: boolean;
};

/**
 * Turns a style factory defined outside a component into a hook you call
 * inside one — the factory gets the current (reactive) units()/breakpoint/
 * isRTL, and the result is memoized so it's only recomputed when one of
 * them actually changes. Runs the factory's return value through
 * StyleSheet.create() itself, so call sites return a plain style object and
 * don't need their own "react-native" import just for that.
 *
 * `isRTL` here is the locale-derived flag (useIsRtl(), see
 * features/localization), not I18nManager.isRTL — it flips the instant the
 * locale does, with no native reload to wait on, so it's safe to build
 * manual mirroring (e.g. `flexDirection: isRTL ? "row-reverse" : "row"`)
 * directly off it in a style that otherwise wouldn't re-render until a
 * reload landed.
 *
 * @example
 * const useStyles = createStyles(({ units, breakpoint, isRTL }) => ({
 *   text: { fontSize: units(14) },
 * }));
 *
 * function Component() {
 *   const styles = useStyles();
 *   return <Text style={styles.text} />;
 * }
 */
export default function createStyles<
  T extends StyleSheet.NamedStyles<T> | StyleSheet.NamedStyles<unknown>,
>(factory: (responsive: Responsive) => T) {
  return function useStyles(): T {
    const units = useUnits();
    const breakpoint = useBreakpoint();
    const isRTL = useIsRtl();
    return useMemo(
      () => StyleSheet.create(factory({ units, breakpoint, isRTL })),
      [units, breakpoint, isRTL],
    );
  };
}
