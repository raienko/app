import type { ReactNode } from "react";
import type { PressableProps, StyleProp, ViewStyle } from "react-native";

import { withIconDefaults } from "@/components/icon";
import { createStyles, useSizes } from "@/features/responsive";

import Button from "./index";
import type { ButtonType } from "./palette";

/** `auto` is deliberately absent — a square has nothing to hug. */
export type IconButtonSize = "small" | "medium" | "large";

/**
 * How big the glyph is inside each box. Roughly half the box, which leaves
 * the icon reading as an icon rather than as a shape that fills its button.
 */
const ICON_SIZE: Record<IconButtonSize, "x16" | "x20" | "x24"> = {
  small: "x16",
  medium: "x20",
  large: "x24",
};

type Props = Omit<PressableProps, "children" | "style"> & {
  /**
   * The icon to draw — usually an `<Icon />`, which takes this button's
   * foreground colour and a matching size without being told either.
   */
  children: ReactNode;
  /**
   * What a screen reader announces. Required, unlike a labelled `Button`:
   * there is no text child to derive a name from.
   */
  label: string;
  /**
   * Visual emphasis, from the same palette `Button` uses. Defaults to
   * `"tertiary"` — an icon button is usually a bare affordance sitting in a
   * field or a toolbar, and a filled one is the deliberate case.
   */
  type?: ButtonType;
  /** Defaults to `"medium"`, which is the 44pt touch-target height. */
  size?: IconButtonSize;
  /** One of several choices (a segmented option) — also announced as such. */
  selected?: boolean;
  style?: StyleProp<ViewStyle>;
};

/**
 * A `Button` whose whole content is an icon.
 *
 * It *is* a Button — the pressable, the palette, the disabled and selected
 * states and the accessibility all come from there, so `secondary` here and
 * `secondary` there can't drift apart. All this adds is the square box and
 * the glyph size to match it.
 *
 * Worth having as its own component rather than left to call sites, because
 * the hand-written alternative — a `Pressable` around an `Icon` — quietly
 * gets three things wrong every time: the hit area collapses to the glyph (a
 * 20pt target against a 44pt minimum), the icon's colour is restated and
 * drifts from the theme, and there is nothing for a screen reader to say.
 *
 * @example <IconButton label="Close" onPress={close}><Icon name="x" /></IconButton>
 * @example <IconButton label="Favourite" type="primary" selected={saved}><Icon name="star" /></IconButton>
 */
export default function IconButton({
  children,
  // Its own default, not Button's: a bare affordance in a field or a
  // toolbar is the common icon-button case, where a filled one is the
  // common case for a button carrying a label.
  type = "tertiary",
  size = "medium",
  style,
  ...props
}: Props) {
  const { spacing } = useSizes();
  const styles = useStyles();

  return (
    <Button
      {...props}
      type={type}
      // `auto` is the one size that reserves no height of its own, which
      // leaves this free to set an exact square. Any other would impose a
      // `minHeight` that a smaller square could not win against.
      size="auto"
      style={[styles[size], style]}
    >
      {/* Size only. The colour is Button's to know, and it fills it in on
          the way through — each contributes the half it owns. */}
      {withIconDefaults(children, { size: spacing[ICON_SIZE[size]] })}
    </Button>
  );
}

// Square, at exactly the heights Button uses for the same names, so the two
// sit level when they share a row. The padding `auto` carries is cancelled
// here — a square sizes by its box, not by what is inside it.
const useStyles = createStyles(({ sizes }) => ({
  small: {
    width: sizes.elementHeightSm,
    height: sizes.elementHeightSm,
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  medium: {
    width: sizes.elementHeightMd,
    height: sizes.elementHeightMd,
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  large: {
    width: sizes.elementHeightLg,
    height: sizes.elementHeightLg,
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
}));
