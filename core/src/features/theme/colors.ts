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
  /** Default visible boundary for controls and content surfaces. */
  border: string;
  /** Muted fill for controls that are unavailable for interaction. */
  disabled: string;
  error: string;
  success: string;
  warning: string;
  info: string;
  /** Scrim color behind overlays; the overlay controls its own opacity. */
  overlay: string;
  /**
   * The letterbox behind media that doesn't fill its frame. Black in both
   * schemes on purpose, unlike every other surface here: a video's own
   * black bars are what the eye expects around a picture, and a light one
   * would read as a rendering fault rather than a theme.
   */
  mediaSurface: string;
  /** Base colour used by platform shadow APIs. */
  shadow: string;
  /** Bottom-sheet drag indicator. */
  grabber: string;
  /** Keyboard/screen-reader focus indicator. */
  focus: string;
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
  "border",
  "disabled",
  "error",
  "success",
  "warning",
  "info",
  "overlay",
  "mediaSurface",
  "shadow",
  "grabber",
  "focus",
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
