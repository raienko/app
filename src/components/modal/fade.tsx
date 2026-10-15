import { useId } from "react";
import { View } from "react-native";
import Svg, { Defs, LinearGradient, Rect, Stop } from "react-native-svg";

import { createStyles } from "@/features/responsive";
import { useTheme } from "@/features/theme";

/**
 * The surface behind an `actions` sheet: one gradient of the page colour,
 * fully transparent at the top and a translucent tint at the bottom —
 * slightly dark in the dark theme, slightly light in the light one.
 *
 * An action sheet is a stack of items rather than a card, so it gets no
 * hard edge and no solid fill — but items over the bare backdrop let
 * whatever is behind the modal compete with them (most visibly through a
 * see-through `secondary` button). The tint settles the stack without
 * turning it back into a box.
 *
 * Absolutely positioned behind the content and reaching `FADE_HEIGHT`
 * above it; it takes no touches, so a tap on the faded band still lands on
 * the backdrop and dismisses.
 */
export default function ModalFade() {
  const theme = useTheme();
  const styles = useStyles();
  const gradientId = `modal-fade-${useId().replace(/:/g, "")}`;

  return (
    // Positioned by a View rather than the Svg itself: an Svg sized "100%"
    // takes its parent's height and ignores top/bottom, which left the
    // tint stopping short of the bottom edge on a hard line.
    <View pointerEvents="none" style={styles.layer}>
      <Svg width="100%" height="100%" preserveAspectRatio="none">
        <Defs>
          <LinearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <Stop
              offset="0"
              stopColor={theme.colors.background}
              stopOpacity="0"
            />
            <Stop
              offset="1"
              stopColor={theme.colors.background}
              stopOpacity={FADE_OPACITY}
            />
          </LinearGradient>
        </Defs>
        <Rect width="100%" height="100%" fill={`url(#${gradientId})`} />
      </Svg>
    </View>
  );
}

/** How far above the items the fade starts. */
const FADE_HEIGHT = 64;

/** How strong the tint gets at the bottom edge — slight, not a fill. */
const FADE_OPACITY = 0.75;

const useStyles = createStyles(({ units }) => ({
  layer: {
    position: "absolute",
    top: -units(FADE_HEIGHT),
    left: 0,
    right: 0,
    bottom: 0,
  },
}));
