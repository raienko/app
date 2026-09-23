# core

An [Expo](https://expo.dev) (SDK 57) app using [Expo Router](https://docs.expo.dev/router/introduction) for navigation, [MMKV](https://github.com/mrousavy/react-native-mmkv) for local storage, and [Storybook](https://storybook.js.org) (on-device + web) for component development.

## Get started

1. Install dependencies

   ```bash
   yarn install
   ```

2. Set up environment variables

   ```bash
   cp .env.example .env
   ```

   `.env` is read by Expo CLI (via `@expo/env`) and used both by `app.config.ts` (app name/slug/scheme/bundle id) and by the app itself through [`src/constants/env`](src/constants/env/index.js). Only `EXPO_PUBLIC_*`-prefixed vars are available at runtime — Metro inlines them into the bundle at build time, so they must be referenced as a static `process.env.EXPO_PUBLIC_X`, never a dynamic key. See the comment in `src/constants/env/index.js` before adding new ones.

   **`EXPO_PUBLIC_BRAND_ICON_BACKGROUND` and `EXPO_PUBLIC_BRAND_SPLASH_BACKGROUND` must be quoted.** They are hex colours, and an unquoted `#` starts a comment in a `.env` file — so `KEY=#208AEF` reads as empty while the line sits there looking correct. The validator says so by name when it finds one missing, because the error is otherwise indistinguishable from having forgotten the variable entirely.

3. Start the app

   ```bash
   yarn web       # browser
   yarn ios       # iOS simulator, real dev client (see caveat below)
   yarn android   # Android emulator, real dev client
   ```

   `yarn start` also works and lets you choose a platform from the Metro CLI (`w`/`i`/`a`), but note it opens **Expo Go** by default, which cannot load native modules like `react-native-mmkv` — use `yarn ios`/`yarn android` (or `expo run:ios`/`expo run:android`) for a real dev-client build instead when you need native storage to work.

   > **iOS build caveat:** building the native dev client currently requires **Xcode 26.4+**. Expo SDK 57's `expo-modules-jsi` fails to compile on Xcode 26.0–26.3 due to a Swift 6.2 C++ interop strictness change ([expo/expo#46242](https://github.com/expo/expo/issues/46242)). Web and Android are unaffected.

## Project structure

```
app.config.ts          Expo config — reads name/slug/scheme/bundleId/brand colours from src/constants/env
metro.config.js         Wraps Metro with Storybook's entry-swap (see Storybook below)
src/
  app/                   Routing only (Expo Router) — each route file re-exports a screen
  root/                   Root — wraps the router; see below
  screens/<name>/        One folder per screen, index.tsx is the screen component
  screens/showcase/sections/ One file per showcase section — see "The app" below
  components/<name>/     One folder per component: index.tsx, index.stories.tsx, index.test.tsx
  features/storage/       LocalValue<T> — a small MMKV-backed reactive value primitive
  features/deep-links/    One pipeline for every incoming link — see below
  constants/env/          Validated EXPO_PUBLIC_* env vars, used by both app code and app.config.ts
assets/
  brand/                  App icon, adaptive icon, splash, favicon — everything that carries the app's identity
  images/                 What a screen draws, reached through `@/assets/images/...`
```

**The two colours the OS paints for us live in `.env`, not in the theme.** `brandIconBackground` (the plate an Android adaptive icon's foreground sits on) and `brandSplashBackground` (behind the launch image) are baked into the native projects at prebuild — the app is not running when they are on screen, so `theme/palette.json` is the wrong home for them and nothing in the app ever draws them. Each pairs with a file in `assets/brand`, so a rebrand is those files plus these two values. They are validated as 3- or 6-digit hex on load: eight-digit is refused outright, because `#RRGGBBAA` on the web and `#AARRGGBB` on Android would make the same string two different colours. A malformed one otherwise fails much later, in Gradle or Xcode, complaining about something else.

**`assets/brand` and `assets/images` are split by who reads them, not by file type.** Everything under `brand/` is read by Expo at config time and baked into the native projects; nothing there is imported by the app at runtime. Everything under `images/` goes through Metro and is `require()`d by a component. The practical payoff is that a rebrand is "replace the contents of `assets/brand`" rather than picking the branding files out of the ones that only look like branding. `app.config.ts` reaches them through a `brandAsset()` helper, so the directory name appears once — and a typo in a path Expo only reads at prebuild time otherwise surfaces as a missing icon on a build machine.

Every screen/component/feature-value lives in its own folder with a single `index` entry point; all imports go through that folder path (e.g. `@/components/text`), not into its internals. Components ship with a co-located Storybook story and a Jest smoke test that follows the same pattern:

```ts
import Component from "./index";

describe(`${Component.name} smoke test`, () => {
  /* ... */
});
```

### Component implementation types

Custom design-system components are always the default. When a component
also offers an `@expo/ui` implementation, it uses the shared
`ComponentTypeProps` from `src/components/types.ts`:

```tsx
<Checkbox value={accepted} onChange={setAccepted} />
<Checkbox type="expo" value={accepted} onChange={setAccepted} />
```

`type` accepts `"custom" | "expo"` and defaults to `"custom"`. Both paths
must expose the same public behavior — including the app-wide `value` /
`onChange` naming — so changing the implementation does not leak Expo UI's
internal API into application code.

## The app

The app itself is a **showcase**: one collapsible section per feature or component, so everything below can be seen running rather than only read about. Sections are ordered foundations-first — the styleguides and app-wide settings everything else is built on, then the components that consume them.

| Section           | What it demonstrates                                                                                    |
| ----------------- | ------------------------------------------------------------------------------------------------------- |
| Typography        | All 11 type-scale entries at their own size, with the title sizes as real headings                      |
| Markdown          | A rendered document taking the app's type scale and palette, with an editable source                    |
| Web view          | The bridge both ways, the app's typography inside a page, and the theme switchable live                 |
| Theme & colors    | `ThemeSwitcher`, the resolved scheme/preference, and a swatch per palette key                           |
| Localization      | `LocaleSwitcher`, a translated sentence, and the resolved locale/RTL state                              |
| Accessibility     | A live readout of every OS flag, `fontScale`, and `duration()`                                          |
| Responsive units  | Window size, breakpoint, `units(16)`, the spacing scale drawn to width, named sizes                     |
| Grid              | 12-column spans, per-breakpoint spans that reflow on resize, and a tile grid                            |
| Spacer            | A gap between two blocks, switchable across all three directions and the spacing scale                  |
| Divider           | Both orientations, a labelled rule, and the inset switchable against a list                             |
| Icons             | One glyph from each of the five families, the custom SVG set, colour and size overrides                 |
| Buttons           | The full type × size matrix, a real segmented control (so `selected` moves), and a disabled row         |
| Tags              | All three shapes, both sizes, the two-control tag, disabled, and truncation                             |
| Badges            | Every type, the count formatting and its zero case, the dot, and where a badge sits                     |
| Avatars           | The fallback stack, the sizes switchable live, the status dot, and awkward names                        |
| Stepper           | The limits disabling their own button, a fractional step, the sizes, and the typing alternative         |
| Skeleton          | A card and a list of rows from one file, the children form beside them, and the sweep switchable live   |
| Chart             | The three forms switchable live, the theme series palette, and the sentence it reads out                |
| Barcode           | A live-editable QR, the linear formats switchable, and an invalid value falling back                    |
| Timer             | A countdown with its ring, a stopwatch, the formats, and pause                                          |
| Progress          | A live determinate bar, custom value wording, and the indeterminate state                               |
| Segmented control | Both implementations side by side, a disabled option, and a disabled control                            |
| Header            | All three zones, uneven slots staying centred, a component in the middle, notch padding                 |
| Tab bar           | Both variants over a scrolling stage, with the reserved space switchable live                           |
| Inputs            | Text, textarea, numeric, email, password, code, phone, select and date/time variations                  |
| Form field        | A Slider and a Stepper framed like inputs, a required/optional hint, and an error that announces itself |
| Images            | A source that loads, one that's empty, one that fails, a custom fallback, and the cache controls        |
| Cards             | The three types, the case that tells them apart, a pressable card, edge-to-edge content                 |
| Section           | A settings group, an action beside a title, a form footer, and levels that count themselves             |
| List items        | Pressable rows with both slots filled, a row holding its own control, truncation                        |
| List              | 200 rows with a handful mounted, and the default renderer swapped for a custom one                      |
| Carousel          | Slides with pagination you can switch off live, and the position it announces                           |
| Pagination        | A paged list, the window and its gaps, the compact form, the dots, and the one-page case                |
| Media player      | Video and audio behind one transport, switchable live, with native controls as an escape hatch          |
| Image picker      | A pressable trigger and the static API — a camera/gallery sheet on native, the file dialog on web       |
| File picker       | A drop-zone trigger, the static API, and the `type="file"` field built on the same picker               |
| Modals            | All four types, opened by `id` _and_ by ref, with `onShow`/`onClose` shown live                         |
| Share             | The two icons, the text form, the copy fallback, and all four outcomes reported                         |
| Alerts            | Every type, a title with an action that updates its message, and one that can be dismissed              |
| Permissions       | Persisted camera, gallery and notification permission state and actions                                 |
| Deep links        | Dispatching a link by URL, the registered patterns, and a gate holding one back                         |
| Storage           | `Counter` (reactive `.useValue()`) beside imperative `.setValue()`/`.getValue()`/`.reset()`             |
| Logger            | Every logger method and structured metadata                                                             |
| Utilities         | `If` toggling content, `Match` cycling four states, and a scoped event bus emitting and counting pings  |

Each section is its own file under `src/screens/showcase/sections/`. They're screen-local — the showcase is their only consumer — but split for the same reason `Modal`'s internals are: one file per concern beats one large screen file. The section list itself is a table in `screens/showcase/index.tsx`, so adding one is an entry there plus a file.

Section titles are translated; the labels _inside_ sections mostly aren't, on purpose — token names, flag names, and icon family names are identifiers, not copy, and translating `sizes.elementHeightMd` would make it harder to match against the code it names.

### Local storage — `LocalValue`

```ts
import { LocalValue } from "@/features/storage";

const value = new LocalValue<T>("some-key");
value.getValue(); // read once
value.setValue(v); // write
value.reset(); // clear
value.useValue(); // reactive read inside a component — see note below
```

Backed by MMKV on **every** platform, web included. `react-native-mmkv` ships its own web implementation (`createMMKV.web.ts`, storing into `localStorage` under keys namespaced by the store's `id`), so platform resolution swaps it in and there's a single adapter with nothing to branch on.

**The one web-specific case — `isStoragePersistent()`.** When a browser refuses `localStorage` (private browsing, blocked site data, an enterprise policy), MMKV doesn't fail — it quietly substitutes an in-memory `Map`. Writes look like they worked and vanish on the next reload, which is exactly the data loss [MMKV's docs warn about](https://github.com/mrousavy/react-native-mmkv). MMKV doesn't expose which of the two is in play, so `features/storage/persistence.web.ts` asks directly and the app can tell the user rather than losing their data silently. Native always answers `true` — MMKV writes a real file there, and no user setting turns that off.

- It **writes** a probe key rather than just reading `window.localStorage`, because the two aren't equivalent: Safari's private mode has historically exposed a perfectly normal-looking `localStorage` whose quota is zero, so it only throws once something is actually stored. Only a round-trip matches what a real write will do — and the probe cleans up after itself.
- The answer is cached for the page's lifetime (the probe hits synchronous storage, and a component rendering a warning would otherwise pay for it every render) — **except** the server-prerender answer. Expo's static web export renders once with no `window`, where nothing persists; caching `false` from that pass would poison the browser that loads the result.
- The showcase's Storage section reads it live, and switches its explanatory line to a warning in `theme.colors.error` when storage isn't persistent.
- Covered by `persistence.test.ts` across all four states: a working round-trip, a write that throws despite the API existing, access denied outright, and the prerender pass.

> **Migration note:** MMKV namespaces web keys as `local-storage\<key>`. An app that previously stored bare `localStorage` keys won't see that old data — irrelevant for a fresh project, but a real migration step for anything already deployed.

### Theme — `src/features/theme`

```tsx
import { useTheme } from "@/features/theme";

const theme = useTheme(); // { scheme, colors, preference, setPreference }
```

- `scheme` — the resolved `"light" | "dark"` actually in effect.
- `preference` — what the user picked: `"light" | "dark" | "system"` (default `"system"`), persisted via `LocalValue` so it survives restarts. `setPreference` updates it.
- When `preference` is `"system"`, `scheme` tracks the OS setting live via React Native's `useColorScheme()` — no reload needed, verified by flipping the emulated OS scheme at runtime.
- `colors` — the current semantic palette (`ThemeColors`: content/surface, selection, border/divider/disabled, status, overlay/focus, and primary/accent tokens), sourced from [`palette.json`](src/features/theme/palette.json). Swap that file for a rebrand/different palette without touching any other file — `colors.ts` validates both `light` and `dark` have every required key and throws a clear error naming the missing one otherwise. (It's `palette.json`, not `colors.json` — Metro and Vite disagree on `.ts` vs `.json` priority for a bare `./colors` specifier, so a same-basename pair resolves to the wrong file depending on which bundler is running; keep the JSON's basename different from `colors.ts`.)

- **The palette is the Graphite kit** — the softened variant of the "Grid" direction: tinted charcoal and warm off-white instead of pure black and white, one blue hue, square corners, hairline rules. Picked from the [UI kit directions canvas](https://claude.ai/artifact/DDBHSjjLv3fGhfEH81GjhT).
- **`primary`/`onPrimary` are a fill pair; `accent` is the same hue as a foreground.** `primary` is the high-emphasis _fill_ (`Button`'s `primary`, a checked box, an on switch) and `onPrimary` the only color guaranteed legible on it. `accent` is that hue as text or an indicator on the app's own surfaces — a `tertiary` label, a link, the bar under a selected segment. They are separate because one value can't do both in the dark scheme: a fill dark enough to carry white text reads under 4.5:1 as text on a dark page, and a label light enough to read turns into a glaring block as a fill. A rebrand moves all three together.
- **Selection is a tint, never an inverted block.** `selected` is the accent-tinted fill behind whatever is currently chosen (a segment, an option row, a tag), always paired with an `accent` edge or label so the choice isn't carried by the tint alone. `divider` is the quiet hairline between rows and sections — deliberately under `border`, which stays the 3:1 control boundary.
- **Every pressable answers a press.** `pressed` is a translucent overlay laid over whatever an unfilled control shows (a secondary/tertiary/icon button, an option row, an accordion header), so one value shades every surface by the same step; `primaryPressed` is the solid shade a `primary` fill switches to, chosen so `onPrimary` stays above 4.5:1 while held (the contrast test checks it).
- **[`colors.test.ts`](src/features/theme/colors.test.ts) enforces WCAG contrast on the palette itself**, so a palette edit can't quietly ship an unreadable combination: every foreground (`text`, `accent`, `error`) clears 4.5:1 against both surfaces the app paints text on (`text` and `accent` against the `selected` tint too), a `primary` fill clears 3:1 against them, `onPrimary` clears it against a `primary` fill, and `textSecondary` clears the 3:1 that WCAG 1.4.11 asks of a control outline against all three fills. It reimplements the luminance math rather than importing it — the point is to check the palette independently. Two real failures were found this way and fixed rather than waived: the accent was 4.17:1 as a label on `backgroundElement` (the Accordion/Modal surface `tertiary` buttons actually sit on), and `error` was 3.90:1 on the same surface. `backgroundElementSelected` is deliberately excluded from the _text_ checks — it's a pressed/selected fill, and the only type that uses it labels itself in `text`; holding every foreground to 4.5:1 against it as well would force the accent several steps paler than any surface in the app needs.

`ThemeProvider` and a `ThemeSwitcher` component (`src/components/theme-switcher`, wired into the Showcase screen) are both included; `Text`, `Screen`, and `Icon` (default `color`) already consume `theme.colors`.

### Localization — `src/features/localization`

```tsx
import { useLocale } from "@/features/localization";

const { locale, isRTL, preference, setPreference, t } = useLocale();

t("common.close"); // "Close" / "Cerrar" / "关闭" / ... depending on locale
t("showcase.summary", { name: "Ada", age: 30, email: "a@b.c" }); // {{token}} interpolation
```

Ten locales ship out of the box — `en` (English), `uk` (Ukrainian), `es` (Spanish), `fr` (French), `pt` (Portuguese), `de` (German), `it` (Italian), `zh` (Chinese), `ja` (Japanese), `ar` (Arabic, the only RTL one) — plus a `"system"` preference (default) that follows the device's own language list via [`expo-localization`](https://docs.expo.dev/versions/v57.0.0/sdk/localization/), falling back to `en` if none of its languages are supported. Same shape as `ThemeProvider`/`useTheme()` end to end: `LocalePreference = LocaleCode | "system"`, persisted via `LocalValue` (`"locale-preference"`), `LocaleProvider` added to `Providers` alongside `ThemeProvider`. A manual choice outranks the OS from then on — see the OS-tracking bullet below.

```
src/features/localization/
  translations/          One flat JSON file per locale (en/uk/es/zh/ja/ar.json)
  translations.ts         Validates every locale against en.json + the `t()` lookup/interpolation
  types.ts                 LocaleCode/LocalePreference/Locale types, the LOCALES metadata table
  rtl.ts                    syncRTL() — the one platform-specific piece, see below
  os-locale.ts               useOsLocale() — tracks + persists the device language
  locale-provider.tsx         LocaleProvider — resolves locale, persists preference, calls syncRTL()
  hooks.ts                     useLocale()/useIsRtl() — both read from context.ts
  context.ts, index.ts
```

- **`en.json` is the source of truth for which keys must exist** — every other locale file is validated against its flattened key set on module load (missing _or_ extra keys throw a clear error naming them), the same fail-fast idea as `theme/colors.ts`'s palette validation. `TranslationKey` is a template-literal type derived from `en.json`'s actual shape (`Flatten<typeof en>`, producing dotted paths like `"input.email.error"`), the same "derive the type from the real data instead of hand-typing it" approach `Icon` uses for glyph names — passing a key that doesn't exist in `en.json` is a `tsc` error, not a runtime "Missing translation" surprise (though `translate()` also throws that at runtime, for the one case type-checking can't catch: a key that exists in `en.json` but was typo'd in a non-`en` locale file, which the cross-validation above already catches at import time instead).
- **`{{token}}` interpolation** is a single `String.prototype.replace` in `translate()` — deliberately not a full ICU/plural-rules engine, since nothing in this app's copy needs pluralization yet; `t("showcase.summary", { name, age, email })` is the one interpolated string used by the Showcase.
- **`LOCALES`** (`types.ts`) is the hand-authored display-name table — `code`, `englishName`, `nativeName` (what `LocaleSwitcher` actually renders — a language's own name for itself, not translated through `t()`), and `rtl`. Cross-checked on load against `Object.keys(translations)` so a locale can't have one without the other (a JSON file with no `LOCALES` entry, or vice versa) without an immediate, clear error.
- **Adding a locale is four edits and no more**, each of which fails loudly if you miss it: a JSON file under `translations/` (validated key-for-key against `en.json` on load, so a missing or extra string throws at startup rather than rendering a raw key), the code in `LocaleCode`, an entry in `LOCALES`, and — because the date field renders through moment rather than `Intl` — a side-effect import plus a `MOMENT_LOCALE` entry in `components/input/datetime/format.ts`. That last map is typed `Record<LocaleCode, string>`, so `tsc` catches a locale that was added everywhere else and would have silently formatted its dates in English.
- **`LocaleSwitcher`** (`src/components/locale-switcher`, wired into the Showcase's Localization section) renders one button per `LOCALE_PREFERENCES` entry (every locale's `nativeName`, plus `t("locale.system")`), same selected/`onPress` pattern as `ThemeSwitcher`.

**RTL** is the one place native and web genuinely can't share a code path, and `rtl.ts`'s `syncRTL()` is deliberately small so that split is easy to see:

- **Web**: sets `document.documentElement.dir` directly. CSS flexbox mirrors `flexDirection: "row"` off the element's own computed `direction` natively — no `I18nManager` involvement needed at all — so this alone re-mirrors every row layout (headers, button rows, `Input`'s `leftSlot`/`rightSlot`) live, with no reload. Verified live: switching to Arabic instantly mirrors the Showcase screen — title, every accordion header/chevron, every button row, and `Input`'s icon slots all flip from the left to the right side, text right-aligns, all without a reload.
- **Native**: `I18nManager.forceRTL()` changes how Yoga mirrors layout app-wide, but only takes effect after a fresh bundle load — so `syncRTL` calls `DevSettings.reload()` after forcing it, guarded to only do so when `I18nManager.isRTL` doesn't already match (`DevSettings.reload()` works in a dev client, which is what this project's `yarn ios`/`yarn android` build; a store-shipped production build would need `expo-updates`' `Updates.reloadAsync()` for the same effect instead — out of scope for this starter app, same "deferred" reasoning as the Modal/`react-native-gesture-handler` Jest-utils note below).
- **These two branches can't be merged into one guard.** `I18nManager.isRTL` reads as `undefined` on web — RN core's `I18nManager.js` snapshots `NativeI18nManager.getConstants()` once at module load, and no such native module is registered on web — so `undefined === false` is `false` on every single render, and reusing the native guard on web calls `syncRTL` → mismatch → (if it also reloaded on web) reload → same mismatch again, forever. This was a real bug caught while verifying this feature live: the first implementation used one shared reload-based guard for both platforms, and the dev server's terminal log showed a tight loop of full bundle rebuilds (`Web Bundled .../entry.js`, repeating every ~150ms) instead of the app ever settling — the fix was recognizing that web doesn't need (or support) the reload-based approach at all, not tuning the guard condition.
- `expo-localization` is a native module — installed via `npx expo install` (keeps it Expo-SDK-compatible) and pinned exact like every other dependency, registered in `app.config.ts`'s `plugins`. Like the vector-icon font families, adding it requires an `expo run:ios`/`expo run:android` rebuild of the dev client before it works on device/simulator — a `yarn ios`/`yarn android` (or Metro reload alone) against an _already-built_ older dev client throws `Cannot find native module 'ExpoLocalization'` instead, same class of caveat as this README's Xcode-version note above.
- **The OS language seeds the app; a manual choice outranks it.** `os-locale.ts`'s `useOsLocale()` tracks the device language _live_ — through `expo-localization`'s `useLocales()` hook, which re-renders on an OS language change, not the one-shot `getLocales()` that shipped first — narrows it to a locale this app actually ships (walking the device's full ordered preference list, so an unsupported first language still yields a supported second before falling back to `en`), and persists it under `"os-locale"`. Resolution order in `LocaleProvider` is then: the user's stored preference if they picked one, otherwise the OS locale. So a first launch comes up in the device language, and the moment someone chooses a language in `LocaleSwitcher` that choice sticks — a later OS language change will not override it. Picking "System" again hands control back to the OS. Covered end-to-end in `locale-provider.test.tsx`, including the relaunch case (a fresh mount with a changed OS language still honours the stored manual choice).
  - The persisted copy deliberately isn't what `useOsLocale()` returns — the live value is always at least as correct, and returning it directly avoids a first-render gap on a genuinely first launch when nothing is stored yet. What storage buys is a record that outlives the process, readable synchronously before React mounts via `getStoredOsLocale()`.
- **`useIsRtl()`** exposes `Locale.isRTL` on its own — a thin wrapper around `useLocale()` for callers that only need the RTL flag, not the rest (`t`, `preference`, `setPreference`, ...). It's what `createStyles` (see Responsive units below) builds its own `isRTL` on, specifically because it's derived straight from `LOCALES`' `rtl` table rather than from `I18nManager.isRTL` — it changes the instant the locale does, on every platform, with no reload to wait on. That makes it useful for more than just reacting to native's reload: styles that manually mirror off `isRTL` (`flexDirection: isRTL ? "row-reverse" : "row"`, swapped `marginLeft`/`marginRight`, ...) work correctly even in environments where automatic mirroring doesn't apply at all, like Yoga on native inside the split-second before `syncRTL`'s reload lands, or a future non-flexbox layout that wouldn't auto-mirror from `dir`/`I18nManager` either way.

### Accessibility — `src/features/accessibility`

```tsx
import {
  useAccessibility,
  useAnimationDuration,
  controlA11yProps,
  fieldA11yProps,
} from "@/features/accessibility";

const { isScreenReaderEnabled, isLargeTextEnabled, fontScale } =
  useAccessibility();

const duration = useAnimationDuration();
progress.value = withTiming(1, { duration: duration(250) }); // 0 under Reduce Motion

<Pressable {...controlA11yProps({ disabled, selected })}>…</Pressable>;
<TextInput {...fieldA11yProps({ label, disabled, error })} />;
```

Two halves: **reading** what the user has turned on at the OS level, and **writing** correct accessibility props onto components without each one re-deriving them.

- **`AccessibilityProvider`** (in `Providers`, alongside `ThemeProvider`) reads every flag once on mount and then keeps them live through `AccessibilityInfo`'s change events — same "resolve once, then track the OS" shape `ThemeProvider` has for colour scheme, so toggling VoiceOver or Reduce Motion in Settings lands without an app restart. Which flags exist is a table in `settings.ts` (`isScreenReaderEnabled`, `isReduceMotionEnabled`, `isBoldTextEnabled`, `isReduceTransparencyEnabled`, `isInvertColorsEnabled`, `isGrayscaleEnabled`), so adding one is a single entry. Several are iOS-only — each query is wrapped so an unsupported platform resolves `false` rather than failing the whole batch, since "the user has not turned this on" is the right answer for a setting the OS doesn't have.
- **`duration(ms)` centralizes Reduce Motion.** It returns `0` when the flag is on and `ms` otherwise, so an animated component asks for its duration and gets the accessible answer without having to know the flag exists — or remember that it should. `Modal` (enter, exit, and the drag handle's snap-back) and `Accordion` (chevron rotation) all go through it. The exit animation's completion callback still fires at duration `0`, so Modal's delayed-unmount handshake with RN's `visible` prop works identically either way.
- **Increased text sizes are handled in the type scale, not per component.** `fontScale` (the OS text-size multiplier) comes from `useWindowDimensions()`, which RN already re-renders on. `createTypography` multiplies **`lineHeight`** by it and deliberately leaves `fontSize` alone: RN scales a `<Text>`'s own font size by the OS setting already (`allowFontScaling`), so scaling it here too would double-apply, while `lineHeight` is _not_ scaled by RN — which is what makes a fixed line box clip growing glyphs at large Dynamic Type settings. `isLargeTextEnabled` (`fontScale > 1`) is there for layout that needs to react more drastically than reflowing.
- **`controlA11yProps()` / `fieldA11yProps()` are the write half.** A bare `Pressable` has no role of its own, so a component that forgets `accessibilityRole` announces as an anonymous group — which is exactly what `Button` shipped as, leaving every button in the app (modal triggers, Close, the theme and locale switchers, Counter's controls) unannounced while `Accordion` happened to get it right. Routing that through one helper makes it structural rather than per-component discipline. Only the state keys actually passed are emitted, so a plain button reports no `selected`/`expanded` at all instead of reporting them as `false` and having a screen reader announce a selection state that doesn't exist.
- **Both `accessibilityState` and `aria-*` are emitted, on purpose.** `accessibilityState` is what native reads and what testing-library asserts against; react-native-web 0.21 renders only the `aria-*` form. State set through `accessibilityState` alone therefore reaches native correctly and produces _nothing_ in the DOM — a gap the Jest suite can't see, since RNTL reads the React prop rather than the rendered output. Caught by inspecting a real rendered button (`role=button` present, `aria-selected` absent) and now covered by a test that asserts the `aria-*` mirror specifically. The Showcase exercises these states across its interactive sections.
- **`headingA11yProps(level)`** marks text as a heading so screen-reader users can navigate by structure (VoiceOver's rotor, TalkBack's heading navigation) instead of reading top to bottom. It emits three spellings because no single one covers both platforms: `accessibilityRole="header"` for native, `role="heading"` for react-native-web (which turns it into a real `<h1>`–`<h6>` element), and `aria-level` to pick which one. That last prop isn't in RN's typings at all, and omitting it doesn't degrade gracefully — react-native-web falls back to `<h1>` for _every_ heading, flattening the outline the role exists to convey. `Text` applies this automatically; see below.
- **`fieldA11yProps()`** carries a field's `error` as its `accessibilityHint`, which VoiceOver/TalkBack read after the label. RN has no "invalid" accessibility state to set — that's an ARIA concept with no React Native equivalent (`accessibilityInvalid` type-checks only because a spread suppresses excess-property checking, and does nothing at runtime) — so a hint is the portable way to announce _why_ a field is wrong instead of leaving the red border as the only signal.
- **`disabledA11yProps()`** is the opposite instruction: hide this from assistive technology entirely. It takes four spellings to say once — `accessible: false` so it never becomes an element, `accessibilityElementsHidden` (iOS) and `importantForAccessibility="no-hide-descendants"` (Android) to hide it _and its descendants_, and `aria-hidden` for the DOM react-native-web renders — and setting only some of them leaves the node announced on whichever platforms the rest covered. It's for things that exist only visually and have nothing to say: `Spacer` (below), a decorative rule, an icon beside a label that already names it. Without it a purely presentational node is still a stop a screen-reader user has to swipe past, announced as an empty element.
- **`imageA11yProps({ label })`** names an image. An image is the one control-shaped thing with no text of its own to derive a name from, and `expo-image` defaults `accessible` to `false` — so an image left alone isn't an accessibility element on iOS or Android at all, and an undescribed one is announced as something a screen-reader user can neither read nor knowingly skip. It sets `accessible: true` alongside the usual two role spellings (`accessibilityRole="image"` for native, `role="img"` for react-native-web). `Image` (below) pairs it with `expo-image`'s own `alt`, which is what becomes the DOM `alt` attribute.
- **`radioGroupA11yProps({ label })`** names the container around a set of mutually exclusive options — a `SegmentedControl`, a radio list. Without it each option announces alone with nothing saying what the choice _is_: a screen reader reads "Day, selected, radio button" and never mentions it's the view mode. The role also tells assistive technology the options belong together, which is what makes position announcements and group navigation work. Pair it with `radioA11yProps()` on each option.
- **`progressA11yProps({ label, value, valueText })`** reports how far along something is. Its range is 0–100, not 0–1, because that is what both platforms read out as a percentage — a `now` of `0.42` is announced as "0.42", not "42%". Omitting `value` is meaningful rather than lazy: ARIA reads a missing `aria-valuenow` as "the total isn't known", so an indeterminate bar reports no figure and sets `busy` instead, which is a different claim from a bar sitting at 0%.

### Responsive units — `src/features/responsive`

```tsx
import { useBreakpoint, useUnits } from "@/features/responsive";

const units = useUnits();
const breakpoint = useBreakpoint(); // "phone" | "foldable" | "tablet" | "desktop"

<View style={{ padding: units(12) }} />; // 12 in Figma is units(12)
```

- `useUnits()` scales a Figma px value for the current device: near-1:1 on a base-width phone (375px, configurable in `config.ts`), scaling up moderately (not linearly — see `SCALE_MODERATION`) and clamped (`MIN_SCALE`/`MAX_SCALE`) so values don't blow up on tablet/desktop.
- Reactive via `useWindowDimensions()` — updates live on rotation, a foldable unfolding, or a browser/desktop resize, verified by resizing the emulated viewport at runtime without navigating away (375 → 768 → 1280 → 2560px; `units(12)` went 12 → 18 → 19 → 19px, confirming both the moderated scale-up and the clamp holding at very wide desktop sizes).
- Scales off `Math.min(width, height)` — the shorter edge — not raw width, so rotating a device doesn't change its values: a phone isn't physically bigger sideways. Verified live: `375×812` portrait and `812×375` landscape both give `units(12) = 12px`; a genuinely bigger screen (`1200×800`) correctly gives `19px`.
- Memoized on the _derived scale factor_, not the raw width/height — two sizes that clamp to the same scale (e.g. 1280px and 2560px both hit `MAX_SCALE`) produce the same `units` function reference, so a `useMemo`/`createStyles()` depending on it won't recompute for a resize that wouldn't change any actual output value.
- Because it's reactive, a `units()`-based style can't live in a module-scope `StyleSheet.create` (that only runs once). Compute those inside the component instead, e.g. `useMemo(() => StyleSheet.create({ padding: units(12) }), [units])`.
- `useBreakpoint()` classifies the current width into `"phone" | "foldable" | "tablet" | "desktop"` — thresholds in `config.ts` (768 deliberately reads as `"tablet"`, matching the common iPad-portrait/`md` breakpoint, not `"foldable"`).

**Everything window-derived comes from one read — `useResponsive()`.** It returns `units`, `breakpoint`, the sizes styleguide (`spacing`/`radius`/`sizes`), and `typography` from a **single** `useWindowDimensions()` call, and it's what `createStyles` uses internally.

That single read is the point. Each styleguide used to own its own `useUnits()`, so one `createStyles` component subscribed to dimension changes four times over (units, breakpoint, sizes, typography) — multiplied by every styled component on screen. The pure `createUnits`/`getBreakpoint`/`createSizes`/`createTypography` builders exist precisely so this composition is possible; the hooks are thin wrappers over them. Verified by counting real `Dimensions` subscriptions while rendering 1, 3, and 6 styled components: 2, 4, and 7 — i.e. exactly **one per component** (plus one app-wide for `AccessibilityProvider`), down from four each.

`useSizes()` and `useTypography()` remain for the cases a static style factory can't cover — a size needed outside a style object entirely (an `Icon`'s `size` prop) or a type-scale entry chosen by a prop at render time (`Text`'s `type`).

**Using units outside a component.** There's also a plain, non-hook `unitsSnapshot(value)`, for module scope, utility functions, or anywhere a hook isn't available:

```ts
import { unitsSnapshot } from "@/features/responsive";

const styles = StyleSheet.create({ padding: unitsSnapshot(16) }); // module scope, no hook
```

It reads `Dimensions.get("window")` imperatively at call time rather than subscribing via `useWindowDimensions()`, so it's a **snapshot, not reactive** — verified directly: called at a 900px width it correctly returned `unitsSnapshot(16) = 26`, but after resizing to 375px _without reloading_, that same module-scope value stayed frozen at `26` (it's only ever recomputed if the surrounding code re-runs, which module-scope code doesn't). Use `useUnits()` inside a component whenever the value needs to track live resizes.

It's named `unitsSnapshot`, not `units`, on purpose, and `eslint.config.js` bans importing it from anywhere under `src/components/`, `src/screens/`, or `src/root/` — verified directly (a scratch file importing it there fails lint; the same import from `src/features/` passes). Inside a component "units" should only ever mean the reactive value from `useUnits()`; reaching for the snapshot there is a lint error now, not a silent stale-value bug.

**Defining a style sheet outside the component, reactively.** `createStyles()` turns a factory into a hook — the factory is a plain function you write next to (or below) the component, and calling the hook it returns gives you fully reactive styles inside the component:

```tsx
import { Text } from "react-native";
import { createStyles } from "@/features/responsive";

function Component() {
  const styles = useStyles();
  return <Text style={styles.text} />;
}

const useStyles = createStyles(
  ({ units, breakpoint, isRTL, spacing, radius, sizes }) => ({
    text: { fontSize: units(14) },
  }),
);
```

The factory receives the same reactive `units`/`breakpoint` as the hooks, plus `isRTL` (see `useIsRtl()` in the Localization section below) and `spacing`/`radius`/`sizes` (see the sizes styleguide just below), and returns a plain style object — `createStyles` runs it through `StyleSheet.create()` itself, so call sites return the object directly and don't need their own `"react-native"` import just for that. The result is memoized (only recomputed when one of these actually changes). `Button` and `Screen` both use this. Verified live: resizing 375px → 768px without reloading grew both `Screen`'s padding and `Button`'s size in the same frame, exactly as before this refactor.

`isRTL` here is deliberately the locale-derived flag, not `I18nManager.isRTL` — see the Localization section's RTL note for why `I18nManager.isRTL` can't be used for this at all (it's a snapshot that never updates without a reload). Because `useIsRtl()` flips the instant the locale does, a style built directly off it (e.g. `flexDirection: isRTL ? "row-reverse" : "row"`) can mirror manually without waiting on the reload that native RTL otherwise requires.

- `createUnits(width)` / `getBreakpoint(width)` are the underlying pure functions (what the hooks call after reading `useWindowDimensions()`) — used directly in `units.test.ts`/`breakpoint.test.ts`, no component rendering needed.

**Sizes styleguide — `spacing`/`radius`/`sizes`** (`sizes.ts`, via `useSizes()`). Two different things that both answer "don't hardcode the same size in two places" — and both come out already scaled, no `units()` wrapping needed at the call site:

```tsx
import { createStyles } from "@/features/responsive";

const useStyles = createStyles(({ units, spacing, radius, sizes }) => ({
  row: { gap: spacing.x8, padding: spacing.x12 },
  card: { borderRadius: radius.surface },
  field: { minHeight: sizes.elementHeightMd },
}));
```

- **`spacing` is a generic scale**, keyed `x<value>` (`spacing.x8`, not `spacing.sm` or `spacing[8]`) — a numeric-value key says exactly what step you're getting without a name to look up first, and `spacing.x10` (not a step in the scale) is a `tsc` error instead of a silently-accepted typo; the `x` prefix exists only because a bare number can't be a dot-accessible property name. The underlying steps match the distinct values already in real use across the component set when this was written (same "derive from what's actually there" reasoning as `THEME_PREFERENCES` deriving from `Object.keys(colors)` rather than being hand-typed). Every `createStyles` call site in the app now reaches for one of these wherever its value matches a step, instead of a bare number — adopting them was a like-for-like swap with zero visual change (verified: full test suite and a live before/after screenshot both came back identical). Not only for `gap`/`padding`, either: `Accordion`'s chevron and the Showcase screen's header icon both pass `size={spacing.x20}` to `Icon`, reusing the same step `Screen`'s padding already uses, rather than a separate icon-size scale.
- **`radius` is by role, not by value — and every corner goes through it, even a zero one.** `radius.control` (buttons, fields, segmented controls, tags, checkboxes, switches), `radius.surface` (cards, modals, toasts, media, code blocks, avatars), `radius.indicator` (badges, dots, progress tracks, swatches) and `radius.full` (a true circle or capsule: radio buttons, the sheet grabber). The Graphite kit is square, so the first three are `0`; rounding the app later is an edit to `RAW_RADIUS` in `sizes.ts` and nothing else. A component that omitted `borderRadius` instead couldn't be rounded from there, which is why a zero corner still names its token.
- **`sizes` is purpose-specific, not generic — but named by _purpose_, not by whichever component happens to use it first.** Where `spacing.x16` means nothing beyond "16px", each entry means exactly one thing: `elementHeightSm`/`elementHeightMd`/`elementHeightLg` (32/44/56 — the compact, standard and prominent control heights, shared by `Input`'s minimum touch target and `Button`'s three fixed sizes; `elementHeightMd` is the 44pt minimum, named for the concept rather than for Input, which is why `Button` sizing itself to match is reusing a touch-target height rather than borrowing Input's own measurement), `elementWidthSm`/`elementWidthLg` (currently Accordion's fixed width and Modal's content `maxWidth` — two components that happened to need two different tiers of "how wide should a self-contained element be" first, not two unrelated measurements). `grabberWidth`/`grabberHeight` (Modal's drag handle) stay specifically named, though — they're genuinely that one element's own pill dimensions, not a reusable concept, and genericizing the name wouldn't make the measurement itself any more general.
- **None of the three raw tables is exported** — every consumer goes through the scaled `spacing`/`radius`/`sizes` from `useSizes()` or `createStyles`. Handing out a raw table would let a call site use an unscaled value by accident, silently skipping the device scaling every other size in the app gets. (`NAMED_SIZES` used to be exported with exactly that hazard, unused by anything, while the two tables beside it were deliberately kept private — the inconsistency is now closed.)
- **`createStyles` hands the whole styleguide to its factory**, which is how most call sites get it. A component needs `useSizes()` directly only for a size used outside a style object entirely — `Accordion` and the Showcase screen both do exactly that (the `Icon` `size` prop above).
- **What's deliberately excluded from both groups**: a measurement that doesn't represent a reusable step or a reusable named purpose — a hairline `borderWidth`, `Counter`'s button `minWidth` tuned to that component's own two buttons — stays a plain number owned by its component, still passed through `units()` at the call site same as always. Nothing was rounded or forced to fit either group just to reuse it; `sizes.ts`'s own doc comments say the same for each: pull a value in once it has a genuine second use or a clear standalone purpose, not before.

**Typography styleguide — `typography`** (`typography.ts`, via `useTypography()`). Apple's [Human Interface Guidelines type scale](https://developer.apple.com/design/human-interface-guidelines/typography) for iOS/iPadOS — the same 11 named text styles Apple's own apps use (at the default "Large" Dynamic Type size, before a user changes their text-size setting), reactive and already scaled through `units()` exactly like `spacing`/`radius`/`sizes`:

```tsx
import { createStyles } from "@/features/responsive";

const useStyles = createStyles(({ typography }) => ({
  title: typography.headline,
}));
```

- **Eleven tokens** — `largeTitle`, `title1`, `title2`, `title3`, `headline`, `body`, `callout`, `subheadline`, `footnote`, `caption1`, `caption2` — each a full `{ fontFamily, fontSize, fontWeight, lineHeight, letterSpacing }`, not just a size. Point sizes and line heights are Apple's own published values for this exact scale, used as-is (same "real numbers, not invented" reasoning as `spacing`/`radius`'s steps), and so is the tracking below the titles — `headline` is Semibold (`600`) per HIG, so it reads as distinct from `body` despite sharing its 17pt size. The four title steps (`largeTitle`–`title3`) are the one deliberate departure: the Graphite kit sets them Semibold with tight negative tracking, the dense grid-set look the rest of the kit is built around.
- **`fontFamily` is set per style, not once for the whole scale** — every entry in `typography.ts`'s `RAW_TYPOGRAPHY` names its own `fontFamily` (all eleven currently point at the same `SYSTEM_FONT_FAMILY` constant, since San Francisco is what HIG itself specifies this scale in), so a future style that genuinely needs a different face — a monospace `caption2` for code, a distinct display face for `largeTitle` — is a one-line change to that entry, not a structural change to how typography works. `SYSTEM_FONT_FAMILY` itself resolves per platform: `"System"` on iOS (RN's special-cased value for San Francisco, so no font bundling needed), Android's own default system font (no San Francisco equivalent there), and the standard Apple-first web system-font stack (resolves to San Francisco on macOS/iOS Safari, a sane native fallback elsewhere).
- **`Text` (`src/components/text`) takes a `type` prop** — `<Text type="headline" value="..." />` — defaulting to `"body"`. It's the one component that reads the scale directly (via `useTypography()`) rather than through `createStyles`, because its variant is chosen by a _prop_ at render time and a static style factory can't express that. An earlier version worked around it by spreading all eleven tokens into the component's own `StyleSheet.create` (`...typography`), so every `<Text>` instance allocated twelve style objects to use exactly one; reading `typography[type]` costs one.
- **Take a whole token, not just its `fontSize`.** Overriding only the size on top of another token leaves the rest of that token behind — which was a real bug in `Input`: its label and helper text set `fontSize` over a `<Text>` that had already received `body`, so an 11px label rendered inside `body`'s 19px line box (and a 10px helper inside the same), 73–90% leading overhead, measurably loose. They're now `<Text type="footnote">` and `<Text type="caption1">`, whose point sizes happened to match exactly what the overrides were reaching for; the field's own `RNTextInput` host takes `typography.callout` as a style, since it isn't our `Text` and has no `type` prop. Measured after the fix: label `11px/16px`, helper `10px/14px`.
- **Line heights scale with the OS text-size setting.** `createTypography` multiplies `lineHeight` by `fontScale` and deliberately leaves `fontSize` alone — see the Accessibility section above for why that split is the correct one. `Text` undoes the `lineHeight` half when a caller passes `allowFontScaling={false}`, since opting out of RN's automatic `fontSize` scaling would otherwise leave the glyphs fixed while their line box kept growing.
- **The type scale carries heading semantics, not just sizes — and `type` is the only input.** `Text` derives `accessibilityRole="header"` (and a real `<h1>`–`<h4>` on web) straight from `type`: `largeTitle` → level 1, `title1`/`title2`/`title3` → 2/3/4. There's deliberately no separate `heading` prop: the type scale already _is_ the hierarchy, so picking `title2` because something is a sub-section and then separately declaring it a heading states the same fact twice, with the option of contradicting yourself. `headline` is excluded from the mapping — HIG uses it for list-row titles at body size, which are emphasis rather than document structure, and marking those as headings fills a screen reader's heading rotor with entries that aren't navigation landmarks.
  - The tradeoff is that a title size can't currently be used as pure decoration (a large stat, say) without also entering the outline. No call site needs that yet; if one turns up, an explicit opt-out is the change to make — the same "pull it in when there's a real second case" rule the styleguides follow.
  - Before this the app had **zero** heading semantics anywhere — verified in the DOM: no `role="heading"`, no `<h*>` tags, no `aria-level` — so a screen-reader user had no way to navigate a screen by structure at all. The Showcase screen's title now renders as a genuine `<h1 aria-level="1">`.
- **`createStyles` supports `typography` the same way it supports `spacing`/`radius`/`sizes`** — it arrives already scaled, no `units()` wrapping needed at the call site.

### `Button` — `src/components/button`

```tsx
import Button from "@/components/button";

<Button value="Continue" type="primary" size="large" onPress={submit} />
<Button value="Cancel" onPress={dismiss} />              // secondary / medium
<Button value="Learn more" type="tertiary" size="auto" onPress={open} />
```

Two independent axes — `type` (visual emphasis) and `size` (box metrics and type scale) — plus `selected` and `disabled` states that cut across both.

| `type`      | Fill                          | Border   | Label       |
| ----------- | ----------------------------- | -------- | ----------- |
| `primary`   | `primary`                     | —        | `onPrimary` |
| `secondary` | none (`selected` when picked) | `border` | `text`      |
| `tertiary`  | none (`selected` when picked) | —        | `accent`    |

| `size`   | Height                 | Label type |
| -------- | ---------------------- | ---------- |
| `small`  | `elementHeightSm` (32) | `footnote` |
| `medium` | `elementHeightMd` (44) | `body`     |
| `large`  | `elementHeightLg` (56) | `headline` |
| `auto`   | hugs its label         | `body`     |

- **The defaults are `type="secondary"`, `size="medium"`** — chosen so adding both props changed nothing about how any existing button in the app renders. `secondary` is also the right default on the merits: the app's buttons are overwhelmingly utility actions, and defaulting to `primary` would make every one of them shout.
- **`secondary` is outlined, and its border is load-bearing.** With no fill, the `border` edge is the only thing marking the control, so it is the semantic token held to the 3:1 WCAG 1.4.11 asks of a boundary against every surface a button can sit on — `backgroundElement` and the `selected` tint included (see the palette contrast test in the Theme section).
- **Every type gets two backgrounds, resting and `selected`**, so a segmented control reads as picked whichever type it's built from — not just the one that happened to have a darker token lying around. `primary` is the exception and stays put: it's already at full emphasis, so it conveys selection through `aria-selected` alone. Verified live: clicking through the showcase's segmented control moves both the readout and the rendered `aria-selected`.
- **`auto` is the one size that reserves no touch target** — it hugs its label, for a button that has to sit inline with text or in a tight row, which by definition puts it under the 44pt minimum. That's why it's the one size to avoid for a primary action, and why it's called out here rather than left to be discovered.
- **The box metrics live in `createStyles`, the type scale in a lookup table.** Height and padding need `units()`-scaled values, which only the style factory has; the label's typography token doesn't. Splitting them isn't ideal, but duplicating the heights into a const nothing reads would be worse — an earlier version did exactly that and the dead fields survived a refactor unnoticed.
- **`borderWidth` is always present, transparent unless the type asks for a border**, so a bordered and an unbordered type occupy identical space and swapping between them doesn't shift the layout around them.
- **Accessibility** comes from `controlA11yProps()` (see the Accessibility section) — a bare `Pressable` has no role of its own, so without it every button announces as an anonymous group. The label comes from the `Text` child rather than an explicit `accessibilityLabel`, and only the states actually in play are emitted.

### `BackButton` — `src/components/back-button`

```tsx
import BackButton from "@/components/back-button";

<BackButton />                         // router.back()
<BackButton onPress={confirmDiscard} /> // takes over entirely
<BackButton fallbackHref="/orders" />   // where to go with no history
```

The back affordance for a screen that draws its own header. With no `onPress` it pops the navigation stack, which is the case it exists for — a header shouldn't have to reach for the router to do the one thing back buttons do. It's an `IconButton` underneath, so the touch target, palette, states and accessible name are the ones every other button has.

- **`onPress` replaces the navigation, it doesn't run alongside it.** That's what makes "ask before discarding" expressible without fighting a default.
- **A back button with no history is a dead control**, which is exactly what a screen opened straight from a deep link or a tapped notification gets: `router.back()` is a no-op and the user is stranded. `fallbackHref` (default `"/"`, the one route every app has) is used instead when `router.canGoBack()` is false — via `replace`, not `navigate`, since this is a way _out_ of a dead end and pushing it would leave a history whose own back button returns to the screen the user just asked to leave. Pass `fallbackHref={null}` to opt out, and the button renders nothing rather than sitting there doing nothing. It's typed as Expo Router's `Href`, so a route the app doesn't have is a `tsc` error rather than a dead end found at runtime.
- **That disappearing act only applies when the button owns the navigation.** With an `onPress`, the caller decides what pressing means and the button stays put however empty the stack is.
- **The chevron mirrors in RTL.** Back is a direction, not a glyph: in a right-to-left locale the previous screen is to the _right_, so a left-pointing chevron there means forward. It reads `useIsRtl()` — the locale-derived flag — rather than relying on automatic mirroring, which only lands after a native reload. Covered by a test that renders in `ar` and asserts both the glyph and the translated label change.
- **Its label is translated** (`common.back`), because an icon-only button has no text to derive a name from — `IconButton` requires one by construction.

### `Header` — `src/components/header`

```tsx
import Header from "@/components/header";

<Header title="Orders" subtitle="12 open" left={<BackButton />} avoidNotch />

<Header
  left={<BackButton />}
  right={[<IconButton key="filter" label="Filter">…</IconButton>,
          <IconButton key="add" label="Add">…</IconButton>]}
>
  <Input type="text" value={query} onChange={setQuery} placeholder="Search" />
</Header>
```

A screen's top bar: something on the left, something on the right, and a title or a component of your own between them. Both slots take one element or several — pass an array or a fragment.

- **The middle stays centred against the header _and_ uses every pixel the slots don't need.** Those pull against each other in plain flexbox, and both failure modes showed up on screen: equal `flexBasis: 0` shares centre the title but make the row believe it always fits, so a long one overlapped the buttons; content-sized slots catch the overflow but let the wider side shove the title off-centre. So the slots are measured (`onLayout`) and the middle is offset by the _difference_ between them — `max(0, right − left)` leading, the reverse trailing — which puts its midpoint on the header's whatever each side holds. Verified in the browser across three headers with different slot loads: all centred to the pixel, none overlapping, the long one truncating.
- **The slots never shrink; the middle does.** A squashed control is unusable, while a clipped title is merely shorter. Making the middle actually give way needs `minWidth: 0` on both the centre _and_ the text inside it — a flex item's default minimum size is its own content, so one level of it isn't enough (which is why the first fix didn't take).
- **The title is the screen's `<h1>`.** It's set in `headline` rather than a title step — a bar is compact, and the type scale's title sizes are built for a page heading with room to breathe — so the heading semantics are declared explicitly rather than inherited from `type`. Without that, a screen reader's heading rotor has no entry for the screen the user is on. Confirmed in the rendered DOM. The subtitle stays plain text: it qualifies the heading rather than being one.
- **`avoidNotch`** adds the device's top safe-area inset, clearing the notch, Dynamic Island or status bar. **Off by default**, because that padding is only correct for a header pinned to the very top: inside a `Modal`, under another header, or within a page that already inset itself, adding it again pushes content down twice. (Web has no inset, so it's a no-op there — the behaviour is covered by a test that supplies a real one through `SafeAreaInsetsContext`.)
- **Title, subtitle and custom middle content are a union**, so the combinations that mean nothing can't be written: a `subtitle` with no `title` to sub, or a custom element competing with a title for the same space. A header with nothing in the middle at all is still valid — back button plus actions is a real bar.

### `TabBar` — `src/components/tab-bar`

```tsx
// app/(tabs)/_layout.tsx
import { Tabs } from "expo-router";
import { NavigationTabBar } from "@/components/tab-bar";

<Tabs
  screenOptions={{ headerShown: false }}
  tabBar={(props) => <NavigationTabBar {...props} variant="floating" />}
/>;

// and in each screen, so its last row clears the bar
const space = useTabBarSpace({ variant: "floating" });
<Screen scrollable contentContainerStyle={{ paddingBottom: space }} />;
```

A bottom tab bar for an Expo Router `Tabs` navigator, in two shapes: `sticky` (docked to the edge, full width, top border) or `floating` (inset as an outlined, raised bar that content scrolls under). Default `sticky`.

- **Three exports, one component.** `TabBar` is the controlled form (`items` / `value` / `onChange`) — that's what the Showcase and stories drive, and what makes the whole thing testable without standing up a navigator. `NavigationTabBar` is the same bar wired to a navigator's props. They live in separate files behind a barrel for the reason `button` and `icon` do: the adapter imports the bar, so defining both in `index` would have them importing each other.
- **The adapter reads each route's own options**, so tabs stay configured the way every Expo Router app already configures them — `title` for the label, `tabBarIcon` for the glyph, `href: null` to keep one out of the bar — rather than being described a second time. Its props type is derived from `Tabs`'s own (`Parameters<NonNullable<ComponentProps<typeof Tabs>["tabBar"]>>[0]`) rather than imported: React Navigation's `BottomTabBarProps` isn't re-exported at `expo-router`'s top level, and reaching into its `build/` folder for a type breaks on any internal reshuffle.
- **Pressing goes through the navigator, not straight to `navigate()`.** A `tabPress` event goes out first and a listener can cancel it (`preventDefault`) — which is how "scroll to top instead of re-navigating" and "block leaving a dirty form" are written. An already-focused tab doesn't navigate again. The controlled form still reports a press on the current tab, because that press is exactly what those listeners are for.
- **`avoidChin`** adds the bottom safe-area inset so the bar clears the home indicator. **On by default**, unlike `Header`'s `avoidNotch`: a tab bar is at the bottom of the screen by definition, so the inset is right in every case except one deliberately nested elsewhere. A `sticky` bar is _padded_ by it, keeping the row of tabs at full height and growing only the dead space beneath; a `floating` bar is _lifted_ by it, since it's already off the edge.
- **`useTabBarSpace({ variant, avoidChin })` is the reserved height**, and it takes the same options the bar does so the two can't disagree. The bar is drawn over the screen, not beside it, so nothing in the layout tells a list that its last row is underneath one — and the usual fix, a hardcoded `paddingBottom: 80`, silently breaks on a different chin, at a different text size, or the moment the variant changes. There is deliberately **no exported height constant**: every consumer goes through the hook so the value is scaled through `units()` like every other size, the same reasoning `sizes.ts` gives for keeping its own scale private. Demonstrated in the Showcase with a switch that turns the reservation off — verified in the browser, where the last row sits clear of the bar with it on (bottom 322 vs bar top 330) and disappears beneath it with it off (381 vs 330).
- **Accessibility is a `tablist` of `tab`s**, not a row of buttons: a tab tells a screen reader that picking it swaps the view rather than performing an action, and that it belongs to the set its parent declares — which is what makes position announcements work. Each tab's whole column is the touch target, since a tab bar's most common miss is a hit area the size of the glyph.
- **Not yet wired into this app's routing.** The showcase is a single route, and adding a `(tabs)` group would restructure the app rather than add a component — so the Showcase demonstrates it over a bounded scrolling stage instead, which is also the only way to show what the space hook is for.

### `FilePicker` — `src/components/file-picker`

```tsx
import FilePicker from "@/components/file-picker";

<FilePicker
  id="attachment"
  onChange={setFile}
  options={{ type: "application/pdf" }}
>
  <Text value="Choose a file" />
</FilePicker>;

FilePicker.open("attachment"); // from anywhere, no ref needed
```

Wraps whatever you give it in a pressable that opens the system file browser, and reports the chosen file. Built on `expo-document-picker`.

- **Simpler than `ImagePicker`, because the platform is.** There's no camera to offer as an alternative and no permission to request first, so there's no chooser sheet in between — a press goes straight to the system UI on every platform, which is the shape `ImagePicker` only has on web.
- **`multiple` is fixed, not forwarded.** `onChange` reports one asset, so a caller never has to narrow between one file and several. A multi-select picker would be a different component.
- **Mounted without `children` it's headless**: it renders nothing and only answers to `FilePicker.open(id)`. That's not a curiosity — it's how `Input`'s `file` variation drives it, since a pressable field can't be nested inside a pressable wrapper (React Native has no touch bubbling; the inner one wins).
- **`FilePicker.open(id)` is synchronous and returns nothing**, unlike `Modal.show`. Browsers only allow a file dialog to open from the user activation that asked for it, so it has to run inside the press handler that called it with nothing awaited first; the chosen file arrives through that instance's `onChange` exactly as it does for a press. Verified in the browser across all four entry points — the component's own trigger, the static, the field, and a PDF-restricted field — each opening one `<input type="file" multiple="false">` with the right `accept`.
- **A press while the browser is already open is ignored**, so two pickers can't stack; the one the user is looking at wins.

### `Icon` — `src/components/icon`

```tsx
import Icon from "@/components/icon";

<Icon type="Feather" name="home" color="red" size={units(24)} />;
<Icon type="custom" name="logo" size={units(24)} />;
<Icon name="home" />; // type omitted -> the default family (Feather)
```

Wraps five [`@react-native-vector-icons`](https://www.npmjs.com/org/react-native-vector-icons) families — `Feather`, `MaterialIcons`, `Ionicons`, `FontAwesome6`, `AntDesign` — plus a `"custom"` type for SVG icons defined in `custom-icons.tsx` (built with `react-native-svg`, no asset-file transform needed).

- **`name` autocompletes to the real glyph names for whichever `type` you pick**, and a name that doesn't exist for that type is a type error — not from a hand-written list, but from each package's own generated `<Family>IconName` union (`keyof typeof glyphMap`), which is also how it stays correct if a package updates its glyph set. Verified directly: `tsc` accepts `<Icon type="Feather" name="home" />` and rejects (with `@ts-expect-error`) a MaterialIcons-only name passed with `type="MaterialIcons"`, a Feather name passed to `type="custom"`, and vice versa — four independent, genuine type errors, not just "it compiles."
- **Default type is one constant**: `DEFAULT_ICON_TYPE` in `index.tsx`. Change it there and `<Icon name="..." />` (type omitted) switches which family's names it expects — no other file changes.
- **`color` defaults to `theme.colors.text`** — pass it explicitly to override, same as `size`. This is what makes an icon with no `color` prop legible in both themes automatically instead of defaulting to the underlying library's black. Verified both ways live in-browser: the Showcase screen's header icon (no `color`) renders white in dark mode and black in light mode, tracking `theme.colors.text` with no reload; a `color="red"` override stays red in both.
- Every family needs its font registered on iOS — each `@react-native-vector-icons/*` package ships its own Expo config plugin (adds the font to `Info.plist`), listed in `app.config.ts`'s `plugins`.
- Verified rendering on web: all 5 vector families with distinct glyphs, the custom SVG icon, and the omitted-`type` default all confirmed visually in-browser. Before the theme-default-color above, several of these icon families defaulted to **black** — invisible against this app's dark-mode `Screen` background unless you passed an explicit `color`; the theme default now makes that the non-issue it should be.
- Adding a new vector family or a new custom icon is one line each in `icon-sets.ts` / `custom-icons.tsx` — nothing else needs to change.
- **FontAwesome6 is the one family that needs a style picked for it.** It ships three separate fonts (regular / solid / brand), each with its own glyphs, chosen by an `iconStyle` prop that defaults to `regular` — much the smallest of the three in the free tier. Its exported `FontAwesome6IconName` is the union of _all three_, so a solid-only name like `"rocket"` type-checked and then rendered as a missing-glyph box: the type promised more than the default font could draw. `IconNameByType` now narrows to `FontAwesome6SolidIconName` and `index.tsx` passes the matching `iconStyle="solid"`, so names and glyphs agree again. Found by building the showcase — the Icons section rendered a `?` where the rocket should have been. Regular/brand aren't exposed yet; add them the day something needs one.

### `Input` — `src/components/input`

```tsx
import Input from "@/components/input";

<Input
  label="Name"
  placeholder="Ada Lovelace"
  value={name}
  onChange={setName}
/>;
<Input
  type="numeric"
  label="Age"
  value={age}
  onChange={setAge}
  min={0}
  max={120}
/>;
<Input type="email" label="Email" value={email} onChange={setEmail} />;
<Input value={query} onChange={setQuery} leftSlot={<Icon name="search" />} />;
```

One component, branching on `type` — like `<input>` in HTML. `type` is optional and defaults to `"text"`.

```
src/components/input/
  index.tsx     Input — picks a variation by `type` and renders it
  types.ts       CommonInputProps + each type's own props (the public API)
  base/           BaseInput — the shared shell: label, slots, focus/disabled styling
  text/           TextInput — type="text" (default)
  textarea/       TextAreaInput — type="textarea", multiline with an optional character limit
  numeric/        NumericInput — type="numeric", + its own use-numeric-text.ts
  email/          EmailInput — type="email", forces the email-address keyboard
  password/       PasswordInput — type="password", visibility + autofill semantics
  code/           CodeInput — type="code", one-time-code entry
  phone/          PhoneInput — type="phone", country selection + E.164 output
  select/         SelectInput — type="select", modal option selection
  file/           FileInput — type="file", system file browser via FilePicker
  datetime/       DateTimeInput — type="datetime", date/time/datetime modes
```

- **Every variation is its own component in its own folder**, not a branch inline in one big file. `BaseInput` (`./base`) owns everything shared — label, `leftSlot`/`rightSlot`, focus/disabled styling, and the actual value host. Each variation resolves its own value shape and type-specific behavior, then renders through that shared shell; `Input` (`index.tsx`) only dispatches by `type`. Adding another variation means one folder, its tests/stories, its props union member, and one dispatcher case.
- **Shared API**: every variation takes `value`/`onChange` plus the applicable common field props. A variation adds only what it specifically needs: numeric bounds, password autofill intent, code length/charset, phone country, select options, or date/time bounds. The discriminated union means a prop or value shape that does not belong to the selected `type` is a `tsc` error.
- **`autoCapitalize`/`autoCorrect` default off for every variation**, enforced in one place: `BaseInput` defaults them (`"none"`/`false`) when not passed, so every current and future variation gets that default for free instead of each one having to remember it. Still overridable per field, e.g. `<Input autoCapitalize="words" />` for a name field.
- **`type="numeric"` buffers the raw typed text separately from the numeric `value`**, in `numeric/use-numeric-text.ts` — a `TextInput` controlled directly by `String(value)` can't represent in-progress input like `"1."` or a bare `"-"`. Non-digit characters are stripped as you type, and `onChange` only fires once the buffered text parses to a real number, clamped to `min`/`max`. The Showcase feeds the committed value back into the field so that clamp-and-resync path stays visible.
- Resyncing the buffered text when `value` changes from outside (e.g. that clamp round-trip above) happens **during render**, not in a `useEffect` — React's documented pattern for adjusting state from a prop change without an extra render pass. A `useEffect` calling `setState` synchronously in its body is also an ESLint error in this project's `react-hooks/set-state-in-effect` rule, which caught the first draft of this hook.
- Focus and disabled states are handled centrally — the field is outlined in `border`, and focus (or an error) thickens that outline and recolours it to `focus` (or `error`), taking the extra width out of the padding so nothing shifts; disabled controls use muted presentation without changing their public behavior.
- **The frame around the field is the public `FormField`** (`src/components/form-field`, below): every variation draws its label, helper and error through it, so a non-`Input` control framed by hand looks identical.
- **`necessity: "required" | "optional"`** on `CommonInputProps` shows "Required" or "Optional" beside the label, and joins the field's accessible name ("Notes, Optional") because a screen reader never reaches the label's hint from inside the field. Mark whichever is the exception in a form — marking every field the same way says nothing.
- **`type="textarea"`** is BaseInput told to be multiline: it starts `minLines` tall (3), grows with its text to `maxLines` (6), then scrolls — sized in lines of its own type step, so a larger OS text size makes a taller field rather than fewer visible lines. Return inserts a new line and never submits. With `maxLength` it shows "120/500" at the end of the helper row (read as "120 of 500 characters"); the limit is hard, so the count never goes over. Capitalisation and correction are back on here, because it's prose.
- **`error`/`helperText`**: `helperText` renders under the field in `theme.colors.textSecondary`; `error` (also a string) replaces it, renders in `theme.colors.error`, and switches the field's border to that color too (`error` — a new key in `palette.json`/`ThemeColors`, `#dc2626`/`#f87171` light/dark — same swap-the-palette-file extensibility as every other color). Both live on `CommonInputProps`, so every variation gets them for free. Verified live: an invalid `Email` value renders a red border and "Enter a valid email" in place of blank helper text.
- **`type="file"` is `FilePicker` behind a field.** It shows the chosen file's own `name`, never its `uri` — a cache path on native, a blob URL on web, meaningless to whoever reads the field — and falls back to the placeholder with nothing picked, the same shape `select` has. The picker is mounted _beside_ the field rather than around it: React Native has no touch bubbling, so a pressable field nested inside a pressable wrapper simply swallows every press. The field's `onPress` calls `FilePicker.open(id)` instead, which the bus delivers synchronously, so a browser still counts the press as the user activation that opened the dialog.
- **Ref forwarding**: typed variations forward their ref to the underlying RN `TextInput`, so a caller can use `.focus()`/`.blur()`. Press-mode variations such as select and datetime deliberately keep a null text-input ref because their value is picked rather than typed.
- **Accessibility**: the RN `TextInput` gets `accessibilityLabel={label ?? placeholder}` (a sibling `Text` isn't auto-associated with a field the way HTML's `<label for>` is) and `accessibilityState={{ disabled }}`, so a screen reader announces the field's name and disabled state without extra wiring per variation.
- **`onFocus`/`onBlur`** are plain optional callbacks on `CommonInputProps` — `BaseInput` still owns the focus-triggered background swap internally, but now also calls a consumer's `onFocus`/`onBlur` alongside it, e.g. for running validation when a field is left.
- `index.tsx`'s dispatch is a `switch` on `props.type`, but the actual `{...props}` spread appears exactly once, in a generic `renderVariant<P>(Component, props, ref)` helper each `case` calls — TS infers `P` from `Component` and checks the (already-narrowed-by-`switch`) `props` against it, so a mismatched case (e.g. the wrong variation under the wrong `case`) is still a `tsc` error, unlike an earlier version of this dispatcher that stored the picked component in an `any`-typed variable.
- Each input layer has its own Storybook story and Jest test, scoped to what that layer owns. `BaseInput` covers shared behavior once; variation tests cover only their value coercion and type-specific behavior; `Input` confirms routing.
- Live examples on the Showcase screen exercise every variation together, including numeric clamp-and-resync behavior, the actual `type="email"` DOM attribute, and ref-based imperative focus.

### `FormField` — `src/components/form-field`

```tsx
import FormField from "@/components/form-field";

<FormField
  label="Volume"
  necessity="optional"
  helperText="Applies to every device"
>
  <Slider
    label="Volume"
    hideLabel
    value={volume}
    onChange={setVolume}
    max={100}
  />
</FormField>;
<FormField label="Guests" error={guestsError}>
  {({ labelId, descriptionId }) => (
    <MyControl aria-labelledby={labelId} aria-describedby={descriptionId} />
  )}
</FormField>;
```

The label, helper and error shell every `Input` variation is drawn in, public so a `Slider`, a `Stepper` or anything custom sits in a form without looking borrowed.

- **It owns text and spacing only.** The control keeps its own name and state; give a control that draws its own label (`Slider`, `Stepper`) `hideLabel`, so its name stays for a screen reader without showing twice. When a control should point at the field's text instead of repeating it, pass a function as `children`: it receives `labelId` and `descriptionId`, the `nativeID`s on the label and the helper/error line, for `aria-labelledby`/`aria-describedby` on the web and `accessibilityLabelledBy` on Android.
- **An error is announced when it appears** — the error line alone is an assertive live region. Helper text is not, because a hint that talks whenever it changes is noise.
- **`necessity`** puts "Required" or "Optional" beside the label; see the note under `Input` on marking only the exception.
- **`counter` / `counterLabel`** put a short reading at the end of the helper row ("3/5", "120/500") with a spoken form ("3 of 5 selected"). The helper wraps and the counter never gets pushed off the edge.

### `Alert` — `src/components/alert`

```tsx
import Alert from "@/components/alert";

<Alert type="warning" message="You're offline. Changes will sync later." />;
<Alert
  type="error"
  title="Couldn't save"
  message="Check your connection and try again."
  action={{ label: "Retry", onPress: save }}
  onDismiss={() => setError(null)}
/>;
```

A message that stays in the page until what it reports stops being true — offline, an unverified email, a failed save. It fills the gap between the two overlays: `Toast` reports something that happened and leaves on its own, `Popup` blocks until answered, and this does neither.

- **Types**: `info` (default), `success`, `warning`, `error` — the same icons, urgencies and announcements as `Toast`, kept as a table in the component so a new type is one entry plus its `alert.<type>` translation.
- **Drawn to the kit, not as a coloured card**: the raised `backgroundElement` surface with a `divider` hairline and `radius.surface` corners. The type is carried by the icon in its status colour and by the spoken announcement — never by a fill.
- **Announced once, on mount**, through a live region with the type read first ("Error, Couldn't save, Check your connection…"); only `error` interrupts. The action (a tertiary button under the message) and the close control stay separate stops.
- **`onDismiss` is what adds the close control.** Leave it off for a message that must stay while its cause does.

### Platform constants — `src/utils`

```ts
import { isWeb, isIOS, isAndroid } from "@/utils";

if (isIOS) AccessibilityInfo.announceForAccessibility(message);
const keyboardProps = isWeb ? { tabIndex: 0, onKeyDown } : null;
```

Three constants instead of a platform comparison written out at every call site — every one of the app's platform branches goes through them (`StateView`'s iOS announcement, `Toast`'s, `Switch`'s per-platform track size, the web keyboard handling in `Slider`, `Input`'s checklist/radio-group/switch-group, `ImagePicker`'s web path).

- **Constants, not functions.** The platform can't change while the app runs, so there's nothing to re-evaluate, and `if (isWeb)` reads as a fact rather than a question.
- **They read `Platform.OS`, not `process.env.EXPO_OS`** — and the difference matters more than it looks. The env read is inlined by `babel-preset-expo` at transform time, so it collapses to a literal and its branches are dead-code-eliminated per platform: cheaper, but under Jest it is permanently `"ios"`, which makes every non-iOS branch unreachable by any test. That's how `ImagePicker`'s web behaviour was first written — shipped, with no test able to see it. `Platform.OS` costs one comparison at module load and leaves the other branches in the bundle; being able to prove platform-specific behaviour is worth more. `src/utils/index.test.ts` asserts the env read is still pinned to `"ios"` under Jest, so a change back fails there rather than silently freezing every branch.
- **A test that needs a different platform mocks `@/utils`**, not react-native's `Platform` — replacing that module breaks `expo-modules-core`, which reads `select` from it during setup. Because the values are settled at module load, that mock belongs at the top of its own test file; `image-picker`'s web behaviour is covered in `web.test.tsx` beside the native cases in `index.test.tsx` for exactly that reason.

### Event bus — `src/features/event-bus`

```ts
import { createEventBus } from "@/features/event-bus";

const bus = createEventBus<{ ping: { count: number } }>();
const unsubscribe = bus.on("ping", (payload) => console.log(payload.count));
bus.emit("ping", { count: 1 });
unsubscribe();
```

A small typed pub/sub wrapper around the ["events"](https://www.npmjs.com/package/events) npm package (a standalone, RN/web-compatible implementation of Node's `EventEmitter` — the same one bundlers polyfill Node's own `"events"` module with; installed and pinned here as a direct dependency since it's imported directly, plus `@types/events` as a pinned dev dependency, since `tsconfig.json`'s `"types": ["jest"]` deliberately keeps `@types/node`'s ambient globals out of this RN codebase and `"events"` itself ships no types of its own). `emit`/`on` are checked against an events map — `bus.emit("ping", "wrong type")` above would be a `tsc` error — and `on` returns an unsubscribe function directly, no separate `off` call needed.

Generic and standalone on purpose: anything needing "fire an event here, react to it somewhere else with no direct reference between the two" can create its own bus with `createEventBus<...>()` instead of writing this plumbing again. `Modal` (below) is the first consumer — its `id`-based `show`/`hide` API is built entirely on one.

### `If` — `src/components/if`

```tsx
import If from "@/components/if";

<If condition={config.backdrop}>
  <ModalBackdrop progress={progress} onDismiss={dismiss} />
</If>;
```

A plain conditional wrapper — renders `children` when `condition` is true, otherwise `null`. It adds no host element of its own (unlike, say, wrapping in a `<View>` and toggling its visibility), so it's a drop-in replacement for `{condition && <X />}`/ternary JSX wherever that reads better as a tag than an inline expression. `Modal` (below) uses it for its optional backdrop and drag handle instead of ternaries.

- **`If` is not a ternary, in the one way that matters: its children are built whether or not the condition holds.** They're an argument, evaluated before `If` is ever called, so `<If condition={user !== undefined}><Text value={user.name} /></If>` reads `user.name` on `undefined` and throws — where `{user ? <Text value={user.name} /> : null}` would not. It doesn't narrow types either, so TypeScript catches most of these; `country-picker.tsx` keeps a ternary and a comment saying why. **Where the body reaches into the thing being guarded, use a ternary.** Everywhere else — a boolean flag, an index comparison, a count — `If` reads better and is what this repo uses.

### `Match` — `src/components/match`

```tsx
import Match from "@/components/match";

<Match<Status> value={status}>
  <Match.Case when="loading">
    <Spinner />
  </Match.Case>
  <Match.Case when={["idle", "ready"]}>
    <Results />
  </Match.Case>
  <Match.Default>
    <Empty />
  </Match.Default>
</Match>;
```

`If` for more than two outcomes — the `switch`/`case` statement as JSX.

- **`Match`, not `Switch`, because `Switch` is already the toggle.** Two components of the same name is a rename at every call site that wants both, and the one that would have to give way is the control people actually see. `Match` is what the pattern is called wherever it isn't a C-family statement.
- **Only the first match renders, and there's no fall-through.** The statement's `break` is what everyone means and forgets to write. A branch listing several values — `when={["idle", "ready"]}` — covers the one use of fall-through anybody wanted.
- **It adds no host element**, the same as `If`. The matched branch's children are returned directly, which is what makes it usable inside `Chart`'s Skia canvas, where a stray `View` is handed to Skia's reconciler and silently renders nothing.
- **`Case` and `Default` hang off `Match` rather than being exported beside it**, so the three read as one construct and neither can be imported without the `Match` that gives it meaning — on its own, a `Match.Case` renders nothing. Same shape as `Share.copy` and `Popup.show`.
- **`<Match<T>>` types `value`, and cannot type the branches.** It reads as though it should, so this is worth knowing before relying on it: a parent's type argument can't reach its JSX children. Every JSX expression arrives typed as `React.JSX.Element` — which is `ReactElement<any>` — so a `children` typed as `ReactElement<CaseProps<T>>` accepts any element at all and the props are never compared. `NoInfer` and a `when?: never` discriminant on `Default` were both tried; neither helps, because nothing is being compared in the first place. What `<Match<Status>>` does buy you is a checked `value`: passing a number, or a string outside the union, is an error.
- **Where a typo in `when` matters, write the type on the branch.** `<Match.Case<Status> when="loding">` gives "Did you mean 'loading'?" at compile time. It's opt-in per branch — `when` defaults to `unknown` and takes anything — which is the trade for writing the type once on the `Match` instead of on every case. Worth it on a switch over a string union; noise on a boolean.
- **Branches have to be direct children.** They're read as props rather than rendered, so a `Match.Case` inside a fragment or lifted into its own component is invisible to the `Match` and that branch silently never matches. There's a test pinning it.
- **`Match` does not narrow, and its branches are all constructed** — the same rule as `If` above. A dispatch that needs narrowing stays a `switch` statement: `Input` picks between thirteen variations off a discriminated union, and its `switch` is what proves each variation gets props of the right shape. Converting that would cost the type check and build all thirteen elements to use one.
- **Two-branch dispatch stays a ternary.** `Checkbox`, `RadioButton`, `SegmentedControl`, `Switch` and `MediaPlayer` each pick one of two implementations off `type`; `a ? <X /> : <Y />` is shorter and no less clear. `Match` earns its place from three branches up — which in this repo is `Chart`, picking between bar, area and line.

### `Modal` — `src/components/modal`

```tsx
import Modal from "@/components/modal";

<Modal id="confirm-delete" type="popup">
  <Text value="Are you sure?" />
</Modal>;

// from anywhere — no ref needed:
Modal.show("confirm-delete");
Modal.hide("confirm-delete");
```

Wraps RN's own `Modal` — already a native, full-window overlay, so no `Root` wiring is needed for it to render above everything — and drives its enter/exit visuals with [Reanimated](https://docs.swmansion.com/react-native-reanimated/) instead of `Modal`'s built-in `animationType`, so each `type` gets its own appearance and motion:

| `type`        | position   | animation | backdrop | content background                          |
| ------------- | ---------- | --------- | -------- | ------------------------------------------- |
| `popup`       | center     | fade      | yes      | yes                                         |
| `bottomSheet` | bottom     | slide up  | yes      | yes                                         |
| `actions`     | bottom     | slide up  | yes      | **no** — behaves like a native action sheet |
| `fullscreen`  | fullscreen | fade      | no       | yes                                         |

(`type` is optional, defaults to `"popup"`. Table lives in code as `MODAL_TYPE_CONFIG` in `config.ts` — add a type by adding one entry there + the literal to `ModalType` in `types.ts`; `index.tsx` reads it generically and doesn't otherwise change.)

- **`actions` has a backdrop but no content background** — it's meant to look like a native action sheet: a dimmed backdrop behind a _stack of independently-styled action items_ (e.g. `Button`s, which already supply their own background and border) rather than one unifying card. The Showcase demo uses exactly that — two `Button`s and a `Close` `Button` stacked with a `gap`, no wrapping card.
- **Toggle two ways, both converging on the same internal show/hide**: locally via a ref (`<Modal ref={ref} id="x">...</Modal>`, then `ref.current.show()`/`.hide()`), or globally via `id` from anywhere with no ref — `Modal.show("x")`/`Modal.hide("x")`, backed by `event-bus.ts` (built on the generic bus above). Every mounted `<Modal id="x">` subscribes for its own id and reacts only to it — verified live and in tests (`Modal.show("some-other-id")` while a differently-`id`'d modal is mounted does nothing to it).
- **`onDismiss`** fires when the user _asks_ to close the modal — a backdrop tap, or the Android back button / RN `Modal`'s `onRequestClose` (not RN `Modal`'s own `onDismiss`, which is iOS-only and fires _after_ its dismissal animation — this one fires on the request, on every platform, before any animation). Defaults to hiding the modal; pass your own to run different logic instead, or to make the modal only closable via `Modal.hide(id)`/a ref (e.g. a "processing, please wait" modal). Doesn't affect `show`/`hide` via ref or the static API — those always still work regardless of `onDismiss`.
- **Exit animations play out before the native `Modal` unmounts.** RN's `Modal` unmounts its content the instant its `visible` prop goes false, which would cut a Reanimated exit animation short — so here, `visible` only follows a state flag that's flipped to `false` inside the exit animation's completion callback (`withTiming`'s 3rd argument, hopped back to the JS thread via `runOnJS`), not immediately when `hide()`/`Modal.hide(id)` is called. Verified live: closing a popup/sheet visibly animates out before disappearing, not an instant cut.
- Bottom-sheet/actions padding and fullscreen's top padding account for safe-area insets (`useSafeAreaInsets`, already provided by `Root`'s `SafeAreaProvider`) on top of the base spacing, so content clears the home indicator / notch.
- **Jest needs one extra config line for Reanimated v4**: `"resolver": "react-native-worklets/jest/resolver.js"` in `package.json`'s `"jest"` block. Reanimated v4 splits its native/worklet runtime into the separate `react-native-worklets` package, whose native-only files (`*.native.ts`) crash under plain Jest (no native module) unless this resolver strips that extension during test resolution — no such config existed before Modal was the first thing in this codebase to import `react-native-reanimated`. `expo start`/`expo start --web` need no equivalent change — `babel-preset-expo` auto-detects `react-native-worklets`/`react-native-reanimated` being installed and wires their Babel plugin in automatically, which is also why there's still no `babel.config.js` in this project.
- **Accessibility**: the outer container gets `accessibilityViewIsModal` (maps to `role="dialog" aria-modal="true"` on web — verified via the actual DOM), and the backdrop gets `accessibilityRole="button"`/`accessibilityLabel="Dismiss"` so a screen reader announces what tapping it does. Keyboard/screen-reader focus trapping and restore-on-close are **not** hand-rolled here — react-native-web's own `Modal` already wraps its children in a WCAG-compliant focus trap (`ModalFocusTrap`) whenever `visible` is true, and native platforms handle modal accessibility focus themselves; re-implementing that would just duplicate what the platform already does correctly.
- **Same-`id` and orphan-`id` calls warn in dev instead of failing silently.** `Modal.show`/`Modal.hide` broadcast on the event bus regardless of whether anything is listening — a typo'd `id`, or two `<Modal id="x">`s accidentally mounted at once, would otherwise do nothing/double up with zero indication why. `registry.ts` tracks which ids are currently mounted purely to `console.warn` in dev in both cases (`__DEV__`-gated, zero runtime cost in production) — verified in tests and doesn't change behavior, only diagnosability.
- **Content taller than the screen scrolls instead of overflowing.** Every type's children render inside a `ScrollView`, bounded by `maxHeight: windowHeight * 0.85` for `popup`/`bottomSheet`/`actions` (fullscreen's is `flex: 1`, already bounded by the screen). Verified live: a popup with 40 lines of text bounds to 85% of the viewport height and scrolls to reveal a "Close" button below the fold, instead of clipping it off-screen.
- **`bottomSheet`/`actions` support drag-to-dismiss from a grabber handle** (`react-native-gesture-handler`'s `Gesture.Pan()` + `GestureDetector`, Reanimated-driven). Deliberately scoped to just the handle, not the whole sheet — wrapping the entire content (including the `ScrollView` above) in the pan gesture would fight the `ScrollView`'s own vertical scrolling for the same gesture. Dragging past 100px or with velocity over 800px/s dismisses (via the same `dismiss()`/`onDismiss` path as a backdrop tap); otherwise it snaps back. Verified live in-browser with simulated pointer drags: a 200px drag dismissed the sheet, a 20px drag snapped back without dismissing.
- **`GestureHandlerRootView` now wraps the whole app**, added to `Providers` (`src/root/providers.tsx`) rather than only around Modal's gesture — gesture-handler needs exactly one, at the true root, to reliably capture touches on Android; wrapping it locally around just the drag handle would work inconsistently. `jest.setup.js` also needed `require("react-native-gesture-handler/jestSetup")` (gesture-handler's own recommended Jest setup) once any gesture was actually used.
- **Composed from smaller pieces**, same folder-per-piece pattern as `Input`: `backdrop.tsx` (`ModalBackdrop`), `content.tsx` (`ModalContent` — position/animation styling + the fade/slide-up interpolation), `handle.tsx` (`ModalHandle` — the grabber and its pan gesture), and `scroll-area.tsx` (`ModalScrollArea` — the bounded, scrollable content region) each own one concern; `index.tsx` is the orchestrator that owns state (`nativeVisible`, `progress`/`dragY` shared values, the show/hide/dismiss callbacks) and composes the pieces, using `If` (above) for the parts that are conditional per `type` (backdrop, drag handle) instead of ternaries.

### `Barcode` — `src/components/barcode`

```tsx
import Barcode from "@/components/barcode";

<Barcode format="qr" value={order.url} label="Order QR code" />
<Barcode format="CODE128" value="PKG-4821" label="Package barcode" />
<Barcode format="EAN13" value="590123412345" label="Product barcode" />
```

A QR code or a linear barcode, drawn as vectors. `format` covers `qr` plus `CODE128`, `CODE39`, `EAN13`, `EAN8`, `UPC`, `ITF14` and `codabar`.

- **No native module and no canvas.** Both symbologies are encoded in plain JavaScript — `qrcode-generator`, and `jsbarcode`'s own encoders used _without_ their DOM renderers — then drawn with `react-native-svg`, which the app already has. So iOS, Android and the web run the same code with nothing to prebuild, unlike the two components before it. The encoders are pure and separately tested; the component is the thin part.
- **It stays black on white in both schemes.** A code is not a graphic the user reads, it is a target a camera reads, and the scanner is the audience. Inverting it for dark mode is a real risk rather than a theoretical one: most QR decoders cope with a light-on-dark symbol, many linear decoders do not, and the failure is silent — the code simply never scans, on someone else's phone, where nobody testing the app will see it. `scanSurface`/`onScanSurface` are the palette's entries that deliberately do not follow the scheme, the same exception `mediaSurface` makes.
- **The quiet zone is part of the drawing.** A scanner finds a symbol by the blank border around it, so a code flush to the edge of its container frequently will not read at all — the most common way a hand-rolled code renderer fails. Four modules for QR (what the spec requires), ten for a linear symbol, both baked in rather than left to a caller's padding.
- **Invalid input renders the `fallback`, never a wrong code.** Each symbology has rules — `EAN13` is twelve digits plus a computed check, `CODE39` has no lower case — and drawing something anyway produces a code that scans as the wrong thing with nothing on screen to say so. The encoders are asked first and `null` means nothing is drawn.
- **`flat: true` is not optional when calling those encoders**, and finding out why is what the tests are for. Without it the EAN/UPC family returns a _segmented_ encoding — guard bars and halves as separate pieces for a renderer that positions them — and the top-level `data` is the three modules of the first guard. That drew three bars where a barcode should be, and was caught only because a test asserted EAN13's check digit and found the text missing too.
- **One path for a QR, runs for a barcode.** A dense QR is 57×57 — around three thousand modules, half of them dark — so every module is a subpath of a single `<Path>` rather than its own `<Rect>`. A linear symbol collapses adjacent dark modules into one bar, turning a hundred-odd modules into a couple of dozen rects.
- **A screen reader gets the value, not the picture.** `label` names the code and the encoded value is its `accessibilityHint`, because someone who cannot see it also cannot point a camera at it — the string is the only way they get what it holds. The drawing declares no accessibility props of its own: the container is one element, and `react-native-svg` forwards unknown props straight to the DOM `<svg>` on the web, where React rejects react-native's spellings of them (caught in the console, the same leak `WebView` hit with `maskType`).
- **`format` is required rather than defaulted.** A component called `Barcode` that silently produced a QR would be a surprise, and one that silently produced `CODE128` would be a worse one.
- Verified by decoding what it drew: the browser's own `BarcodeDetector` reads the rendered QR back as `https://example.com/order/12` and the rendered CODE128 back as `PKG-4821`.

### `Chart` — `src/components/chart`

```tsx
import Chart from "@/components/chart";

<Chart
  label="Money by month"
  type="bar"
  data={months}
  xKey="month"
  yKeys={["revenue", "costs"]}
  seriesLabels={{ revenue: "Revenue", costs: "Costs" }}
  formatValue={(v) => `£${v}k`}
/>;
```

A wrapper over [Victory Native XL](https://commerce.nearform.com/open-source/victory-native/), which draws on a Skia canvas. Three forms — `line` (default), `area`, `bar`.

- **It says its data out loud.** A Skia canvas is one opaque picture to assistive technology: no bars, no points, no elements at all, only pixels. So unlike every other component here an accessible _name_ is not enough — the container carries a generated sentence instead ("Revenue. Line chart, 6 points from Jan to Jun. Revenue, up from 18 to 46, low 18, high 46."). That is the shape the picture communicates; reading forty numbers aloud would not be an alternative to seeing it. `summary.ts` is pure and separately tested, which is just as well, since a canvas renders nothing a test could read.
- **The series palette lives in the theme and was computed, not eyeballed.** Six hues in `palette.json` (`chart1`–`chart6`), run through the data-viz validator against this app's own surfaces (`#ffffff` and `#000000`) rather than the reference's: worst adjacent colour-blind ΔE 9.1 light / 8.4 dark against a target of 8, worst adjacent normal-vision ΔE 19.6 / 19.3 against a floor of 15. The dark values are _chosen_ for a dark surface, not the light ones flipped — an inverted palette lands outside the lightness band and loses its contrast against black.
- **Colour is assigned by position and never cycled.** Slot 1 is always the first of `yKeys`, so a filter that removes a series does not repaint the ones that remain — colour follows the entity, not its rank. A seventh series is **dropped with a log naming the fix** rather than given a repeated colour: two different things in one colour is a worse outcome than a chart that admits it is incomplete, and folding the tail into an "Other" series is a decision about the data that belongs to the caller.
- **Series colours are separate from `success`/`warning`/`error`/`info`.** Those are reserved for state, always ship with an icon and a label, and reusing one as "series 4" teaches a reader that red means bad in one chart and means "Germany" in the next.
- **A legend appears for two or more series and never for one.** With one, the title already names it. With two, colour is carrying identity and something has to say what it means — and three of the light series colours sit under 3:1 against white, a documented relief in the palette that obliges a visible label. The legend text wears a text token, never its series colour.
- **No dual axes and no pie.** Two measures on two y-scales is the single most misread chart there is — use two charts, or index them to a common base. Pie is left out because judging angle is harder than judging length and a bar answers the same question better; both are deliberate omissions rather than gaps.
- **Web needs CanvasKit, which is ~8MB of WebAssembly.** `setup-skia-web` copies `canvaskit.wasm` into `public/` (wired into `postinstall`, and gitignored — reproducible from a checkout rather than a binary in git), and `index.web.tsx` code-splits the Skia half behind Skia's own `WithSkiaWeb`. So `./plot` must be reachable _only_ through that dynamic import; a static import anywhere in the web entry's graph would pull Skia into the main bundle and undo the split. The frame renders immediately either way — legend and readout are there from the first paint, and a screen-reader user never waits for CanvasKit at all.
- **Axis labels appear on native and not on the web, and that is CanvasKit.** Skia draws text with a font _object_, so an axis with no font renders ticks and no labels. `matchFont` asks the platform's font manager rather than making us bundle a `.ttf` — but CanvasKit's `FontMgr` exposes only `FromData`, with no system font manager in the WebAssembly build at all (checked in the browser). The failure is contained: Victory reads `null` as "no labels", so the web keeps its grid, its marks and its readout, which carries every number the labels would have shown. Giving the web labels too means shipping a font file, which is a bundle-size decision rather than a bug fix.
- **Everything inside the canvas is a Skia node.** A react-native `View` dropped in there is handed to Skia's reconciler as if it were one: it renders nothing and throws out of a `ResizeObserver` on the web. Found exactly that way — an empty plot and a console full of `unobserve: parameter 1 is not of type Element` — and fixed by grouping marks with a `Fragment`.
- **The grid is `backgroundElementSelected`, not `border`.** `border` is the token for an edge that has to be _seen_; a grid is a reference the eye should be able to ignore while reading the marks.

### `Share` — `src/components/share`

```tsx
import Share from "@/components/share";

<Share content={{ url: order.url, title: "Order #12" }} />      // share icon
<Share content={{ url: order.url }} mode="copy" />              // copy icon
<Share content={{ url: order.url }} value="Share this order" /> // text button

// or drive it yourself, from anywhere
const outcome = await Share.share({ url });
await Share.copy(url);
```

A button that opens the OS share sheet, and copies to the clipboard where there isn't one.

- **It is an icon by default, and the glyph says which mode it is in** — a share glyph for the sheet, a copy glyph for the clipboard. They are different actions rather than two spellings of one, so they no more share a glyph than they share a label. It is also what this is nearly always wanted as: one control beside the thing being shared, not a word competing with it. Passing `value` turns it into a text button for the cases that need the action spelled out, and the accessible name is the localized "Share"/"Copy" either way — so the icon form is never an unnamed control.
- **The clipboard is not a consolation prize.** iOS and Android always have a share sheet. A browser has one only where the Web Share API exists — mobile Safari and Chrome, over HTTPS — and `react-native-web` maps `Share.share` straight onto `navigator.share`, rejecting with "Share is not supported in this browser" everywhere else. That is most desktop browsers, so on the web the clipboard is the _normal_ path rather than an edge case, which is why `copied` is one of four first-class outcomes rather than an error. Confirmed in the preview browser, which reports `navigator.share` as `undefined` and takes the fallback.
- **A dismissal never falls back to copying.** Someone who opened the sheet and closed it has decided not to share; quietly copying instead — and then announcing that it was copied — does the opposite of what they just asked for. The web reports that cancel by _rejecting_ with an `AbortError`, which is indistinguishable from a real failure unless the name is checked, so it is checked.
- **Four outcomes, not a boolean**, because the three that aren't `shared` mean different things: `dismissed` is the user's choice and nothing to apologise for, `copied` means they still got what they came for, and only `failed` is a failure. On Android the OS cannot tell a share from a dismissal and reports `shared` for both — a platform limit rather than something this papers over.
- **A copy is invisible unless something says so.** Nothing on screen changes when text reaches the clipboard; the only way to know it worked is to paste somewhere and look. So the confirmation `Toast` is on by default rather than opt-in, and `notify={false}` is for a caller showing its own feedback.
- **What gets copied is the URL, not the sentence around it.** The clipboard is nearly always on its way into an address bar, a chat box, or a QR generator, where "Check this out https://…" is wrong in a way the bare link never is. `title` is deliberately not in that chain either: it names the _sheet_ rather than the thing being shared, and react-native's own `Share` rejects content that is only a title — so treating it as a payload would make the runtime disagree with `ShareContent`, which already refuses to describe that case.
- **Nothing to share is a disabled button**, not a sheet that opens empty — reached by a URL that hasn't loaded yet far more often than by a caller getting it wrong.
- **`Share.share()` and `Share.copy()` are attached to the component**, the same shape `Toast` and `Image` use, so a screen with its own `IconButton` or menu item doesn't have to render this button to get the behaviour.
- `ShareContent` is written as two whole shapes rather than `{ title? } & (A | B)`. The intersection describes the same values but stops narrowing, so a check on `message` no longer tells the compiler which branch it is in — which is exactly what handing it to react-native's own union needs.

### `Timer` — `src/components/timer`

```tsx
import Timer from "@/components/timer";

<Timer label="Time remaining" until={expiresAt} ring onComplete={expire} />
<Timer label="Session length" since={startedAt} type="body" />
```

A countdown or a stopwatch. `until` counts down and stops at zero, `since` counts up — a union, so a timer with both (no sensible answer) or neither (nothing to count) won't compile.

- **The two halves run at different rates, and that is the whole design.** The digits change once a second, so they are React state and cost one cheap re-render a second. The ring changes every frame, so it is a single `withTiming` on a shared value read straight into the circle's `strokeDashoffset` — it runs on the UI thread, never re-renders React, and stays smooth while JavaScript is busy. Driving both from one clock would mean either a ring that jumps in sixty steps or sixty React renders a second for something React does not need to know about. Measured in the browser: the ring's offset moved 86.80 → 88.68 over 480ms in sub-pixel steps while the digits produced three distinct values over 3.2 seconds.
- **It cannot drift.** Every value is `Date.now()` measured against the target rather than a count of elapsed ticks, so it is still correct after the app was backgrounded, after the device slept, and after a slow frame — a timer that counted its own ticks would be visibly behind after any of those and would never recover. `AppState` re-reads on foreground, because that is the one moment the value on screen is guaranteed stale.
- **The redraw is scheduled to the next second boundary**, not a flat 1000ms. An interval started at `x.900` redraws at `.900` forever — always 100ms after the second it is showing actually turned over, and further out as the drift accumulates. Waiting for the remainder means each redraw lands when the digits change, once each, instead of sometimes firing twice inside one second.
- **The digits are tabular.** In a proportional font `11:11` is narrower than `00:00`, so a timer laid out normally jiggles every second and shoves whatever is beside it. `fontVariant: ["tabular-nums"]` fixes every digit's width — the difference between a timer and a timer that looks broken.
- **A screen reader hears words, not a clock face.** `4:07` is announced as "four oh seven", which is a time of day rather than a length of one, so the spoken form is built separately (`describeDuration` → "4 minutes 7 seconds") and stops at the two largest units that carry information. It is the element's _value_ rather than a live region: a timer announcing itself every second would talk over the whole screen, so it is read on demand like any other value.
- **The ring sweeps linearly and starts at twelve o'clock.** Eased, it would disagree with the digits about how much time is left, which is the one thing a timer must not do. Under Reduce Motion it is drawn at its true position without the sweep — the number beside it already says how long is left, so the movement alone was carrying nothing.
- **`onComplete` fires once**, not once per redraw after the deadline, and `ring` is countdown-only in the types: counting up has no total to be a fraction of, so there is nothing for a ring to show.
- One bug worth recording: the value arithmetic was written twice, and the copy the scheduler used had its sign inverted — so every countdown reported itself complete on the first tick and never redrew. It is one function now.

### `ProgressBar` — `src/components/progress-bar`

```tsx
import ProgressBar from "@/components/progress-bar";

<ProgressBar value={uploaded / total} label="Uploading photos" />
<ProgressBar label="Checking for updates" />          // indeterminate
<ProgressBar
  value={step / steps}
  label="Setup"
  size="small"
  formatValue={(v) => `Step ${Math.round(v * steps)} of ${steps}`}
/>
```

A horizontal bar showing how far along a task is. `Spinner` stays the right answer for a wait that is short and shapeless — a bar earns its space by answering "how much longer", which is also why the indeterminate state is the weaker of the two and not the default.

- **`value` is a 0–1 fraction, clamped.** A caller dividing by a total that turns out to be `0` gets an empty bar rather than a fill running off the end. `NaN` reads as `0`; an infinity is just past the end and pins to the right edge rather than being lumped in with it.
- **Omitting `value` is a claim, not a missing prop.** It makes the bar indeterminate, which reports _no_ `aria-valuenow` at all and sets `busy` instead — a bar that can't say how far along it is says something different from one reporting 0%. Verified in the rendered DOM: the determinate bars carry `aria-valuenow` with `aria-valuetext` (`"35%"`, or a caller's `"Step 2 of 6"`) and no `aria-busy`; the indeterminate one carries `aria-busy="true"` and no value.
- **Both states honour Reduce Motion, differently.** The determinate fill goes through `duration()`, so it lands on each new value instantly instead of gliding. The indeterminate sweep can't simply stop — the movement _is_ the signal that something is happening — so it becomes a cross-fade in place, which is the substitution Apple's own guidance names. Covered by tests that render with `isReduceMotionEnabled` mocked on and assert the bar fades full-width rather than sweeping a segment.
- **The track is `backgroundElementSelected`, not `backgroundElement`** — the latter is what most raised surfaces already use, so an unfilled bar sitting on a `Card` would be invisible. Same trap `Button`'s `secondary` and `Card`'s `outlined` document.
- **No `type="expo"` here.** Expo UI has a progress view for SwiftUI and one for Jetpack Compose, but nothing universal and nothing on web — three platform-specific implementations for a bar drawn from two `View`s isn't a trade worth making. `Switch`, `Checkbox`, `RadioButton`, `Slider` and `SegmentedControl` offer the switch because Expo UI ships one component that covers every platform.

### `List` — `src/components/list`

```tsx
import List from "@/components/list";

// default: each entry renders as a ListItem
<List
  data={people.map((person) => ({
    key: person.id,
    title: person.name,
    subtitle: person.email,
    onPress: () => open(person.id),
  }))}
/>

// or bring your own renderer
<List
  data={photos}
  keyExtractor={(photo) => photo.id}
  renderItem={({ item }) => <Image source={item.url} alt={item.caption} />}
/>
```

A virtualized list wrapping [Legend List](https://legendapp.com/open-source/list/) — a drop-in `FlatList` replacement that recycles item containers rather than mounting one view per row. Everything is Legend List's own API passed straight through (`ListHeaderComponent`, `ItemSeparatorComponent`, `ListEmptyComponent`, `onEndReached`, `numColumns`, `horizontal`, the viewability callbacks). The wrapper adds two things.

- **A default renderer.** Give it `data` of `ListItemData` — `ListItem`'s own props plus a `key` — and each entry renders as a `ListItem`, which is what most lists here are. Pass `renderItem` and it steps out of the way entirely: the item type is then inferred from `data` and stops asking for `ListItem`'s shape. Expressed as a union, so omitting `renderItem` with data that isn't `ListItemData` is a `tsc` error rather than a blank list.
- **Defaults it can actually know.** `keyExtractor` reads each row's `key`, and `estimatedItemSize` is `ListItem`'s own row height — a genuine first-render hint rather than a guess, which Legend List replaces with measured averages as soon as anything renders. Both are supplied _only_ for default rows: an item with its own renderer has a shape this knows nothing about, so guessing would be worse than Legend List's own fallbacks. Both are overridable.
- **The `key` never reaches the row.** React treats a spread `key` as the element's own key and warns about it — which the Showcase surfaced the first time this rendered. It's destructured out and used through `keyExtractor`, the only place it means anything. A required `key` rather than an index is the point of a recycling list: reorder or remove a row and an index key reuses the wrong content in the wrong container.
- **Composing rows needs the array annotated.** `ListItemData` is a union (text-or-children, pressable-or-not), so spreading over rows afterwards widens the array into a union of shapes that no longer matches the default branch, and the list starts asking for a `renderItem`. Build each row in one place, or annotate the array `ListItemData[]`.
- **Jest can't drive it.** Legend List renders no rows without a measured container, which under Jest is every time. The tests replace it with a stub and assert what the wrapper _hands over_ — the default renderer, the default key and size hint, and everything else untouched — with the virtualization left to Legend List's own suite. Verified in the browser instead: 200 rows, 11 mounted, still 11 after scrolling, and pressing a row reports it.

### `ListItem` — `src/components/list-item`

```tsx
import ListItem from "@/components/list-item";

<ListItem title="Ada Lovelace" subtitle="ada@example.com" left={<Avatar />} />

<ListItem
  title="Account"
  right={<Icon name="chevron-right" />}
  onPress={openAccount}
/>

// the button is the control; the row just labels it, so it stays inert
<ListItem
  title="Ada Lovelace"
  right={<IconButton label="Remove Ada Lovelace" onPress={remove}>…</IconButton>}
/>
```

One row in a list: something on the left, text in the middle, something on the right. Both slots take one element or several.

- **The middle is _not_ centred**, unlike `Header`'s. A list is read down its leading edge, and text that shifts with the width of whatever sits beside it is much harder to scan. It takes the space the slots don't need and truncates before either of them shrinks — a squashed avatar or control is unusable, while a clipped line is merely shorter. That needs `minWidth: 0` on both the middle _and_ the lines inside it: a flex item's default minimum size is its own content, so one level isn't enough (the same trap `Header` documents).
- **`onPress` makes the whole row one control**, named from its own text (`label` overrides), with `selected` and `disabled` announced. Right for a row that navigates; wrong for a row that _holds_ a control — `accessible` groups the children into one announcement, so an `IconButton` in the right slot of a pressable row becomes unreachable. Give the button the interaction and leave the row inert. Both halves are covered by tests, and verified in the browser: the rows announce as buttons with `aria-selected` tracking the pick, and the remove button inside an inert row is still reachable and still fires.
- **`Switch`, `Checkbox` and `RadioButton` don't go in a slot at all.** Each is already a full labelled row (they share `BinaryControlRow`), so nesting one puts its label beside this row's title and says everything twice — caught the first time the Showcase rendered a "Notifications" row with the word in it twice. They replace a `ListItem` rather than sitting inside one.
- **Title, subtitle and custom middle content are a union**, so a `subtitle` with no `title` to sub, or a custom element competing with a title, won't compile — the same construction `Header` uses.

### `WebView` — `src/components/web-view`

```tsx
import WebView, { type WebViewHandle } from "@/components/web-view";

const web = useRef<WebViewHandle>(null);

<WebView
  ref={web}
  label="Checkout"
  source={{ uri: "https://pay.example.com/session/12" }}
  onMessage={({ type, payload }) => {
    if (type === "checkout.complete") finish(payload);
  }}
/>;

web.current?.post("cart.updated", cart);
```

Someone else's web page, embedded, with a two-way event bridge and the app's own typography pushed into it. `react-native-webview` on native, an `<iframe>` on the web, one set of props over both.

- **`react-native-webview` has no web implementation**, and the community shim for it is a thin iframe wrapper with a smaller API than this needs. Owning the twenty lines of `iframe` in `index.web.tsx` is a better trade than a second dependency to keep the bridge working across — the platform split is the same `.web.tsx` mechanism `RadioButton` uses for its own.
- **The page gets one API on both platforms.** A shim (`injection.ts`) publishes `window.AppBridge` with `post` and `on`; it picks `window.ReactNativeWebView` when there is one and `window.parent` otherwise, so a page written once works in both. Without it every page would carry its own branch, which is the kind of thing that gets written once and then rots on the platform nobody tests. `bridgeScript()` is exported for the case it can't be injected.
- **The shim goes in ahead of the page's own scripts, and that is not a detail.** Native has `injectedJavaScriptBeforeContentLoaded`; the web's only hook for a frame it did not write is `load`, which is too late. The first version injected there and produced a genuinely confusing asymmetry: the page could `post` (from a click handler, registered late) but never received anything, because its `AppBridge.on(...)` at parse time had thrown a `ReferenceError` and killed the rest of the inline script. An `html` source is now built with the shim at the top of the document (`htmlWithBridge`), which is the same guarantee native gives. A cross-origin `uri` page must include `bridgeScript()` itself.
- **Only the origin you loaded is listened to.** `allowedOrigins` defaults to the origin of `source.uri`; everything else is dropped. The shim travels with the view, so without this a page that redirects elsewhere would be talking to your `onMessage` from a site nobody named. Exact origins, no wildcard hosts — a subdomain is frequently not under the same control as its parent, so `https://example.com` does not cover `https://pay.example.com`.
- **What counts as "a document we wrote" differs by platform, and has to.** Native loads an `html` source as `about:blank`, which parses to no origin at all. A browser renders it from `srcdoc` and, because the frame carries `allow-same-origin`, it _inherits the app's own origin_ rather than getting an opaque one — so on the web the app's origin counts too. Found the hard way: the handshake never arrived in the browser until it did. Either way it is a named list rather than a blank cheque, so an `html` document that follows a link out to a real site stops being heard.
- **Everything arriving is untrusted data.** It is JSON-parsed behind a 64k length cap and never evaluated; anything without our channel stamp is dropped as "not for us" rather than handed to a listener that would have to guess. Most pages that use `postMessage` at all are talking to something else.
- **The injected script's literals are escaped past what `JSON.stringify` does.** A stylesheet is caller data, and `JSON.stringify` leaves `<` alone — so a sheet containing `</script>` closes the tag early once a page author inlines the exported `bridgeScript()`. U+2028 and U+2029 get the same treatment, being line terminators inside a JS string literal on older engines. A test posts `</script><script>window.stolen=1</script>` as a stylesheet and asserts neither tag survives.
- **`post` is safe to call before the page is up.** Messages sent before the shim announces itself are queued and flushed in order, so a caller with data already in hand doesn't have to wait for `onReady` — losing those is a bug that only shows on a slow connection.
- **The stylesheet is baked into the first document and updated over the bridge.** Rebuilding `srcdoc` for a changed colour would reload the page under the user. What was last _sent_ is tracked rather than what the document started with: turning a stylesheet off and back on returns it to the initial value, and comparing against that decides nothing changed and leaves the page unstyled — which is exactly what the showcase did until it didn't.
- **`buildThemeCss` is two halves and both are useful**: custom properties (`--app-color-text`, `--app-font-size-body`, …) for a page that wants to style itself with the app's values, and shallow base rules so a page that does nothing still comes out in the app's typography and palette. Headings map to the same type-scale steps `Text` uses to decide heading semantics, so a `<h1>` in a page matches a `<Text type="largeTitle">` beside it. No layout, no spacing, no component styling — the point is to make a page belong, not to redesign it. Palette values are stripped of `;{}` so a rebrand or a `ThemeOverrides` can't turn a colour into a rule of its own.

**What works where.** The browser will not let a page script a cross-origin frame — no exception, no workaround — so that column is a property of the web, not a gap in this component.

|        | native   | web, same origin or `html` | web, cross-origin                 |
| ------ | -------- | -------------------------- | --------------------------------- |
| bridge | injected | injected                   | page includes `bridgeScript()`    |
| CSS    | injected | injected                   | over the bridge, once it is there |

### `Skeleton` — `src/components/skeleton`

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

### `Stepper` — `src/components/stepper`

```tsx
import Stepper from "@/components/stepper";

<Stepper label="Quantity" value={quantity} onChange={setQuantity} />
<Stepper label="Guests" value={guests} onChange={setGuests} min={1} max={8} hideLabel />
<Stepper label="Rate" value={rate} onChange={setRate} step={0.25} formatValue={(v) => `${v}×`} />
```

A number with a button either side of it: a quantity, a party size, a count of anything small enough to reach by pressing.

- **The value is not editable, and that is the decision rather than an omission.** A middle you can type into makes the control two things at once — an adjustable element and a text field — which need opposite accessibility treatment and disagree about what the keyboard is for. A stepper is for small adjustments (1 to 2, 4 to 3); anything with a range wide enough to want typing wants `Input`'s `numeric` variation, which already owns the digit filtering, the clamping and the right keyboard. The showcase puts the two side by side rather than merging them.
- **The whole control is one adjustable element and the buttons are hidden from assistive technology.** That is what the platform's own stepper is: a screen-reader user swipes up and down (arrow keys, `Home` and `End` on the web) rather than hunting two anonymous buttons, and announcing "decrease, button / 2 / increase, button" would turn one control into three stops. The buttons stay perfectly pressable by touch — hiding affects the accessibility tree, not the hit area. It reuses `sliderA11yProps()` rather than a near-identical helper of its own: the native adjustable role plus the equivalent ARIA range contract is exactly a stepper's, and RN has no separate spinbutton role to reach for.
- **Hiding them means taking them out of the tab order too**, which needs two props for two platforms: `focusable={false}` is what native reads, and react-native-web ignores it on a `Pressable` — it renders a real `<button>`, focusable by default — so the web needs `tabIndex` spelled out. Caught in the browser, where the buttons were `aria-hidden` and still `tabindex="0"`: focus stops that announce nothing, and three tab stops for one control.
- **It stops at its limits and looks like it.** The button that would cross a bound is disabled rather than pressable-and-ignored, and the announced range tells a screen reader the same thing. `min` and `max` default to concrete values (0 and 99) because an adjustable element has to announce a range, and a stepper with no limits is one that can't disable at them.
- **The arithmetic is a separate, tested module** (`step.ts`). `0.1 + 0.2` is `0.30000000000000004`, and a stepper that displays that is broken — the result is rounded to as many places as the widest of its inputs actually has, which is exact for any step a caller can reasonably pass and does nothing at all to whole numbers. Verified live: a `0.25` step walks 1 → 1.25 → 1.5 → 1.75 → 2 with no drift.
- **It moves the value rather than snapping it.** A stepper is controlled, so a `value` off the step grid is the caller's business and is left alone: `2.5` with a step of `1` becomes `3.5`, not `3`. (`Slider` does snap, because there the value comes from a continuous drag rather than from the caller.)
- **The value is drawn in tabular figures over a reserved width**, so the control doesn't resize as digits are added — measured at a steady 194px from 0 to 999. The reserved width is what actually guarantees that; `fontVariant` support varies across Android builds, so the figures are the braces and the width is the belt.
- **`label` is required**, because "3" read aloud says nothing about what three of, and `hideLabel` keeps it as the accessible name for a row that already says it visually — the same contract `Slider` has.

### `Avatar` — `src/components/avatar`

```tsx
import Avatar from "@/components/avatar";

<Avatar name="Ada Lovelace" source={user.avatarUrl} />
<Avatar name="Ada Lovelace" status="success" statusLabel="Online" />
<Avatar name="Design team" icon={<Icon name="users" />} size="large" />
```

The picture of a person or a thing, in a square: a list row's leading slot, a comment's author, the account button in a header.

- **The fallbacks are a stack, not a branch.** The monogram (or `icon`) is always rendered and the picture sits on top of it, so an avatar with no source shows initials, one whose source fails shows initials, and one that is _still loading_ shows initials until the picture arrives. There is no separate loading state to design, because the thing underneath is already the right thing to look at. `Image` owns the error detection and the log; this just declines its generic placeholder (`fallback={null}`) in favour of something that says who this is.
- **It reuses `Image`, so it reuses that cache** — no second one. An avatar URL warmed through `Image.preload()` is already warm here.
- **`name` does double duty on purpose**: it is the accessible name _and_ what the monogram is derived from, so the two can't disagree. `getInitials` (`initials.ts`, pure and separately tested) takes the first character of the first and last words and skips the middle ones — a monogram that grew with the length of someone's name would stop fitting the circle. It iterates code points rather than UTF-16 units, so `"🙂 Smith"` gives `🙂S` instead of half a surrogate pair, and it uppercases through the active locale, because that mapping isn't universal (Turkish `i` → `İ`).
- **The whole avatar is one accessibility element**, named from `name` with the status appended. The picture is `decorative` and the monogram is spread with `disabledA11yProps()`: a screen reader announcing "A L" would be reading the abbreviation instead of the person, and the monogram's larger sizes are title steps, which carry heading semantics in `Text` and have no business in a heading rotor. An avatar left with nothing to be called — no name and no status — is hidden outright rather than left as an element with an empty name, the treatment an unlabelled `Badge` dot gets. The label is joined from the parts that exist, so a nameless avatar with a status announces "Online" and not ", Online".
- **A `status` requires a `statusLabel`, in the types.** A dot is colour, and colour alone is not information (WCAG 1.4.1) — the same reason every `Toast` type carries an `announcement`. The dot is a `Badge`, sat over the square's corner with a ring in the page colour that cuts it out of the picture underneath. It's a sibling of the clipping surface rather than a child, or `overflow: "hidden"` would cut it in half, and it scales with the avatar — fixed at `Badge`'s own 8pt it vanishes on a large one.
- **The monogram doesn't scale with the OS text size** (`allowFontScaling={false}`). The square is a fixed graphic that has to line up down a list, so letters that grew would clip rather than help — and the name is available in full to anyone reading by screen reader. Everything else scales with the device through `units()` as usual.
- **The square sides (32/48/64) are local to this component** rather than entries in the sizes styleguide: nothing else in the app is measured in avatars, and the styleguide's own note says a bespoke measurement stays local. The status dot's side is chosen from `isRTL` rather than RN's `end`, which resolves through `I18nManager` and so lags a locale switch by a native reload — verified live by switching to العربية and watching the dot move from x=60 to x=10 on a 70px avatar.
- **There is no per-person colour tint.** Deterministic here means the _monogram_ is deterministic; tinting each avatar by a hash of the name would need a set of avatar colours in the palette and a contrast check for each of them against both schemes, which is a palette change rather than a component one. Every avatar uses `backgroundElement` over a `border` edge, the same surface `ImageFallback` and `Button`'s `secondary` use, and for the same reason.
- **It isn't pressable.** An avatar that navigates is a button with an avatar in it; wrap it rather than growing a second press channel here.

### `Badge` — `src/components/badge`

```tsx
import Badge from "@/components/badge";

<Badge value="Beta" type="info" />
<Badge count={unread} label={`${unread} unread`} type="error" />
<Badge count={1200} max={999} />                 // "999+"
<Badge dot type="success" label="Online" />
```

A small status marker attached to something else: an unread count on a tab, "Beta" beside a feature's name, a dot on an avatar. Content is a union of three shapes — `value` (text), `count` (a quantity), `dot` (no content at all) — so a badge carrying both a count and a caption, which has room for neither, won't compile.

- **It doesn't position itself.** A badge is sized by its own content and nothing more; where it sits — inline after a title, pinned to the corner of an icon — belongs to whatever owns both it and the thing it marks. An `anchor` prop would put one component in charge of another's layout, the trade `Spacer` and `Divider` also decline.
- **A filled badge is labelled in `background`, not `text`.** The semantic colours are tuned to contrast against the page — dark in the light scheme, light in the dark one — so using one as a _fill_ inverts the problem, and the token that still contrasts is the page colour it was measured against. `text` on `error` is 3.25:1 in light and 2.77:1 in dark, both under WCAG 1.4.3's 4.5; `background` on the same fills is 6.47:1 and 7.59:1, and the worst pair across all four types and both schemes is 6.47:1. Asserted per type, so a new palette can't quietly regress it.
- **`neutral` carries a border and the semantic types don't**, for the reason `Button`'s `secondary` does: its fill is `backgroundElement`, so on one of the app's raised surfaces it is the same colour as what's behind it and vanishes — which is exactly what a neutral dot did the first time the showcase rendered one on a card. The border is applied only where there is one rather than as a transparent edge everywhere, because `borderWidth` is drawn inside the box and a transparent one would quietly shrink the dot's coloured area.
- **A count of zero (or less) renders nothing at all.** "No unread" is not a thing to show a badge about, so the component returns `null` rather than a badge saying "0"; a caller who really does want a visible zero passes `value="0"`. Overflow is `max` (default 99) and the `badge.overflow` translation key, so a locale is free to put the "+" somewhere other than the end.
- **Counts go through `Intl.NumberFormat` keyed on the resolved locale** (`count.ts`, pure and separately tested). A thousands separator is a comma in `en` and a full stop in `de` — verified live by switching the showcase to Deutsch and watching `1,200` become `1.200` — and a locale that asks for its own numbering system gets its own digits. Hermes' `Intl` coverage varies by platform, so the `try`/`catch` falling back to plain digits is load-bearing rather than defensive.
- **An unlabelled dot is invisible to assistive technology.** With no text it has nothing to announce, so it goes through `disabledA11yProps()` and is hidden on every platform rather than left as an anonymous stop — the treatment `Spacer` and an unlabelled `Divider` get, asserted from both sides. A dot that _does_ mean something says so through `label` and is then announced like any other badge.
- **`label` replaces the announced text rather than adding to it.** "3" is no use read aloud, because its meaning is carried entirely by where it sits; pass a label whenever the badge isn't already inside something that names it. Omitted, the badge announces its own text and adds no duplicate.
- **Minimums, not a fixed size.** `minWidth`/`minHeight` are equal, so a single digit comes out square, and text that outgrows the box under large dynamic type makes the badge grow instead of clipping. Its corners are `radius.indicator`. The dot is the exception: it takes an exact size, scaling with the device but not with the OS text size, because there is nothing to read.
- There is no `primary` type: `primary` and `info` are the same value in both schemes, so it would be a second name for a badge that already exists.

### `Tag` — `src/components/tag`

```tsx
import Tag from "@/components/tag";

<Tag value="Design" />                                   // static: content, not a control
<Tag value="Unread" onPress={toggle} selected={unread} /> // a filter chip
<Tag value="Ada Lovelace" onClose={() => remove(ada)} />  // removable
<Tag value="Draft" icon={<Icon name="edit-3" />} size="small" />
```

A short piece of text in a pill: a keyword on an article, an applied filter, one of the recipients in a "To:" field. Three shapes out of two props — neither is static, `onPress` makes the body a control that can be `selected`, `onClose` adds the remove button — and both props together give one pill with two controls in it.

- **The remove button is its own target, never part of the body's.** A pressable body groups its children into one announcement, so a remove button _inside_ it would be unreachable to a screen reader, and the whole pill would carry two meanings on one tap — "apply this filter" and "delete it" — with no way to choose. They sit side by side instead, each with its own name; the test asserts exactly two controls and that pressing one never fires the other. Same rule `ListItem` states for a row that holds a control.
- **The remove button names what it removes** — "Remove Ada Lovelace", not "Close". A row of tags is a row of identical ✕ glyphs otherwise, and which one you're on is exactly what a screen-reader user can't see. The wording is a translation key (`tag.remove`, interpolating the value) in all ten locales, with `closeLabel` for product wording that differs.
- **`selected`, `label` and `closeLabel` are unions with the props they belong to**, so a static tag that reports itself as selected, or a `closeLabel` with no remove button to name, is a `tsc` error rather than a state nothing reads — the same construction `ListItem` uses for its inert/pressable split.
- **Both halves take the pill's full height**, so neither target is a fraction of what it looks like, and `size` defaults to `"medium"` — the 44pt touch target every other control in the app defaults to. `"small"` is the compact 32pt pill, best kept for static tags.
- **`borderRadius` is `radius.control`**, the same corner as every button and field, so a tag in a row of controls never looks like a different kit.
- **It sizes itself to its own text** (`alignSelf: "flex-start"`), unlike `Card` and `ListItem` which stretch — a tag is a word, and a row of them should read as a row. A tag longer than its container truncates rather than overflowing it: the body shrinks and the remove button never does.
- Colours come from the same tokens `Button`'s `secondary` uses — `backgroundElement` over a `border` edge — and a selected tag takes the `selected` tint with an `accent` edge and label rather than inverting into a solid block.

### `Section` — `src/components/section`

```tsx
import Section from "@/components/section";

<Section title="Notifications" description="Choose what reaches you.">
  <Switch value={push} onChange={setPush} label="Push" />
</Section>

<Section title="Recent orders" action={<Button value="See all" size="small" onPress={openAll} />}>
  <ListItem title="Order #12" />
</Section>

<Section title="Address" footer="Used for delivery only.">
  <Input type="text" label="Street" value={street} onChange={setStreet} />
</Section>
```

A titled group of related things: a block of settings, a fieldset, a "Recent orders" list with a "See all" beside it.

- **It draws no surface.** No fill, no border, no shadow — that is `Card`'s job, and a second component owning the same box is how two of them end up disagreeing about a radius. This owns the _structure_: a heading, the copy around it, and the gaps between them. Wrap it in a `Card` when the group should also look raised, and the two compose without either knowing about the other.
- **The heading level is counted, not passed.** A `Section` announces at level 2, because level 1 belongs to the screen and `Header` already claims it; a `Section` inside a `Section` announces at 3, and so on to 6 — through a context, so nobody writes a number. That matters because a hand-written level is right when it is written and wrong the first time a screen is rearranged, and the damage is invisible: an outline is only ever read through a screen reader's heading rotor. Verified in the browser, where the showcase produces a real `h1 → h2 → h3 → h4 → h5` document outline.
- **An untitled section still counts as a level.** A group that needs the gaps but not a heading is a real thing, and if it did not provide a deeper level the outline would silently flatten wherever a screen used one.
- **Size follows the level**, so a title looks like what it announces as — `title1` at level 2 down to `headline`, where it stops, since there is nothing smaller left that is still a heading. `titleType` changes the size without touching the level, the same split `Header` makes when it sets its `<h1>` in `headline`.
- **The level is declared explicitly rather than left to `Text`'s own type-to-level mapping.** That mapping stops at `title3`, so a fifth- or sixth-level heading set in `headline` would announce as plain text and drop out of the outline entirely.
- **Text slots are strings, control slots are nodes.** `description` and `footer` are strings because owning their typography is most of what this component is for; `action` is a `ReactNode` because it is whatever control the screen already uses. Anything richer than a footnote belongs in `children`, where it is content rather than a caption.
- **`title`, `description` and `action` are a union.** A `description` with no title has nothing to qualify and an `action` with no title has nothing to act on, so an untitled section cannot carry either — the same construction `ListItem` and `Header` use.
- **It is not an accessibility group.** Marking the whole thing `accessible` would collapse everything inside into one announcement and make the controls in it unreachable — the trap `Card` and `ListItem` both document. The heading is what gives a screen reader the structure, which is the same thing it gives a sighted reader.

### `Card` — `src/components/card`

```tsx
import Card from "@/components/card";

<Card>
  <Text value="Total" type="footnote" />
  <Text value="£42.00" type="title2" />
</Card>

<Card type="outlined" onPress={() => router.navigate("/orders/12")}>
  <Text value="Order #12" />
</Card>

<Card padded={false}><Image source={url} alt="Preview" /></Card>
```

A raised surface that groups related content. It owns the box and nothing else — no title, no footer, no slots; content is `children`, composed from `Text`, `Image`, `Spacer` and the rest, which is what keeps one component from growing a prop per layout anyone ever wants. `Accordion` (below) is the version that also owns a header, and stays separate for that reason.

| `type`     | fill                | border | shadow |
| ---------- | ------------------- | ------ | ------ |
| `elevated` | `backgroundElement` | no     | yes    |
| `outlined` | **none**            | yes    | no     |
| `filled`   | `backgroundElement` | no     | no     |

(Defaults to `elevated`. The table lives in code as `TYPE_CONFIG` — add a type by adding one entry there plus the literal in `CardType`.)

- **`outlined` has no fill at all, and that's the interesting one.** The other two fill with `backgroundElement`, the same token every other raised surface uses, so a card sitting on an `Accordion` or a `Modal` is literally the same colour as what's behind it — the trap `Button`'s `secondary` already documents. Filling `outlined` with `background` instead looks like the obvious fix and is the wrong one: on a dark scheme `background` is _darker_ than the raised surface, so the card reads as a well punched into the page rather than a thing resting on it. It came out as a black hole in a grey panel the first time it rendered on screen. Taking whatever is behind it and drawing only the `border` edge reads correctly on any surface in either scheme — checked in both.
- **The shadow is emitted in both spellings** (`shadow*` for iOS and web, `elevation` for Android) and is nearly invisible against a dark background whatever you do, which is why `elevated` also carries the raised _fill_ rather than leaning on the shadow alone to separate it from the page.
- **`padded={false}`** hands spacing to the content, for a card whose image or rows go edge to edge. The card clips to its edge (`overflow: hidden`) so that content stays inside its `radius.surface` corners and border.
- **`onPress` makes the whole card a single button**, named from the text inside it the way a labelled `Button` is (`label` overrides). That's the right shape for a card that navigates and the wrong one for a card with its own controls: `accessible` groups the children into one announcement, so a button nested inside a pressable card becomes unreachable. Put `onPress` on the inner control instead when the card holds more than one thing to do. Expressed as a union, so `label`/`disabled` can't be passed to a card that isn't pressable in the first place.

### `Accordion` — `src/components/accordion`

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

### `MediaPlayer` — `src/components/media-player`

```tsx
import MediaPlayer from "@/components/media-player";

<MediaPlayer type="video" source={url} label="Trip video" />
<MediaPlayer type="audio" source={url} label="Episode 12" loop />
<MediaPlayer type="video" source={url} label="Trailer" nativeControls />
```

One player for both kinds of media: `type="video"` renders a picture with the controls beneath it, `type="audio"` is the controls alone. Built on `expo-video` and `expo-audio`.

- **Two implementations, one transport.** The packages share no API — `expo-audio` hands back a reactive status object while `expo-video` reports through events, and a video has a view to mount where audio has nothing to show. Both are reduced to one `MediaTransport` (`playing`, `currentTime`, `duration`, `muted`, and four methods) and rendered by one `MediaControls`, so the play button, scrubber, clock and mute toggle can't drift apart between them — the same reason `Checkbox` and `Switch` share `BinaryControlRow`.
- **The scrubber is the app's own `Slider`**, so it arrives `adjustable` and keyboard-operable rather than being a bare track only a pointer can move. It announces the clock — "1:23 of 4:56" — instead of a raw second count, which is what a listener actually wants read back. That needed a new `hideLabel` on `Slider`: a slider has no text of its own for a screen reader to derive a name from, but the media bar already says what it is between a play button and a clock, so the name is kept and the visible text dropped.
- **The scrubber stays disabled until there's a duration.** A player reports `0` until it has read the media's length, and scrubbing a zero-length track divides by nothing. Verified in the browser: disabled with `aria-valuetext="0:00 of 0:00"` while loading, enabling itself to "0:00 of 0:05" the moment the source resolved.
- **`label` is required and not shown** — it names the whole player, which otherwise announces as a group of unlabelled buttons with no indication what they control. It goes on a plain labelled group, not an `accessible` one, which would swallow the buttons into a single announcement.
- **`nativeControls`** hands the picture to the platform's own video controls. Video only — there is no audio-only control surface to defer to. Off by default so a video and an audio player look and announce the same.
- **Mutating the player is the API.** Both packages expose mutable native objects (`player.loop = true`, `player.currentTime = 5`), which React Compiler's immutability rule can't tell apart from mutating a hook's return value by mistake — so the rule is disabled in those two files, with the reason recorded, rather than across the codebase.
- **A `mediaSurface` palette token** was added for the letterbox behind a `contain`-fitted video: black in both schemes, unlike every other surface, because a video's own black bars are what the eye expects and a light one reads as a rendering fault.
- **`expo-audio` and `expo-video` are stubbed in `jest.setup.js`**, beside the other native modules that can't load under Jest. Importing either throws otherwise, which reaches every test that renders a tree containing a `MediaPlayer` — the Showcase's included.

### `Markdown` — `src/components/markdown`

```tsx
import Markdown from "@/components/markdown";

<Markdown markdown={article.body} />
<Markdown markdown={source} selectable onLinkPress={openInSheet} />
```

Renders markdown as native text, wrapping [`react-native-enriched-markdown`](https://github.com/callstackincubator/react-native-enriched-markdown). Task lists, tables, code fences, streaming and selection menus are all the library's own API, passed straight through. The wrapper adds three things.

- **It looks like the rest of the app.** Every block is set in a step of the app's type scale and coloured from the theme (`style.ts`), rather than the library's own defaults — which would leave a paragraph of markdown a different size and colour from the `Text` beside it. `h1`–`h4` take the four title steps, the same mapping `Text` uses to decide heading semantics, so a markdown `#` and a `<Text type="largeTitle">` come out identical. `h5`/`h6` fall back to `headline`: the scale doesn't go six levels deep, and inventing two sizes to fill the gap would put values in the app that nothing else uses. Because it all comes from `useResponsive()`/`useTheme()`, markdown reflows with the device and the OS text-size setting and follows a scheme change for free — asserted in tests against the tokens themselves rather than against numbers.
- **Its screen-reader announcements are translated.** They're native-only — see the stripping note below; on web the library renders real HTML a screen reader reads directly. The library speaks "Bullet point", "List item 2", "Row 3: …" while navigating a document and ships them in English only, which in a ten-locale app is a defect you can't see. They come from the app's own catalogue, with the library's `{n}`/`{content}`/`{latex}` placeholders left intact for native to substitute at speak time — a test asserts they survive, since a translation that renames one silently loses the number.
- **A tapped link goes through the deep-link pipeline**, so `/orders/12` inside a document opens the same screen a push notification would and an external URL still opens in the browser. `onLinkPress` takes that over.
- **The style bridge disables `no-restricted-syntax` on two lines.** That rule exists to stop hand-picked type sizes; these are the opposite — read straight off the app's scale — and the numbers are unavoidable because the library takes a style shape of its own rather than an RN `TextStyle`, so a token can't just be spread in.
- **Native-only props are stripped on web.** The package ships a different component there: `index.web.js` exports the web renderer directly, bypassing the native wrapper, and that renderer destructures the twelve props it understands and spreads everything else onto a `<div>` — so a native-only prop reaches the DOM as an unrecognised attribute and React warns. `accessibilityLabels` did exactly that on every render. The wrapper drops the sixteen props the library's own types annotate `@platform ios, android`, taken from those annotations rather than guessed so the list is checkable when the package updates. Everything the web renderer does understand is left untouched, which its tests assert — stripping is for silencing a warning, not for breaking the component.
- **Jest**: the package ships its own mock (wired up in `jest.setup.js`, since the component is a native view), but it deliberately drops `markdownStyle`, `accessibilityLabels` and `onLinkPress` — exactly what this wrapper supplies — so the component's own tests swap in a stub that records what it was handed.

### `Image` — `src/components/image`

```tsx
import Image from "@/components/image";

<Image source={user.avatarUrl} alt={`${user.name}'s avatar`} style={styles.avatar} />
<Image source={require("...")} decorative style={styles.texture} />
<Image source={url} fallback={DEFAULT_AVATAR} alt="Profile photo" />

// from anywhere — no instance needed:
await Image.preload([urlA, urlB]);
await Image.cacheClear();
```

A wrapper over [`expo-image`](https://docs.expo.dev/versions/v57.0.0/sdk/image/) that adds the three things every call site would otherwise repeat. Everything else — `contentFit`, `transition`, `cachePolicy`, `placeholder`, `priority`, the load callbacks — is `expo-image`'s own API passed straight through; this is a wrapper, not a redesign.

- **A fallback for when there's nothing to show.** Kicks in when `source` is missing (`null`, `undefined`, `""`, `[]`) _or_ fails to load. `""` is the one worth naming: it's what a record with no picture looks like straight out of an API, and a plain `expo-image` sits on it forever loading nothing. The default fallback is a **themed placeholder** (`fallback.tsx`) rather than a bundled PNG — a fixed placeholder asset is one set of greys, so whichever scheme it wasn't drawn for gets a light patch in a dark UI exactly where something already went wrong. Pass `fallback={source}` for a specific picture instead (a default avatar, a branded product shot), or `fallback={null}` to render nothing.
- **`placeholder` and `fallback` are different things, and both are worth having.** A placeholder is what `expo-image` shows _while_ the real image loads and drops when it arrives; a fallback is what's shown when the real image is never going to arrive.
- **A failed source recovers when the source changes**, because the failure is recorded as a key derived from the source's _value_, not a boolean. That's not incidental: a call site passing `source={{ uri }}` makes a new object every render, so an identity-keyed reset would clear the flag right after each error and re-render into the same failing load forever.
- **Accessibility can't be forgotten.** `alt` and `decorative` are a union, not two optional props, so an image with neither is a `tsc` error — the same construction that makes an unnamed `IconButton` one. A described image gets `imageA11yProps()` (above) plus `expo-image`'s `alt`; a decorative one gets `disabledA11yProps()` and leaves the accessibility tree entirely. Every accessibility prop the component owns is `Omit`ted from its props type, so a caller can't half-override the set. **The description stays on the fallback too** — the image is gone, but what it was _for_ is still what the user needs to know about that spot, so it announces something missing rather than silently vanishing. Verified in the rendered DOM: a described image is `role="img"` with `alt="…"` on the `<img>`, a decorative one is `aria-hidden="true"` with neither, and a fallback placeholder keeps `role="img"` and its label.
- **Images are not native drag sources on web** (`draggable={false}` by default; pass `draggable` to opt back in). Browsers make every `<img>` an HTML5 drag source, and starting one cancels the pointer stream any gesture is reading — which silently broke dragging a `Carousel` whose slides were images. Traced in the browser: the pan fired `begin` then `end` with a translation of `0`, immediately after the browser's own `dragstart`; with the flag off the same drag runs uninterrupted. Native has no equivalent concept, so defaulting it off is also what makes web behave the way iOS and Android already did.
- **`Image.preload(urls, options?)`** warms the cache for images about to be needed — the next page of a feed, the photos behind a screen one tap away. Only remote URLs benefit; a `require()`d asset is in the bundle already. It resolves `false` if _any_ URL fails, and nothing treats that as fatal: a warm cache is an optimization, and a failed preload just means the image is fetched at render as it would have been anyway.
- **`Image.cacheClear(target?)`** empties `expo-image`'s caches — after a sign-out when images are user-scoped, or from a "clear cached data" setting. Both caches by default; `"memory"` or `"disk"` narrows it. It resolves `false` on web (which has no cache of `expo-image`'s own) and on Android when the activity is gone, so `false` means "nothing was cleared", not "something broke" — which is exactly what the Showcase shows when you press it in a browser.

### `Pagination` — `src/components/pagination`

```tsx
import Pagination from "@/components/pagination";

<Pagination label="Search results" value={page} total={40} onChange={setPage} />
<Pagination label="Results" value={page} total={40} onChange={setPage} compact />
<Pagination variant="dots" label="Slides" value={slide} total={5} onChange={setSlide} />
```

Which of these am I on, and take me to another one.

- **Two variants, because that question has two shapes.** `"numbers"` is the paged-data control — arrows, page numbers, gaps. `"dots"` is the position indicator for a small, known set, where the count matters more than the index. Dots have no arrows and no gaps: every position is a dot.
- **`Carousel` uses the `"dots"` variant.** It passes its own labels, so a dot announces "A pug wrapped in a blanket, Slide 2 of 4" rather than a number, and its private pagination wrapper is gone.
- **The dots are plain pressables, and that is the second version.** The first interpolated each dot off the carousel's animated `progress` so it would grow while the finger was still moving. It produced two iOS bugs in a row and was removed: the animation was worth less than a control that is reliably pressable.
- **The touch target is a real box, not `hitSlop`.** An 8pt dot needs a target several times its size, and `hitSlop` is the obvious way to get one — and the wrong one here, because dots sit a few points apart, so 16pt of slop overlapped every neighbour. Overlapping targets do not average out: the topmost wins, so on iOS every press landed on the last dot rendered and the earlier ones could not be pressed at all. Sizing the `Pressable` itself (32pt, 4pt apart) makes the targets tile instead of stack.
- **Neither web check could have caught that**, which is worth recording. `react-native-web`'s `Pressable` does not implement `hitSlop` at all — only its legacy `Touchable` references it — so on web the targets never overlapped and the bug did not exist. The first check compounded it by driving the dots with `element.click()`, which dispatches straight to the element and bypasses hit-testing entirely. Verified since with real pointer events at coordinates, recording which element each one reaches: clicks on dots 1, 4, 2, 1, 3 landed on exactly those dots, backwards moves included.
- **Fewer than two pages renders nothing at all.** A pagination bar for a single page is a control that cannot do anything, and it is the state a real screen spends most of its time in — an empty result set, a filter that narrowed to one page. Hiding it is the behaviour, not an oversight.
- **The width does not change as you page.** `paginationRange` returns a constant number of slots once there are enough pages to need gaps, so the button under your cursor stays where it is; a bar that reflows moves the target you were about to press. Verified at 121px and five number slots at every position from page 1 to 10 of 40, as the digits go from one to two.
- **A gap must hide at least two pages.** An ellipsis standing in for a single number takes the same room and tells the reader less. The bound is off-by-one-prone and was — the first version rendered `1 … 3 4 5 … 12` at page 4, where the gap hid only page 2, and a test caught it.
- **The arrows mirror in RTL.** Previous is a direction, not a glyph: in a right-to-left locale the earlier page is to the _right_, so a left-pointing chevron there means next. Read from `useIsRtl()` rather than automatic mirroring, which only lands after a native reload — the same reason `BackButton` does it.
- **The numbers wrap; the arrows do not.** Letting the whole row wrap put "next" alone on a second line at phone widths, where it reads as a different control rather than the other end of this one. `compact` — two arrows and "Page 3 of 20" — is the better answer when there is genuinely no room.
- **`value`/`onChange`, not `page`/`onPageChange`.** The same pair `Checkbox`, `Switch`, `Slider`, `SegmentedControl`, `Stepper` and `Input` take, so a controlled component reads the same wherever you meet one. `value` is 1-based — the number the reader sees, not an array index — and carries none of the zero-based implication `index` would. The active item is wider or recoloured depending on the variant, so state survives greyscale (WCAG 1.4.1).
- **Every item announces its position**: "Page 3 of 20", not "3", because a screen-reader user has no visible row to read it among — and `getItemLabel` lets a carousel say "A pug wrapped in a blanket, Slide 2 of 4" instead. The current item is marked selected. The bar itself is not `accessible`: that would collapse its buttons into one announcement and make them unreachable, the trap `Card` and `ListItem` both document.
- **Out-of-range input is clamped, not trusted.** A `page` past the end selects the last page and disables "next" rather than rendering a bar with nothing selected.

### `Carousel` — `src/components/carousel`

```tsx
import Carousel from "@/components/carousel";

<Carousel
  data={photos}
  label="Trip photos"
  slideLabel={(photo) => photo.caption}
  renderItem={({ item }) => <Image source={item.url} alt={item.caption} />}
  style={styles.carousel}       // must give it a height — see below
  loop
/>

<Carousel data={steps} label="Onboarding" hasPagination={false} renderItem={renderStep} />
```

A wrapper over [`react-native-reanimated-carousel`](https://rn-carousel.dev/) (v5, whose peer deps — Reanimated 4, Worklets, Gesture Handler — this project already had). `loop`, `autoplay`, `itemSize`, `layout`, `animation`, `snapMode`, `orientation` and the render callbacks are the library's own API, passed straight through; the wrapper adds pagination and accessibility.

- **`hasPagination`** (default `true`) shows one dot per slide. On by default because a carousel's remaining content is off-screen by definition — without dots nothing says it exists or how much of it there is. The dots are this app's own `Pagination` in its `"dots"` variant — the private `pagination.tsx` that used to live here is gone, and with it the `progress` shared value it interpolated each dot from. They follow the settled slide instead, which is what made them reliably pressable on iOS; see `Pagination` above for what that cost. The active dot is **recoloured**, and the carousel passes `slideLabel` through so a dot announces what it goes to rather than a number.
- **`style` has to give the carousel a height.** Its slides are absolutely positioned — that's how the library animates them — so they can't stretch their container the way ordinary children would, and an unsized carousel renders as an empty box. The dots share that same box.
- **A carousel is driven by a pan gesture, which no screen reader can perform.** Left alone it's a region whose content silently changes and that a VoiceOver or TalkBack user can never move through. Two things fix that, both on by default:
  - The region is `accessibilityRole="adjustable"` with increment/decrement actions wired to the carousel's own `next()`/`prev()`, so the native swipe-up/swipe-down gesture changes slides. Its `accessibilityValue` carries the position, which both platforms re-announce as it changes. A one-slide carousel gets neither — offering gestures that can't do anything is worse than offering none.
  - The pagination dots are real buttons that jump straight to a slide. That's the ARIA "slide picker" pattern and the one navigation path that behaves identically everywhere, which is why turning pagination off is a visual decision worth making deliberately.
- **On web the region is additionally `role="group"` with `aria-roledescription="carousel"`** — the ARIA authoring-practices spelling for exactly this widget, which native has no equivalent of. Same two-spellings-because-neither-covers-both split as the rest of `@/features/accessibility`. Verified in the rendered DOM, along with the announcement updating live: pressing the fourth dot moved `aria-valuetext` to `"A forest road in the fog, Slide 4 of 4"`.
- **`slideLabel(item, index)`** names what's _on_ a slide. The active slide's own content is already reachable — the library mounts every slide at once but marks all but the current one `aria-hidden`, confirmed in the DOM — so this isn't rescuing hidden content. It names the two things that _describe_ the carousel rather than being it: the region's announcement becomes "A pug wrapped in a blanket, Slide 2 of 4", and each dot says where it goes instead of only which number it is. Without it both fall back to the position alone.
- **Known gap, web only:** the library's dots set their current-slide state through `accessibilityState={{ selected }}` and nothing else, and react-native-web 0.21 renders only the `aria-*` form — the same finding this project already documented for `Button` — so `aria-selected` never reaches the DOM. Native is unaffected. It degrades rather than breaks: the region's own `aria-valuetext` still announces which slide is current, so the information is available, just not from the dot itself. Patching it needs `patch-package` against the library's minified `lib/` build (its unminified `src/` is not what the bundler resolves — verified), which didn't seem worth the maintenance for a redundancy gap; say the word and it's a small patch.
- **Images inside slides must not be native drag sources.** An `<img>` that the browser can drag hijacks the pan the moment the pointer moves, so the carousel just snaps back — this is why `Image` now ships `draggable={false}` (above). A slide rendering a raw `expo-image` or `<img>` of its own needs the same flag.
- **Jest can't drive it.** Under `react-native-reanimated/mock` nothing animates, so the library never settles a slide and `onSnapToItem` never fires. The tests cover every piece of wiring the wrapper owns — the region's accessibility props, the pagination, and that the controls reach the library's handle (spying on the very object `useImperativeHandle` hands the caller) — and the parts that need real motion are verified in the browser instead.

### `SegmentedControl` — `src/components/segmented-control`

```tsx
import SegmentedControl from "@/components/segmented-control";

<SegmentedControl
  label="View"
  value={view}
  onChange={setView}
  options={[
    { value: "day", label: "Day" },
    { value: "week", label: "Week" },
    { value: "month", label: "Month" },
  ]}
/>

<SegmentedControl type="expo" label="View" value={view} onChange={setView} options={options} />
```

A row of mutually exclusive options with exactly one chosen — for switching between a handful of views or modes, where a `Select` would hide the alternatives behind a tap and a radio list would spend a whole column on them. App-owned by default, with Expo UI's platform control (`@expo/ui/community/segmented-control`) behind `type="expo"`, the same switch `Switch`, `Checkbox`, `RadioButton` and `Slider` use.

- **`options` follows `SelectOption`'s split**: `value` is what `onChange` reports and what `value` is matched against, `label` is the only thing shown — so the stored value stays a stable code while the visible text is free to be translated. A `value` matching no option leaves everything unselected rather than throwing, the same degrade-don't-crash rule `Select`'s placeholder follows, so a stale value out of storage doesn't take the screen down.
- **Pressing the current segment reports nothing.** It isn't a change, and firing `onChange` for a value the caller already holds turns an idle tap into a state update — and, for a call site that persists on change, into a write.
- **Accessibility is a `radiogroup` of radios, not a row of buttons.** Each segment announces as a radio with its checked state, inside a group named by the required `label`; a screen reader then says what the choice is for, which option this is, and whether it's checked. Announcing each as an unrelated "button, selected" would lose the fact that picking one unpicks the rest. Verified in the rendered DOM: `role="radiogroup"` with `aria-label` on the track, `role="radio"` with `aria-checked` on every segment, and `aria-disabled` on both.
- **The selected segment is tinted and underlined, not inverted.** It takes the `selected` tint, an `accent` bar along its bottom edge, and a `text` label where the rest are `textSecondary`. A solid `primary` or `text` block was the loudest thing on any screen, most of all in the dark scheme; the bar alone clears the 3:1 WCAG 1.4.11 asks of the only thing marking the choice, and as a shape it survives greyscale and a colour-blindness filter.
- **A single option can be disabled** (`options[n].disabled`) as well as the whole control. A disabled segment is dimmed as well as unpressable — one unavailable choice among available ones is otherwise indistinguishable until you tap it and nothing happens.
- **Two things `type="expo"` can't do**, by the native control's design rather than an oversight: it addresses segments by index off a flat `values: string[]` (so `value` is resolved to an index in and back out — going through the index rather than its `onValueChange`, which reports the visible _label_, keeps two same-labelled options distinguishable and leaves the label free to be translated), and it has no per-option `enabled`, so `options[n].disabled` is ignored there. Reach for the custom implementation when one choice needs to be unavailable.

### `Grid` — `src/components/grid`

```tsx
import { Cell, Column, Row } from "@/components/grid";

// 12-column layout, reflowing by breakpoint
<Row gap={spacing.x12}>
  <Cell columns={{ phone: 12, tablet: 6 }}><Card /></Cell>
  <Cell columns={{ phone: 12, tablet: 6 }}><Card /></Cell>
</Row>

// A uniform tile grid — columns alone, no per-cell props
<Row columns={{ phone: 2, tablet: 4 }}>
  {tiles.map((t) => <Cell key={t.id}><Tile {...t} /></Cell>)}
</Row>

// Column is Row's transpose: it stacks blocks down the page
<Column gap={spacing.x16}>
  <Row>…</Row>
  <Row>…</Row>
</Column>
```

Three pieces: **`Row`** places cells across and divides into `columns` (default 12), **`Cell`** occupies `columns` of them (default 1), **`Column`** stacks blocks down. Cells wrap onto new lines on their own, so one `<Row>` holds a whole grid — the same auto-placement CSS Grid does, and one less level of nesting than a container/row/cell hierarchy. Both `columns` props accept a plain number or a per-breakpoint map.

- **Why `columns` on both, and not `span`.** A bare `span` doesn't say span _of what_, or along which axis — `<Cell span={6}>` could plausibly mean six columns, six rows, or six pixels. Using `columns` on the cell reads one level down from the row's own: a row _has_ twelve columns, a cell _takes_ six of them. They're separate components, so there's no ambiguity at a call site — `<Row columns={12}><Cell columns={6}>` states the whole relationship in two props with one word.
- **`Column` means the direction, never the count.** "Column" does double duty in every grid system that has both — a vertical arrangement, and a subdivision of a row. The rule here: the _component_ always means the direction, the _count_ is always a `columns` prop.
- **`gap` is the prop, but not the implementation — and that's the whole design.** A cell occupying half a 12-column row is `width: "50%"`. Set RN's own `gap` style between cells and two of them no longer fit on one line (50% + 50% + the gap overflows), so everything wraps one-per-line and the grid silently stops being a grid. The usual escapes are to measure the row and compute exact pixel widths — an extra layout pass plus a visible reflow before the first measurement — or a `calc()` RN doesn't have. Instead each cell carries **half** the requested gap as padding on all sides, and the row cancels the resulting outer edge with a matching negative margin. Widths then sum to exactly 100%, wrapping is exact, adjacent cells sit a full gap apart, and nothing needs measuring. It works because RN lays out border-box, so padding is inside the declared width rather than added to it. `Column` has no such arithmetic — its children are stacked, not sized as percentages — so there it really is RN's `gap`.
- **Verified by measurement, not by eye.** At a 1100px window the four `columns={{ phone: 12, foldable: 6, tablet: 3 }}` cells came out 252.25px each inside a 1009px row — 4 × 252.25 = 1009 exactly, four per line, with 6.5px padding a side (half the 13px scaled gap). The same cells go two per line at 700px and one per line at 500px, summing to the row width at every step.
- **`columns` is clamped to the row's column count**, so a cell asking for more columns than exist becomes a full-width line instead of overflowing. `<Cell>` outside a `<Row>` throws rather than silently laying out wrong.
- **There's deliberately no row-spanning counterpart.** Rows here come from flex wrapping, and a wrapped flex line has no concept of a cell reaching into the line below. True two-dimensional spanning needs absolute positioning off a measured row height — a different and much heavier component than this one.
- **RTL-aware** — `Row`'s `flexDirection` flips, so cells fill from the right in an RTL locale.

**The layout arithmetic is not in the components.** `createGridMetrics(columns, gap)` and its hook `useGridMetrics()` live in `features/responsive` and return the whole calculation — the resolved column count, the gap, each cell's half-gap `cellPadding`, the container's cancelling `edgeOffset`, and `widthFor(n)` for a cell's percentage width (clamped, so an over-wide or zero request can't produce a broken value). `Row` calls the hook and shares the result with its cells through context; `Cell` does no arithmetic of its own. Anything else that wants to sit on the same grid without being inside a `<Row>` — a standalone card that should be a third of the screen, a modal sized to eight columns — can call it directly. The pure function is covered by its own tests, including that a full line of cells sums to exactly 100%.

**`ResponsiveValue<T>` / `resolveResponsive()`** (`features/responsive`) are the primitive underneath, and are useful well beyond the grid: a value that's either fixed or a per-breakpoint map, resolved **mobile-first**. A breakpoint with no entry inherits the nearest narrower one that has one, so `{ phone: 12, tablet: 6 }` means 12 on phone _and_ foldable, then 6 on tablet _and_ desktop — a map only names the widths where something actually changes. It never cascades downward: `{ desktop: 4 }` on a phone falls back rather than reaching up. `BREAKPOINT_ORDER` drives the cascade and is derived by sorting `BREAKPOINTS` on its own thresholds, so a new breakpoint slots in at the right place without the order being restated.

### `Divider` — `src/components/divider`

```tsx
import Divider from "@/components/divider";

<Divider />
<Divider label="or" />
<Divider inset="x16" />              // clears the leading edge
<Divider orientation="vertical" />
```

A rule between things: between list rows, between sections of a form, between two columns.

- **An unlabelled divider is invisible to assistive technology.** It's a drawn boundary and nothing more — the grouping it suggests is already carried by the content either side — so it goes through `disabledA11yProps()` and is hidden on every platform rather than left as an empty stop a screen-reader user swipes past. Same treatment `Spacer` gets, for the same reason, and asserted from both sides in the tests.
- **A labelled one is not.** "or", "Today", "3 more" is content, so the label is announced and it's the two rules either side that become the decoration. They each take an equal half of what the label leaves, so it sits centred however long it is — measured in the browser at 160px + label + 160px in a 349px row.
- **`inset`** leaves both ends clear, as a step of the spacing scale (`SpacingToken`) or a raw px value, and follows the orientation: horizontal margins on a horizontal rule, vertical on a vertical one, so it always clears the ends rather than the sides. That's what lines a list rule up with the text instead of running under the avatars — verified live at 347px with no inset, 313px at `x16`, 263px at `x40`.
- **`label` and `orientation="vertical"` are mutually exclusive in the types**: a vertical rule has no room for text, and turning text sideways is a different component's problem.
- `List`'s `ItemSeparatorComponent` in the Showcase and stories now uses it, replacing the inline separator `View`s written before it existed.

### `Spacer` — `src/components/spacer`

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

### `Screen` — `src/components/screen`

```tsx
<Screen>…</Screen>              // centred, fills the viewport
<Screen scrollable>…</Screen>   // scrolls, content starts at the top
```

The app's layout primitive: fills the viewport, applies `theme.colors.background`, and pads with `spacing.x16`. `scrollable` swaps the `View` for a `ScrollView` and drops the vertical centring — content that can outgrow the viewport has to start at the top, or the first screenful gets pushed off the top edge as it grows. The showcase uses it; a short screen shouldn't.

### Deep links — `src/features/deep-links`

```
src/features/deep-links/
  routes.ts        The app's link table — the one place to add a link
  registry.ts       The pipeline: match, gate, dispatch. `deepLinks` + `deepLinkEvents`
  deep-links.tsx    <DeepLinks> — subscribes to incoming URLs. Mounted in providers.tsx
  native-intent.ts  Native Router interception, reusable by branded app entry points
  url.ts            Any URL shape → an app path + query
  match.ts          `/orders/:id` → captured params
  queue.ts          Links held until their gates open
  types.ts          DeepLink, DeepLinkRoute, DeepLinkGate, DEEP_LINK_GATES
```

```ts
import { deepLinks } from "@/features/deep-links";

// Declared once, in routes.ts:
{ pattern: "/orders/:id", handle: ({ params }) => `/orders/${params.id}` }
{ pattern: "/promo/:code", handle: ({ params }) => Modal.show(`promo-${params.code}`) }
{ pattern: "/account", gates: ["auth"], handle: () => "/account" }

// Dispatched from anywhere — a tapped push notification, a toast action:
deepLinks.open(url);

// Released when the app says the condition is met:
deepLinks.setGate("auth", true);
```

**One pipeline, whatever raised the link.** `<DeepLinks>` (mounted in `providers.tsx`) owns the feature's `Linking` subscription and reads the URL the app was launched with, handing both to `deepLinks.receive()`. It clears Expo's cached launch URL after reading it and the registry deduplicates initial URLs, so a development remount or the two native initial-URL readers cannot replay one launch intent. Links the app raises itself never reach the OS, so they call `deepLinks.open()` and run exactly the same handlers.

**One native navigation owner.** [`src/app/+native-intent.tsx`](src/app/+native-intent.tsx) is intentionally only an import/export of the reusable implementation in [`native-intent.ts`](src/features/deep-links/native-intent.ts). A branded app can keep its own app entry point and reuse the feature unchanged. The implementation asks whether the registry claims the URL: a registered command returns `null`, preventing Expo Router from navigating to the original URL; an ordinary route is returned unchanged for Router to resolve by file. `<DeepLinks>` receives the same registered URL and dispatches it after its gates open, so a handler that returns an href is its only navigation rather than a second navigation racing Router.

The two programmatic entry points still differ on unregistered paths:

|                           | Path a route claims | Path no route claims                             |
| ------------------------- | ------------------- | ------------------------------------------------ |
| `receive()` — from the OS | Runs the handler    | **Left alone** — Router owns ordinary route URLs |
| `open()` — from the app   | Runs the handler    | Navigates, letting the router resolve it by file |

On web, `+native-intent` does not run. Expo Router resolves the browser location first, so authentication must also be enforced by the protected route/layout itself; a deep-link gate postpones its command handler, not web route rendering. Registered side-effect-only web URLs should therefore also have a real route (or a root-layout redirect) rather than relying on a non-existent path.

**Any link shape.** `url.ts` reduces all four of these to the same `/orders/12`:

| Shape                           | Where it comes from                              |
| ------------------------------- | ------------------------------------------------ |
| `myapp://orders/12`             | A custom-scheme deep link, as the OS delivers it |
| `myapp:///orders/12`            | `Linking.createURL()`'s triple-slashed spelling  |
| `https://example.com/orders/12` | A universal link (iOS) / app link (Android)      |
| `/orders/12`                    | A bare path inside a payload — a push, a toast   |

`https://` is accepted for a host in `EXPO_PUBLIC_APP_LINK_DOMAINS` (`app.config.ts` turns the same list into the `associatedDomains` and verified intent filters that make a native OS deliver those links) or for the web build's current origin, including localhost. Anything else — another app's scheme, a site we don't own — is _not_ ours, and `deepLinks.open()` hands it to the OS with `Linking.openURL` instead. One call site can therefore take any link at all without knowing in advance whether it points inside the app. Programmatic fallback navigation preserves repeated query parameters rather than reducing the link to its pathname.

The URL is split by hand rather than with `URL` or `Linking.parse`. React Native's global `URL` is a regex shim whose `hostname`/`pathname` only match `https?://`, so it reports an empty host and a path of `/` for exactly the custom-scheme links this exists to handle; `Linking.parse` is built on that same `URL` and additionally reads `expo-constants`, which makes it throw where those aren't populated.

**Postponed links — gates.** Every route can name conditions it needs before its handler runs; a link that arrives while any of them is closed is held in memory and dispatched the moment they all open. Up to ten pending intents are retained, with the oldest discarded if an eleventh arrives. `gates: ["auth"]` is the "handle this only once the user is signed in" case, and `deepLinks.setGate("auth", true)` after a sign-in releases it. Native registered commands are also suppressed by `+native-intent` while waiting; protected web routes still need their own layout-level authentication guard.

`ready` is built in and applies to _every_ link. `<DeepLinks>` opens it once the navigation tree exists, which is what makes a launch URL safe: it's read while Expo Router is still working out its initial state, so the handler waits rather than calling `router.navigate` into a navigator that doesn't exist yet. The queue is deliberately in-memory — a held link is a _this-launch_ intent, and persisting it would mean a link tapped last week reopening a screen out of nowhere. An app that wants an invite to survive an install should persist that one link itself with `LocalValue` and its own expiry, then hand it back through `deepLinks.open()`.

**Watching rather than handling.** `deepLinkEvents` (an `@/features/event-bus` bus) emits `handled` and `deferred` for every link — the hook for analytics counting deep-link opens, or a debug screen. The showcase's Deep links section uses it to keep its "waiting on a gate" readout live.

**Web.** `Linking.getInitialURL()` returns `window.location.href` there, so a page load runs through the same pipeline as a native launch — handlers fire on web too, alongside the router rendering the route.

### `Root` — `src/root`

```
src/root/
  index.tsx       Root — mounted once in src/app/_layout.tsx: <Root><Stack /></Root>
  providers.tsx    Providers — every context provider (safe area, accessibility, theme, locale, ...)
  testing.tsx       render()/screen/etc. wrapping Providers, for tests
```

`Root` wraps `Providers` and is the single place for:

- context providers every screen needs — add a new one to `providers.tsx` only, alongside the two app-lifetime services that live there (`Permissions`, `DeepLinks`)
- global overlay UI rendered above the current screen (toasts, modals, ...)
- global listeners/services that should run for the app's lifetime (analytics init, push notification listeners, app-state listeners, ...) — wire these up here via `useEffect` once there's a concrete one to add

**Providers are centralized on purpose.** Both Storybook preview configs (`.storybook/preview.tsx`, `.rnstorybook/preview.tsx`) decorate every story with `<Providers>`, and every component test imports `render`/`screen`/etc. from `@/root/testing` instead of `@testing-library/react-native` directly:

```tsx
import { render, screen } from "@/root/testing";
```

That `render` is a drop-in replacement that already wraps the tree in `Providers`. Adding a new provider in `providers.tsx` — a state provider, an auth provider, whatever comes next — makes it available to the real app, every Storybook story, and every test's `render()` in one edit; no per-file changes needed. (`src/root/index.test.tsx` is the one exception — it tests `Root` itself, so it renders unwrapped, via `@testing-library/react-native` directly.)

`Root` and `Providers` also accept an optional `config` object. Core defaults remain intact; an app can layer in its palette tokens and its own namespaced strings without editing `core`:

```tsx
<Root
  config={{
    theme: { overrides: { light: { primary: "#2a6dff" } } },
    locale: {
      translations: {
        en: { app: { home: { title: "Home" } } },
        uk: { app: { home: { title: "Головна" } } },
      },
    },
  }}
>
  <Stack />
</Root>
```

Theme overrides are partial and fall back to the core palette. Locale catalogs are deep-merged per shipped locale; app-owned keys must be nested under `app.*`, while core strings can be intentionally overridden when necessary.

It's not a route or a reusable UI component — it's app composition root, kept separate from `components/` for that reason.

## Scripts

| Script                            | What it does                                                            |
| --------------------------------- | ----------------------------------------------------------------------- |
| `yarn start`                      | Metro, choose platform interactively (opens Expo Go)                    |
| `yarn web` / `ios` / `android`    | Run on a given platform (ios/android build a real dev client)           |
| `yarn lint`                       | ESLint (`expo lint`)                                                    |
| `yarn typecheck`                  | `tsc --noEmit`                                                          |
| `yarn test`                       | Jest                                                                    |
| `yarn format` / `format:check`    | Prettier write / check                                                  |
| `yarn secretlint`                 | Scan the repo for committed secrets                                     |
| `yarn storybook`                  | On-device Storybook (Metro, opens on whatever device/emulator you pick) |
| `yarn storybook:ios` / `:android` | On-device Storybook, direct to one platform                             |
| `yarn storybook:web`              | Web Storybook (Vite) at `localhost:6006`                                |
| `yarn storybook:web:build`        | Build the web Storybook for static hosting                              |

## Storybook

Two separate setups, both driven by the same `*.stories.tsx` files under `src/`:

- **On-device** (`.rnstorybook/`): `yarn storybook[:ios|:android]` sets `STORYBOOK_ENABLED=true`, which makes `metro.config.js` swap the app's entry point for the Storybook UI — the regular `yarn ios`/`yarn android`/`yarn web` builds are unaffected when the flag isn't set.
- **Web** (`.storybook/`): a separate Vite-based build (`@storybook/react-native-web-vite`), since MMKV doesn't exist on web. `.env` is loaded manually here (Vite doesn't do Expo's env inlining) — see the `viteFinal` hook in `.storybook/main.ts`.

## Git hooks

Set up via [husky](https://typicode.github.io/husky) + [lint-staged](https://github.com/lint-staged/lint-staged), rooted at the repo root's `.git` even though `package.json` lives in this `core/` subdirectory (see `prepare` script and `core/.husky/`).

- **pre-commit**: formats and lints staged files, and scans staged files for secrets ([secretlint](https://github.com/secretlint/secretlint)).
- **pre-push**: full `lint` + `typecheck` + `test`.

## Learn more

- [Expo documentation](https://docs.expo.dev/)
- [Expo Router](https://docs.expo.dev/router/introduction/)
- [react-native-mmkv](https://github.com/mrousavy/react-native-mmkv)
- [Storybook for React Native](https://github.com/storybookjs/react-native)
