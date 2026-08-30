import type { ReactNode } from "react";
import { View, type StyleProp, type ViewStyle } from "react-native";

import If from "@/components/if";
import Text from "@/components/text";
import { createStyles } from "@/features/responsive";
import { useTheme } from "@/features/theme";

type Props = {
  label?: string;
  /** Shown under the control and takes priority over helperText. */
  error?: string;
  helperText?: string;
  style?: StyleProp<ViewStyle>;
  /** The control itself — a text row, a grid of boxes, whatever the variation renders. */
  children: ReactNode;
};

/**
 * One labelled field in a form: a label above, whatever control the
 * variation renders, and its error or helper text below.
 *
 * Split out of BaseInput because not every variation's control is a row
 * with a text host in it — `code` draws a line of boxes — but every
 * variation still wants the same label and the same error styling around
 * it. This is the part they genuinely share; BaseInput keeps the row.
 *
 * Label and helper text aren't styled here — they're `<Text type="footnote">`
 * and `<Text type="caption1">`, so they get a *whole* type-scale entry rather
 * than this file overriding only `fontSize` on top of `body`. That partial
 * override was a real bug: an 11px label kept body's 19px line height.
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
      {/* `!!` keeps the original truthiness — an empty label or an empty
          message renders nothing — and the `?? ""` below is a real default
          rather than an assertion, since `If` builds its children whether or
          not it renders them. */}
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
