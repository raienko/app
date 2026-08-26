import { Pressable } from "react-native";

import Icon from "@/components/icon";
import Text from "@/components/text";
import { controlA11yProps } from "@/features/accessibility";
import { createStyles, useSizes } from "@/features/responsive";
import { useTheme } from "@/features/theme";

import type { SelectOption } from "../types";

type Props = {
  option: SelectOption;
  selected: boolean;
  onPress: (value: string) => void;
};

/**
 * One row in the options Modal: the option's label, plus a checkmark on the
 * currently-picked one.
 *
 * Not a `Button` — Button renders a centered label and nothing else, and the
 * checkmark is the whole point of a list you pick *one* of. The states it
 * does share with Button (the `selected` background, the announced selected
 * state) come from the same theme tokens and the same `controlA11yProps`, so
 * they can't drift.
 */
export default function SelectOptionRow({ option, selected, onPress }: Props) {
  const theme = useTheme();
  const { spacing } = useSizes();
  const styles = useStyles();

  return (
    <Pressable
      style={[
        styles.row,
        selected
          ? { backgroundColor: theme.colors.backgroundElementSelected }
          : null,
      ]}
      onPress={() => onPress(option.value)}
      // The label is explicit even though the row has a Text child, because
      // it has an *icon* child too — icon fonts render as a glyph character,
      // which a screen reader would otherwise read out as part of the name.
      {...controlA11yProps({ label: option.label, selected })}
    >
      <Text value={option.label} style={styles.label} />
      {selected ? (
        <Icon name="check" size={spacing.x20} color={theme.colors.primary} />
      ) : null}
    </Pressable>
  );
}

const useStyles = createStyles(({ isRTL, spacing, radius, sizes }) => ({
  row: {
    flexDirection: isRTL ? "row-reverse" : "row",
    alignItems: "center",
    gap: spacing.x8,
    minHeight: sizes.elementHeightMd,
    paddingHorizontal: spacing.x16,
    borderRadius: radius.x8,
  },
  label: {
    flex: 1,
  },
}));
