import { StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import Counter from "@/components/counter";
import Text from "@/components/text";
import env from "@/constants/env";

export default function Home() {
  return (
    <SafeAreaView style={styles.container}>
      <Text value={env.appName} />
      <Counter storageKey="home-demo-counter" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 24,
  },
});
