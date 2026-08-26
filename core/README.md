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
app.config.ts          Expo config — reads name/slug/scheme/bundleId from src/constants/env
metro.config.js         Wraps Metro with Storybook's entry-swap (see Storybook below)
src/
  app/                   Routing only (Expo Router) — each route file re-exports a screen
  root/                   Root — wraps the router; see below
  screens/<name>/        One folder per screen, index.tsx is the screen component
  screens/home/sections/  One file per showcase section — see "The app" below
  components/<name>/     One folder per component: index.tsx, index.stories.tsx, index.test.tsx
  features/storage/       LocalValue<T> — a small MMKV-backed reactive value primitive
  constants/env/          Validated EXPO_PUBLIC_* env vars, used by both app code and app.config.ts
```

Every screen/component/feature-value lives in its own folder with a single `index` entry point; all imports go through that folder path (e.g. `@/components/text`), not into its internals. Components ship with a co-located Storybook story and a Jest smoke test that follows the same pattern:

```ts
import Component from "./index";

describe(`${Component.name} smoke test`, () => {
  /* ... */
});
```

## The app

The app itself is a **showcase**: one collapsible section per feature or component, so everything below can be seen running rather than only read about. Sections are ordered foundations-first — the styleguides and app-wide settings everything else is built on, then the components that consume them.

| Section          | What it demonstrates                                                                            |
| ---------------- | ----------------------------------------------------------------------------------------------- |
| Typography       | All 11 type-scale entries at their own size, with the title sizes as real headings              |
| Theme & colors   | `ThemeSwitcher`, the resolved scheme/preference, and a swatch per palette key                   |
| Localization     | `LocaleSwitcher`, a translated sentence, and the resolved locale/RTL state                      |
| Accessibility    | A live readout of every OS flag, `fontScale`, and `duration()`                                  |
| Responsive units | Window size, breakpoint, `units(16)`, the spacing scale drawn to width, named sizes             |
| Grid             | 12-column spans, per-breakpoint spans that reflow on resize, and a tile grid                    |
| Icons            | One glyph from each of the five families, the custom SVG set, colour and size overrides         |
| Buttons          | The full type × size matrix, a real segmented control (so `selected` moves), and a disabled row |
| Inputs           | All three variations, secure entry, a disabled field, live validation, and ref-based focus      |
| Modals           | All four types, opened by `id` _and_ by ref, with `onShow`/`onClose` shown live                 |
| Storage          | `Counter` (reactive `.useValue()`) beside imperative `.setValue()`/`.getValue()`/`.reset()`     |
| Utilities        | `If` toggling content, and a scoped event bus emitting and counting pings                       |

Each section is its own file under `src/screens/home/sections/`. They're screen-local — the showcase is their only consumer — but split for the same reason `Modal`'s internals are: one file per concern beats one file that renders eleven. The section list itself is a table in `screens/home/index.tsx`, so adding one is an entry there plus a file.

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
- `colors` — the current palette (`ThemeColors`: `background`, `text`, `textSecondary`, `backgroundElement`, `backgroundElementSelected`, `error`, `primary`, `onPrimary`), sourced from [`palette.json`](src/features/theme/palette.json). Swap that file for a rebrand/different palette without touching any other file — `colors.ts` validates both `light` and `dark` have every required key and throws a clear error naming the missing one otherwise. (It's `palette.json`, not `colors.json` — Metro and Vite disagree on `.ts` vs `.json` priority for a bare `./colors` specifier, so a same-basename pair resolves to the wrong file depending on which bundler is running; keep the JSON's basename different from `colors.ts`.)

- **`primary`/`onPrimary` are an accent pair, not two independent colors.** `primary` is the high-emphasis accent (`Button`'s `primary` fill and `tertiary` label); `onPrimary` is the only color guaranteed legible _on_ it. A rebrand has to move both together — changing `primary` alone is exactly the edit the contrast test below exists to catch.
- **[`colors.test.ts`](src/features/theme/colors.test.ts) enforces WCAG contrast on the palette itself**, so a palette edit can't quietly ship an unreadable combination: every foreground (`text`, `primary`, `error`) clears 4.5:1 against both surfaces the app paints text on, `onPrimary` clears it against a `primary` fill, and `textSecondary` clears the 3:1 that WCAG 1.4.11 asks of a control outline against all three fills. It reimplements the luminance math rather than importing it — the point is to check the palette independently. Two real failures were found this way and fixed rather than waived: the accent was 4.17:1 as a label on `backgroundElement` (the Accordion/Modal surface `tertiary` buttons actually sit on), and `error` was 3.90:1 on the same surface. `backgroundElementSelected` is deliberately excluded from the _text_ checks — it's a pressed/selected fill, and the only type that uses it labels itself in `text`; holding every foreground to 4.5:1 against it as well would force the accent several steps paler than any surface in the app needs.

`ThemeProvider` and a `ThemeSwitcher` component (`src/components/theme-switcher`, wired into the Home screen) are both included; `Text`, `Screen`, and `Icon` (default `color`) already consume `theme.colors`.

### Localization — `src/features/localization`

```tsx
import { useLocale } from "@/features/localization";

const { locale, isRTL, preference, setPreference, t } = useLocale();

t("common.close"); // "Close" / "Cerrar" / "关闭" / ... depending on locale
t("home.summary", { name: "Ada", age: 30, email: "a@b.c" }); // {{token}} interpolation
```

Six locales ship out of the box — `en` (English), `uk` (Ukrainian), `es` (Spanish), `zh` (Chinese), `ja` (Japanese), `ar` (Arabic, the only RTL one) — plus a `"system"` preference (default) that follows the device's own language list via [`expo-localization`](https://docs.expo.dev/versions/v57.0.0/sdk/localization/), falling back to `en` if none of its languages are supported. Same shape as `ThemeProvider`/`useTheme()` end to end: `LocalePreference = LocaleCode | "system"`, persisted via `LocalValue` (`"locale-preference"`), `LocaleProvider` added to `Providers` alongside `ThemeProvider`. A manual choice outranks the OS from then on — see the OS-tracking bullet below.

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
- **`{{token}}` interpolation** is a single `String.prototype.replace` in `translate()` — deliberately not a full ICU/plural-rules engine, since nothing in this app's copy needs pluralization yet; `t("home.summary", { name, age, email })` is the one interpolated string, used for the Home screen's live form-values readout.
- **`LOCALES`** (`types.ts`) is the hand-authored display-name table — `code`, `englishName`, `nativeName` (what `LocaleSwitcher` actually renders — a language's own name for itself, not translated through `t()`), and `rtl`. Cross-checked on load against `Object.keys(translations)` so a locale can't have one without the other (a JSON file with no `LOCALES` entry, or vice versa) without an immediate, clear error.
- **`LocaleSwitcher`** (`src/components/locale-switcher`, wired into the Home screen's "Counter & Theme" section next to `ThemeSwitcher`) renders one button per `LOCALE_PREFERENCES` entry (every locale's `nativeName`, plus `t("locale.system")`), same selected/`onPress` pattern as `ThemeSwitcher`.

**RTL** is the one place native and web genuinely can't share a code path, and `rtl.ts`'s `syncRTL()` is deliberately small so that split is easy to see:

- **Web**: sets `document.documentElement.dir` directly. CSS flexbox mirrors `flexDirection: "row"` off the element's own computed `direction` natively — no `I18nManager` involvement needed at all — so this alone re-mirrors every row layout (headers, button rows, `Input`'s `leftSlot`/`rightSlot`) live, with no reload. Verified live: switching to Arabic instantly mirrors the Home screen — title, every accordion header/chevron, every button row, and `Input`'s icon slots all flip from the left to the right side, text right-aligns, all without a reload.
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
- **Both `accessibilityState` and `aria-*` are emitted, on purpose.** `accessibilityState` is what native reads and what testing-library asserts against; react-native-web 0.21 renders only the `aria-*` form. State set through `accessibilityState` alone therefore reaches native correctly and produces _nothing_ in the DOM — a gap the Jest suite can't see, since RNTL reads the React prop rather than the rendered output. Caught by inspecting a real rendered button (`role=button` present, `aria-selected` absent) and now covered by a test that asserts the `aria-*` mirror specifically. Verified after the fix: `role="button"` went from 3 elements on the Home screen to 20, with `aria-expanded` on every accordion header and `aria-selected` on all 17 switcher options.
- **`headingA11yProps(level)`** marks text as a heading so screen-reader users can navigate by structure (VoiceOver's rotor, TalkBack's heading navigation) instead of reading top to bottom. It emits three spellings because no single one covers both platforms: `accessibilityRole="header"` for native, `role="heading"` for react-native-web (which turns it into a real `<h1>`–`<h6>` element), and `aria-level` to pick which one. That last prop isn't in RN's typings at all, and omitting it doesn't degrade gracefully — react-native-web falls back to `<h1>` for _every_ heading, flattening the outline the role exists to convey. `Text` applies this automatically; see below.
- **`fieldA11yProps()`** carries a field's `error` as its `accessibilityHint`, which VoiceOver/TalkBack read after the label. RN has no "invalid" accessibility state to set — that's an ARIA concept with no React Native equivalent (`accessibilityInvalid` type-checks only because a spread suppresses excess-property checking, and does nothing at runtime) — so a hint is the portable way to announce _why_ a field is wrong instead of leaving the red border as the only signal.

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
  card: { borderRadius: radius.x12 },
  field: { minHeight: sizes.elementHeightMd },
}));
```

- **`spacing`/`radius` are a generic scale**, keyed `x<value>` (`spacing.x8`, not `spacing.sm` or `spacing[8]`) — a numeric-value key says exactly what step you're getting without a name to look up first, and `spacing.x10` (not a step in the scale) is a `tsc` error instead of a silently-accepted typo; the `x` prefix exists only because a bare number can't be a dot-accessible property name. The underlying steps match the distinct values already in real use across the component set when this was written (same "derive from what's actually there" reasoning as `THEME_PREFERENCES` deriving from `Object.keys(colors)` rather than being hand-typed). Every `createStyles` call site in the app now reaches for one of these wherever its value matches a step, instead of a bare number — adopting them was a like-for-like swap with zero visual change (verified: full test suite and a live before/after screenshot both came back identical). Not only for `gap`/`padding`, either: `Accordion`'s chevron and the Home screen's header icon both pass `size={spacing.x20}` to `Icon`, reusing the same step `Screen`'s padding already uses, rather than a separate icon-size scale.
- **`sizes` is purpose-specific, not generic — but named by _purpose_, not by whichever component happens to use it first.** Where `spacing.x16` means nothing beyond "16px", each entry means exactly one thing: `elementHeightSm`/`elementHeightMd`/`elementHeightLg` (32/44/56 — the compact, standard and prominent control heights, shared by `Input`'s minimum touch target and `Button`'s three fixed sizes; `elementHeightMd` is the 44pt minimum, named for the concept rather than for Input, which is why `Button` sizing itself to match is reusing a touch-target height rather than borrowing Input's own measurement), `elementWidthSm`/`elementWidthLg` (currently Accordion's fixed width and Modal's content `maxWidth` — two components that happened to need two different tiers of "how wide should a self-contained element be" first, not two unrelated measurements). `grabberWidth`/`grabberHeight` (Modal's drag handle) stay specifically named, though — they're genuinely that one element's own pill dimensions, not a reusable concept, and genericizing the name wouldn't make the measurement itself any more general.
- **None of the three raw tables is exported** — every consumer goes through the scaled `spacing`/`radius`/`sizes` from `useSizes()` or `createStyles`. Handing out a raw table would let a call site use an unscaled value by accident, silently skipping the device scaling every other size in the app gets. (`NAMED_SIZES` used to be exported with exactly that hazard, unused by anything, while the two tables beside it were deliberately kept private — the inconsistency is now closed.)
- **`createStyles` hands the whole styleguide to its factory**, which is how most call sites get it. A component needs `useSizes()` directly only for a size used outside a style object entirely — `Accordion` and the Home screen both do exactly that (the `Icon` `size` prop above).
- **What's deliberately excluded from both groups**: a measurement that doesn't represent a reusable step or a reusable named purpose — a hairline `borderWidth`, `Counter`'s button `minWidth` tuned to that component's own two buttons — stays a plain number owned by its component, still passed through `units()` at the call site same as always. Nothing was rounded or forced to fit either group just to reuse it; `sizes.ts`'s own doc comments say the same for each: pull a value in once it has a genuine second use or a clear standalone purpose, not before.

**Typography styleguide — `typography`** (`typography.ts`, via `useTypography()`). Apple's [Human Interface Guidelines type scale](https://developer.apple.com/design/human-interface-guidelines/typography) for iOS/iPadOS — the same 11 named text styles Apple's own apps use (at the default "Large" Dynamic Type size, before a user changes their text-size setting), reactive and already scaled through `units()` exactly like `spacing`/`radius`/`sizes`:

```tsx
import { createStyles } from "@/features/responsive";

const useStyles = createStyles(({ typography }) => ({
  title: typography.headline,
}));
```

- **Eleven tokens** — `largeTitle`, `title1`, `title2`, `title3`, `headline`, `body`, `callout`, `subheadline`, `footnote`, `caption1`, `caption2` — each a full `{ fontFamily, fontSize, fontWeight, lineHeight, letterSpacing }`, not just a size. Point sizes, line heights, and tracking are Apple's own published values for this exact scale, used as-is (same "real numbers, not invented" reasoning as `spacing`/`radius`'s steps) — `headline` is the one style at Semibold (`600`) rather than Regular (`400`), per HIG, so it reads as distinct from `body` despite sharing its 17pt size.
- **`fontFamily` is set per style, not once for the whole scale** — every entry in `typography.ts`'s `RAW_TYPOGRAPHY` names its own `fontFamily` (all eleven currently point at the same `SYSTEM_FONT_FAMILY` constant, since San Francisco is what HIG itself specifies this scale in), so a future style that genuinely needs a different face — a monospace `caption2` for code, a distinct display face for `largeTitle` — is a one-line change to that entry, not a structural change to how typography works. `SYSTEM_FONT_FAMILY` itself resolves per platform: `"System"` on iOS (RN's special-cased value for San Francisco, so no font bundling needed), Android's own default system font (no San Francisco equivalent there), and the standard Apple-first web system-font stack (resolves to San Francisco on macOS/iOS Safari, a sane native fallback elsewhere).
- **`Text` (`src/components/text`) takes a `type` prop** — `<Text type="headline" value="..." />` — defaulting to `"body"`. It's the one component that reads the scale directly (via `useTypography()`) rather than through `createStyles`, because its variant is chosen by a _prop_ at render time and a static style factory can't express that. An earlier version worked around it by spreading all eleven tokens into the component's own `StyleSheet.create` (`...typography`), so every `<Text>` instance allocated twelve style objects to use exactly one; reading `typography[type]` costs one.
- **Take a whole token, not just its `fontSize`.** Overriding only the size on top of another token leaves the rest of that token behind — which was a real bug in `Input`: its label and helper text set `fontSize` over a `<Text>` that had already received `body`, so an 11px label rendered inside `body`'s 19px line box (and a 10px helper inside the same), 73–90% leading overhead, measurably loose. They're now `<Text type="footnote">` and `<Text type="caption1">`, whose point sizes happened to match exactly what the overrides were reaching for; the field's own `RNTextInput` host takes `typography.callout` as a style, since it isn't our `Text` and has no `type` prop. Measured after the fix: label `11px/16px`, helper `10px/14px`.
- **Line heights scale with the OS text-size setting.** `createTypography` multiplies `lineHeight` by `fontScale` and deliberately leaves `fontSize` alone — see the Accessibility section above for why that split is the correct one. `Text` undoes the `lineHeight` half when a caller passes `allowFontScaling={false}`, since opting out of RN's automatic `fontSize` scaling would otherwise leave the glyphs fixed while their line box kept growing.
- **The type scale carries heading semantics, not just sizes — and `type` is the only input.** `Text` derives `accessibilityRole="header"` (and a real `<h1>`–`<h4>` on web) straight from `type`: `largeTitle` → level 1, `title1`/`title2`/`title3` → 2/3/4. There's deliberately no separate `heading` prop: the type scale already _is_ the hierarchy, so picking `title2` because something is a sub-section and then separately declaring it a heading states the same fact twice, with the option of contradicting yourself. `headline` is excluded from the mapping — HIG uses it for list-row titles at body size, which are emphasis rather than document structure, and marking those as headings fills a screen reader's heading rotor with entries that aren't navigation landmarks.
  - The tradeoff is that a title size can't currently be used as pure decoration (a large stat, say) without also entering the outline. No call site needs that yet; if one turns up, an explicit opt-out is the change to make — the same "pull it in when there's a real second case" rule the styleguides follow.
  - Before this the app had **zero** heading semantics anywhere — verified in the DOM: no `role="heading"`, no `<h*>` tags, no `aria-level` — so a screen-reader user had no way to navigate a screen by structure at all. The Home screen's title now renders as a genuine `<h1 aria-level="1">`.
- **`createStyles` supports `typography` the same way it supports `spacing`/`radius`/`sizes`** — it arrives already scaled, no `units()` wrapping needed at the call site.

### `Button` — `src/components/button`

```tsx
import Button from "@/components/button";

<Button value="Continue" type="primary" size="large" onPress={submit} />
<Button value="Cancel" onPress={dismiss} />              // secondary / medium
<Button value="Learn more" type="tertiary" size="auto" onPress={open} />
```

Two independent axes — `type` (visual emphasis) and `size` (box metrics and type scale) — plus `selected` and `disabled` states that cut across both.

| `type`      | Fill                                   | Border          | Label       |
| ----------- | -------------------------------------- | --------------- | ----------- |
| `primary`   | `primary`                              | —               | `onPrimary` |
| `secondary` | `backgroundElement`                    | `textSecondary` | `text`      |
| `tertiary`  | none (`backgroundElement` when picked) | —               | `primary`   |

| `size`   | Height                 | Label type |
| -------- | ---------------------- | ---------- |
| `small`  | `elementHeightSm` (32) | `footnote` |
| `medium` | `elementHeightMd` (44) | `body`     |
| `large`  | `elementHeightLg` (56) | `headline` |
| `auto`   | hugs its label         | `body`     |

- **The defaults are `type="secondary"`, `size="medium"`** — chosen so adding both props changed nothing about how any existing button in the app renders. `secondary` is also the right default on the merits: the app's buttons are overwhelmingly utility actions, and defaulting to `primary` would make every one of them shout.
- **`secondary`'s border is load-bearing, not decoration.** Its fill is `backgroundElement` — the same token `Accordion`, `Modal` and every other raised surface uses — so on one of those surfaces a fill-only secondary button is literally the same color as what's behind it and vanishes. Found live, in the showcase, the moment a `primary` button sat next to one. The border is `textSecondary` rather than the more obvious `backgroundElementSelected`: on a `backgroundElement` surface those two greys contrast at 1.19:1, well under the 3:1 WCAG 1.4.11 asks of a boundary that's the only thing marking the control (see the palette contrast test in the Theme section).
- **Every type gets two backgrounds, resting and `selected`**, so a segmented control reads as picked whichever type it's built from — not just the one that happened to have a darker token lying around. `primary` is the exception and stays put: it's already at full emphasis, so it conveys selection through `aria-selected` alone. Verified live: clicking through the showcase's segmented control moves both the readout and the rendered `aria-selected`.
- **`auto` is the one size that reserves no touch target** — it hugs its label, for a button that has to sit inline with text or in a tight row, which by definition puts it under the 44pt minimum. That's why it's the one size to avoid for a primary action, and why it's called out here rather than left to be discovered.
- **The box metrics live in `createStyles`, the type scale in a lookup table.** Height and padding need `units()`-scaled values, which only the style factory has; the label's typography token doesn't. Splitting them isn't ideal, but duplicating the heights into a const nothing reads would be worse — an earlier version did exactly that and the dead fields survived a refactor unnoticed.
- **`borderWidth` is always present, transparent unless the type asks for a border**, so a bordered and an unbordered type occupy identical space and swapping between them doesn't shift the layout around them.
- **Accessibility** comes from `controlA11yProps()` (see the Accessibility section) — a bare `Pressable` has no role of its own, so without it every button announces as an anonymous group. The label comes from the `Text` child rather than an explicit `accessibilityLabel`, and only the states actually in play are emitted.

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
- **`color` defaults to `theme.colors.text`** — pass it explicitly to override, same as `size`. This is what makes an icon with no `color` prop legible in both themes automatically instead of defaulting to the underlying library's black. Verified both ways live in-browser: the Home screen's `<Icon type="Feather" name="home" size={units(20)} />` (no `color`) renders white in dark mode and black in light mode, tracking `theme.colors.text` with no reload; a `color="red"` override stays red in both.
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
  numeric/        NumericInput — type="numeric", + its own use-numeric-text.ts
  email/          EmailInput — type="email", forces the email-address keyboard
```

- **Every variation is its own component in its own folder**, not a branch inline in one big file. `BaseInput` (`./base`) owns everything shared — label, `leftSlot`/`rightSlot`, focus/disabled styling, the actual RN `TextInput` host — driven by a plain string `value`/`onChangeText`. `TextInput` (`./text`), `NumericInput` (`./numeric`), and `EmailInput` (`./email`) each resolve their own value shape and type-specific extras, then render through `BaseInput`; `Input` (`index.tsx`) just picks which one to render based on `type`. Adding a new variation (e.g. `"search"`, `"phone"`) means a new folder with its own component (+ whatever variation-only logic/UI it needs, developed and tested independently of the others) and a branch in `index.tsx` — no existing variation's file changes. `EmailInput` is the smallest possible example of this: it's `TextInput`-shaped (plain string `value`/`onChange`, no extra props) but forces `keyboardType="email-address"` — the whole variation is one four-line component.
- **Shared API**: every variation takes `value`/`onChange`, plus `label`, `placeholder`, `disabled`, `leftSlot`/`rightSlot` (render any node — typically an `Icon`, but not limited to one — in either slot), and `style`. A variation adds only what it specifically needs on top: `type="text"` adds `secureTextEntry`; `type="numeric"` adds `min`/`max` and swaps `value`/`onChange` to `number | null` instead of `string`; `type="email"` adds nothing beyond the shared API. The discriminated union (same pattern as `Icon`'s `type`) means passing a numeric-only prop like `min` with `type="text"` — or the wrong `value` type for the chosen `type` — is a `tsc` error, not a runtime surprise.
- **`autoCapitalize`/`autoCorrect` default off for every variation**, enforced in one place: `BaseInput` defaults them (`"none"`/`false`) when not passed, so every current and future variation gets that default for free instead of each one having to remember it — `EmailInput` needed zero extra code to get this right, which is the point. Still overridable per field, e.g. `<Input autoCapitalize="words" />` for a name field. Verified live in-browser: all three fields on the Home screen render with `autocapitalize="none"` and `autocorrect="off"` in the actual DOM without any of them setting either prop explicitly.
- **`type="numeric"` buffers the raw typed text separately from the numeric `value`**, in `numeric/use-numeric-text.ts` — a `TextInput` controlled directly by `String(value)` can't represent in-progress input like `"1."` or a bare `"-"` (they'd parse to a number, re-render back to `"1"`/`""`, and the character just typed would vanish). Non-digit characters are stripped as you type, and `onChange` only fires once the buffered text parses to a real number, clamped to `min`/`max`. Verified live in-browser: typing `"2a5b0"` into an `Age` field (`min={0}`, `max={120}`) strips the letters as they're typed and the committed value clamps to `120` — which then round-trips back through the controlled `value` prop and corrects the displayed text to `"120"` too, since the Home screen demo feeds `onChange`'s value straight back in as `value`.
- Resyncing the buffered text when `value` changes from outside (e.g. that clamp round-trip above) happens **during render**, not in a `useEffect` — React's documented pattern for adjusting state from a prop change without an extra render pass. A `useEffect` calling `setState` synchronously in its body is also an ESLint error in this project's `react-hooks/set-state-in-effect` rule, which caught the first draft of this hook.
- Focus and disabled states are handled the same way `Button` handles `selected` — background swaps to `theme.colors.backgroundElementSelected` on focus, and `opacity: 0.5` when `disabled`, no new palette entries needed.
- **`error`/`helperText`**: `helperText` renders under the field in `theme.colors.textSecondary`; `error` (also a string) replaces it, renders in `theme.colors.error`, and switches the field's border to that color too (`error` — a new key in `palette.json`/`ThemeColors`, `#dc2626`/`#f87171` light/dark — same swap-the-palette-file extensibility as every other color). Both live on `CommonInputProps`, so every variation gets them for free. Verified live: an invalid `Email` value renders a red border and "Enter a valid email" in place of blank helper text.
- **Ref forwarding**: `BaseInput` is `forwardRef`, and every variation (`TextInput`/`NumericInput`/`EmailInput`) and the top-level `Input` forward their own ref straight through to it, so `<Input ref={...} />` exposes the underlying RN `TextInput`'s imperative `.focus()`/`.blur()` regardless of `type`. Verified live: a "Focus email" button on the Home screen calls `emailRef.current?.focus()` and moves real DOM focus to the email field (confirmed via `document.activeElement`). `forwardRef` components have no `.name` the way a plain function component does — each sets `displayName` explicitly so `describe(\`${Component.displayName} smoke test\`, ...)` keeps working the same way it does everywhere else in this codebase.
- **Accessibility**: the RN `TextInput` gets `accessibilityLabel={label ?? placeholder}` (a sibling `Text` isn't auto-associated with a field the way HTML's `<label for>` is) and `accessibilityState={{ disabled }}`, so a screen reader announces the field's name and disabled state without extra wiring per variation.
- **`onFocus`/`onBlur`** are plain optional callbacks on `CommonInputProps` — `BaseInput` still owns the focus-triggered background swap internally, but now also calls a consumer's `onFocus`/`onBlur` alongside it, e.g. for running validation when a field is left.
- `index.tsx`'s dispatch is a `switch` on `props.type`, but the actual `{...props}` spread appears exactly once, in a generic `renderVariant<P>(Component, props, ref)` helper each `case` calls — TS infers `P` from `Component` and checks the (already-narrowed-by-`switch`) `props` against it, so a mismatched case (e.g. the wrong variation under the wrong `case`) is still a `tsc` error, unlike an earlier version of this dispatcher that stored the picked component in an `any`-typed variable.
- Each of `BaseInput`/`TextInput`/`NumericInput`/`EmailInput`/`Input` has its own Storybook stories and Jest smoke test, scoped to what that layer actually owns — `BaseInput`'s test covers label/slots/focus/disabled/autoCapitalize-autoCorrect/error-helperText/accessibility/ref-forwarding once, so the variation tests only need to cover what's actually different about them (value coercion, `secureTextEntry`, digit filtering/clamping, keyboard type), and `Input`'s test just confirms routing.
- Live examples on the Home screen (`Name` as text with a left icon and helper text, `Age` as numeric with `min`/`max`, `Email` with live validation showing the error state, plus a "Focus email" button) exercise every variation together, including the numeric clamp-and-resync behavior, the actual `type="email"` DOM attribute, and ref-based imperative focus.

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

- **`actions` has a backdrop but no content background** — it's meant to look like a native action sheet: a dimmed backdrop behind a _stack of independently-styled action items_ (e.g. `Button`s, which already supply their own background/rounded corners) rather than one unifying card. The Home screen demo uses exactly that — two `Button`s and a `Close` `Button` stacked with a `gap`, no wrapping card. Verified live in-browser, both that the backdrop dims the screen and that there's no card background behind the buttons.
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

A titled, collapsible section — tapping the header toggles `children` between hidden and shown. The chevron on the right (via `Icon`) rotates 180° between collapsed/open with a Reanimated `withTiming`, rather than swapping between two separate icon assets, so there's only ever one glyph to keep in sync with state. `defaultOpen` (default `false`) controls the initial state. Content itself shows/hides instantly via `If` (above), not height-animated — animating to/from an unmeasured "auto" height is the fiddly part of building an accordion, and not worth taking on until there's a real need for that extra polish. The Home screen wraps each of its three demo sections (Counter & Theme, Input, Modal) in one.

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

### `Screen` — `src/components/screen`

```tsx
<Screen>…</Screen>              // centred, fills the viewport
<Screen scrollable>…</Screen>   // scrolls, content starts at the top
```

The app's layout primitive: fills the viewport, applies `theme.colors.background`, and pads with `spacing.x16`. `scrollable` swaps the `View` for a `ScrollView` and drops the vertical centring — content that can outgrow the viewport has to start at the top, or the first screenful gets pushed off the top edge as it grows. The showcase uses it; a short screen shouldn't.

### `Root` — `src/root`

```
src/root/
  index.tsx       Root — mounted once in src/app/_layout.tsx: <Root><Stack /></Root>
  providers.tsx    Providers — every context provider (safe area, accessibility, theme, locale, ...)
  testing.tsx       render()/screen/etc. wrapping Providers, for tests
```

`Root` wraps `Providers` and is the single place for:

- context providers every screen needs — add a new one to `providers.tsx` only
- global overlay UI rendered above the current screen (toasts, modals, ...)
- global listeners/services that should run for the app's lifetime (analytics init, push notification listeners, app-state listeners, ...) — wire these up here via `useEffect` once there's a concrete one to add

**Providers are centralized on purpose.** Both Storybook preview configs (`.storybook/preview.tsx`, `.rnstorybook/preview.tsx`) decorate every story with `<Providers>`, and every component test imports `render`/`screen`/etc. from `@/root/testing` instead of `@testing-library/react-native` directly:

```tsx
import { render, screen } from "@/root/testing";
```

That `render` is a drop-in replacement that already wraps the tree in `Providers`. Adding a new provider in `providers.tsx` — a state provider, an auth provider, whatever comes next — makes it available to the real app, every Storybook story, and every test's `render()` in one edit; no per-file changes needed. (`src/root/index.test.tsx` is the one exception — it tests `Root` itself, so it renders unwrapped, via `@testing-library/react-native` directly.)

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
