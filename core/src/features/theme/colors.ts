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
  /**
   * The categorical series order for charts — slot 1 first, always in this
   * order, never cycled. See CHART_SERIES_KEYS below for why these are
   * separate from the status colours and why the two schemes are different
   * values rather than one palette flipped.
   */
  chart1: string;
  chart2: string;
  chart3: string;
  chart4: string;
  chart5: string;
  chart6: string;
};

/**
 * The chart series slots, in the order a chart must assign them.
 *
 * **Fixed order, never cycled.** A seventh series is not a generated
 * seventh hue — it folds into an "Other" series, or the chart becomes small
 * multiples. Cycling back to slot 1 would give two different things the
 * same colour, which is worse than not drawing the seventh at all.
 *
 * **Separate from `success`/`warning`/`error`/`info` on purpose.** Those are
 * reserved: they mean a state, they always ship with an icon and a label,
 * and reusing one as "series 4" teaches a reader that red means bad in one
 * chart and means "Germany" in the next.
 *
 * **The dark values are chosen, not flipped.** They are the same six hues
 * stepped for a dark surface — a light-scheme palette inverted lands
 * outside the lightness band and loses its contrast against black. Both
 * sets were run through the data-viz validator against this app's own
 * surfaces (`#ffffff` and `#000000`) rather than eyeballed: worst adjacent
 * CVD ΔE 9.1 light / 8.4 dark against a target of 8, worst adjacent
 * normal-vision ΔE 19.6 / 19.3 against a floor of 15.
 *
 * Three light slots (`chart3`, `chart4`, `chart5`) sit under 3:1 against
 * white. That is a documented relief rather than a failure, and it is what
 * obliges `Chart` to carry a legend and an accessible readout of its data
 * instead of leaving identity to colour alone.
 */
export const CHART_SERIES_KEYS = [
  "chart1",
  "chart2",
  "chart3",
  "chart4",
  "chart5",
  "chart6",
] as const satisfies readonly (keyof ThemeColors)[];

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
  ...CHART_SERIES_KEYS,
];

export function validatePalette(
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
  light: validatePalette("light", rawColors.light),
  dark: validatePalette("dark", rawColors.dark),
};

export type ThemeOverrides = Partial<{
  light: Partial<ThemeColors>;
  dark: Partial<ThemeColors>;
}>;

/**
 * Returns an application palette layered over immutable core defaults. Every
 * scheme is validated after composition, so an incomplete app override still
 * receives core fallbacks while malformed values fail early.
 */
export function composePalette(
  overrides?: ThemeOverrides,
): Record<ColorScheme, ThemeColors> {
  return {
    light: validatePalette("light", { ...colors.light, ...overrides?.light }),
    dark: validatePalette("dark", { ...colors.dark, ...overrides?.dark }),
  };
}
