import { useEffect, useId } from "react";
import Animated, {
  useAnimatedProps,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import Svg, {
  Defs,
  G,
  Image as SvgImage,
  LinearGradient,
  Mask,
  Rect,
  Stop,
} from "react-native-svg";

import { createStyles } from "@/features/responsive";
import { useTheme } from "@/features/theme";

import { SKELETON_COLORS } from "./colors";
import { preserveAspectRatio, type svgHref } from "./source";

/** One pass of the highlight across the artwork. */
const SWEEP_DURATION = 1400;
/** How much of the width the highlight band occupies. */
const BAND_WIDTH = 0.6;

/**
 * How far the band leans off vertical, in degrees.
 *
 * **The lean is a skew on the rect, not an angled gradient.** Angling the
 * gradient inside an upright rect looks like it should do the same thing
 * and doesn't: a diagonal gradient only reaches its end stops at two
 * corners, so the band's own left and right edges stay partly opaque down
 * most of their height and the rect shows up as a hard vertical line
 * travelling across the artwork. Skewing the shape keeps the gradient
 * running along the band's own axis — transparent along the whole of both
 * edges — and leans the soft edges with it.
 */
const BAND_SKEW = -18;

/**
 * How strong the highlight gets at the centre of the band, which depends on
 * what it is allowed to paint.
 *
 * `masked` travels through the artwork's own shapes and touches nothing
 * else, so it can be strong enough to read as a sweep. `unmasked` — the
 * `children` case, where there is no alpha channel to clip against — paints
 * the gaps between the shapes as well, and at the same strength that reads
 * as a translucent panel sliding over the placeholder rather than a shine.
 * Held to roughly a third of it, it goes back to reading as light.
 */
const BAND_OPACITY = { masked: 0.45, unmasked: 0.16 };

const AnimatedRect = Animated.createAnimatedComponent(Rect);

type Props = {
  /** The measured box to sweep across. Only mounted once it is non-zero. */
  width: number;
  height: number;
  /** The artwork to clip the band to, or undefined to sweep the whole box. */
  href: ReturnType<typeof svgHref>;
  contentFit: string | undefined;
  testID?: string;
};

/**
 * The travelling highlight: a skewed gradient band swept across the box on
 * repeat, clipped to the artwork's alpha when there is artwork to clip to.
 * `Skeleton` decides *whether* it runs (Reduce Motion, `animated`, a
 * measured box); this owns *how*.
 */
export default function SkeletonShimmer({
  width,
  height,
  href,
  contentFit,
  testID,
}: Props) {
  const theme = useTheme();
  const styles = useStyles();

  // `Defs` ids are document-global once several skeletons are on screen
  // together, so each instance needs its own or they all resolve to
  // whichever mounted last.
  const id = useId();
  const gradientId = `skeleton-gradient-${id}`;
  const maskId = `skeleton-mask-${id}`;

  const sweep = useSharedValue(0);
  const band = width * BAND_WIDTH;
  // The skew slides the band's lower edge sideways by this much, so the
  // travel has to be that much longer at both ends or the lean would still
  // be on screen when the upright part has already left.
  const lean = height * Math.abs(Math.tan((BAND_SKEW * Math.PI) / 180));

  useEffect(() => {
    sweep.value = 0;
    sweep.value = withRepeat(
      withTiming(1, { duration: SWEEP_DURATION }),
      -1,
      false,
    );
  }, [width, sweep]);

  // Starts fully off the leading edge and ends fully off the trailing one,
  // so the highlight enters and leaves rather than popping.
  const bandProps = useAnimatedProps(() => ({
    x: -band - lean + sweep.value * (width + band + lean * 2),
  }));

  return (
    <Svg
      testID={testID}
      pointerEvents="none"
      width={width}
      height={height}
      style={styles.shimmer}
    >
      <Defs>
        {/* Along the band's own axis, never across it — see BAND_SKEW
            for what happens when you angle this instead of the shape. */}
        <LinearGradient id={gradientId} x1="0" y1="0" x2="1" y2="0">
          <Stop
            offset="0"
            stopColor={theme.colors[SKELETON_COLORS.highlight]}
            stopOpacity="0"
          />
          <Stop
            offset="0.5"
            stopColor={theme.colors[SKELETON_COLORS.highlight]}
            stopOpacity="1"
          />
          <Stop
            offset="1"
            stopColor={theme.colors[SKELETON_COLORS.highlight]}
            stopOpacity="0"
          />
        </LinearGradient>

        {href === undefined ? null : (
          /* `alpha`, not SVG's default of `luminance`: the artwork's own
             colours are irrelevant (the layer above has already thrown
             them away), and a luminance mask would make a dark export
             mask nothing at all. Set through `style` rather than the
             `maskType` prop — the prop reaches native but leaks to the
             DOM on web, where React rejects it and the mask is dropped;
             the style is read by both. */
          <Mask
            id={maskId}
            // Pinned to the canvas rather than to the bounding box of
            // whatever is being masked: that box is the band, which
            // moves and leans, and a mask region tracking it would
            // crop the artwork differently every frame.
            maskUnits="userSpaceOnUse"
            x="0"
            y="0"
            width={width}
            height={height}
            style={{ maskType: "alpha" }}
          >
            <SvgImage
              href={href}
              x="0"
              y="0"
              width={width}
              height={height}
              preserveAspectRatio={preserveAspectRatio(contentFit)}
            />
          </Mask>
        )}
      </Defs>

      {/* The mask is on the group, not on the rect. An element's own
          transform applies to its mask as well, so skewing the rect
          directly would skew the artwork it is masked against and pull
          the two out of register. */}
      <G {...(href === undefined ? null : { mask: `url(#${maskId})` })}>
        <AnimatedRect
          animatedProps={bandProps}
          y="0"
          width={band}
          height={height}
          transform={`skewX(${BAND_SKEW})`}
          opacity={
            href === undefined ? BAND_OPACITY.unmasked : BAND_OPACITY.masked
          }
          fill={`url(#${gradientId})`}
        />
      </G>
    </Svg>
  );
}

const useStyles = createStyles(() => ({
  shimmer: {
    position: "absolute",
    top: 0,
    left: 0,
  },
}));
