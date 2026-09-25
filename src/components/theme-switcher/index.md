[Docs](../../../docs/index.md) › [Components](../../../docs/components/index.md) › Forms & input

# ThemeSwitcher

> Light, dark or system appearance, as three buttons.

<sub>`src/components/theme-switcher` · [Stories](index.stories.tsx) · [Tests](index.test.tsx)</sub>

```tsx
import ThemeSwitcher from "@/components/theme-switcher";

<ThemeSwitcher />;
```

- **No props.** It reads and writes `useTheme().preference`, which `ThemeProvider` persists, so the choice survives a restart.
- One `Button` per entry of `THEME_PREFERENCES`, labelled from the `theme.*` translation keys. The current preference is shown as `selected` (Graphite's tint and accent edge, not an inverted fill).
- Adding a preference is an entry in `THEME_PREFERENCES` plus its translation key.

---

[All components](../../../docs/components/index.md) · [Docs index](../../../docs/index.md)
