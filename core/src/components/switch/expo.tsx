import { Host, Switch as ExpoSwitch } from "@expo/ui";

import { createStyles } from "@/features/responsive";
import { useTheme } from "@/features/theme";

import type { SwitchImplementationProps } from "./types";

/** Expo UI's universal SwiftUI, Compose, and web switch. */
export default function ExpoUISwitch({
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
    <Host
      matchContents={{ vertical: true }}
      colorScheme={theme.scheme}
      seedColor={theme.colors.primary}
      // Expo UI's Android content can report zero height while several
      // matchContents Hosts mount together. Reserving the normal control
      // height in Yoga keeps sibling rows distinct; matchContents can still
      // grow the Host when a scaled/wrapped label needs more room.
      style={[styles.host, style]}
    >
      <ExpoSwitch
        value={value}
        onValueChange={onChange}
        label={label}
        disabled={disabled}
        testID={testID}
      />
    </Host>
  );
}

const useStyles = createStyles(({ sizes }) => ({
  host: {
    width: "100%",
    minHeight: sizes.elementHeightMd,
  },
}));
