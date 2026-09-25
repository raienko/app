[Docs](../../../docs/index.md) › [Components](../../../docs/components/index.md) › Layout & structure

# Spacer

> An explicit gap from the spacing scale, where a parent's `gap` can't express it.

<sub>`src/components/spacer` · [Stories](index.stories.tsx) · [Tests](index.test.tsx)</sub>

```tsx
import Spacer from "@/components/spacer";

<Spacer />                                    // 16pt vertical (the default)
<Spacer size="x8" />                           // a step of the spacing scale, by name
<Spacer direction="horizontal" size="x24" />
<Spacer direction="both" size={10} />          // off-scale px, still unit-scaled
```

An explicit gap between two elements — the version of a margin you can see in the tree, for the places a parent's `gap` can't express: an uneven step inside an otherwise evenly-spaced stack, or a gap between two siblings that neither of them owns.

- **`direction`** (`"vertical" | "horizontal" | "both"`, default `"vertical"`) picks which axes the gap occupies. The unused axis is left **unset rather than zeroed**, so a vertical spacer dropped into a row container takes no width of its own instead of forcing a 0-sized box into the layout. A gap only separates anything along its parent's own main axis, which is what the showcase section makes visible by switching the stage between a row and a column.
- **`size`** takes a spacing-scale step _by name_ (`"x8"`, `"x16"`, …, exported as `SpacingToken` from `@/features/responsive`) so a step that isn't in the scale is a `tsc` error rather than a silent typo — the same guarantee a `spacing.x8` lookup already has. A raw px number is accepted for a gap the scale genuinely doesn't have, and goes through `units()` like every other size in the app. Defaults to `"x16"`.
- **Prefer the parent's `gap` when the spacing is uniform** — it says "these are evenly spaced" once instead of once per gap. The two compose rather than replace each other: a `Spacer` inside a `gap`'d container adds the container's gap on _both_ sides of it.
- **It is deliberately invisible to assistive technology.** A spacer carries nothing a screen-reader user could act on, so it spreads `disabledA11yProps()` (above) and is hidden on every platform at once. Two things make that structural rather than a convention: the props are spread **after** the caller's, so an override can't undo the one guarantee the component makes, and every prop that would give it something to say (`accessible`, `accessibilityLabel`, `role`, the hide flags themselves, …) is `Omit`ted from its props type, so passing one is a `tsc` error rather than something you'd find later with VoiceOver. Its test suite asserts this from both sides: with `includeHiddenElements` a query finds the node, and _without_ it — which is what a screen reader effectively does — the same query returns nothing.

---

[All components](../../../docs/components/index.md) · [Docs index](../../../docs/index.md)
