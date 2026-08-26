import { useState } from "react";
import { View } from "react-native";

import Button from "@/components/button";
import { createStyles } from "@/features/responsive";

import Readout from "./readout";

/**
 * Every Button state side by side. The first row is a real segmented
 * control rather than three static buttons, so `selected` can be seen
 * moving — and with it `aria-selected`, which is what a screen reader
 * announces.
 */
export default function ButtonsSection() {
  const [picked, setPicked] = useState("one");
  const [pressCount, setPressCount] = useState(0);
  const styles = useStyles();

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        {["one", "two", "three"].map((option) => (
          <Button
            key={option}
            value={option}
            selected={picked === option}
            onPress={() => setPicked(option)}
          />
        ))}
      </View>
      <Readout label="selected" value={picked} />

      <View style={styles.row}>
        <Button value="press me" onPress={() => setPressCount((n) => n + 1)} />
        <Button value="disabled" disabled onPress={() => {}} />
      </View>
      <Readout label="presses" value={String(pressCount)} />
    </View>
  );
}

const useStyles = createStyles(({ spacing }) => ({
  container: {
    gap: spacing.x8,
  },
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.x8,
  },
}));
