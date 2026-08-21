import ar from "./translations/ar.json";
import en from "./translations/en.json";
import es from "./translations/es.json";
import ja from "./translations/ja.json";
import uk from "./translations/uk.json";
import zh from "./translations/zh.json";

// Swap/extend the JSON files under ./translations without touching this
// file — en.json is the source of truth for which keys must exist, and
// every other locale is validated against it below (same
// validate-on-load idea as theme/colors.ts).
export type LocaleCode = "en" | "uk" | "es" | "zh" | "ja" | "ar";

type Flatten<T, Prefix extends string = ""> = T extends string
  ? Prefix extends `${infer Head}.`
    ? Head
    : never
  : {
      [K in keyof T & string]: T[K] extends string
        ? `${Prefix}${K}`
        : Flatten<T[K], `${Prefix}${K}.`>;
    }[keyof T & string];

export type TranslationKey = Flatten<typeof en>;

const raw: Record<LocaleCode, unknown> = { en, uk, es, zh, ja, ar };

function flattenKeys(value: unknown, prefix = ""): string[] {
  if (typeof value === "string") {
    return [prefix];
  }
  return Object.entries(value as Record<string, unknown>).flatMap(
    ([key, child]) => flattenKeys(child, prefix ? `${prefix}.${key}` : key),
  );
}

const expectedKeys = new Set(flattenKeys(en));

function validate(locale: LocaleCode, value: unknown): Record<string, unknown> {
  const keys = new Set(flattenKeys(value));
  const missing = [...expectedKeys].filter((key) => !keys.has(key));
  const extra = [...keys].filter((key) => !expectedKeys.has(key));

  if (missing.length > 0 || extra.length > 0) {
    const details = [
      missing.length > 0 ? `missing: ${missing.join(", ")}` : null,
      extra.length > 0 ? `extra: ${extra.join(", ")}` : null,
    ]
      .filter(Boolean)
      .join("; ");
    throw new Error(
      `locale/translations/${locale}.json is out of sync with en.json (${details})`,
    );
  }

  return value as Record<string, unknown>;
}

export const translations: Record<
  LocaleCode,
  Record<string, unknown>
> = Object.fromEntries(
  (Object.entries(raw) as [LocaleCode, unknown][]).map(([locale, value]) => [
    locale,
    validate(locale, value),
  ]),
) as Record<LocaleCode, Record<string, unknown>>;

export function translate(
  locale: LocaleCode,
  key: TranslationKey,
  params?: Record<string, string | number>,
): string {
  const value = key.split(".").reduce<unknown>((node, segment) => {
    if (node && typeof node === "object") {
      return (node as Record<string, unknown>)[segment];
    }
    return undefined;
  }, translations[locale]);

  if (typeof value !== "string") {
    throw new Error(`Missing translation for "${key}" in locale "${locale}"`);
  }

  if (!params) {
    return value;
  }

  return value.replace(/\{\{(\w+)\}\}/g, (match, token: string) =>
    token in params ? String(params[token]) : match,
  );
}
