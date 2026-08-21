import { useState, type ReactNode } from "react";
import { Pressable, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import If from "@/components/if";
import Icon from "@/components/icon";
import Text from "@/components/text";
import { createStyles, useUnits } from "@/features/responsive";
import { useTheme } from "@/features/theme";

const ANIMATION_DURATION = 200;

type Props = {
  title: string;
  defaultOpen?: boolean;
  children: ReactNode;
};

/**
 * A titled, collapsible section — tap the header to toggle. The chevron on
 * the right rotates 180° between collapsed/open instead of swapping between
 * two icon assets, so there's only ever one glyph to keep in sync with
 * state.
 *
 * Content itself shows/hides instantly (via `If`), not height-animated —
 * animating to/from an unmeasured "auto" height is the fiddly part of an
 * accordion; not worth it until a real need for that polish shows up.
 */
export default function Accordion({
  title,
  defaultOpen = false,
  children,
}: Props) {
  const [open, setOpen] = useState(defaultOpen);
  const rotation = useSharedValue(defaultOpen ? 1 : 0);
  const theme = useTheme();
  const units = useUnits();
  const styles = useStyles();

  function toggle() {
    const next = !open;
    setOpen(next);
    rotation.value = withTiming(next ? 1 : 0, {
      duration: ANIMATION_DURATION,
    });
  }

  const chevronStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value * 180}deg` }],
  }));

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.colors.backgroundElement },
      ]}
    >
      <Pressable
        style={styles.header}
        onPress={toggle}
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
      >
        <Text value={title} style={styles.title} />
        <Animated.View style={chevronStyle}>
          <Icon
            name="chevron-down"
            size={units(20)}
            color={theme.colors.textSecondary}
          />
        </Animated.View>
      </Pressable>
      <If condition={open}>
        <View style={styles.content}>{children}</View>
      </If>
    </View>
  );
}

const useStyles = createStyles(({ units, isRTL }) => ({
  container: {
    // Screen (this component's typical parent) centers children without
    // stretching them, so without an explicit width the header's
    // space-between would have no extra room to actually space with.
    width: units(260),
    borderRadius: units(12),
    overflow: "hidden",
  },
  header: {
    flexDirection: isRTL ? "row-reverse" : "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: units(12),
    paddingHorizontal: units(16),
  },
  title: {
    flex: 1,
  },
  content: {
    gap: units(12),
    paddingHorizontal: units(16),
    paddingBottom: units(16),
  },
}));
