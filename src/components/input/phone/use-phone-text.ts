import {
  AsYouType,
  getCountryCallingCode,
  parseDigits,
  parsePhoneNumberFromString,
  validatePhoneNumberLength,
  type CountryCode,
} from "libphonenumber-js";
import { useState } from "react";

type PhoneAnalysis = {
  text: string;
  value: string | null;
  detectedCountry?: CountryCode;
};

/** E.164 permits at most fifteen digits, excluding the leading `+`. */
const MAX_E164_DIGITS = 15;

function analyze(raw: string, country?: CountryCode): PhoneAnalysis {
  const formatter = new AsYouType(country);
  const text = formatter.input(raw);
  const parsed = parsePhoneNumberFromString(text, country);

  return {
    text,
    value: parsed?.isValid() ? parsed.number : null,
    detectedCountry: formatter.getCountry() ?? parsed?.country,
  };
}

function countryOf(value: string | null): CountryCode | undefined {
  return value ? parsePhoneNumberFromString(value)?.country : undefined;
}

/**
 * How a finished number is shown: grouped the local way when it belongs to
 * `country`, and with its dialling code when it doesn't — which is the only
 * way a number from elsewhere is unambiguous. National grouping here matches
 * what `AsYouType` produces, so re-displaying a value doesn't reshuffle what
 * was just typed.
 */
function display(value: string, country?: CountryCode): string {
  const parsed = parsePhoneNumberFromString(value, country);
  if (!parsed) return analyze(value, country).text;

  return country && parsed.countryCallingCode === getCountryCallingCode(country)
    ? parsed.formatNational()
    : parsed.formatInternational();
}

function toE164(text: string, country?: CountryCode): string | null {
  const parsed = parsePhoneNumberFromString(text, country);
  return parsed?.isValid() ? parsed.number : null;
}

/** Digits libphonenumber understands, retaining `+` for international input. */
function dialableOf(text: string): string {
  const prefix = text.trimStart().startsWith("+") ? "+" : "";
  return `${prefix}${parseDigits(text)}`;
}

/**
 * Stops at the selected numbering plan's maximum rather than accepting an
 * arbitrarily long invalid string. The global E.164 ceiling also covers the
 * period before an international calling code can be identified.
 */
function limitPhoneLength(text: string, country?: CountryCode): string {
  const dialable = dialableOf(text);
  const prefix = dialable.startsWith("+") ? "+" : "";
  const digits = parseDigits(dialable).slice(0, MAX_E164_DIGITS);
  let accepted = "";

  for (const digit of digits) {
    const candidate = `${prefix}${accepted}${digit}`;
    if (validatePhoneNumberLength(candidate, country) === "TOO_LONG") break;
    accepted += digit;
  }

  return `${prefix}${accepted}`;
}

/**
 * Buffers the formatted text separately from the E.164 value. It also owns
 * the active country: `defaultCountry` starts national input in the right
 * numbering plan, while an international number can replace it as soon as
 * libphonenumber has enough digits to identify the country.
 */
export default function usePhoneText(
  value: string | null,
  onChange: (value: string | null) => void,
  defaultCountry?: CountryCode,
  onCountryChange?: (country: CountryCode) => void,
) {
  const [country, setCountry] = useState<CountryCode | undefined>(
    () => countryOf(value) ?? defaultCountry,
  );
  const [text, setText] = useState(() =>
    value === null ? "" : display(value, countryOf(value) ?? defaultCountry),
  );

  // Resync only when the controlled value really changes from outside. A
  // value reported from the current text must leave that in-progress text
  // alone, including its caret-friendly as-you-type formatting.
  const [previous, setPrevious] = useState(value);
  if (value !== previous) {
    setPrevious(value);
    if (toE164(text, country) !== value) {
      const nextCountry = countryOf(value) ?? country;
      if (nextCountry !== country) setCountry(nextCountry);
      setText(value === null ? "" : display(value, nextCountry));
    }
  }

  function updateCountry(next: CountryCode) {
    if (next === country) return;
    setCountry(next);
    onCountryChange?.(next);
  }

  function onChangeText(raw: string) {
    // Backspacing over punctuation would otherwise put the formatter's own
    // character straight back. Preserve a leading `+` while removing one
    // actual digit, so international input never turns into a national one.
    const deleting = raw.length < text.length;
    const rawDialable = dialableOf(raw);
    const currentDialable = dialableOf(text);
    const stripped =
      deleting && rawDialable === currentDialable
        ? rawDialable.slice(0, -1)
        : raw;

    const result = analyze(limitPhoneLength(stripped, country), country);
    if (result.detectedCountry) updateCountry(result.detectedCountry);

    // A complete international number moves its calling code into the
    // picker. Partial international input stays untouched to avoid jumping
    // while the user is still establishing the country code.
    const nextText =
      result.value && result.detectedCountry
        ? display(result.value, result.detectedCountry)
        : result.text;

    setText(nextText);
    onChange(result.value);
  }

  function selectCountry(nextCountry: CountryCode) {
    const parsed = parsePhoneNumberFromString(text, country);
    const nationalDigits = limitPhoneLength(
      parsed?.nationalNumber ?? parseDigits(text),
      nextCountry,
    );
    const result = analyze(nationalDigits, nextCountry);
    const nextText = result.value
      ? display(result.value, nextCountry)
      : result.text;

    updateCountry(nextCountry);
    setText(nextText);
    onChange(result.value);
  }

  return { text, country, onChangeText, selectCountry };
}
