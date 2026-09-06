import { Pressable } from "react-native";

import Icon from "@/components/icon";
import If from "@/components/if";
import Text from "@/components/text";
import { controlA11yProps } from "@/features/accessibility";
import { createStyles, useSizes } from "@/features/responsive";
import { useTheme } from "@/features/theme";

import type { PhoneCountry } from "./countries";

type Props = {
  option: PhoneCountry;
  selected: boolean;
  onPress: (option: PhoneCountry) => void;
};

export default function CountryOption({ option, selected, onPress }: Props) {
  const theme = useTheme();
  const { spacing } = useSizes();
  const styles = useStyles();
  const accessibleLabel = `${option.name}, +${option.callingCode}`;

  return (
    <Pressable
      style={[
        styles.row,
        selected
          ? { backgroundColor: theme.colors.backgroundElementSelected }
          : null,
      ]}
      onPress={() => onPress(option)}
      {...controlA11yProps({ label: accessibleLabel, selected })}
    >
      <Text value={option.flag} type="title3" allowFontScaling={false} />
      <Text value={option.name} style={styles.name} numberOfLines={1} />
      <Text
        value={`+${option.callingCode}`}
        type="callout"
        style={{ color: theme.colors.textSecondary }}
      />
      <If condition={selected}>
        <Icon name="check" size={spacing.x20} color={theme.colors.primary} />
      </If>
    </Pressable>
  );
}

const useStyles = createStyles(({ isRTL, spacing, radius, sizes }) => ({
  row: {
    flexDirection: isRTL ? "row-reverse" : "row",
    alignItems: "center",
    gap: spacing.x8,
    minHeight: sizes.elementHeightMd,
    paddingHorizontal: spacing.x12,
    borderRadius: radius.x8,
  },
  name: {
    flex: 1,
  },
}));
