import { ScrollView, View, type ViewProps } from "react-native";

import { createStyles } from "@/features/responsive";
import { useTheme } from "@/features/theme";

type Props = ViewProps & {
  /**
   * Let content taller than the screen scroll instead of overflowing.
   *
   * Also drops the vertical centering a short screen gets — content that
   * can outgrow the viewport has to start at the top, or the first screenful
   * is pushed off the top edge as it grows.
   */
  scrollable?: boolean;
};

export default function Screen({ scrollable = false, style, ...props }: Props) {
  const theme = useTheme();
  const styles = useStyles();
  const background = { backgroundColor: theme.colors.background };

  if (scrollable) {
    return (
      <ScrollView
        // Same reason Modal's backdrop and grabber carry one: it's the only
        // handle a test has on which branch rendered. A caller's own testID
        // still wins, since props spread last.
        testID="screen-scroll"
        style={[styles.flex, background]}
        contentContainerStyle={[styles.scrollContent, style]}
        {...props}
      />
    );
  }

  return <View style={[styles.container, background, style]} {...props} />;
}

const useStyles = createStyles(({ spacing }) => ({
  flex: {
    flex: 1,
  },
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.x16,
  },
  scrollContent: {
    alignItems: "center",
    padding: spacing.x16,
  },
}));
