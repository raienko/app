import { useCallback, useMemo, type ReactNode } from "react";
import { getLocales } from "expo-localization";

import { LocalValue } from "@/features/storage";

import LocaleContext from "./context";
import { translate, type TranslationKey } from "./translations";
import {
  LOCALES,
  type Locale,
  type LocaleCode,
  type LocalePreference,
} from "./types";

const localePreference = new LocalValue<LocalePreference>("locale-preference");
const supportedCodes = new Set(LOCALES.map((locale) => locale.code));

function resolveSystemLocale(): LocaleCode {
  for (const device of getLocales()) {
    if (
      device.languageCode &&
      supportedCodes.has(device.languageCode as LocaleCode)
    ) {
      return device.languageCode as LocaleCode;
    }
  }
  return "en";
}

type Props = {
  children: ReactNode;
};

export default function LocaleProvider({ children }: Props) {
  // localePreference.use() is a method call, not a useXxx() identifier, so
  // React Compiler can't see it's a hook — see StorageValue.use().
  "use no memo";

  const preference = localePreference.use() ?? "system";
  const locale: LocaleCode =
    preference === "system" ? resolveSystemLocale() : preference;
  const isRTL = LOCALES.find((entry) => entry.code === locale)?.rtl ?? false;

  const t = useCallback(
    (key: TranslationKey, params?: Record<string, string | number>) =>
      translate(locale, key, params),
    [locale],
  );

  const value = useMemo<Locale>(
    () => ({
      locale,
      isRTL,
      preference,
      setPreference: (next) => localePreference.setValue(next),
      t,
    }),
    [locale, isRTL, preference, t],
  );

  return (
    <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
  );
}
