import { useState } from "react";
import { View } from "react-native";

import Button from "@/components/button";
import Counter from "@/components/counter";
import Text from "@/components/text";
import { createStyles } from "@/features/responsive";
import { LocalValue } from "@/features/storage";
import { useTheme } from "@/features/theme";

import Readout from "./readout";

const note = new LocalValue<string>("showcase-note");

/**
 * Two views onto the same primitive. `Counter` uses `.use()`, the reactive
 * read — increment it, reload the app, and the value is still there. The
 * row below writes through `.setValue()`/`.reset()` and reads back with
 * `.getValue()`, the imperative pair, to show that persistence isn't tied
 * to rendering.
 */
export default function StorageSection() {
  const theme = useTheme();
  const styles = useStyles();
  const [stored, setStored] = useState(() => note.getValue() ?? "—");

  return (
    <View style={styles.container}>
      <Counter storageKey="showcase-counter" />

      <View style={styles.row}>
        <Button
          value="write"
          onPress={() => {
            note.setValue(new Date().toLocaleTimeString());
            setStored(note.getValue() ?? "—");
          }}
        />
        <Button
          value="clear"
          onPress={() => {
            note.reset();
            setStored(note.getValue() ?? "—");
          }}
        />
      </View>

      <Readout label='LocalValue("showcase-note")' value={stored} />

      <Text
        value="Both survive a reload — MMKV on device, localStorage on web."
        type="caption1"
        style={{ color: theme.colors.textSecondary }}
      />
    </View>
  );
}

const useStyles = createStyles(({ spacing }) => ({
  container: {
    gap: spacing.x12,
    alignItems: "stretch",
  },
  row: {
    flexDirection: "row",
    gap: spacing.x8,
  },
}));
