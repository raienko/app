import { type ReactNode } from "react";
import { ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { createStyles, useUnits } from "@/features/responsive";

import type { ModalPosition } from "./config";

type Props = {
  position: ModalPosition;
  children: ReactNode;
  scrollEnabled?: boolean;
};

/**
 * Scrolls content taller than the screen instead of letting it overflow —
 * bounded by ModalContent's own `maxHeight`, so it shrinks to fit short
 * content and only scrolls once content actually exceeds that cap.
 *
 * Spaces its children apart with explicit spacer Views rather than a `gap`
 * style — `gap` on a ScrollView's content is inconsistently supported
 * across RN environments (confirmed missing on-device even though it works
 * on web), where a plain spacer View always renders the same everywhere.
 *
 * `position === "bottom"` gets the safe-area bottom inset added as padding
 * *inside* the scrollable area (not on the card outside it), so it's always
 * reachable by scrolling to the end instead of being pushed past the
 * card's own (otherwise unbounded) height and clipped.
 */
export default function ModalScrollArea({
  position,
  children,
  scrollEnabled,
}: Props) {
  const insets = useSafeAreaInsets();
  const styles = useStyles();
  const units = useUnits();

  const scrollStyle = position === "fullscreen" ? styles.flex : styles.shrink;
  const contentContainerStyle = [
    styles.container,
    position === "bottom" && { paddingBottom: insets.bottom + units(10) },
  ];

  return (
    <ScrollView
      style={scrollStyle}
      scrollEnabled={scrollEnabled}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={contentContainerStyle}
    >
      {children}
    </ScrollView>
  );
}

const useStyles = createStyles(({ units }) => ({
  flex: {
    flex: 1,
  },
  shrink: {
    flexShrink: 1,
  },
  container: {
    gap: units(8),
  },
}));
