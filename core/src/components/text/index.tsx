import { Text as RNText, type TextProps as RNTextProps } from "react-native";

import { createStyles, type TypographyToken } from "@/features/responsive";
import { useTheme } from "@/features/theme";

type Props = Omit<RNTextProps, "children"> & {
  value: string;
  /** One of Apple's HIG type-scale names — see `@/features/responsive`'s typography styleguide. Defaults to `"body"`. */
  type?: TypographyToken;
};

export default function Text({ value, type = "body", style, ...props }: Props) {
  const theme = useTheme();
  const styles = useStyles();

  return (
    <RNText
      style={[styles.text, styles[type], { color: theme.colors.text }, style]}
      {...props}
    >
      {value}
    </RNText>
  );
}

const useStyles = createStyles(({ isRTL, typography }) => ({
  text: {
    textAlign: isRTL ? "right" : "left",
  },
  ...typography,
}));
