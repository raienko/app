import { useState } from "react";
import { View } from "react-native";

import Button from "@/components/button";
import Stepper from "@/components/stepper";
import Text from "@/components/text";
import { createStyles } from "@/features/responsive";
import { isStoragePersistent, LocalValue } from "@/features/storage";
import { useTheme } from "@/features/theme";

import Readout from "./readout";

const note = new LocalValue<string>("showcase-note");
const count = new LocalValue<number>("showcase-counter");

/**
 * Two views onto the same primitive. The stepper reads through
 * `.useValue()`, the reactive read — step it, reload the app, and the value
 * is still there. The
 * row below writes through `.setValue()`/`.reset()` and reads back with
 * `.getValue()`, the imperative pair, to show that persistence isn't tied
 * to rendering.
 */
export default function StorageSection() {
  const theme = useTheme();
  const styles = useStyles();
  const [stored, setStored] = useState(() => note.getValue() ?? "—");
  const persistent = isStoragePersistent();
  const storedCount = count.useValue() ?? 0;

  return (
    <View style={styles.container}>
      <Stepper
        label='LocalValue("showcase-counter")'
        value={storedCount}
        onChange={(next) => count.setValue(next)}
      />

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
      <Readout label="isStoragePersistent()" value={String(persistent)} />

      <Text
        value={
          persistent
            ? "One MMKV-backed API everywhere — a real file on device, localStorage on web. Both survive a reload."
            : "This browser is blocking localStorage, so MMKV has fallen back to in-memory storage: anything written here is lost on reload."
        }
        type="caption1"
        style={{
          color: persistent ? theme.colors.textSecondary : theme.colors.error,
        }}
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
