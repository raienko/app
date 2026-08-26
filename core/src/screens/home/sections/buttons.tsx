import { useState } from "react";
import { View } from "react-native";

import Button, { type ButtonSize, type ButtonType } from "@/components/button";
import { Column } from "@/components/grid";
import Text from "@/components/text";
import { createStyles, useSizes } from "@/features/responsive";
import { useTheme } from "@/features/theme";

import Readout from "./readout";

const TYPES: ButtonType[] = ["primary", "secondary", "tertiary"];
const SIZES: ButtonSize[] = ["small", "medium", "large", "auto"];

/**
 * The full type × size matrix, plus the states that cut across both.
 *
 * Laid out as one row per type so the emphasis order reads top to bottom —
 * filled accent, filled neutral, unfilled — and the sizes line up in
 * columns, which is the easiest way to see that `auto` is the only one that
 * doesn't reserve a touch target.
 */
export default function ButtonsSection() {
  const theme = useTheme();
  const { spacing } = useSizes();
  const styles = useStyles();
  const [picked, setPicked] = useState<ButtonType>("secondary");
  const [pressCount, setPressCount] = useState(0);

  return (
    <Column gap={spacing.x12}>
      {TYPES.map((type) => (
        <View key={type} style={styles.group}>
          <Text
            value={type}
            type="footnote"
            style={{ color: theme.colors.textSecondary }}
          />
          <View style={styles.row}>
            {SIZES.map((size) => (
              <Button
                key={size}
                value={size}
                type={type}
                size={size}
                onPress={() => setPressCount((n) => n + 1)}
              />
            ))}
          </View>
        </View>
      ))}

      <Text value="Selected — a segmented control" type="headline" />
      <View style={styles.row}>
        {TYPES.map((type) => (
          <Button
            key={type}
            value={type}
            type={type}
            selected={picked === type}
            onPress={() => setPicked(type)}
          />
        ))}
      </View>
      <Readout label="selected" value={picked} />

      <Text value="Disabled" type="headline" />
      <View style={styles.row}>
        {TYPES.map((type) => (
          <Button
            key={type}
            value={type}
            type={type}
            disabled
            onPress={() => {}}
          />
        ))}
      </View>

      <Readout label="presses" value={String(pressCount)} />
    </Column>
  );
}

const useStyles = createStyles(({ spacing }) => ({
  group: {
    gap: spacing.x4,
  },
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: spacing.x8,
  },
}));
