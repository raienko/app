import { View, type ViewProps } from "react-native";

import { disabledA11yProps } from "@/features/accessibility";
import { useSizes, useUnits, type SpacingToken } from "@/features/responsive";

export type SpacerDirection = "vertical" | "horizontal" | "both";

/**
 * Every prop that would give this thing something to say. A spacer is empty
 * by definition, so there is no case where any of them is the right answer —
 * omitting them makes passing one a `tsc` error rather than something that
 * silently un-hides the spacer from a screen reader (see `disabledA11yProps`
 * below, which is spread *after* the caller's props for the same reason).
 */
type SilencedProps =
  | "children"
  | "accessible"
  | "accessibilityElementsHidden"
  | "importantForAccessibility"
  | "aria-hidden"
  | "accessibilityRole"
  | "accessibilityLabel"
  | "accessibilityHint"
  | "role";

type Props = Omit<ViewProps, SilencedProps> & {
  /**
   * Which axes the gap occupies. Defaults to `"vertical"` — the common case
   * is separating stacked rows.
   *
   * The unused axis is left unset rather than zeroed, so a `"vertical"`
   * spacer in a row container (or the reverse) takes no width of its own
   * instead of forcing a 0-sized box into the layout.
   */
  direction?: SpacerDirection;
  /**
   * A step of the spacing scale by name (`"x8"`, `"x16"`, ...), or a raw
   * Figma px value for a gap the scale genuinely doesn't have. Either way
   * it's scaled through `units()` like every other size in the app.
   * Defaults to `"x16"`.
   */
  size?: SpacingToken | number;
};

/**
 * A blank, non-interactive gap between two elements — the explicit version
 * of a margin, for the places a parent `gap` can't express: an uneven step
 * inside an otherwise evenly-spaced stack, or a gap between two siblings
 * that neither of them owns.
 *
 * Prefer the parent's `gap` when the spacing is uniform; it says "these are
 * evenly spaced" in one place instead of once per gap. Note the two compose
 * rather than replace each other — dropping a `Spacer` into a `gap`'d
 * container adds the container's gap on *both* sides of it.
 *
 * **It is deliberately invisible to assistive technology.** It carries no
 * information a screen-reader user could act on, so it's hidden on every
 * platform at once via `disabledA11yProps()` rather than left as an empty
 * announced stop between the two things that actually matter.
 *
 * @example <Spacer />                              // 16pt vertical
 * @example <Spacer size="x8" />                     // 8pt vertical
 * @example <Spacer direction="horizontal" size="x24" />
 * @example <Spacer direction="both" size={10} />    // off-scale, still unit-scaled
 */
export default function Spacer({
  direction = "vertical",
  size = "x16",
  style,
  ...props
}: Props) {
  const { spacing } = useSizes();
  const units = useUnits();
  const value = typeof size === "number" ? units(size) : spacing[size];

  return (
    <View
      {...props}
      style={[
        {
          width: direction === "vertical" ? undefined : value,
          height: direction === "horizontal" ? undefined : value,
        },
        style,
      ]}
      // Spread last on purpose: unlike every other component here, a caller
      // overriding these would be undoing the one guarantee this component
      // makes. `SilencedProps` already keeps them out of `props`; this makes
      // the result true regardless.
      {...disabledA11yProps()}
    />
  );
}
