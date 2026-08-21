import { Pressable, StyleSheet } from "react-native";
import Animated, {
  useAnimatedStyle,
  type SharedValue,
} from "react-native-reanimated";

import { createStyles } from "@/features/responsive";

const BACKDROP_MAX_OPACITY = 0.5;

type Props = {
  progress: SharedValue<number>;
  onDismiss: () => void;
};

/**
 * The dimmed, tap-to-dismiss layer behind a modal's content. Fades in/out
 * with `progress` (the same 0–1 value driving the content's own enter/exit
 * animation, owned by index.tsx) — kept as a separate component since it's
 * a self-contained concern (its own Pressable, its own accessibility props)
 * that types without a backdrop (`fullscreen`) simply don't render.
 */
export default function ModalBackdrop({ progress, onDismiss }: Props) {
  const styles = useStyles();

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: progress.value * BACKDROP_MAX_OPACITY,
  }));

  return (
    <Pressable
      testID="modal-backdrop"
      style={StyleSheet.absoluteFill}
      onPress={onDismiss}
      accessibilityRole="button"
      accessibilityLabel="Dismiss"
    >
      <Animated.View
        style={[StyleSheet.absoluteFill, styles.backdrop, backdropStyle]}
      />
    </Pressable>
  );
}

const useStyles = createStyles(() => ({
  // The one deliberate exception to sourcing color from theme.colors — a
  // dimming scrim is conventionally black regardless of theme.
  backdrop: {
    backgroundColor: "#000",
  },
}));
