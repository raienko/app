import { useState } from "react";
import { View } from "react-native";

import Button from "@/components/button";
import Card from "@/components/card";
import Image from "@/components/image";
import Skeleton, { SKELETON_COLORS } from "@/components/skeleton";
import Switch from "@/components/switch";
import Text from "@/components/text";
import { createStyles } from "@/features/responsive";
import { useTheme } from "@/features/theme";

const CARD = require("@/assets/images/skeleton-card.svg");
const ROW = require("@/assets/images/skeleton-row.svg");

/** The artwork, the sweep, the static case, and a list of placeholders. */
export default function SkeletonSection() {
  const theme = useTheme();
  const styles = useStyles();
  const [animated, setAnimated] = useState(true);
  // The same tone the `source` path tints to, so the two demos match.
  const fill = { backgroundColor: theme.colors[SKELETON_COLORS.base] };
  const [loading, setLoading] = useState(true);

  return (
    <View style={styles.container}>
      <Text
        value="A loading placeholder: your own artwork with a highlight travelling through it. The shapes come from a file exported from Figma, not from primitives reassembled in code."
        type="footnote"
        style={{ color: theme.colors.textSecondary }}
      />

      <Switch
        value={animated}
        onChange={setAnimated}
        label="Animate the highlight"
      />

      <Text value="A card" type="headline" />
      <Skeleton source={CARD} animated={animated} style={styles.card} />
      <Text
        value="The artwork is recoloured through Image's tintColor, so only its alpha matters — the same grey export is correct in both schemes."
        type="caption1"
        style={{ color: theme.colors.textSecondary }}
      />

      <Text value="A list of rows" type="headline" />
      <Card padded={false}>
        <View style={styles.rows}>
          {[0, 1, 2].map((row) => (
            <Skeleton
              key={row}
              source={ROW}
              animated={animated}
              style={styles.row}
            />
          ))}
        </View>
      </Card>
      <Text
        value="The highlight is clipped to the shapes, so it travels through them rather than across the gaps between."
        type="caption1"
        style={{ color: theme.colors.textSecondary }}
      />

      <Text value="Your own children" type="headline" />
      <Text
        value="A lone Image child is the same thing as source, and is drawn the same way — masked to its own shapes."
        type="caption1"
        style={{ color: theme.colors.textSecondary }}
      />
      <Skeleton animated={animated} style={styles.row}>
        <Image source={ROW} decorative style={styles.fill} />
      </Skeleton>

      <Text
        value="Anything else — an SVG component out of Figma, or several elements — has no alpha channel to mask against, so the highlight sweeps the bounding box instead, at a third of the strength."
        type="caption1"
        style={{ color: theme.colors.textSecondary }}
      />
      <Skeleton animated={animated}>
        <View style={styles.drawn}>
          <View style={[styles.drawnCircle, fill]} />
          <View style={styles.drawnLines}>
            <View style={[styles.drawnLine, fill]} />
            <View style={[styles.drawnLineShort, fill]} />
          </View>
        </View>
      </Skeleton>

      <Text value="Standing in for content" type="headline" />
      <Button
        value={loading ? "Finish loading" : "Load again"}
        onPress={() => setLoading((current) => !current)}
      />
      {loading ? (
        <Skeleton
          source={ROW}
          label="Loading the profile"
          animated={animated}
          style={styles.row}
        />
      ) : (
        <View style={styles.loaded}>
          <Text value="Ada Lovelace" />
          <Text
            value="ada@example.com"
            type="footnote"
            style={{ color: theme.colors.textSecondary }}
          />
        </View>
      )}
    </View>
  );
}

const useStyles = createStyles(({ spacing, units, radius }) => ({
  container: {
    gap: spacing.x12,
  },
  card: {
    alignSelf: "stretch",
    width: "100%",
    aspectRatio: 480 / 352,
  },
  rows: {
    padding: spacing.x12,
    gap: spacing.x12,
  },
  row: {
    alignSelf: "stretch",
    width: "100%",
    aspectRatio: 480 / 64,
  },
  loaded: {
    gap: spacing.x2,
  },
  fill: {
    width: "100%",
    height: "100%",
  },
  drawn: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.x12,
    padding: spacing.x4,
  },
  drawnCircle: {
    width: units(48),
    height: units(48),
    borderRadius: units(24),
  },
  drawnLines: {
    gap: spacing.x8,
  },
  drawnLine: {
    width: units(200),
    height: units(16),
    borderRadius: radius.x4,
  },
  drawnLineShort: {
    width: units(120),
    height: units(16),
    borderRadius: radius.x4,
  },
}));
