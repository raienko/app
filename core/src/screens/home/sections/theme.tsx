import { View } from "react-native";

import Text from "@/components/text";
import ThemeSwitcher from "@/components/theme-switcher";
import { createStyles } from "@/features/responsive";
import { useTheme } from "@/features/theme";

import Readout from "./readout";

/**
 * The theme switcher plus a swatch per palette entry, so switching light /
 * dark / system shows every colour change at once — including the ones no
 * other section happens to put on screen.
 *
 * The swatch list is derived from `theme.colors` rather than hand-listed,
 * so a palette key added to `palette.json` shows up here for free.
 */
export default function ThemeSection() {
  const theme = useTheme();
  const styles = useStyles();

  return (
    <View style={styles.container}>
      <ThemeSwitcher />

      <Readout label="scheme" value={theme.scheme} />
      <Readout label="preference" value={theme.preference} />

      <View style={styles.swatches}>
        {Object.entries(theme.colors).map(([name, value]) => (
          <View key={name} style={styles.swatch}>
            <View
              style={[
                styles.chip,
                {
                  backgroundColor: value,
                  borderColor: theme.colors.textSecondary,
                },
              ]}
            />
            <Text value={name} type="caption2" style={styles.chipLabel} />
          </View>
        ))}
      </View>
    </View>
  );
}

/**
 * Palette keys are long compound names (`backgroundElementSelected`), so
 * the swatch is sized to the *label* rather than the chip, and the label is
 * stretched to that full width so it wraps inside its own column instead of
 * spilling over its neighbours.
 */

const useStyles = createStyles(({ spacing, radius }) => ({
  container: {
    gap: spacing.x12,
  },
  swatches: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.x8,
  },
  swatch: {
    alignItems: "center",
    gap: spacing.x4,
    width: spacing.x40 * 3,
  },
  chip: {
    width: spacing.x32,
    height: spacing.x32,
    borderRadius: radius.x8,
    borderWidth: spacing.x1,
  },
  chipLabel: {
    alignSelf: "stretch",
    textAlign: "center",
  },
}));
