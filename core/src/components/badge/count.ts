/**
 * How a badge turns a number into the two or three characters it has room
 * for. Split from the component and pure, for the same reason
 * `media-player/time.ts` and `input/datetime/format.ts` are: the rounding
 * and overflow rules are where the mistakes live, and they're worth testing
 * without rendering anything.
 */

// One formatter per locale, built on first use. `Intl.NumberFormat`'s
// constructor is the expensive half; a badge that re-renders on every
// unread count shouldn't pay it again each time.
const formatters = new Map<string, Intl.NumberFormat | null>();

function digitsIn(value: number, locale: string): string {
  if (!formatters.has(locale)) {
    try {
      formatters.set(locale, new Intl.NumberFormat(locale));
    } catch {
      // A runtime without the locale data still gets a readable count.
      formatters.set(locale, null);
    }
  }
  return formatters.get(locale)?.format(value) ?? String(value);
}

/**
 * The count as digits in the active locale, capped at `max` and handed to
 * `overflow` when it goes over.
 *
 * The locale is what makes this more than `String(count)`: a thousands
 * separator is a comma in `en` and a full stop in `de`, and a locale that
 * asks for its own numbering system gets its own digits (`ar-EG` → ٩٩).
 * Where the runtime can't honour a tag at all, the plain digits are still
 * a readable count rather than an exception — Hermes' `Intl` coverage
 * varies by platform, so that fallback is load-bearing, not defensive.
 *
 * `overflow` is a function rather than a `"+"` appended here because the
 * suffix is copy — a locale is free to put it somewhere else — so it comes
 * from a translation key at the call site.
 */
export function formatCount(
  count: number,
  max: number,
  locale: string,
  overflow: (value: string) => string,
): string {
  const capped = Math.min(count, max);
  const value = digitsIn(capped, locale);
  return count > max ? overflow(value) : value;
}
