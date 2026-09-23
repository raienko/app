import { Pressable, View } from "react-native";

import { controlA11yProps } from "@/features/accessibility";
import { createStyles, useSizes } from "@/features/responsive";
import { useTheme } from "@/features/theme";

type Props = {
  active: boolean;
  label: string;
  onPress: () => void;
  orientation: "horizontal" | "vertical";
  testID?: string;
};

/**
 * One dot.
 *
 * **The pressable area is a real box, not `hitSlop`.** An 8pt dot needs a
 * touch target several times its size, and the obvious way to get one is
 * `hitSlop` — which is wrong here, because dots sit a few points apart and
 * the slop then overlaps every neighbour. Overlapping targets do not
 * average out: the topmost wins, so on iOS every press landed on the last
 * dot rendered and the earlier ones could not be pressed at all. Sizing the
 * `Pressable` itself makes the targets tile instead of stack.
 */
export default function PaginationDot({
  active,
  label,
  onPress,
  orientation,
  testID,
}: Props) {
  const theme = useTheme();
  const { spacing } = useSizes();
  const styles = useStyles();

  const rest = spacing.x8;
  const grown = spacing.x20;

  return (
    <Pressable
      testID={testID}
      // A plain Pressable has no role of its own — the gap `Button` shipped
      // with. `selected` is what makes a screen reader say which one you
      // are on.
      {...controlA11yProps({ label, selected: active })}
      onPress={onPress}
      style={({ pressed }) => [
        styles.target,
        pressed ? { backgroundColor: theme.colors.pressed } : null,
      ]}
    >
      <View
        style={[
          styles.dot,
          {
            width: orientation === "vertical" ? rest : active ? grown : rest,
            height: orientation === "vertical" ? (active ? grown : rest) : rest,
            // Longer as well as recoloured: colour is never the sole
            // carrier of state (WCAG 1.4.1), and a shape change survives
            // greyscale.
            backgroundColor: active ? theme.colors.accent : theme.colors.border,
          },
        ]}
      />
    </Pressable>
  );
}

const useStyles = createStyles(({ spacing, radius }) => ({
  target: {
    // The target, not the dot. Wide enough to press and narrow enough that
    // a row of them still reads as a row.
    width: spacing.x32,
    height: spacing.x32,
    alignItems: "center",
    justifyContent: "center",
  },
  dot: {
    borderRadius: radius.indicator,
  },
}));
