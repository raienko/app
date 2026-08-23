import {
  Pressable,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from "react-native";

import Text from "@/components/text";
import { createStyles } from "@/features/responsive";
import { useTheme } from "@/features/theme";

type Props = Omit<PressableProps, "children" | "style"> & {
  value: string;
  selected?: boolean;
  style?: StyleProp<ViewStyle>;
};

export default function Button({
  value,
  selected = false,
  style,
  ...props
}: Props) {
  const theme = useTheme();
  const styles = useStyles();

  return (
    <Pressable
      style={[
        styles.button,
        {
          backgroundColor: selected
            ? theme.colors.backgroundElementSelected
            : theme.colors.backgroundElement,
        },
        style,
      ]}
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
