import {
  translations,
  type LocaleCode,
  type TranslationKey,
} from "./translations";

export type { LocaleCode, TranslationKey };

export type LocalePreference = LocaleCode | "system";

export type LocaleInfo = {
  code: LocaleCode;
  /** English name, for contexts describing the locale rather than switching to it. */
  englishName: string;
  /** The language's own name for itself — what a LocaleSwitcher should actually show. */
  nativeName: string;
  rtl: boolean;
};

// Hand-authored (native names/rtl-ness aren't derivable from translations.ts),
// but cross-checked against it below so a locale can't drift out of sync —
// same fail-fast-on-load idea as theme/types.ts's THEME_PREFERENCES.
export const LOCALES: LocaleInfo[] = [
  { code: "en", englishName: "English", nativeName: "English", rtl: false },
  {
    code: "uk",
    englishName: "Ukrainian",
    nativeName: "Українська",
    rtl: false,
  },
  { code: "es", englishName: "Spanish", nativeName: "Español", rtl: false },
  { code: "zh", englishName: "Chinese", nativeName: "中文", rtl: false },
  { code: "ja", englishName: "Japanese", nativeName: "日本語", rtl: false },
  { code: "ar", englishName: "Arabic", nativeName: "العربية", rtl: true },
];

const localeCodes = new Set(LOCALES.map((locale) => locale.code));
const translationCodes = new Set(Object.keys(translations) as LocaleCode[]);
if (
  localeCodes.size !== translationCodes.size ||
  [...localeCodes].some((code) => !translationCodes.has(code))
) {
  throw new Error(
    "locale/types.ts's LOCALES is out of sync with locale/translations.ts's locale files",
  );
}

export const LOCALE_PREFERENCES: LocalePreference[] = [
  ...LOCALES.map((locale) => locale.code),
  "system",
];

export type Locale = {
  /** The resolved locale actually in effect (preference "system" resolved against the device). */
  locale: LocaleCode;
  isRTL: boolean;
  preference: LocalePreference;
  setPreference: (preference: LocalePreference) => void;
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;
};
