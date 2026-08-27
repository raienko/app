import moment from "moment";
import "moment/locale/ar";
import "moment/locale/es";
import "moment/locale/ja";
import "moment/locale/uk";
import "moment/locale/zh-cn";
import type { DatePickerBaseProps } from "react-native-ui-datepicker";

import type { LocaleCode } from "@/features/localization";

import type { DateTimeMode } from "../types";

/**
 * How the *collapsed field* renders its value, via moment.
 *
 * moment carries its own locale data rather than leaning on `Intl`, which
 * matters here beyond preference: asking `Intl` for a 24-hour time through
 * `timeStyle` silently lost the clock on Hermes, so the field read
 * "2:32 PM" on device above wheels reading 14. `HH:mm` is a literal token
 * with no locale opinion to override, so the same string comes out on every
 * engine.
 *
 * English is built into moment; every other locale's data has to be
 * imported for its side effect, which is what the imports above are for.
 */

/**
 * moment's locale ids, which are not simply our codes: it ships no plain
 * `zh` (only the regional variants), so Chinese has to name one.
 */
const MOMENT_LOCALE: Record<LocaleCode, string> = {
  en: "en",
  uk: "uk",
  es: "es",
  zh: "zh-cn",
  ja: "ja",
  ar: "ar",
};

/**
 * `ll` is moment's localized medium date — it orders and abbreviates per
 * locale on its own. The time is deliberately *not* `LT`, moment's
 * localized time, because that follows the locale's own clock and half of
 * ours are 12-hour: the picker can only be trusted with 24-hour wheels (see
 * TWELVE_HOUR_UNSUPPORTED in ./index), and a field disagreeing with the
 * wheels above it would be showing one moment two ways.
 */
const VALUE_FORMAT: Record<DateTimeMode, string> = {
  date: "ll",
  time: "HH:mm",
  datetime: "ll HH:mm",
};

export function formatValue(
  value: Date,
  locale: LocaleCode,
  mode: DateTimeMode,
): string {
  // `.locale()` on the instance rather than `moment.locale()`, which would
  // set it globally for everything else in the app as a side effect.
  return moment(value).locale(MOMENT_LOCALE[locale]).format(VALUE_FORMAT[mode]);
}

/**
 * Which digits the picker should draw, matched to the ones moment writes in
 * the field above it. Arabic is the case that forces the question: moment
 * renders "٢٧ أغسطس ٢٠٢٦" while the picker defaults to Latin, and the two
 * sitting together in one sheet reads like a rendering fault.
 */
export function numeralsFor(
  locale: LocaleCode,
): NonNullable<DatePickerBaseProps["numerals"]> {
  return locale === "ar" ? "arab" : "latn";
}
