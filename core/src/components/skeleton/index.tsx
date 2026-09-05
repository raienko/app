import { useEffect, useId, useState, type ReactNode } from "react";
import {
  View,
  type LayoutChangeEvent,
  type StyleProp,
  type ViewStyle,
} from "react-native";
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

import Image, { type ImageSourceProp } from "@/components/image";
import {
  disabledA11yProps,
  statusA11yProps,
  useAccessibility,
} from "@/features/accessibility";
import { createStyles } from "@/features/responsive";
import { useTheme } from "@/features/theme";

import { artworkFromChildren, preserveAspectRatio, svgHref } from "./source";

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

/**
 * The two tones a skeleton is drawn in, exported so `children` drawn by the
 * caller can use the same ones the `source` path tints to.
 *
 * **The base is `backgroundElementSelected`, not `backgroundElement`**, for
 * the reason `ProgressBar`'s track is: `backgroundElement` is what most
 * raised surfaces in the app already use, so a placeholder sitting on a
 * `Card` or inside an open `Accordion` would be exactly the colour of what
 * is behind it. Caught in the showcase, where the first version rendered an
 * invisible skeleton on the section's own card.
 *
 * **The highlight is `grabber`**, the one neutral that is the same value in
 * both schemes. That makes it reliably *visible* against the base rather
 * than reliably brighter — it reads as a lighter sweep in the dark scheme
 * and a darker one in the light. No token is brighter than the base in both
 * (the palette has no step above `backgroundElementSelected` in light, and
 * `background` inverts), so visibility is the property worth pinning; a
 * conventional always-brighter shine would need a palette entry of its own.
 * It is drawn at `BAND_OPACITY`, which is what keeps a mid-grey from
 * reading as a bar rather than a shine.
 */
export const SKELETON_COLORS = {
  base: "backgroundElementSelected",
  highlight: "grabber",
} as const;

const AnimatedRect = Animated.createAnimatedComponent(Rect);

/**
 * Two ways to say what is shimmering, as a union rather than two optional
 * props: a file this component draws and recolours itself, or content the
 * caller draws. They aren't interchangeable — see the note on the mask —
 * so passing both should be a `tsc` error rather than a silent precedence
 * rule.
 */
type ContentProps =
  | {
      /**
       * The skeleton artwork, as anything `Image` takes — a `require()`d
       * PNG or SVG, or a URL. Export the placeholder from Figma as one file
       * and pass it here.
       */
      source: ImageSourceProp;
      children?: never;
    }
  | {
      source?: never;
      /**
       * Whatever should shimmer, drawn by the caller — an `<Image />`, an
       * SVG component, a stack of views. Sizes the skeleton itself.
       */
      children: ReactNode;
    };

type Props = ContentProps & {
  /**
   * What a screen reader should say while this is on screen — "Loading
   * messages". Omit it for a skeleton inside something that already
   * announces the wait, which is the common case; see the note below.
   */
  label?: string;
  /**
   * Turns the sweep off and leaves the content sitting there. For a screen
   * with many placeholders at once, where a dozen independent shimmers is
   * worse than none.
   */
  animated?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

/**
 * A loading placeholder: your own artwork, with a highlight travelling
 * through it.
 *
 * **It draws no shapes of its own.** There are no `<SkeletonLine>` /
 * `<SkeletonCircle>` primitives to reassemble the design in code — a
 * placeholder's whole job is to be the shape of the content that is coming,
 * the design tool is where that shape already exists, and rebuilding it in
 * JSX means maintaining the same layout twice and watching the two drift.
 *
 * ```tsx
 * <Skeleton source={require("@/assets/images/skeleton-card.svg")} style={styles.card} />
 *
 * <Skeleton>
 *   <Image source={placeholder} alt="" style={{ width: 200, height: 200 }} />
 * </Skeleton>
 *
 * <Skeleton>
 *   <SvgFromFigma width={200} height={50} />
 * </Skeleton>
 * ```
 *
 * **The highlight is masked to the artwork's shapes whenever the artwork is
 * a file.** Given a `source` — or a lone `<Image>` child, which is the same
 * thing said another way — the file's own alpha clips the highlight, so it
 * travels through the shapes and never across the gaps between them.
 * `<Skeleton source={x} />` and `<Skeleton><Image source={x} /></Skeleton>`
 * are therefore the same placeholder, drawn the same way.
 *
 * **Anything else gets the highlight across its bounding box**, because a
 * React element tree has no alpha channel to ask about. An SVG component
 * out of Figma, or several elements, will shimmer — the band is just held
 * to a third of the masked strength, since it is painting the empty space
 * as well and at full strength that reads as a panel sliding over the
 * placeholder rather than as light. Pass the artwork as `source` where you
 * can; it is the better of the two on shapes with a lot of space between
 * them.
 *
 * **A `source` is recoloured, not used as drawn.** It goes through `Image`'s
 * `tintColor`, so only its alpha matters — a Figma export in any grey comes
 * out in the app's own palette, correct in both schemes and after a
 * rebrand, with nothing to re-export. Opacity in the file still counts, so
 * a shape drawn at 50% comes out half-strength. `children` are drawn
 * exactly as given: their colour is the caller's business, and
 * `SKELETON_COLORS` is exported so they can use the same two.
 *
 * **A `source` sizes itself from `style`, like `Image` does** — give it the
 * width and height (or a width and an `aspectRatio`) of the space it stands
 * in for, since a file has no layout of its own to contribute. `children`
 * size the skeleton themselves.
 *
 * **Reduce Motion stops it dead**, with nothing substituted. `ProgressBar`
 * swaps its sweep for a cross-fade because there the movement carries
 * information — "this is still going" — and something has to. A skeleton's
 * does not: the shapes already say the content hasn't arrived, so a
 * placeholder that simply sits still is the whole answer rather than a
 * lesser one.
 *
 * **It is hidden from assistive technology unless you name it.** A skeleton
 * is a picture of content that hasn't arrived: nothing to read, nothing to
 * act on. Usually the screen already says it is loading — a `StateView`, a
 * route's own busy state — and a second announcement would talk over it.
 * Pass `label` when this *is* the announcement, and it becomes a polite
 * live region instead.
 *
 * @example <Skeleton source={require("@/assets/images/skeleton-card.svg")} style={styles.card} />
 * @example <Skeleton label="Loading messages"><Placeholder width={200} height={50} /></Skeleton>
 */
export default function Skeleton({
  source,
  children,
  label,
  animated = true,
  style,
  testID,
}: Props) {
  const theme = useTheme();
  const styles = useStyles();
  const { isReduceMotionEnabled } = useAccessibility();
  const [size, setSize] = useState({ width: 0, height: 0 });

  // `Defs` ids are document-global once several skeletons are on screen
  // together, so each instance needs its own or they all resolve to
  // whichever mounted last.
  const id = useId();
  const gradientId = `skeleton-gradient-${id}`;
  const maskId = `skeleton-mask-${id}`;

  // The artwork to mask against: the `source`, or a lone `<Image>` child's
  // own source, so the two ways of saying the same thing render the same
  // thing. Undefined for anything else, and for the handful of
  // `expo-image` sources that name something rather than a file — see
  // ./source.ts.
  const artwork =
    source === undefined
      ? artworkFromChildren(children)
      : { source, contentFit: "contain" };
  const href = artwork === undefined ? undefined : svgHref(artwork.source);

  // Reduce Motion is the whole answer, not a slower one: the sweep is
  // dropped and the placeholder sits still. `ProgressBar` substitutes a
  // cross-fade in the same spot because its movement carries information —
  // "this is still going" — but a skeleton's does not. The shapes already
  // say the content hasn't arrived, so there is nothing left for an
  // animation to convey and the honest substitution is none at all.
  const shimmering = animated && !isReduceMotionEnabled;

  const sweep = useSharedValue(0);
  const band = size.width * BAND_WIDTH;
  // The skew slides the band's lower edge sideways by this much, so the
  // travel has to be that much longer at both ends or the lean would still
  // be on screen when the upright part has already left.
  const lean = size.height * Math.abs(Math.tan((BAND_SKEW * Math.PI) / 180));

  useEffect(() => {
    if (!shimmering || size.width === 0) return;

    sweep.value = 0;
    sweep.value = withRepeat(
      withTiming(1, { duration: SWEEP_DURATION }),
      -1,
      false,
    );
  }, [shimmering, size.width, sweep]);

  // Starts fully off the leading edge and ends fully off the trailing one,
  // so the highlight enters and leaves rather than popping.
  const bandProps = useAnimatedProps(() => ({
    x: -band - lean + sweep.value * (size.width + band + lean * 2),
  }));

  function handleLayout(event: LayoutChangeEvent) {
    const { width, height } = event.nativeEvent.layout;
    setSize((current) =>
      current.width === width && current.height === height
        ? current
        : { width, height },
    );
  }

  return (
    <View
      testID={testID}
      {...(label === undefined
        ? disabledA11yProps()
        : statusA11yProps({ label }))}
      onLayout={handleLayout}
      style={[styles.skeleton, style]}
    >
      {source === undefined ? (
        children
      ) : (
        /* Only the alpha of this survives: the fill is the app's own
           surface colour, so the export's greys never reach the screen. */
        <Image
          source={source}
          decorative
          contentFit="contain"
          tintColor={theme.colors[SKELETON_COLORS.base]}
          fallback={null}
          style={styles.artwork}
        />
      )}

      {!shimmering || size.width === 0 ? null : (
        <Svg
          testID={testID === undefined ? undefined : `${testID}-shimmer`}
          pointerEvents="none"
          width={size.width}
          height={size.height}
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
                width={size.width}
                height={size.height}
                style={{ maskType: "alpha" }}
              >
                <SvgImage
                  href={href}
                  x="0"
                  y="0"
                  width={size.width}
                  height={size.height}
                  preserveAspectRatio={preserveAspectRatio(artwork?.contentFit)}
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
              height={size.height}
              transform={`skewX(${BAND_SKEW})`}
              opacity={
                href === undefined ? BAND_OPACITY.unmasked : BAND_OPACITY.masked
              }
              fill={`url(#${gradientId})`}
            />
          </G>
        </Svg>
      )}
    </View>
  );
}

const useStyles = createStyles(() => ({
  skeleton: {
    // Keeps the travelling highlight inside the placeholder's own box.
    overflow: "hidden",
  },
  // A file has no layout to contribute, so it fills the box `style` gave.
  artwork: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  shimmer: {
    position: "absolute",
    top: 0,
    left: 0,
  },
}));
