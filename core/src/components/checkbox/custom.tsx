import { Pressable, View } from "react-native";

import Icon from "@/components/icon";
import If from "@/components/if";
import Text from "@/components/text";
import { checkboxA11yProps } from "@/features/accessibility";
import { createStyles, useSizes } from "@/features/responsive";
import { useTheme } from "@/features/theme";

import type { CheckboxImplementationProps } from "./types";

/** The app-owned checkbox, rendered entirely with React Native primitives. */
export default function CustomCheckbox({
  value,
  onChange,
  label,
  disabled = false,
  style,
  testID,
}: CheckboxImplementationProps) {
  const theme = useTheme();
  const { spacing } = useSizes();
  const styles = useStyles();

  return (
    <Pressable
      {...checkboxA11yProps({ label, checked: value, disabled })}
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
      <View
        // The Pressable is the one checkbox accessibility stop. Hiding the
        // decorative square prevents its icon-font glyph becoming part of
        // the name a screen reader derives.
        accessible={false}
        importantForAccessibility="no-hide-descendants"
        style={[
          styles.box,
          {
            backgroundColor: value ? theme.colors.primary : "transparent",
            borderColor: value ? theme.colors.primary : theme.colors.border,
          },
        ]}
      >
        <If condition={value}>
          <Icon
            name="check"
            size={spacing.x16}
            color={theme.colors.onPrimary}
          />
        </If>
      </View>
      <Text value={label} style={styles.label} />
    </Pressable>
  );
}

const useStyles = createStyles(({ isRTL, spacing, radius, sizes }) => ({
  row: {
    minHeight: sizes.elementHeightMd,
    flexDirection: isRTL ? "row-reverse" : "row",
    alignItems: "center",
    gap: spacing.x8,
    alignSelf: "flex-start",
  },
  box: {
    width: spacing.x24,
    height: spacing.x24,
    borderRadius: radius.x4,
    borderWidth: spacing.x2,
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    flexShrink: 1,
  },
  disabled: {
    opacity: 0.5,
  },
  pressed: {
    opacity: 0.7,
  },
}));
