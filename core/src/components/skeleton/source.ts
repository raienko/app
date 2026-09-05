import { Children, isValidElement, type ReactNode } from "react";
import type { ImageSourcePropType } from "react-native";

import Image, {
  type ImageProps,
  type ImageSourceProp,
} from "@/components/image";

/**
 * The same artwork, in the shape `react-native-svg`'s `<Image>` accepts.
 *
 * `Image` (and so `Skeleton`) takes everything `expo-image` does, which is
 * a much wider set than SVG's `href` — a decoded `SharedRef`, an SF Symbol
 * name, a blurhash. This narrows the shapes that are genuinely a file to
 * `href`, and returns `undefined` for the rest, which is the signal to draw
 * the artwork without a masked highlight rather than to fail.
 *
 * Split out and pure because it is a pile of shape checks, and those are
 * worth testing without rendering anything.
 */
export function svgHref(
  source: ImageSourceProp,
): ImageSourcePropType | string | undefined {
  // A `require()`d asset — the common case for a Figma export.
  if (typeof source === "number") return source;

  if (typeof source === "string") {
    const uri = source.trim();
    // SF Symbols and blurhash/thumbhash placeholders are strings that name
    // something `expo-image` draws itself; there is no file for SVG to load.
    if (uri === "" || /^(sf:|blurhash:|thumbhash:)/.test(uri)) return undefined;
    return uri;
  }

  if (Array.isArray(source)) {
    // expo-image picks a candidate from the list by size; a mask only needs
    // the shapes, so the first usable entry is as good as any.
    for (const candidate of source) {
      const href = svgHref(candidate);
      if (href !== undefined) return href;
    }
    return undefined;
  }

  if (source !== null && typeof source === "object" && "uri" in source) {
    const { uri } = source;
    return typeof uri === "string" && uri.trim() !== "" ? uri : undefined;
  }

  return undefined;
}

/**
 * How `expo-image` fits a picture into its box, in SVG's spelling of the
 * same idea — so a mask built from a child's source lines up with how that
 * child is actually drawn rather than assuming one of them.
 */
const PRESERVE_ASPECT_RATIO: Record<string, string> = {
  contain: "xMidYMid meet",
  cover: "xMidYMid slice",
  fill: "none",
  "scale-down": "xMidYMid meet",
  none: "none",
};

/** `expo-image`'s own default, which a child that says nothing gets. */
const DEFAULT_CONTENT_FIT = "cover";

export function preserveAspectRatio(contentFit?: string): string {
  return (
    PRESERVE_ASPECT_RATIO[contentFit ?? DEFAULT_CONTENT_FIT] ??
    PRESERVE_ASPECT_RATIO[DEFAULT_CONTENT_FIT]
  );
}

/**
 * The artwork behind a lone `<Image>` child, if that is what the children
 * are.
 *
 * This exists so the two ways of saying the same thing render the same
 * thing: `<Skeleton source={x} />` and `<Skeleton><Image source={x} /></Skeleton>`
 * are the same placeholder, and it would be a poor surprise for one of them
 * to get a highlight masked to the shapes and the other a band sweeping the
 * whole box. Anything else — an SVG component, several elements, a tree —
 * has no source to find and keeps the unmasked sweep.
 *
 * Only a *direct, only* child is inspected, and only when it is this app's
 * own `Image`. Reaching further into a caller's tree would make the effect
 * depend on layers they did not write; the same limit `withIconDefaults`
 * puts on which children it will touch.
 */
export function artworkFromChildren(
  children: ReactNode,
): { source: ImageSourceProp; contentFit?: string } | undefined {
  const elements = Children.toArray(children).filter(isValidElement);
  if (elements.length !== 1) return undefined;

  const [only] = elements;
  if (only.type !== Image) return undefined;

  const { source, contentFit } = only.props as Pick<
    ImageProps,
    "source" | "contentFit"
  >;
  return source === undefined ? undefined : { source, contentFit };
}
