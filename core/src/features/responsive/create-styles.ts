import { useMemo } from "react";
import { StyleSheet } from "react-native";

import { useIsRtl } from "@/features/localization";

import useResponsive, { type Responsive } from "./use-responsive";

type StyleFactoryArgs = Responsive & {
  isRTL: boolean;
};

/**
 * Turns a style factory defined outside a component into a hook you call
 * inside one — the factory gets the current (reactive) units/breakpoint/
 * isRTL/spacing/radius/sizes/typography, and the result is memoized so
 * it's only recomputed when one of them actually changes. Runs the
 * factory's return value through StyleSheet.create() itself, so call sites
 * return a plain style object and don't need their own "react-native"
 * import just for that.
 *
 * Everything window-derived comes from one `useResponsive()` call, which
 * makes one `useWindowDimensions()` read — see that hook for why that
 * matters.
 *
 * `isRTL` here is the locale-derived flag (useIsRtl(), see
 * features/localization), not I18nManager.isRTL — it flips the instant the
 * locale does, with no native reload to wait on, so it's safe to build
 * manual mirroring (e.g. `flexDirection: isRTL ? "row-reverse" : "row"`)
 * directly off it in a style that otherwise wouldn't re-render until a
 * reload landed.
 *
 * `spacing`/`radius`/`sizes` (the sizes styleguide) and `typography` (the
 * type scale) all arrive already scaled through units(), so
 * `spacing.x8`/`sizes.elementHeightMd`/`typography.body` are used directly
 * with no units() wrapping of their own.
 *
 * @example
 * const useStyles = createStyles(({ units, isRTL, spacing, sizes, typography }) => ({
 *   text: { fontSize: units(14) },
 *   row: { gap: spacing.x8 },
 *   field: { minHeight: sizes.elementHeightMd },
 *   title: typography.headline,
 * }));
 *
 * function Component() {
 *   const styles = useStyles();
 *   return <Text style={styles.text} />;
 * }
 */
export default function createStyles<
  T extends StyleSheet.NamedStyles<T> | StyleSheet.NamedStyles<unknown>,
>(factory: (args: StyleFactoryArgs) => T) {
  return function useStyles(): T {
    const responsive = useResponsive();
    const isRTL = useIsRtl();
    return useMemo(
      () => StyleSheet.create(factory({ ...responsive, isRTL })),
      [responsive, isRTL],
    );
  };
}
