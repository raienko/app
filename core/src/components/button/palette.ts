/**
 * The visual vocabulary shared by every button-shaped control: `Button` and
 * `IconButton` both read it, so a change to what `secondary` means lands on
 * both at once.
 *
 * It sits beside them rather than inside either, and both ship from this
 * folder for the same reason `grid` ships Row and Cell together — a sibling
 * folder would have to reach across into another component's internals to
 * get at it.
 */
import type { ThemeColors } from "@/features/theme";

export type ButtonSize = "small" | "medium" | "large" | "auto";
export type ButtonType = "primary" | "secondary" | "tertiary";

/**
 * Which palette entries each type draws from. Two backgrounds per type —
 * resting and `selected` — so a segmented control reads as picked in every
 * type, not just the one that happens to have a darker token.
 *
 * `null` means "no fill": `tertiary` is a text-only button, so its resting
 * state paints nothing and only picks up a background once selected.
 *
 * **`secondary` carries a border, and that's not decoration.** Its fill is
 * `backgroundElement` — the same token `Accordion`, `Modal` and every other
 * raised surface uses. Sitting on one of those, a fill-only secondary button
 * is literally the same colour as what's behind it and disappears; the
 * showcase made that obvious the moment a `primary` button sat next to one.
 * The border gives it an edge on any surface without changing the fill every
 * existing button in the app already has.
 *
 * That border is `textSecondary` rather than the more obvious
 * `backgroundElementSelected`: on a `backgroundElement` surface — the exact
 * case the border exists for — the two neighbouring greys contrast at 1.19:1,
 * far under the 3:1 WCAG 1.4.11 asks of a boundary that is the only thing
 * marking the control. `textSecondary` clears it in both schemes.
 */
export const TYPE_COLORS: Record<
  ButtonType,
  {
    background: keyof ThemeColors | null;
    backgroundSelected: keyof ThemeColors;
    border: keyof ThemeColors | null;
    label: keyof ThemeColors;
    labelSelected?: keyof ThemeColors;
  }
> = {
  primary: {
    background: "primary",
    backgroundSelected: "primary",
    border: null,
    label: "onPrimary",
  },
  secondary: {
    background: "backgroundElement",
    backgroundSelected: "backgroundElementSelected",
    border: "textSecondary",
    label: "text",
  },
  tertiary: {
    background: null,
    backgroundSelected: "backgroundElement",
    border: null,
    label: "primary",
  },
};
