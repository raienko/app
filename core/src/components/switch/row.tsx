import type { ComponentType } from "react";
import { Pressable } from "react-native";

import Text from "@/components/text";
import { switchA11yProps } from "@/features/accessibility";
import { createStyles } from "@/features/responsive";

import type { SwitchImplementationProps, SwitchIndicatorProps } from "./types";

type Props = SwitchImplementationProps & {
  Indicator: ComponentType<SwitchIndicatorProps>;
};

/** Shared, stable layout and behavior around either switch indicator. */
export default function SwitchRow({
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
      {...switchA11yProps({ label, value, disabled })}
      testID={testID}
      disabled={disabled}
      onPress={() => onChange(!value)}
      style={({ pressed }) => [
        styles.row,
        disabled ? styles.disabled : null,
        pressed && !disabled ? styles.pressed : null,
        style,
      ]}
    >
      <Text value={label} style={styles.label} />
      <Indicator value={value} disabled={disabled} />
    </Pressable>
  );
}

const useStyles = createStyles(({ isRTL, spacing, sizes }) => ({
  row: {
    minHeight: sizes.elementHeightMd,
    flexDirection: isRTL ? "row-reverse" : "row",
    alignItems: "center",
    justifyContent: "space-between",
    alignSelf: "stretch",
    gap: spacing.x12,
  },
  label: {
    flex: 1,
    includeFontPadding: false,
    textAlignVertical: "center",
  },
  disabled: {
    opacity: 0.5,
  },
  pressed: {
    opacity: 0.7,
  },
}));
