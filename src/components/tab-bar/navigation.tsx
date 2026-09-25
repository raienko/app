import type { ComponentProps } from "react";
import { Tabs } from "expo-router";

import { useSizes } from "@/features/responsive";
import { useTheme } from "@/features/theme";

import TabBar from "./tab-bar";
import type { TabBarItem, TabBarLayoutProps } from "./types";

/**
 * Exactly what Expo Router hands a custom `tabBar`, derived from `Tabs`'s
 * own props rather than imported: React Navigation's `BottomTabBarProps`
 * isn't re-exported at `expo-router`'s top level, and reaching into its
 * `build/` folder for a type would break on any internal reshuffle.
 */
export type NavigationTabBarProps = Parameters<
  NonNullable<ComponentProps<typeof Tabs>["tabBar"]>
>[0];

type Props = NavigationTabBarProps & TabBarLayoutProps;

/**
 * `TabBar` wired to a navigator, which is what the component is for:
 *
 * ```tsx
 * // app/(tabs)/_layout.tsx
 * import { Tabs } from "expo-router";
 * import { NavigationTabBar } from "@/components/tab-bar";
 *
 * <Tabs
 *   screenOptions={{ headerShown: false }}
 *   tabBar={(props) => <NavigationTabBar {...props} avoidChin />}
 * />
 * ```
 *
 * It reads each route's own options, so tabs keep being configured the way
 * every Expo Router app already configures them — `title` for the label,
 * `tabBarIcon` for the glyph, `href: null` to hide one — rather than being
 * described a second time here.
 *
 * The press path is the navigator's, not a shortcut to `navigate()`: a
 * `tabPress` event goes out first and a listener is free to cancel it
 * (`preventDefault`), which is how "scroll to top instead of re-navigating"
 * and "block leaving a dirty form" are written. A tab that's already
 * focused doesn't navigate again.
 */
export default function NavigationTabBar({
  state,
  descriptors,
  navigation,
  ...layout
}: Props) {
  const theme = useTheme();
  const { spacing } = useSizes();

  const routes = state.routes.filter((route) => {
    // Expo Router hides a tab with `href: null`. It isn't in React
    // Navigation's own options type, so it's read defensively rather than
    // asserted — a route without the key simply stays visible.
    const options = descriptors[route.key]?.options as { href?: unknown };
    return options?.href !== null;
  });

  const items: TabBarItem[] = routes.map((route) => {
    const { options } = descriptors[route.key];
    const focused = state.routes[state.index]?.key === route.key;

    return {
      key: route.key,
      label: options.title ?? route.name,
      icon: options.tabBarIcon?.({
        focused,
        // The route's own icon renderer gets the colour this bar would have
        // used anyway, so an icon that ignores the argument and an icon
        // that honours it both come out right.
        color: focused ? theme.colors.text : theme.colors.textSecondary,
        size: spacing.x24,
      }),
      testID: options.tabBarButtonTestID,
    };
  });

  function select(key: string) {
    const route = routes.find((candidate) => candidate.key === key);
    if (!route) return;

    const event = navigation.emit({
      type: "tabPress",
      target: route.key,
      canPreventDefault: true,
    });

    const focused = state.routes[state.index]?.key === route.key;
    if (focused || event.defaultPrevented) return;

    navigation.navigate(route.name, route.params);
  }

  return (
    <TabBar
      {...layout}
      items={items}
      value={state.routes[state.index]?.key ?? ""}
      onChange={select}
    />
  );
}
