import { Checkbox as ExpoCheckbox, Host } from "@expo/ui";

import { useTheme } from "@/features/theme";

import type { CheckboxImplementationProps } from "./types";

/**
 * Expo UI's universal checkbox: SwiftUI on iOS, Jetpack Compose on Android,
 * and its web implementation in the browser. `Host` is required by the
 * universal Expo UI API and is kept local so callers never need to know.
 */
export default function ExpoUICheckbox({
  value,
  onChange,
  label,
  disabled = false,
  style,
  testID,
}: CheckboxImplementationProps) {
  const theme = useTheme();

  return (
    <Host
      matchContents
      colorScheme={theme.scheme}
      seedColor={theme.colors.primary}
      style={style}
    >
      <ExpoCheckbox
        value={value}
        onValueChange={onChange}
        label={label}
        disabled={disabled}
        testID={testID}
      />
    </Host>
  );
}
