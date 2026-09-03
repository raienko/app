import { Pressable, View } from "react-native";

import Text from "@/components/text";
import { switchA11yProps } from "@/features/accessibility";
import { createStyles } from "@/features/responsive";
import { useTheme } from "@/features/theme";

import type { SwitchImplementationProps } from "./types";

/** The app-owned switch, rendered entirely with React Native primitives. */
export default function CustomSwitch({
  value,
  onChange,
  label,
  disabled = false,
  style,
  testID,
}: SwitchImplementationProps) {
  const theme = useTheme();
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
      <View
        accessible={false}
        importantForAccessibility="no-hide-descendants"
        style={[
          styles.track,
          value ? styles.trackOn : styles.trackOff,
          {
            backgroundColor: value
              ? theme.colors.primary
              : theme.colors.backgroundElementSelected,
            borderColor: value ? theme.colors.primary : theme.colors.border,
          },
        ]}
      >
        <View
          style={[
            styles.thumb,
            value ? styles.thumbOn : styles.thumbOff,
            {
              backgroundColor: value
                ? theme.colors.onPrimary
                : theme.colors.textSecondary,
            },
          ]}
        />
      </View>
    </Pressable>
  );
}

const useStyles = createStyles(({ isRTL, spacing, radius, sizes }) => ({
  row: {
    minHeight: sizes.elementHeightMd,
    flexDirection: isRTL ? "row-reverse" : "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.x12,
    alignSelf: "stretch",
  },
  label: {
    flex: 1,
  },
  track: {
    width: spacing.x40,
    height: spacing.x24,
    padding: spacing.x2,
    borderRadius: radius.x16,
    borderWidth: spacing.x1,
    flexDirection: "row",
    alignItems: "center",
  },
  trackOn: {
    justifyContent: isRTL ? "flex-start" : "flex-end",
  },
  trackOff: {
    justifyContent: isRTL ? "flex-end" : "flex-start",
  },
  thumb: {
    width: spacing.x16,
    height: spacing.x16,
    borderRadius: radius.x16,
  },
  thumbOn: {
    transform: [{ scale: 1.1 }],
  },
  thumbOff: {
    transform: [{ scale: 1 }],
  },
  disabled: {
    opacity: 0.5,
  },
  pressed: {
    opacity: 0.7,
  },
}));
