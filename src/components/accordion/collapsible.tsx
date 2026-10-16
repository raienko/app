import type { ReactNode } from "react";
import type { StyleProp, ViewStyle } from "react-native";
import Animated, {
  FadeIn,
  FadeOut,
  LinearTransition,
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
 * The transition every section's own container takes, so the sections
 * below one that's toggled slide with it instead of jumping.
 */
export function sectionTransition(duration: number) {
  return LinearTransition.duration(duration).easing(easeOutClamped);
}

/**
 * Native: content mounts at its full size and fades in while this clip grows
 * to fit it, and fades out while it shrinks back.
 *
 * The growing is a Reanimated layout transition rather than an animated
 * `height`, because on device the latter was both slow and wrong: every
 * frame re-laid-out the whole scroll content, and while the clip was pinned
 * Yoga squeezed the content to its padding, so its real height only arrived
 * after the animation had already finished. A layout transition runs in the
 * mounting layer — nothing is measured and nothing re-lays-out per frame.
 *
 * Web has its own version (./collapsible.web.tsx): Reanimated draws this
 * transition there as a scale, which squashes the content.
 */
export default function Collapsible({
  open,
  duration,
  contentStyle,
  children,
}: Props) {
  return (
    // Always there, and the one that clips: the content is revealed as this
    // grows rather than spilling over the sections below.
    <Animated.View layout={sectionTransition(duration)} style={clip}>
      <If condition={open}>
        <Animated.View
          entering={FadeIn.duration(duration)}
          exiting={FadeOut.duration(duration)}
          style={contentStyle}
        >
          {children}
        </Animated.View>
      </If>
    </Animated.View>
  );
}

const clip = { overflow: "hidden" } as const;
