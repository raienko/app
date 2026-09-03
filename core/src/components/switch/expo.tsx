import { Host, Switch as ExpoSwitch } from "@expo/ui";
import { StyleSheet, View } from "react-native";

import { useTheme } from "@/features/theme";

import SwitchRow from "./row";
import type { SwitchImplementationProps, SwitchIndicatorProps } from "./types";

const switchSize = (() => {
  switch (process.env.EXPO_OS) {
    case "android":
      // Material 3 switch plus its native minimum interactive canvas.
      return { width: 52, height: 48 };
    case "ios":
      // UISwitch is 51×31pt; retain a little vertical native breathing room.
      return { width: 51, height: 44 };
    default:
      // Expo UI's web track has a 36×22 CSS-pixel intrinsic size.
      return { width: 36, height: 22 };
  }
})();

function ExpoIndicator({ value, disabled }: SwitchIndicatorProps) {
  const theme = useTheme();

  return (
    <View
      accessible={false}
      importantForAccessibility="no-hide-descendants"
      pointerEvents="none"
      style={styles.slot}
    >
      <Host
        colorScheme={theme.scheme}
        seedColor={theme.colors.primary}
        ignoreSafeArea="all"
        style={styles.host}
      >
        <ExpoSwitch
          value={value}
          disabled={disabled}
          onValueChange={() => {}}
        />
      </Host>
    </View>
  );
}

/** Expo UI switch on every platform, with our own stable labelled row. */
export default function ExpoUISwitch(props: SwitchImplementationProps) {
  return <SwitchRow {...props} Indicator={ExpoIndicator} />;
}

const styles = StyleSheet.create({
  slot: {
    ...switchSize,
    alignItems: "center",
    justifyContent: "center",
    overflow: "visible",
  },
  host: {
    ...switchSize,
  },
});
