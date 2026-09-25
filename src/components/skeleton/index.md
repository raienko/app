[Docs](../../../docs/index.md) › [Components](../../../docs/components/index.md) › Feedback & status

# Skeleton

> A loading placeholder drawn from your own artwork, with a travelling highlight.

<sub>`src/components/skeleton` · [Stories](index.stories.tsx) · Tests: [`index.test.tsx`](index.test.tsx), [`source.test.tsx`](source.test.tsx)</sub>

```tsx
import Skeleton from "@/components/skeleton";

<Skeleton source={require("@/assets/images/skeleton-card.svg")} style={styles.card} />

<Skeleton>
  <Image source={placeholder} alt="" style={{ width: 200, height: 200 }} />
</Skeleton>

<Skeleton>
  <SvgFromFigma width={200} height={50} />
</Skeleton>
```

A loading placeholder: your own artwork, with a highlight travelling through it.

- **It draws no shapes of its own.** There are no `<SkeletonLine>` / `<SkeletonCircle>` primitives to reassemble the design in code. A placeholder's whole job is to be the shape of the content that is coming, the design tool is where that shape already exists, and rebuilding it in JSX means maintaining the same layout twice and watching the two drift. Export it from Figma as one file, or hand over the elements you have already drawn.
- **The highlight is masked to the artwork's shapes whenever the artwork is a file.** Given a `source` — or a lone `<Image>` child, which is the same thing said another way — the file's own alpha clips the highlight, so it travels through the shapes and never across the gaps between them. `<Skeleton source={x} />` and `<Skeleton><Image source={x} /></Skeleton>` are therefore the same placeholder, drawn the same way; only a direct, only child is inspected, and only when it is this app's own `Image`, the same limit `withIconDefaults` puts on which children it will touch. The child's own `contentFit` is carried into the mask's `preserveAspectRatio`, or the two would line up only by accident.
- **Anything else gets the highlight across its bounding box**, because a React element tree has no alpha channel to ask about. An SVG component out of Figma, or several elements, still shimmers — the band is just held to a third of the masked strength (`0.16` against `0.45`), since it is painting the empty space as well and at full strength that reads as a translucent panel sliding over the placeholder rather than as light. The showcase puts the masked and unmasked forms next to each other, where the difference is obvious.
- **The band leans, and the lean is a skew on the shape rather than an angled gradient.** Angling the gradient inside an upright rect looks like it should do the same thing and doesn't: a diagonal gradient only reaches its end stops at two corners, so the band's own left and right edges stay partly opaque down most of their height and the rect shows up as a hard vertical line travelling across the artwork — tried it, and it was worse than the upright version it replaced. `skewX` leans the shape while the gradient keeps running along the band's own axis, transparent along the whole of both edges, so the soft edges lean with it. The travel is padded at both ends by `height × tan(skew)`, or the leaning part would still be on screen once the upright part had left.
- **The mask sits on a wrapping `<G>`, not on the band itself.** An element's own transform applies to its mask as well, so skewing the rect directly skews the artwork it is masked against and pulls the two out of register. The mask is also pinned with `maskUnits="userSpaceOnUse"`: the default is relative to the bounding box of what is being masked, which here is a band that moves and leans, and that would re-crop the artwork every frame.
- **The mask is `react-native-svg`, not a new dependency.** The usual recipe for this is `@react-native-masked-view/masked-view` plus `expo-linear-gradient`; neither is installed, and adding a native module to get a loading placeholder is a poor trade. Instead the highlight is an SVG `<Rect>` filled with a `<LinearGradient>` and masked by an `<Image>` of the same artwork, swept by animating the rect's `x` through Reanimated's `useAnimatedProps`. Verified running on web, where the band walks from `-190` to `+322` across a 349px box with `mask-type: alpha` applied.
- **`maskType` is set through `style`, not the prop of the same name.** The prop reaches native fine and leaks straight to the DOM on web, where React rejects it as an unknown attribute and the mask is silently dropped — caught in the browser console. `react-native-svg` reads `props.maskType || style?.maskType`, so the style spelling is the one that works on both. It must be `alpha`: the artwork's colours are already gone by then, and SVG's default luminance mask would make a dark export mask nothing at all.
- **A `source` is recoloured, not used as drawn.** It goes through `Image`'s `tintColor`, so only its alpha matters — a Figma export in any grey comes out in the app's own palette, correct in both schemes and after a rebrand, with nothing to re-export. Opacity in the file still counts, so a shape drawn at 50% comes out half-strength. `children` are drawn as given; `SKELETON_COLORS` is exported so they can use the same two tones.
- **The base is `backgroundElementSelected`, not `backgroundElement`**, for the reason `ProgressBar`'s track is: `backgroundElement` is what most raised surfaces already use, so a placeholder on a `Card` or in an open `Accordion` is the colour of what is behind it. The first version did exactly that and rendered invisible in the showcase. The highlight is `grabber`, the one neutral with the same value in both schemes — that makes it reliably _visible_ rather than reliably brighter (it reads as a lighter sweep in dark and a darker one in light). No token is brighter than the base in both, so visibility is the property worth pinning; a conventional always-brighter shine would need a palette entry of its own.
- **Reduce Motion stops it dead, with nothing substituted.** `ProgressBar` swaps its sweep for a cross-fade because there the movement carries information — "this is still going" — and something has to take that over. A skeleton's does not: the shapes already say the content hasn't arrived, so a placeholder that simply sits still is the whole answer rather than a lesser one, and the shimmer layer isn't rendered at all. `animated={false}` does the same thing by hand, for a screen where a dozen independent shimmers is worse than none.
- **It is hidden from assistive technology unless you name it.** A skeleton is a picture of content that hasn't arrived: nothing to read, nothing to act on, and usually the screen already says it is loading. Pass `label` when this _is_ the announcement, and it becomes a polite live region instead.
- **A `source` sizes itself from `style`, like `Image` does** — a file has no layout of its own to contribute, so give it the width and height (or a width and an `aspectRatio`) of the space it stands in for. `children` size the skeleton themselves.

---

[All components](../../../docs/components/index.md) · [Docs index](../../../docs/index.md)
