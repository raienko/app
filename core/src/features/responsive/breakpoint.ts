import { useMemo } from "react";
import { useWindowDimensions } from "react-native";

import { BREAKPOINTS } from "./config";

export type Breakpoint = "phone" | "foldable" | "tablet" | "desktop";

/** Pure — exported mainly for testing. See useBreakpoint below. */
export function getBreakpoint(width: number): Breakpoint {
  if (width >= BREAKPOINTS.desktop) {
    return "desktop";
  }
  if (width >= BREAKPOINTS.tablet) {
    return "tablet";
  }
  if (width >= BREAKPOINTS.foldable) {
    return "foldable";
  }
  return "phone";
}

/** Reactive current device category — updates on resize/rotate/fold. */
export function useBreakpoint(): Breakpoint {
  const { width } = useWindowDimensions();
  return useMemo(() => getBreakpoint(width), [width]);
}
