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

A titled, collapsible section — tapping the header toggles `children` between hidden and shown. The chevron on the right (via `Icon`) rotates 180° between collapsed/open with a Reanimated `withTiming`, rather than swapping between two separate icon assets, so there's only ever one glyph to keep in sync with state. `defaultOpen` (default `false`) controls the initial state. Content itself shows/hides instantly via `If` (above), not height-animated — animating to/from an unmeasured "auto" height is the fiddly part of building an accordion, and not worth taking on until there's a real need for that extra polish. The Showcase wraps each demo section in one.

---

[All components](../../../docs/components/index.md) · [Docs index](../../../docs/index.md)
