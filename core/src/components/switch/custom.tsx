import { View } from "react-native";

import { createStyles } from "@/features/responsive";
import { useTheme } from "@/features/theme";

import SwitchRow from "./row";
import type { SwitchImplementationProps, SwitchIndicatorProps } from "./types";

function CustomIndicator({ value }: SwitchIndicatorProps) {
  const theme = useTheme();
  const styles = useStyles();

  return (
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
  );
}

/** The app-owned switch, rendered entirely with React Native primitives. */
export default function CustomSwitch(props: SwitchImplementationProps) {
  return <SwitchRow {...props} Indicator={CustomIndicator} />;
}

const useStyles = createStyles(({ isRTL, spacing, radius }) => ({
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
}));
