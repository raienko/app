import { useMemo } from "react";
import { StyleSheet, View } from "react-native";

import Button from "@/components/button";
import Text from "@/components/text";
import { createStyles } from "@/features/responsive";
import { LocalValue } from "@/features/storage";

type Props = {
  storageKey?: string;
};

export default function Counter({ storageKey = "counter" }: Props) {
  // counter.use() is a method call, not a useXxx() identifier, so React
  // Compiler can't see it's a hook and would otherwise memoize this
  // component as if count never changed. See StorageValue.use().
  "use no memo";

  const counter = useMemo(
    () => new LocalValue<number>(storageKey),
    [storageKey],
  );
  const count = counter.use();
  const styles = useStyles();

  return (
    <View style={styles.container}>
      <Text value={`count: ${count ?? 0}`} />
      <Button
        value="increment"
        onPress={() => counter.setValue((count ?? 0) + 1)}
        style={styles.button}
      />
      <Button
        value="reset"
        onPress={() => counter.reset()}
        style={styles.button}
      />
    </View>
  );
}

const useStyles = createStyles(({ units }) =>
  StyleSheet.create({
    container: {
      gap: units(12),
      alignItems: "center",
    },
    button: {
      minWidth: units(120),
    },
  }),
);
