import { Checkbox as ExpoCheckbox } from "@expo/ui";
import { View } from "react-native";

import ExpoUIHost from "@/components/expo-ui-host";
import { createStyles } from "@/features/responsive";

import CheckboxRow from "./row";
import type {
  CheckboxImplementationProps,
  CheckboxIndicatorProps,
} from "./types";

/**
 * Expo UI's universal checkbox: SwiftUI on iOS, Jetpack Compose on Android,
 * and its web implementation in the browser. `ExpoUIHost` supplies the
 * app-wide color scheme, seed color, and layout direction.
 */
function ExpoIndicator({ value, disabled }: CheckboxIndicatorProps) {
  const styles = useStyles();

  return (
    <View
      accessible={false}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      pointerEvents="none"
      style={styles.slot}
    >
      <ExpoUIHost matchContents ignoreSafeArea="all">
        <ExpoCheckbox
          value={value}
          onValueChange={() => {}}
          disabled={disabled}
        />
      </ExpoUIHost>
    </View>
  );
}

/** Expo UI checkbox indicator inside the app-owned typed and themed row. */
export default function ExpoUICheckbox(props: CheckboxImplementationProps) {
  return <CheckboxRow {...props} Indicator={ExpoIndicator} />;
}

const useStyles = createStyles(({ spacing, sizes }) => ({
  slot: {
    width: spacing.x24,
    height: sizes.elementHeightMd,
    alignItems: "center",
    justifyContent: "center",
    overflow: "visible",
  },
}));
