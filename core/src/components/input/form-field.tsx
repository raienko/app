import type { ReactNode } from "react";
import { View, type StyleProp, type ViewStyle } from "react-native";

import If from "@/components/if";
import Text from "@/components/text";
import { createStyles } from "@/features/responsive";
import { useTheme } from "@/features/theme";

type Props = {
  label?: string;
  /** Takes priority over helperText. */
  error?: string;
  helperText?: string;
  style?: StyleProp<ViewStyle>;
  children: ReactNode;
};

/**
 * A label above, the variation's own control, and its error or helper text
 * below — the part every variation shares, whether its control is a text row
 * or `code`'s line of boxes.
 */
export default function FormField({
  label,
  error,
  helperText,
  style,
  children,
}: Props) {
  const theme = useTheme();
  const styles = useStyles();

  const helper = error ?? helperText;

  return (
    <View style={[styles.container, style]}>
      <If condition={!!label}>
        <Text value={label ?? ""} type="footnote" />
      </If>
      {children}
      <If condition={!!helper}>
        <Text
          value={helper ?? ""}
          type="caption1"
          style={{
            color: error ? theme.colors.error : theme.colors.textSecondary,
          }}
        />
      </If>
    </View>
  );
}

const useStyles = createStyles(({ spacing }) => ({
  container: {
    gap: spacing.x8,
  },
}));
