import { Pagination } from "react-native-reanimated-carousel";
import type { PaginationProps } from "react-native-reanimated-carousel";

import { createStyles, useSizes } from "@/features/responsive";
import { useTheme } from "@/features/theme";

type Props = {
  count: number;
  progress: PaginationProps["progress"];
  orientation: "horizontal" | "vertical";
  /**
   * Jump to a slide. Required, not optional: the library's dots are inert
   * `View`s without it, and these are the one screen-reader-reachable way
   * to move through a carousel — see ./index.tsx.
   */
  onPress: (index: number) => void;
  /** What each dot announces. Built by the parent, which knows the data. */
  getLabel: (index: number) => string;
};

/**
 * The library's own `Pagination`, dressed in the app's theme and given
 * localized labels.
 *
 * Wrapping rather than hand-rolling a row of dots is the whole point: the
 * library's version already drives each dot off the same `progress` shared
 * value the carousel animates with, so a dot grows *as you drag* rather
 * than snapping when the slide settles — and it already gets the
 * accessibility of an interactive dot right (a real button, with the
 * selected state, per dot). What it can't know is this app's colours,
 * spacing scale, or language, which is exactly what this adds.
 *
 * `onPress` is what turns the dots from decoration into controls, and
 * that's not just a nicety: a pan gesture is unreachable by a screen
 * reader, so these buttons are the one navigation path that works the same
 * on every platform. See ./index.tsx.
 */
export default function CarouselPagination({
  count,
  progress,
  orientation,
  onPress,
  getLabel,
}: Props) {
  const theme = useTheme();
  const { spacing, radius } = useSizes();
  const styles = useStyles();

  const dotStyle = {
    width: spacing.x8,
    height: spacing.x8,
    borderRadius: radius.x4,
    backgroundColor: theme.colors.border,
  };

  return (
    <Pagination
      count={count}
      progress={progress}
      orientation={orientation}
      containerStyle={
        orientation === "vertical" ? styles.vertical : styles.horizontal
      }
      dotStyle={dotStyle}
      activeDotStyle={{
        ...dotStyle,
        // Wider rather than only recoloured: colour alone is never the sole
        // carrier of state (WCAG 1.4.1), and the shape change is visible
        // under a colour-blindness filter or in greyscale.
        width: spacing.x20,
        backgroundColor: theme.colors.primary,
      }}
      onPress={onPress}
      getItemAccessibilityLabel={(index) => getLabel(index)}
    />
  );
}

const useStyles = createStyles(({ spacing }) => ({
  horizontal: {
    justifyContent: "center",
    alignItems: "center",
    gap: spacing.x8,
    paddingTop: spacing.x12,
  },
  vertical: {
    justifyContent: "center",
    alignItems: "center",
    gap: spacing.x8,
    paddingStart: spacing.x12,
  },
}));
