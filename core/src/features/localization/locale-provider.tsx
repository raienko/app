import { useCallback, useMemo, type ReactNode } from "react";

import { LocalValue } from "@/features/storage";

import LocaleContext from "./context";
import useOsLocale from "./os-locale";
import { translate, type TranslationKey } from "./translations";
import { LOCALES, type Locale, type LocalePreference } from "./types";

const localePreference = new LocalValue<LocalePreference>("locale-preference");

type Props = {
  children: ReactNode;
};

/**
 * Resolves the active locale from two inputs, in priority order:
 *
 * 1. **The user's explicit choice.** Once they pick a language in
 *    `LocaleSwitcher`, that's stored and wins — a later OS language change
 *    does not override a deliberate selection.
 * 2. **The device language**, while the preference is `"system"` (the
 *    default, so this is what a first launch uses). Tracked live and
 *    persisted by `useOsLocale`.
 *
 * Same shape as `ThemeProvider`: a stored preference of
 * `<concrete value> | "system"`, with `"system"` deferring to the OS.
 */
export default function LocaleProvider({ children }: Props) {
  // localePreference.use() is a method call, not a useXxx() identifier, so
  // React Compiler can't see it's a hook — see StorageValue.use().
  "use no memo";

  const preference = localePreference.use() ?? "system";
  const osLocale = useOsLocale();
  const locale = preference === "system" ? osLocale : preference;
  const isRTL = LOCALES.find((entry) => entry.code === locale)?.rtl ?? false;

  const t = useCallback(
    (key: TranslationKey, params?: Record<string, string | number>) =>
      translate(locale, key, params),
    [locale],
  );

  const setPreference = useCallback((next: LocalePreference) => {
    localePreference.setValue(next);
  }, []);

  const value = useMemo<Locale>(
    () => ({ locale, isRTL, preference, setPreference, t }),
    [locale, isRTL, preference, setPreference, t],
  );

  return (
    <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
  );
}
