import { useMemo, type ReactNode } from "react";
import { useColorScheme } from "react-native";

import { LocalValue } from "@/features/storage";

import { colors, type ColorScheme } from "./colors";
import ThemeContext from "./context";
import type { Theme, ThemePreference } from "./types";

const themePreference = new LocalValue<ThemePreference>("theme-preference");

type Props = {
  children: ReactNode;
};

export default function ThemeProvider({ children }: Props) {
  const systemScheme = useColorScheme();
  const preference = themePreference.useValue() ?? "system";
  const scheme: ColorScheme =
    preference === "system"
      ? systemScheme === "dark"
        ? "dark"
        : "light"
      : preference;

  const theme = useMemo<Theme>(
    () => ({
      scheme,
      colors: colors[scheme],
      preference,
      setPreference: (next) => themePreference.setValue(next),
    }),
    [scheme, preference],
  );

  return (
    <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>
  );
}
