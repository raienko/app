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
import {
  controlA11yProps,
  useAnimationDuration,
} from "@/features/accessibility";
import { createStyles, useSizes } from "@/features/responsive";
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
  const { spacing } = useSizes();
  const styles = useStyles();
  const duration = useAnimationDuration();

  function toggle() {
    const next = !open;
    setOpen(next);
    // duration() collapses to 0 under "Reduce Motion" — the chevron still
    // ends up in the right place, it just doesn't spin to get there.
    rotation.value = withTiming(next ? 1 : 0, {
      duration: duration(ANIMATION_DURATION),
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
        {...controlA11yProps({ expanded: open })}
      >
        <Text value={title} style={styles.title} />
        <Animated.View style={chevronStyle}>
          <Icon
            name="chevron-down"
            size={spacing.x20}
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

const useStyles = createStyles(({ isRTL, spacing, radius }) => ({
  container: {
    // Fills whatever contains it, rather than picking a width of its own.
    // `alignSelf` (not `width: "100%"`) because the usual parent — Screen —
    // centers its children without stretching them, and only alignSelf
    // opts back out of that; without it the header's `space-between` has no
    // extra room to space with and the chevron sits against the title.
    // Constraining the width is the parent's call: see the Home screen,
    // which caps its content column at `sizes.contentMaxWidth`.
    alignSelf: "stretch",
    borderRadius: radius.x12,
    overflow: "hidden",
  },
  header: {
    flexDirection: isRTL ? "row-reverse" : "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: spacing.x12,
    paddingHorizontal: spacing.x16,
  },
  title: {
    flex: 1,
  },
  content: {
    gap: spacing.x12,
    paddingHorizontal: spacing.x16,
    paddingBottom: spacing.x16,
  },
}));
