import type { ReactNode } from "react";
import { StyleSheet } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { AccessibilityProvider } from "@/features/accessibility";
import { LocaleProvider } from "@/features/localization";
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
          <ThemeProvider>
            <LocaleProvider>{children}</LocaleProvider>
          </ThemeProvider>
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
