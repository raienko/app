import dayjs, { type Dayjs } from "dayjs";
import utc from "dayjs/plugin/utc";
import moment from "moment";
import type { DateType } from "react-native-ui-datepicker";

dayjs.extend(utc);

/**
 * What's left of this picker's own date handling now that
 * react-native-ui-datepicker owns the calendar: the grid, the
 * out-of-range disabling and the month arithmetic all live in the library.
 *
 * Neither function mutates its argument — `Date`'s own setters do, which is
 * exactly the kind of shared-object edit that would surprise a caller
 * holding the same value in state.
 */

/** Pulls a value into [min, max]; either bound may be absent. */
export function clamp(date: Date, min?: Date, max?: Date): Date {
  if (min && date < min) return min;
  if (max && date > max) return max;
  return date;
}

/**
 * Narrows the library's `DateType` to a real `Date`.
 *
 * In `single` mode it always hands back a `Date` (or `null` once cleared),
 * but the prop type it's declared with covers dayjs objects, timestamps and
 * ISO strings as well — so this converts rather than casting, and reports
 * an unusable value as `null` instead of an `Invalid Date` that would only
 * surface later.
 */
export function toDate(value: DateType): Date | null {
  if (value === null || value === undefined) return null;

  const parsed =
    typeof value === "string"
      ? // Parsed strictly as ISO 8601. moment falls back to the `Date`
        // constructor for anything else and warns that it's doing so, which
        // is both looser than we want and noisy.
        moment(value, moment.ISO_8601)
      : value instanceof Date || typeof value === "number"
        ? moment(value)
        : // A dayjs object, which moment doesn't recognise — unwrap it to a
          // Date first.
          moment(value.toDate());

  return parsed.isValid() ? parsed.toDate() : null;
}

/**
 * The picker is run in UTC, and these convert at its boundary.
 *
 * Not a preference — a workaround with a measured cause. The library does
 * all of its internal date maths through dayjs's timezone plugin, which
 * asks `Intl` for a zone's offset. Hermes cannot answer, so every
 * conversion against a real zone comes back wrong: on device, opening the
 * sheet at 17:06 rendered 17:10, and one day-tap moved the time by nearly
 * an hour in one direction while our own copy moved three minutes in the
 * other. Pinned to `"UTC"` the same code is exact to the second, because
 * UTC needs no offset lookup at all.
 *
 * So the picker is handed a UTC-aware dayjs value whose fields read as the
 * local wall clock, and what it hands back is read the same way round. The
 * timezone-aware value matters on the first render: the library clones its
 * input with `dayjs(value)` before its timezone sync effect runs. A plain
 * Date loses the UTC interpretation in that clone and shifts the initial
 * wheel by the device offset. The trip goes through a formatted string
 * rather than an offset, which keeps it exact and independent of whatever
 * `Intl` can or cannot do.
 */
const WALL_CLOCK = "YYYY-MM-DDTHH:mm:ss.SSS";

/** Local wall clock in, the same wall clock as UTC out. */
export function toPickerDate(value: Date): Dayjs {
  return dayjs.utc(moment(value).format(WALL_CLOCK));
}

/** The picker's UTC wall clock in, the same wall clock as local out. */
export function fromPickerDate(value: DateType): Date | null {
  const date = toDate(value);
  if (date === null) return null;

  return moment(moment.utc(date).format(WALL_CLOCK), WALL_CLOCK).toDate();
}
