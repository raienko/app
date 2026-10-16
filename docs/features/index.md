[Docs](../index.md) › Features

# Features

> App-wide systems that aren't a single component. Each guide lives in its folder, as `src/features/<name>/index.md`, and each feature is imported through that folder: `import { useTheme } from "@/features/theme"`.

## Foundations

The shared systems every component is built on. Change these and the whole app follows.

| Feature                                                                            | What it's for                                                                                                            |
| ---------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| [**Theme & colour**](../../src/features/theme/index.md)                            | The Graphite palette, semantic colour tokens, light/dark switching and the contrast rules the palette is tested against. |
| [**Responsive units, sizes & typography**](../../src/features/responsive/index.md) | Device scaling, breakpoints (phone, foldable, tablet, desktop), the spacing/radius/sizes styleguide and the type scale.  |
| [**Localization**](../../src/features/localization/index.md)                       | Locales, translations, RTL and number formatting.                                                                        |
| [**Accessibility**](../../src/features/accessibility/index.md)                     | OS accessibility flags, text scaling, reduced motion and the shared accessibility-prop helpers every component uses.     |

## App services

Capabilities the app uses behind the UI.

| Feature                                                  | What it's for                                                                                |
| -------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| [**Storage**](../../src/features/storage/index.md)       | `LocalValue<T>` for preferences and `SecureValue<T>` for small secrets.                      |
| [**Deep links**](../../src/features/deep-links/index.md) | One pipeline for every incoming link: parsing, matching, queueing and routing.               |
| [**Maps**](../../src/features/maps/index.md)             | Themed map style, tile config, the user's location, and directions via the platform map app. |
| [**Event bus**](../../src/features/event-bus/index.md)   | Typed, scoped publish/subscribe for decoupled parts of the app.                              |

## Not documented yet

No guide yet — the JSDoc in each `index.ts` is the reference until one is written:

[`logger`](../../src/features/logger), [`permissions`](../../src/features/permissions)
