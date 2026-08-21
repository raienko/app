import { useMemo } from "react";

import { useBreakpoint, type Breakpoint } from "./breakpoint";
import useUnits from "./units";

type Responsive = {
  units: ReturnType<typeof useUnits>;
  breakpoint: Breakpoint;
};

/**
 * Turns a style factory defined outside a component into a hook you call
 * inside one — the factory gets the current (reactive) units()/breakpoint,
 * and the result is memoized so it's only recomputed when they actually
 * change.
 *
 * @example
 * const useStyles = createStyles(({ units, breakpoint }) =>
 *   StyleSheet.create({
 *     text: { fontSize: units(14) },
 *   }),
 * );
 *
 * function Component() {
 *   const styles = useStyles();
 *   return <Text style={styles.text} />;
 * }
 */
export default function createStyles<T>(
  factory: (responsive: Responsive) => T,
) {
  return function useStyles(): T {
    const units = useUnits();
    const breakpoint = useBreakpoint();
    return useMemo(() => factory({ units, breakpoint }), [units, breakpoint]);
  };
}
