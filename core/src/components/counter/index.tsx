import { useMemo } from "react";
import { View } from "react-native";

import Button from "@/components/button";
import Text from "@/components/text";
import { createStyles } from "@/features/responsive";
import { LocalValue } from "@/features/storage";

type Props = {
  storageKey?: string;
};

export default function Counter({ storageKey = "counter" }: Props) {
  const counter = useMemo(
    () => new LocalValue<number>(storageKey),
    [storageKey],
  );
  const count = counter.useValue();
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

const useStyles = createStyles(({ units, spacing }) => ({
  container: {
    gap: spacing.x12,
    alignItems: "center",
  },
  button: {
    minWidth: units(120),
  },
}));
