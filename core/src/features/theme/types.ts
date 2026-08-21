import type { ColorScheme, ThemeColors } from "./colors";

export type ThemePreference = ColorScheme | "system";

export type Theme = {
  /** The resolved scheme actually in effect (preference "system" resolved against the OS setting). */
  scheme: ColorScheme;
  colors: ThemeColors;
  preference: ThemePreference;
  setPreference: (preference: ThemePreference) => void;
};
