import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { tabListA11yProps } from "@/features/accessibility";
import { createStyles } from "@/features/responsive";
import { useElevationStyle, useTheme } from "@/features/theme";

import { useTabBarMetrics } from "./space";
import Tab from "./tab";
import type { TabBarProps } from "./types";

/**
 * A bottom tab bar, in two shapes: docked to the edge (`sticky`) or lifted
 * off it as an outlined bar (`floating`).
 *
 * This is the controlled form — `items`, `value`, `onChange` — which is what
 * the Showcase and the stories drive. To use it as a navigator's own bar,
 * reach for `NavigationTabBar` from this folder, which maps a screen's
 * routes and options onto exactly these props:
 *
 * ```tsx
 * // app/(tabs)/_layout.tsx
 * <Tabs tabBar={(props) => <NavigationTabBar {...props} />} />
 * ```
 *
 * **A screen has to reserve room for it**, because the bar is drawn over
 * the screen rather than beside it — see `useTabBarSpace()`, which takes
 * the same `variant`/`avoidChin` options so the two can't disagree.
 *
 * @example
 * <TabBar items={items} value={tab} onChange={setTab} variant="floating" />
 */
export default function TabBar({
  items,
  value,
  onChange,
  variant = "sticky",
  avoidChin = true,
  style,
  testID,
}: TabBarProps) {
  const theme = useTheme();
  const elevationStyle = useElevationStyle("floating");
  const styles = useStyles();
  const insets = useSafeAreaInsets();
  const { height, floatingInset } = useTabBarMetrics();

  const chin = avoidChin ? insets.bottom : 0;
  const floating = variant === "floating";

  return (
    <View
      {...tabListA11yProps()}
      testID={testID}
      style={[
        styles.bar,
        {
          height: height + (floating ? 0 : chin),
          backgroundColor: theme.colors.background,
        },
        floating
          ? [
              styles.floating,
              elevationStyle,
              {
                borderColor: theme.colors.border,
                // The gap under a floating bar is its own inset plus the
                // chin, which is what `useTabBarSpace` reserves for it.
                marginBottom: floatingInset + chin,
                marginHorizontal: floatingInset,
              },
            ]
          : [
              styles.sticky,
              {
                // A hairline, not a control boundary: the bar is set apart
                // by position, the line only stops content running into it.
                borderTopColor: theme.colors.divider,
                // Padded rather than made taller by the chin, so the row of
                // tabs keeps its full height and only the dead space below
                // grows.
                paddingBottom: chin,
              },
            ],
        style,
      ]}
    >
      {items.map((item) => (
        <Tab
          key={item.key}
          item={item}
          selected={item.key === value}
          onPress={() => onChange(item.key)}
        />
      ))}
    </View>
  );
}

const useStyles = createStyles(({ isRTL, spacing, radius }) => ({
  bar: {
    flexDirection: isRTL ? "row-reverse" : "row",
    alignItems: "stretch",
  },
  sticky: {
    alignSelf: "stretch",
    borderTopWidth: spacing.x1,
  },
  floating: {
    borderRadius: radius.surface,
    borderWidth: spacing.x1,
    // Keeps a pressed tab's highlight inside the bar's corners.
    overflow: "hidden",
  },
}));
