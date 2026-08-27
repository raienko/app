import { Pressable } from "react-native";

import Icon from "@/components/icon";
import { controlA11yProps } from "@/features/accessibility";
import { useLocale } from "@/features/localization";
import { createStyles, useSizes } from "@/features/responsive";
import { useTheme } from "@/features/theme";

type Props = {
  /** Whether the password is currently readable. */
  visible: boolean;
  disabled?: boolean;
  onPress: () => void;
};

/**
 * The eye in a password field's right slot.
 *
 * Its accessible name is the *action* ("Show password") rather than the
 * state, because that's what a screen reader user is choosing to do — and
 * it's the one label that stays unambiguous when the icon has flipped but
 * the announcement hasn't been re-read.
 *
 * The hit area is a full touch target rather than the icon's own size: the
 * eye is 20pt of drawing, which is less than half the 44pt minimum, and it
 * sits right beside the text it would otherwise be easy to tap by mistake.
 */
export default function VisibilityToggle({
  visible,
  disabled,
  onPress,
}: Props) {
  const { t } = useLocale();
  const theme = useTheme();
  const { spacing } = useSizes();
  const styles = useStyles();

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={styles.toggle}
      {...controlA11yProps({
        label: t(visible ? "input.password.hide" : "input.password.show"),
        disabled: disabled ?? false,
      })}
    >
      <Icon
        name={visible ? "eye-off" : "eye"}
        size={spacing.x20}
        color={theme.colors.textSecondary}
      />
    </Pressable>
  );
}

const useStyles = createStyles(({ sizes }) => ({
  toggle: {
    width: sizes.elementHeightMd,
    height: sizes.elementHeightMd,
    alignItems: "center",
    justifyContent: "center",
  },
}));
