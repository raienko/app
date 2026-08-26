import {
  Pressable,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from "react-native";

import Text from "@/components/text";
import { controlA11yProps } from "@/features/accessibility";
import { createStyles, type TypographyToken } from "@/features/responsive";
import { useTheme, type ThemeColors } from "@/features/theme";

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
const TYPE_COLORS: Record<
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

/**
 * Which step of the type scale each size sets its label in.
 *
 * The box metrics (height, padding) deliberately live in the stylesheet
 * below instead: they need `units()`-scaled values, which only
 * `createStyles` has. Splitting them isn't ideal, but duplicating the
 * heights into a const nothing reads would be worse.
 */
const SIZE_TEXT: Record<ButtonSize, TypographyToken> = {
  small: "footnote",
  medium: "body",
  large: "headline",
  auto: "body",
};

type Props = Omit<PressableProps, "children" | "style"> & {
  value: string;
  /**
   * Visual emphasis. Defaults to `"secondary"` — the app's buttons are
   * overwhelmingly utility actions, and defaulting to `primary` would make
   * every one of them shout.
   */
  type?: ButtonType;
  /** Defaults to `"medium"`, which is the 44pt touch-target height. */
  size?: ButtonSize;
  /** One of several choices (a segmented option) — also announced as such. */
  selected?: boolean;
  style?: StyleProp<ViewStyle>;
};

export default function Button({
  value,
  type = "secondary",
  size = "medium",
  selected = false,
  disabled,
  style,
  ...props
}: Props) {
  const theme = useTheme();
  const styles = useStyles();

  const palette = TYPE_COLORS[type];
  const background = selected ? palette.backgroundSelected : palette.background;
  const label =
    selected && palette.labelSelected ? palette.labelSelected : palette.label;

  return (
    <Pressable
      // Announced as a button, with its selected/disabled state — a plain
      // Pressable has no role of its own, so without this every button in
      // the app reads as an anonymous group to a screen reader. The label
      // comes from the Text child, so it isn't passed explicitly.
      {...controlA11yProps({ disabled: disabled ?? false, selected })}
      style={[
        styles.button,
        styles[size],
        {
          backgroundColor:
            background === null ? "transparent" : theme.colors[background],
          borderColor:
            palette.border === null
              ? "transparent"
              : theme.colors[palette.border],
          opacity: disabled ? 0.5 : 1,
        },
        style,
      ]}
      disabled={disabled}
      {...props}
    >
      <Text
        value={value}
        type={SIZE_TEXT[size]}
        style={{ color: theme.colors[label] }}
      />
    </Pressable>
  );
}

const useStyles = createStyles(({ spacing, radius, sizes }) => ({
  button: {
    borderRadius: radius.x8,
    alignItems: "center",
    justifyContent: "center",
    // Always present, transparent unless the type asks for one — so a
    // bordered and an unbordered type are the same size and don't shift
    // layout when swapped.
    borderWidth: spacing.x1,
  },
  // One entry per size rather than an inline object, so the whole set goes
  // through StyleSheet.create once instead of being rebuilt per render.
  //
  // `auto` is the odd one out on purpose: it sets no minHeight and hugs its
  // label, for a button that has to sit inline with text or in a tight row.
  // That puts it below the 44pt touch-target minimum by definition, so it's
  // the one size to avoid for a primary action.
  small: {
    minHeight: sizes.elementHeightSm,
    paddingHorizontal: spacing.x12,
    paddingVertical: spacing.x4,
  },
  medium: {
    minHeight: sizes.elementHeightMd,
    paddingHorizontal: spacing.x16,
    paddingVertical: spacing.x8,
  },
  large: {
    minHeight: sizes.elementHeightLg,
    paddingHorizontal: spacing.x20,
    paddingVertical: spacing.x12,
  },
  auto: {
    paddingHorizontal: spacing.x12,
    paddingVertical: spacing.x8,
  },
}));
