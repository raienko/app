[Docs](../../../docs/index.md) › [Components](../../../docs/components/index.md) › Layout & structure

# Accordion

> A titled section that collapses and expands.

<sub>`src/components/accordion` · [Stories](index.stories.tsx) · [Tests](index.test.tsx)</sub>

```tsx
import Accordion from "@/components/accordion";

<Accordion title="Section">
  <Text value="Only visible when expanded." />
</Accordion>;
<Accordion title="Section" defaultOpen>
  <Text value="Open by default." />
</Accordion>;
```

A titled, collapsible section — tapping the header toggles `children` between hidden and shown. The chevron on the right (via `Icon`) rotates 180° between collapsed/open with a Reanimated `withTiming`, rather than swapping between two separate icon assets, so there's only ever one glyph to keep in sync with state. `defaultOpen` (default `false`) controls the initial state. Content fades in while the section grows to fit it, and back out, on the same 220ms ease-out as the chevron. On native the growing is a Reanimated layout transition (`collapsible.tsx`) — no per-frame layout or measuring, and the sections below slide with it; on web, where Reanimated draws that transition as a scale, the clip's height animates towards the measured content instead (`collapsible.web.tsx`). Collapsed content is unmounted. Under Reduce Motion the change is instant. The Showcase wraps each demo section in one.

---

[All components](../../../docs/components/index.md) · [Docs index](../../../docs/index.md)
