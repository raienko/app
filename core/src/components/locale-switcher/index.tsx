import { View } from "react-native";

import Button from "@/components/button";
import {
  LOCALES,
  LOCALE_PREFERENCES,
  useLocale,
} from "@/features/localization";
import { createStyles } from "@/features/responsive";

const localeByCode = new Map(LOCALES.map((locale) => [locale.code, locale]));

export default function LocaleSwitcher() {
  const locale = useLocale();
  const styles = useStyles();

  return (
    <View style={styles.container}>
      {LOCALE_PREFERENCES.map((option) => (
        <Button
          key={option}
          value={
            option === "system"
              ? locale.t("locale.system")
              : localeByCode.get(option)!.nativeName
          }
          selected={locale.preference === option}
          onPress={() => locale.setPreference(option)}
        />
      ))}
    </View>
  );
}

const useStyles = createStyles(({ spacing }) => ({
  container: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.x8,
  },
}));
