import { IconButton } from "@/components/button";
import Icon from "@/components/icon";
import { useLocale } from "@/features/localization";
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
 * The colour is passed explicitly rather than taken from the button's
 * palette: `tertiary`'s foreground is the accent, which is right for a
 * button that reads as an action, and too loud for a control sitting inside
 * a field it isn't the subject of.
 */
export default function VisibilityToggle({
  visible,
  disabled,
  onPress,
}: Props) {
  const { t } = useLocale();
  const theme = useTheme();

  return (
    <IconButton
      label={t(visible ? "input.password.hide" : "input.password.show")}
      disabled={disabled}
      onPress={onPress}
    >
      <Icon
        name={visible ? "eye-off" : "eye"}
        color={theme.colors.textSecondary}
      />
    </IconButton>
  );
}
