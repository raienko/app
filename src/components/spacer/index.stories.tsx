import { View } from "react-native";

import Text from "@/components/text";
import { createStyles } from "@/features/responsive";
import { useTheme } from "@/features/theme";

import Component from "./index";

const meta = {
  title: "components/Spacer",
  component: Component,
};

export default meta;

/**
 * A spacer is a gap — invisible by definition — so every story here puts
 * tinted blocks either side of it. The blocks are the only thing you can
 * see; the space between them is the component.
 */
function Block({ label }: { label: string }) {
  const theme = useTheme();
  const styles = useStyles();

  return (
    <View
      style={[
        styles.block,
        { backgroundColor: theme.colors.backgroundElementSelected },
      ]}
    >
      <Text value={label} type="caption2" />
    </View>
  );
}

export const Vertical = () => (
  <View>
    <Block label="above" />
    <Component />
    <Block label="below" />
  </View>
);

export const Horizontal = () => {
  const styles = useStyles();

  return (
    <View style={styles.row}>
      <Block label="left" />
      <Component direction="horizontal" size="x24" />
      <Block label="right" />
    </View>
  );
};

/** Both axes at once — the diagonal step a single-axis gap can't make. */
export const Both = () => {
  const styles = useStyles();

  return (
    <View style={styles.row}>
      <Block label="first" />
      <Component direction="both" size="x40" />
      <Block label="second" />
    </View>
  );
};

/** Every step of the spacing scale, drawn as the gap it actually produces. */
export const Scale = () => {
  const styles = useStyles();

  return (
    <View style={styles.row}>
      {(["x4", "x8", "x16", "x24", "x40"] as const).map((size) => (
        <View key={size} style={styles.row}>
          <Block label={size} />
          <Component direction="horizontal" size={size} />
        </View>
      ))}
    </View>
  );
};

const useStyles = createStyles(({ isRTL, spacing, radius }) => ({
  row: {
    flexDirection: isRTL ? "row-reverse" : "row",
    alignItems: "center",
  },
  block: {
    borderRadius: radius.surface,
    paddingHorizontal: spacing.x8,
    paddingVertical: spacing.x4,
  },
}));
