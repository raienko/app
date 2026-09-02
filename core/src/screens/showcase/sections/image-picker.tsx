import { useState } from "react";
import { Image } from "expo-image";
import type { ImagePickerAsset } from "expo-image-picker";
import { View } from "react-native";

import Button from "@/components/button";
import Icon from "@/components/icon";
import ImagePicker from "@/components/image-picker";
import Text from "@/components/text";
import { createStyles, useSizes } from "@/features/responsive";
import { useTheme } from "@/features/theme";

import Readout from "./readout";

const PICKER_ID = "showcase-image-picker";

/** Pressable and static entry points sharing one camera/gallery picker. */
export default function ImagePickerSection() {
  const [image, setImage] = useState<ImagePickerAsset>();
  const theme = useTheme();
  const { spacing } = useSizes();
  const styles = useStyles();

  const fileName = image?.fileName ?? (image ? "selected image" : "none");
  const dimensions = image ? `${image.width} × ${image.height}` : "—";

  return (
    <View style={styles.container}>
      <Text
        value="Tap the preview or use the static API. Both open the same camera/gallery bottom sheet."
        type="footnote"
        style={{ color: theme.colors.textSecondary }}
      />

      <ImagePicker
        id={PICKER_ID}
        accessibilityLabel={
          image ? "Replace selected image" : "Choose an image"
        }
        style={[styles.trigger, { borderColor: theme.colors.textSecondary }]}
        onChange={setImage}
      >
        {image ? (
          <Image
            source={image.uri}
            contentFit="cover"
            accessibilityLabel="Selected image preview"
            style={styles.image}
          />
        ) : (
          <View style={styles.placeholder}>
            <Icon
              name="image"
              size={spacing.x32}
              color={theme.colors.textSecondary}
            />
            <Text value="Choose from camera or gallery" type="callout" />
          </View>
        )}
      </ImagePicker>

      <View style={styles.actions}>
        <Button
          value="Open with ImagePicker.show"
          onPress={() => void ImagePicker.show(PICKER_ID)}
        />
        {image ? (
          <Button
            value="Clear"
            type="tertiary"
            onPress={() => setImage(undefined)}
          />
        ) : null}
      </View>

      <Readout label="file" value={fileName} />
      <Readout label="dimensions" value={dimensions} />
    </View>
  );
}

const useStyles = createStyles(({ radius, spacing, units }) => ({
  container: {
    gap: spacing.x12,
  },
  trigger: {
    alignSelf: "stretch",
    minHeight: units(180),
    overflow: "hidden",
    borderWidth: spacing.x1,
    borderStyle: "dashed",
    borderRadius: radius.x12,
  },
  placeholder: {
    flex: 1,
    minHeight: units(180),
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.x8,
    padding: spacing.x16,
  },
  image: {
    width: "100%",
    aspectRatio: 16 / 9,
  },
  actions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.x8,
  },
}));
