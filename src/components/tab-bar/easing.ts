import { Easing } from "react-native-reanimated";

const easeOut = Easing.out(Easing.cubic);

/**
 * Ease-out cubic, with its input held to 0–1.
 *
 * On web, Reanimated's first frame can be stamped slightly *before* the
 * press that started the animation — a `requestAnimationFrame` timestamp is
 * the frame's start, the press came later in it — so the timing's progress
 * begins a little below 0. Plain `Easing.out(Easing.cubic)` extrapolates
 * that steeply: measured in the browser, the indicator's first frame jumped
 * 45px the wrong way before sliding to the tab. Clamping removes the kick
 * and changes nothing in between.
 */
export default function easeOutClamped(t: number): number {
  "worklet";
  return easeOut(Math.min(1, Math.max(0, t)));
}
