import type { ComponentType } from "react";
import { Pressable } from "react-native";

import Text from "@/components/text";
import { radioA11yProps } from "@/features/accessibility";
import { createStyles } from "@/features/responsive";

import type {
  RadioButtonImplementationProps,
  RadioIndicatorProps,
} from "./types";

type Props = RadioButtonImplementationProps & {
  Indicator: ComponentType<RadioIndicatorProps>;
};

/** Shared radio behavior and labelled touch target around either indicator. */
export default function RadioButtonRow({
  value,
  onChange,
  label,
  disabled = false,
  style,
  testID,
  Indicator,
}: Props) {
  const styles = useStyles();

  return (
    <Pressable
      {...radioA11yProps({ label, checked: value, disabled })}
      testID={testID}
      disabled={disabled}
      onPress={() => {
        if (!value) onChange(true);
      }}
      style={({ pressed }) => [
        styles.row,
        disabled ? styles.disabled : null,
        pressed && !disabled ? styles.pressed : null,
        style,
      ]}
    >
      <Indicator selected={value} />
      <Text value={label} style={styles.label} />
    </Pressable>
  );
}

const useStyles = createStyles(({ isRTL, spacing, sizes }) => ({
  row: {
    minHeight: sizes.elementHeightMd,
    flexDirection: isRTL ? "row-reverse" : "row",
    alignItems: "center",
    alignSelf: "stretch",
    gap: spacing.x8,
  },
  label: {
    flex: 1,
  },
  disabled: {
    opacity: 0.5,
  },
  pressed: {
    opacity: 0.7,
  },
}));
