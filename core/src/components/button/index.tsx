import {
  Pressable,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from "react-native";

import Text from "@/components/text";
import { controlA11yProps } from "@/features/accessibility";
import { createStyles } from "@/features/responsive";
import { useTheme } from "@/features/theme";

type Props = Omit<PressableProps, "children" | "style"> & {
  value: string;
  /** One of several choices (a segmented option) — also announced as such. */
  selected?: boolean;
  style?: StyleProp<ViewStyle>;
};

export default function Button({
  value,
  selected = false,
  disabled,
  style,
  ...props
}: Props) {
  const theme = useTheme();
  const styles = useStyles();

  return (
    <Pressable
      // Announced as a button, with its selected/disabled state — a plain
      // Pressable has no role of its own, so without this every button in
      // the app reads as an anonymous group to a screen reader. The label
      // comes from the Text child, so it isn't passed explicitly.
      {...controlA11yProps({ disabled: disabled ?? false, selected })}
      style={[
        styles.button,
        {
          backgroundColor: selected
            ? theme.colors.backgroundElementSelected
            : theme.colors.backgroundElement,
          opacity: disabled ? 0.5 : 1,
        },
        style,
      ]}
      disabled={disabled}
      {...props}
    >
      <Text value={value} />
    </Pressable>
  );
}

const useStyles = createStyles(({ spacing, radius }) => ({
  button: {
    paddingVertical: spacing.x8,
    paddingHorizontal: spacing.x12,
    borderRadius: radius.x8,
    alignItems: "center",
  },
}));
