import { Pressable, StyleSheet, View } from "react-native";

import Text from "@/components/text";
import { useTheme, type ThemePreference } from "@/features/theme";

const OPTIONS: ThemePreference[] = ["light", "dark", "system"];

export default function ThemeSwitcher() {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      {OPTIONS.map((option) => {
        const selected = theme.preference === option;

        return (
          <Pressable
            key={option}
            onPress={() => theme.setPreference(option)}
            style={[
              styles.option,
              {
                backgroundColor: selected
                  ? theme.colors.backgroundElementSelected
                  : theme.colors.backgroundElement,
              },
            ]}
          >
            <Text value={option} />
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    gap: 8,
  },
  option: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    alignItems: "center",
  },
});
