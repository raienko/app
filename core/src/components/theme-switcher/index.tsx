import { StyleSheet, View } from "react-native";

import Button from "@/components/button";
import { THEME_PREFERENCES, useTheme } from "@/features/theme";

export default function ThemeSwitcher() {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      {THEME_PREFERENCES.map((option) => (
        <Button
          key={option}
          value={option}
          selected={theme.preference === option}
          onPress={() => theme.setPreference(option)}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    gap: 8,
  },
});
