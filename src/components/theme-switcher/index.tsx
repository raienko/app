import { View } from "react-native";

import Button from "@/components/button";
import { useLocale } from "@/features/localization";
import { createStyles } from "@/features/responsive";
import { THEME_PREFERENCES, useTheme } from "@/features/theme";

const LABEL_KEY = {
  light: "theme.light",
  dark: "theme.dark",
  system: "theme.system",
} as const;

export default function ThemeSwitcher() {
  const theme = useTheme();
  const { t } = useLocale();
  const styles = useStyles();

  return (
    <View style={styles.container}>
      {THEME_PREFERENCES.map((option) => (
        <Button
          key={option}
          value={t(LABEL_KEY[option])}
          selected={theme.preference === option}
          onPress={() => theme.setPreference(option)}
        />
      ))}
    </View>
  );
}

const useStyles = createStyles(({ spacing }) => ({
  container: {
    flexDirection: "row",
    gap: spacing.x8,
  },
}));
