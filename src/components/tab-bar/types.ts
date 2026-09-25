import type { ReactNode } from "react";
import type { StyleProp, ViewStyle } from "react-native";

/**
 * How the bar sits on the screen.
 *
 * - `sticky` — docked to the bottom edge, full width, with a top border.
 *   Content scrolls up to meet it, and it never covers the edge of the
 *   screen it's anchored to.
 * - `floating` — inset from all three edges as an outlined, raised bar.
 *   Content scrolls *under* it, which is what makes it worth the extra
 *   space it costs.
 */
export type TabBarVariant = "sticky" | "floating";

/** One destination in the bar. */
export type TabBarItem = {
  /** Identifies the tab: what `value` is matched against and `onChange` reports. */
  key: string;
  /** Visible text, and the tab's accessible name. */
  label: string;
  /**
   * Usually an `<Icon />`. It takes the bar's own colour for its state
   * without the call site restating it — the same way a `Button` fills one
   * in for its child.
   */
  icon?: ReactNode;
  testID?: string;
};

export type TabBarLayoutProps = {
  /** Defaults to `"sticky"`. */
  variant?: TabBarVariant;
  /**
   * Adds the device's bottom safe-area inset, so the bar clears the home
   * indicator (the "chin") rather than sitting under it.
   *
   * Defaults to `true`, unlike `Header`'s `avoidNotch`: a tab bar is at the
   * very bottom of the screen by definition — that's the only place it can
   * be — so the inset is right in every case except one deliberately
   * nested somewhere else.
   */
  avoidChin?: boolean;
};

export type TabBarProps = TabBarLayoutProps & {
  items: TabBarItem[];
  /** The selected item's `key`. One matching nothing selects nothing. */
  value: string;
  /** Reports the pressed item's `key`, including the already-selected one. */
  onChange: (key: string) => void;
  style?: StyleProp<ViewStyle>;
  testID?: string;
};
