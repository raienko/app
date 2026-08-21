import { Text as RNText, type TextProps as RNTextProps } from "react-native";

import { useTheme } from "@/features/theme";
import { createStyles } from "@/features/responsive";

type Props = Omit<RNTextProps, "children"> & {
  value: string;
};

export default function Text({ value, style, ...props }: Props) {
  const theme = useTheme();
  const baseStyle = useStyles();

  return (
    <RNText
      style={[baseStyle.text, { color: theme.colors.text }, style]}
      {...props}
    >
      {value}
    </RNText>
  );
}

const useStyles = createStyles(({ isRTL }) => ({
  text: {
    textAlign: isRTL ? "right" : "left",
  },
}));
