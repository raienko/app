[Docs](../../../docs/index.md) › [Components](../../../docs/components/index.md) › Layout & structure

# Screen

> The page container: fills the viewport, paints the background, pads the content.

<sub>`src/components/screen` · [Stories](index.stories.tsx) · [Tests](index.test.tsx)</sub>

```tsx
<Screen>…</Screen>              // centred, fills the viewport
<Screen scrollable>…</Screen>   // scrolls, content starts at the top
```

The app's layout primitive: fills the viewport, applies `theme.colors.background`, and pads with `spacing.x16`. `scrollable` swaps the `View` for a `ScrollView` and drops the vertical centring — content that can outgrow the viewport has to start at the top, or the first screenful gets pushed off the top edge as it grows. The showcase uses it; a short screen shouldn't.

---

[All components](../../../docs/components/index.md) · [Docs index](../../../docs/index.md)
