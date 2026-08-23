import { useMemo } from "react";
import { Platform, type TextStyle } from "react-native";

import useUnits from "./units";

/**
 * RN's special-cased "System" font resolves to San Francisco on iOS — the
 * same font Apple's own type scale below is specified in, so no font
 * bundling is needed there. Android has no San Francisco equivalent, so it
 * gets its own default system font rather than a look that doesn't exist
 * there; web gets the standard Apple-first system-font stack (the same one
 * macOS/iOS Safari's own UI uses), so it resolves to San Francisco wherever
 * the OS actually has it and a sane native-looking fallback everywhere
 * else.
 *
 * The default every `RAW_TYPOGRAPHY` entry below uses — not the only font
 * the scale can have. Each entry names its own `fontFamily` rather than
 * the whole scale sharing one hardcoded constant, so a future style that
 * genuinely needs a different face (a monospace `caption2` for code, a
 * distinct display face for `largeTitle`) is a one-line change to that
 * entry, not a structural change to how typography works.
 */
const SYSTEM_FONT_FAMILY = Platform.select({
  ios: "System",
  android: "sans-serif",
  web: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  default: "System",
});

/**
 * Apple's Human Interface Guidelines type scale for iOS/iPadOS — the
 * default ("Large") Dynamic Type size, i.e. the sizes Apple's own apps use
 * before a user changes their text-size setting:
 * https://developer.apple.com/design/human-interface-guidelines/typography
 *
 * Point sizes, line heights, and tracking (letter spacing) are Apple's own
 * published values for this scale, used as-is as the Figma-px input to
 * units() — exactly like SPACING/RADIUS's steps, not invented for this
 * app. `fontWeight` follows Apple's spec too: everything is Regular (400)
 * except Headline, which HIG specifies as Semibold (600) to visually
 * separate it from Body despite sharing Body's 17pt size. Every entry uses
 * `SYSTEM_FONT_FAMILY` for now (San Francisco is what HIG itself specifies
 * this scale in) — see that constant's own doc comment for why each entry
 * names its font individually instead of the scale hardcoding one face.
 */
const RAW_TYPOGRAPHY = {
  largeTitle: {
    fontFamily: SYSTEM_FONT_FAMILY,
    fontSize: 34,
    lineHeight: 41,
    fontWeight: "400",
    letterSpacing: 0.37,
  },
  title1: {
    fontFamily: SYSTEM_FONT_FAMILY,
    fontSize: 28,
    lineHeight: 34,
    fontWeight: "400",
    letterSpacing: 0.36,
  },
  title2: {
    fontFamily: SYSTEM_FONT_FAMILY,
    fontSize: 22,
    lineHeight: 28,
    fontWeight: "400",
    letterSpacing: 0.35,
  },
  title3: {
    fontFamily: SYSTEM_FONT_FAMILY,
    fontSize: 20,
    lineHeight: 25,
    fontWeight: "400",
    letterSpacing: 0.38,
  },
  headline: {
    fontFamily: SYSTEM_FONT_FAMILY,
    fontSize: 17,
    lineHeight: 22,
    fontWeight: "600",
    letterSpacing: -0.41,
  },
  body: {
    fontFamily: SYSTEM_FONT_FAMILY,
    fontSize: 17,
    lineHeight: 22,
    fontWeight: "400",
    letterSpacing: -0.41,
  },
  callout: {
    fontFamily: SYSTEM_FONT_FAMILY,
    fontSize: 16,
    lineHeight: 21,
    fontWeight: "400",
    letterSpacing: -0.32,
  },
  subheadline: {
    fontFamily: SYSTEM_FONT_FAMILY,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "400",
    letterSpacing: -0.24,
  },
  footnote: {
    fontFamily: SYSTEM_FONT_FAMILY,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "400",
    letterSpacing: -0.08,
  },
  caption1: {
    fontFamily: SYSTEM_FONT_FAMILY,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "400",
    letterSpacing: 0,
  },
  caption2: {
    fontFamily: SYSTEM_FONT_FAMILY,
    fontSize: 11,
    lineHeight: 13,
    fontWeight: "400",
    letterSpacing: 0.06,
  },
} as const satisfies Record<
  string,
  {
    fontFamily: string;
    fontSize: number;
    lineHeight: number;
    fontWeight: TextStyle["fontWeight"];
    letterSpacing: number;
  }
>;

/** `"largeTitle" | "title1" | ... | "caption2"` — Text's `type` prop, see index.tsx. */
export type TypographyToken = keyof typeof RAW_TYPOGRAPHY;

export type TypographyStyle = {
  fontFamily: string;
  fontSize: number;
  fontWeight: TextStyle["fontWeight"];
  lineHeight: number;
  letterSpacing: number;
};

export type Typography = { [K in TypographyToken]: TypographyStyle };

/**
 * The typography styleguide, reactive and already scaled — every field on
 * `typography.body` (etc.) is a real, final value with no `units()`
 * wrapping needed at the call site, same reasoning as `useSizes()`'s
 * `spacing`/`radius`/`sizes`.
 *
 * `createStyles` (see create-styles.ts) calls this internally and hands
 * `typography` straight to the style factory — most call sites never call
 * this directly. `Text` (`src/components/text`) is the one place that does,
 * since its `type` prop needs to pick a single variant out of the whole
 * scale at render time rather than bake one fixed variant into a static
 * style key.
 */
export function useTypography(): Typography {
  const units = useUnits();
  return useMemo(
    () =>
      Object.fromEntries(
        Object.entries(RAW_TYPOGRAPHY).map(([key, value]) => [
          key,
          {
            fontFamily: value.fontFamily,
            fontSize: units(value.fontSize),
            fontWeight: value.fontWeight,
            lineHeight: units(value.lineHeight),
            letterSpacing: units(value.letterSpacing),
          },
        ]),
      ) as Typography,
    [units],
  );
}
