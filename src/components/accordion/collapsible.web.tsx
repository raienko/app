import { useEffect, useState, type ReactNode } from "react";
import {
  View,
  type LayoutChangeEvent,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import If from "@/components/if";
import { easeOutClamped } from "@/utils/easing";

type Props = {
  open: boolean;
  /** Already through `useAnimationDuration()`, so 0 under Reduce Motion. */
  duration: number;
  contentStyle?: StyleProp<ViewStyle>;
  children: ReactNode;
};

/**
 * None on web: the browser re-flows the sections below as this one's
 * height animates, so they already move with it — and Reanimated would draw
 * a layout transition here as a scale, squashing whatever it's on.
 */
export function sectionTransition(_duration: number) {
  return undefined;
}

/**
 * Web: content grows and fades in, then shrinks and fades out, by animating
 * the clip's height towards the content's measured one. The height is
 * pinned whenever the section isn't fully open — including a finished
 * collapse, since going back to `auto` before the unmount lands would pop
 * the content to full height for a frame — and `auto` once it is, so
 * content that changes size while open is never clipped.
 *
 * Native uses layout transitions instead (./collapsible.tsx), for reasons
 * that don't apply in a browser.
 */
export default function Collapsible({
  open,
  duration,
  contentStyle,
  children,
}: Props) {
  // Stays true through the collapse so the content can animate out.
  const [mounted, setMounted] = useState(open);
  const progress = useSharedValue(open ? 1 : 0);
  const contentHeight = useSharedValue(0);

  // Mounting is decided during render, so the content is there on the same
  // commit that starts the animation rather than one render later.
  if (open && !mounted) setMounted(true);

  useEffect(() => {
    progress.value = withTiming(
      open ? 1 : 0,
      { duration, easing: easeOutClamped },
      (finished) => {
        // A toggle mid-animation cancels this one; only the last one settles.
        if (finished && !open) runOnJS(setMounted)(false);
      },
    );
  }, [open, duration, progress]);

  function measure(event: LayoutChangeEvent) {
    contentHeight.value = event.nativeEvent.layout.height;
  }

  const clipStyle = useAnimatedStyle(() => ({
    height:
      progress.value === 1 ? "auto" : progress.value * contentHeight.value,
    opacity: progress.value,
  }));

  return (
    <If condition={mounted}>
      <Animated.View style={[clip, clipStyle]}>
        <View style={contentStyle} onLayout={measure}>
          {children}
        </View>
      </Animated.View>
    </If>
  );
}

const clip = { overflow: "hidden" } as const;
