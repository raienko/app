import { StyleSheet } from "react-native";

import Counter from "@/components/counter";
import Screen from "@/components/screen";
import Text from "@/components/text";
import ThemeSwitcher from "@/components/theme-switcher";
import env from "@/constants/env";

export default function Home() {
  return (
    <Screen style={styles.container}>
      <Text value={env.appName} />
      <Counter storageKey="home-demo-counter" />
      <ThemeSwitcher />
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 24,
  },
});
