import rawColors from "./palette.json";

// Swap palette.json for a different palette (e.g. a rebrand) without
// touching any other file in this feature. Kept as a separate basename from
// this file (not colors.json) — Metro and Vite disagree on whether .ts or
// .json wins for a bare "./colors" specifier, so a same-name pair silently
// resolves to the wrong file depending on which bundler is running.
export type ThemeColors = {
  background: string;
  text: string;
  textSecondary: string;
  backgroundElement: string;
  backgroundElementSelected: string;
  error: string;
  /** Accent used for high-emphasis actions — see Button's `primary` type. */
  primary: string;
  /** Text/icon colour that sits legibly on `primary`. */
  onPrimary: string;
};

export type ColorScheme = "light" | "dark";

const REQUIRED_KEYS: (keyof ThemeColors)[] = [
  "background",
  "text",
  "textSecondary",
  "backgroundElement",
  "backgroundElementSelected",
  "error",
  "primary",
  "onPrimary",
];

function validate(
  scheme: ColorScheme,
  palette: Partial<ThemeColors>,
): ThemeColors {
  for (const key of REQUIRED_KEYS) {
    if (typeof palette[key] !== "string") {
      throw new Error(`theme/palette.json is missing "${scheme}.${key}"`);
    }
  }
  return palette as ThemeColors;
}

export const colors: Record<ColorScheme, ThemeColors> = {
  light: validate("light", rawColors.light),
  dark: validate("dark", rawColors.dark),
};
