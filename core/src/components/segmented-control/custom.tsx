import { View } from "react-native";

import { radioGroupA11yProps } from "@/features/accessibility";
import { createStyles } from "@/features/responsive";
import { useTheme } from "@/features/theme";

import Segment from "./segment";
import type { SegmentedControlImplementationProps } from "./types";

/**
 * The app-owned segmented control: a bordered track with equal-width
 * segments and a filled pill on the current one.
 *
 * The pill is `primary` with an `onPrimary` label rather than the lighter
 * "raised card on a grey track" iOS uses. That shade of the idea would put
 * `background` on `backgroundElement` — the same 1.19:1 pairing `Button`'s
 * palette already rejected for its `secondary` border — which is far under
 * the 3:1 WCAG 1.4.11 asks of the only thing marking which option is
 * chosen. Selection is also a *fill* appearing rather than a hue changing,
 * so it survives greyscale and a colour-blindness filter.
 */
export default function CustomSegmentedControl({
  value,
  onChange,
  options,
  label,
  disabled = false,
  style,
  testID,
}: SegmentedControlImplementationProps) {
  const theme = useTheme();
  const styles = useStyles();

  return (
    <View
      {...radioGroupA11yProps({ label, disabled })}
      testID={testID}
      style={[
        styles.track,
        {
          backgroundColor: theme.colors.backgroundElement,
          borderColor: theme.colors.border,
        },
        disabled ? styles.disabled : null,
        style,
      ]}
    >
      {options.map((option) => (
        <Segment
          key={option.value}
          option={option}
          selected={option.value === value}
          disabled={disabled || (option.disabled ?? false)}
          onPress={() => onChange(option.value)}
        />
      ))}
    </View>
  );
}

const useStyles = createStyles(({ isRTL, spacing, radius, sizes }) => ({
  track: {
    flexDirection: isRTL ? "row-reverse" : "row",
    alignItems: "center",
    alignSelf: "stretch",
    minHeight: sizes.elementHeightMd,
    // Inset so the selected pill sits *inside* the track rather than
    // covering its border.
    padding: spacing.x4,
    gap: spacing.x2,
    borderRadius: radius.x8,
    // Same reason Button's `secondary` carries one: the fill is
    // `backgroundElement`, which is invisible against any other raised
    // surface the control might sit on.
    borderWidth: spacing.x1,
  },
  disabled: {
    opacity: 0.5,
  },
}));
