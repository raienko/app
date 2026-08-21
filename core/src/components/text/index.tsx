import { Text as RNText, type TextProps as RNTextProps } from "react-native";

import { useTheme } from "@/features/theme";

type Props = Omit<RNTextProps, "children"> & {
  value: string;
};

export default function Text({ value, style, ...props }: Props) {
  const theme = useTheme();

  return (
    <RNText style={[{ color: theme.colors.text }, style]} {...props}>
      {value}
    </RNText>
  );
}
