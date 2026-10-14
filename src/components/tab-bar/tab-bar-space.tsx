import { View } from "react-native";

import { disabledA11yProps } from "@/features/accessibility";

import useTabBarSpace from "./space";
import type { TabBarLayoutProps } from "./types";

/**
 * Empty room at the end of a tab screen's content, so its last row
 * scrolls clear of the bar drawn over it. Put it last inside `Screen`:
 *
 * ```tsx
 * <Screen scrollable header={<Header title="Home" />}>
 *   …
 *   <TabBarSpace variant="floating" />
 * </Screen>
 * ```
 *
 * Takes the bar's own `variant` and `avoidChin`, so the two can't disagree.
 *
 * **`avoidChin` defaults to `false` here**, unlike on the bar: inside
 * `Screen` the content is already padded by the bottom safe area, and
 * reserving it again would leave a double gap above the home indicator.
 * Pass `avoidChin` when the space sits somewhere that doesn't clear the
 * chin itself. `useTabBarSpace()` remains for a layout `Screen` doesn't own.
 */
export default function TabBarSpace({
  variant,
  avoidChin = false,
}: TabBarLayoutProps) {
  const height = useTabBarSpace({ variant, avoidChin });

  return (
    <View testID="tab-bar-space" {...disabledA11yProps()} style={{ height }} />
  );
}
