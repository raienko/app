import { useState, type ReactNode } from "react";
import {
  View,
  type LayoutChangeEvent,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import Image, { type ImageSourceProp } from "@/components/image";
import {
  disabledA11yProps,
  statusA11yProps,
  useAccessibility,
} from "@/features/accessibility";
import { createStyles } from "@/features/responsive";
import { useTheme } from "@/features/theme";

import { SKELETON_COLORS } from "./colors";
import SkeletonShimmer from "./shimmer";
import { artworkFromChildren, svgHref } from "./source";

export { SKELETON_COLORS } from "./colors";

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
        <SkeletonShimmer
          width={size.width}
          height={size.height}
          href={href}
          contentFit={artwork?.contentFit}
          testID={testID === undefined ? undefined : `${testID}-shimmer`}
        />
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
}));
