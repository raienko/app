[Docs](../../../docs/index.md) › [Components](../../../docs/components/index.md) › Navigation

# TabBar

> Bottom tabs for an Expo Router `Tabs` navigator, docked or floating.

<sub>`src/components/tab-bar` · [Stories](index.stories.tsx) · [Tests](index.test.tsx)</sub>

```tsx
// app/(tabs)/_layout.tsx
import { Tabs } from "expo-router";
import { NavigationTabBar } from "@/components/tab-bar";

<Tabs
  screenOptions={{ headerShown: false }}
  tabBar={(props) => <NavigationTabBar {...props} variant="floating" />}
/>;

// and in each screen, so its last row clears the bar
const space = useTabBarSpace({ variant: "floating" });
<Screen scrollable contentContainerStyle={{ paddingBottom: space }} />;
```

A bottom tab bar for an Expo Router `Tabs` navigator, in two shapes: `sticky` (docked to the edge, full width, top border) or `floating` (inset as an outlined, raised bar that content scrolls under). Default `sticky`.

- **Three exports, one component.** `TabBar` is the controlled form (`items` / `value` / `onChange`) — that's what the Showcase and stories drive, and what makes the whole thing testable without standing up a navigator. `NavigationTabBar` is the same bar wired to a navigator's props. They live in separate files behind a barrel for the reason `button` and `icon` do: the adapter imports the bar, so defining both in `index` would have them importing each other.
- **The adapter reads each route's own options**, so tabs stay configured the way every Expo Router app already configures them — `title` for the label, `tabBarIcon` for the glyph, `href: null` to keep one out of the bar — rather than being described a second time. Its props type is derived from `Tabs`'s own (`Parameters<NonNullable<ComponentProps<typeof Tabs>["tabBar"]>>[0]`) rather than imported: React Navigation's `BottomTabBarProps` isn't re-exported at `expo-router`'s top level, and reaching into its `build/` folder for a type breaks on any internal reshuffle.
- **Pressing goes through the navigator, not straight to `navigate()`.** A `tabPress` event goes out first and a listener can cancel it (`preventDefault`) — which is how "scroll to top instead of re-navigating" and "block leaving a dirty form" are written. An already-focused tab doesn't navigate again. The controlled form still reports a press on the current tab, because that press is exactly what those listeners are for.
- **`avoidChin`** adds the bottom safe-area inset so the bar clears the home indicator. **On by default**, unlike `Header`'s `avoidNotch`: a tab bar is at the bottom of the screen by definition, so the inset is right in every case except one deliberately nested elsewhere. A `sticky` bar is _padded_ by it, keeping the row of tabs at full height and growing only the dead space beneath; a `floating` bar is _lifted_ by it, since it's already off the edge.
- **`useTabBarSpace({ variant, avoidChin })` is the reserved height**, and it takes the same options the bar does so the two can't disagree. The bar is drawn over the screen, not beside it, so nothing in the layout tells a list that its last row is underneath one — and the usual fix, a hardcoded `paddingBottom: 80`, silently breaks on a different chin, at a different text size, or the moment the variant changes. There is deliberately **no exported height constant**: every consumer goes through the hook so the value is scaled through `units()` like every other size, the same reasoning `sizes.ts` gives for keeping its own scale private. Demonstrated in the Showcase with a switch that turns the reservation off — verified in the browser, where the last row sits clear of the bar with it on (bottom 322 vs bar top 330) and disappears beneath it with it off (381 vs 330).
- **Accessibility is a `tablist` of `tab`s**, not a row of buttons: a tab tells a screen reader that picking it swaps the view rather than performing an action, and that it belongs to the set its parent declares — which is what makes position announcements work. Each tab's whole column is the touch target, since a tab bar's most common miss is a hit area the size of the glyph.
- **Not yet wired into this app's routing.** The showcase is a single route, and adding a `(tabs)` group would restructure the app rather than add a component — so the Showcase demonstrates it over a bounded scrolling stage instead, which is also the only way to show what the space hook is for.

---

[All components](../../../docs/components/index.md) · [Docs index](../../../docs/index.md)
