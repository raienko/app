import { useMemo } from "react";
import { StyleSheet } from "react-native";

import { useIsRtl } from "@/features/localization";

import { useBreakpoint, type Breakpoint } from "./breakpoint";
import { useSizes, type Sizes } from "./sizes";
import useUnits from "./units";

type Responsive = Sizes & {
  units: ReturnType<typeof useUnits>;
  breakpoint: Breakpoint;
  isRTL: boolean;
};

/**
 * Turns a style factory defined outside a component into a hook you call
 * inside one — the factory gets the current (reactive) units()/breakpoint/
 * isRTL/spacing/radius/sizes, and the result is memoized so it's only
 * recomputed when one of them actually changes. Runs the factory's return
 * value through StyleSheet.create() itself, so call sites return a plain
 * style object and don't need their own "react-native" import just for
 * that.
 *
 * `isRTL` here is the locale-derived flag (useIsRtl(), see
 * features/localization), not I18nManager.isRTL — it flips the instant the
 * locale does, with no native reload to wait on, so it's safe to build
 * manual mirroring (e.g. `flexDirection: isRTL ? "row-reverse" : "row"`)
 * directly off it in a style that otherwise wouldn't re-render until a
 * reload landed.
 *
 * `spacing`/`radius`/`sizes` are the sizes styleguide (see sizes.ts's
 * useSizes(), which this calls internally) — already scaled through
 * units(), so `spacing.x8`/`sizes.elementHeightMd` are used directly with
 * no units() wrapping of their own.
 *
 * @example
 * const useStyles = createStyles(({ units, isRTL, spacing, sizes }) => ({
 *   text: { fontSize: units(14) },
 *   row: { gap: spacing.x8 },
 *   field: { minHeight: sizes.elementHeightMd },
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
    const { spacing, radius, sizes } = useSizes();
    return useMemo(
      () =>
        StyleSheet.create(
          factory({ units, breakpoint, isRTL, spacing, radius, sizes }),
        ),
      [units, breakpoint, isRTL, spacing, radius, sizes],
    );
  };
}
