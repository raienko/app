import type { ReactNode } from "react";
import { StyleSheet } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { AccessibilityProvider } from "@/features/accessibility";
import { DeepLinks } from "@/features/deep-links";
import { LocaleProvider } from "@/features/localization";
import { Permissions } from "@/features/permissions";
import { ThemeProvider } from "@/features/theme";

type Props = {
  children: ReactNode;
};

/**
 * Every context provider a screen might need (state, theme, safe area, ...).
 * Shared by Root (the real app) and testing.tsx (Jest + Storybook), so a new
 * provider is added in exactly one place and every screen, test, and story
 * picks it up automatically — see src/root/index.tsx and src/root/testing.tsx.
 *
 * Not every entry is a context provider: `Permissions` and `DeepLinks` own
 * app-lifetime lifecycle rather than a value — keeping the OS permission
 * snapshots fresh, and subscribing to incoming links. They live here so
 * they're mounted exactly once, wrapping everything, on the same "add it in
 * one place" terms as the providers. Neither does anything in Storybook or
 * Jest: their state lives outside React (a LocalValue, a singleton), and
 * the deep-link pipeline stays gated shut without a navigator to route into.
 *
 * GestureHandlerRootView is here (rather than only where a gesture is used,
 * e.g. Modal's bottom-sheet swipe-to-dismiss) because react-native-gesture-handler
 * requires exactly one, wrapping the whole app, to reliably capture touches
 * on Android — not just wherever a gesture happens to be defined.
 */
export default function Providers({ children }: Props) {
  return (
    <GestureHandlerRootView style={styles.flex}>
      <SafeAreaProvider>
        <AccessibilityProvider>
          <Permissions>
            <DeepLinks>
              <ThemeProvider>
                <LocaleProvider>{children}</LocaleProvider>
              </ThemeProvider>
            </DeepLinks>
          </Permissions>
        </AccessibilityProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
});
