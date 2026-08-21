import { StyleSheet, View } from "react-native";

import Counter from "@/components/counter";
import Icon from "@/components/icon";
import Screen from "@/components/screen";
import Text from "@/components/text";
import ThemeSwitcher from "@/components/theme-switcher";
import env from "@/constants/env";
import { createStyles, useUnits } from "@/features/responsive";

export default function Home() {
  const units = useUnits();
  const styles = useStyles();

  return (
    <Screen style={styles.container}>
      <View style={styles.title}>
        <Icon type="Feather" name="home" size={units(20)} />
        <Text value={env.appName} />
      </View>
      <Counter storageKey="home-demo-counter" />
      <ThemeSwitcher />
    </Screen>
  );
}

const useStyles = createStyles(({ units }) =>
  StyleSheet.create({
    container: {
      gap: units(24),
    },
    title: {
      flexDirection: "row",
      alignItems: "center",
      gap: units(8),
    },
  }),
);
