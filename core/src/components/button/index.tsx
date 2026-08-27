import type { ReactNode } from "react";
import {
  Pressable,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from "react-native";

import { withIconDefaults } from "@/components/icon";
import Text from "@/components/text";
import { controlA11yProps } from "@/features/accessibility";
import { createStyles, type TypographyToken } from "@/features/responsive";
import { useTheme } from "@/features/theme";

import { TYPE_COLORS, type ButtonSize, type ButtonType } from "./palette";

// Re-exported so a call site keeps importing them from this folder's entry
// point rather than reaching past it into ./palette.
export { default as IconButton } from "./icon-button";
export type { ButtonSize, ButtonType } from "./palette";

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

/**
 * A button says what it is either with a label or with content of its own,
 * never neither — and content has no text for a screen reader to read, so
 * that case has to name itself. Expressed as a union rather than three
 * optional props so an unnamed icon button is a `tsc` error rather than
 * something you find with a screen reader.
 */
type ContentProps =
  | {
      /** The label, centered and set in the size's step of the type scale. */
      value: string;
      children?: never;
      /** Rarely needed: the label already names the button. */
      label?: string;
    }
  | {
      value?: never;
      /**
       * Arbitrary content instead of a label. Any `Icon` inside takes this
       * button's foreground colour without being told it — see `IconButton`,
       * which is this case with a square box around it.
       */
      children: ReactNode;
      /** Required here: there is no text to derive a name from. */
      label: string;
    };

type Props = Omit<PressableProps, "children" | "style"> &
  ContentProps & {
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
  children,
  label,
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
  const foreground =
    selected && palette.labelSelected ? palette.labelSelected : palette.label;

  return (
    <Pressable
      // Announced as a button, with its selected/disabled state — a plain
      // Pressable has no role of its own, so without this every button in
      // the app reads as an anonymous group to a screen reader. A labelled
      // button derives its name from the Text child, so `label` is only
      // passed when there is one.
      {...controlA11yProps({ label, disabled: disabled ?? false, selected })}
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
      {/* An icon child is filled in with the same palette entry the label
          would have used, so the call site doesn't repeat it. */}
      {children ? (
        withIconDefaults(children, { color: theme.colors[foreground] })
      ) : (
        <Text
          value={value as string}
          type={SIZE_TEXT[size]}
          style={{ color: theme.colors[foreground] }}
        />
      )}
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
