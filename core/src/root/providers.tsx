import type { ReactNode } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { ThemeProvider } from "@/features/theme";

type Props = {
  children: ReactNode;
};

/**
 * Every context provider a screen might need (state, theme, safe area, ...).
 * Shared by Root (the real app) and testing.tsx (Jest + Storybook), so a new
 * provider is added in exactly one place and every screen, test, and story
 * picks it up automatically — see src/root/index.tsx and src/root/testing.tsx.
 */
export default function Providers({ children }: Props) {
  return (
    <SafeAreaProvider>
      <ThemeProvider>{children}</ThemeProvider>
    </SafeAreaProvider>
  );
}
