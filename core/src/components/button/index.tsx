import {
  Pressable,
  StyleSheet,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from "react-native";

import Text from "@/components/text";
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

const styles = StyleSheet.create({
  button: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    alignItems: "center",
  },
});
