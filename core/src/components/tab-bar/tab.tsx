import { Pressable } from "react-native";

import { withIconDefaults } from "@/components/icon";
import Text from "@/components/text";
import { tabA11yProps } from "@/features/accessibility";
import { createStyles, useSizes } from "@/features/responsive";
import { useTheme } from "@/features/theme";

import type { TabBarItem } from "./types";

type Props = {
  item: TabBarItem;
  selected: boolean;
  onPress: () => void;
};

/**
 * One destination: its icon, its label, and the whole column as the touch
 * target — a tab bar's most common miss is a hit area the size of the glyph,
 * which is a quarter of the space the row already reserves for it.
 *
 * The current tab is marked by an `accent` bar along its top edge as well
 * as a `text` label, not by recolouring alone — a shift between two greys
 * is the cue greyscale and colour-blind viewers are most likely to lose.
 */
export default function Tab({ item, selected, onPress }: Props) {
  const theme = useTheme();
  const { spacing } = useSizes();
  const styles = useStyles();

  const color = selected ? theme.colors.text : theme.colors.textSecondary;

  return (
    <Pressable
      {...tabA11yProps({ label: item.label, selected })}
      testID={item.testID}
      onPress={onPress}
      style={({ pressed }) => [
        styles.tab,
        { borderTopColor: selected ? theme.colors.accent : "transparent" },
        pressed ? styles.pressed : null,
      ]}
    >
      {/* Colour and size filled in from the tab's state, so a call site
          passes `<Icon name="home" />` and nothing else. */}
      {withIconDefaults(item.icon, { color, size: spacing.x24 })}
      <Text
        value={item.label}
        type="caption2"
        numberOfLines={1}
        style={[styles.label, { color }]}
      />
    </Pressable>
  );
}

const useStyles = createStyles(({ spacing }) => ({
  tab: {
    // Equal shares, so the row divides evenly however many tabs there are
    // and every touch target is the same size.
    flex: 1,
    minWidth: 0,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.x2,
    paddingHorizontal: spacing.x4,
    // The whole column, not just the glyph.
    alignSelf: "stretch",
    // Reserved on every tab, so the bar appearing doesn't shift the glyph.
    borderTopWidth: spacing.x2,
  },
  label: {
    textAlign: "center",
  },
  pressed: {
    opacity: 0.6,
  },
}));
