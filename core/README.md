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

### Local storage — `LocalValue`

```ts
import { LocalValue } from "@/features/storage";

const value = new LocalValue<T>("some-key");
value.getValue(); // read once
value.setValue(v); // write
value.reset(); // clear
value.use(); // reactive read inside a component — see note below
```

Backed by MMKV natively, `localStorage` (with an in-memory fallback for SSR) on web. Any component calling `.use()` needs a `"use no memo";` directive as its first line — React Compiler doesn't recognize a method call as a hook and will otherwise memoize the component and break reactivity (see the comment on `StorageValue.use()`).

### Theme — `src/features/theme`

```tsx
import { useTheme } from "@/features/theme";

const theme = useTheme(); // { scheme, colors, preference, setPreference }
```

- `scheme` — the resolved `"light" | "dark"` actually in effect.
- `preference` — what the user picked: `"light" | "dark" | "system"` (default `"system"`), persisted via `LocalValue` so it survives restarts. `setPreference` updates it.
- When `preference` is `"system"`, `scheme` tracks the OS setting live via React Native's `useColorScheme()` — no reload needed, verified by flipping the emulated OS scheme at runtime.
- `colors` — the current palette (`ThemeColors`: `background`, `text`, `textSecondary`, `backgroundElement`, `backgroundElementSelected`, `error`), sourced from [`palette.json`](src/features/theme/palette.json). Swap that file for a rebrand/different palette without touching any other file — `colors.ts` validates both `light` and `dark` have every required key and throws a clear error naming the missing one otherwise. (It's `palette.json`, not `colors.json` — Metro and Vite disagree on `.ts` vs `.json` priority for a bare `./colors` specifier, so a same-basename pair resolves to the wrong file depending on which bundler is running; keep the JSON's basename different from `colors.ts`.)

`ThemeProvider` and a `ThemeSwitcher` component (`src/components/theme-switcher`, wired into the Home screen) are both included; `Text`, `Screen`, and `Icon` (default `color`) already consume `theme.colors`.

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

**Using units outside a component.** There's also a plain, non-hook `unitsSnapshot(value)`, for module scope, utility functions, or anywhere a hook isn't available:

```ts
import { unitsSnapshot } from "@/features/responsive";

const styles = StyleSheet.create({ padding: unitsSnapshot(16) }); // module scope, no hook
```

It reads `Dimensions.get("window")` imperatively at call time rather than subscribing via `useWindowDimensions()`, so it's a **snapshot, not reactive** — verified directly: called at a 900px width it correctly returned `unitsSnapshot(16) = 26`, but after resizing to 375px _without reloading_, that same module-scope value stayed frozen at `26` (it's only ever recomputed if the surrounding code re-runs, which module-scope code doesn't). Use `useUnits()` inside a component whenever the value needs to track live resizes.

It's named `unitsSnapshot`, not `units`, on purpose, and `eslint.config.js` bans importing it from anywhere under `src/components/`, `src/screens/`, or `src/root/` — verified directly (a scratch file importing it there fails lint; the same import from `src/features/` passes). Inside a component "units" should only ever mean the reactive value from `useUnits()`; reaching for the snapshot there is a lint error now, not a silent stale-value bug.

**Defining a style sheet outside the component, reactively.** `createStyles()` turns a factory into a hook — the factory is a plain function you write next to (or below) the component, and calling the hook it returns gives you fully reactive styles inside the component:

```tsx
import { StyleSheet, Text } from "react-native";
import { createStyles } from "@/features/responsive";

function Component() {
  const styles = useStyles();
  return <Text style={styles.text} />;
}

const useStyles = createStyles(({ units, breakpoint }) =>
  StyleSheet.create({
    text: { fontSize: units(14) },
  }),
);
```

The factory receives the same reactive `units`/`breakpoint` as the hooks, and the result is memoized (only recomputed when they actually change). `Button` and `Screen` both use this. Verified live: resizing 375px → 768px without reloading grew both `Screen`'s padding and `Button`'s size in the same frame, exactly as before this refactor.

- `createUnits(width)` / `getBreakpoint(width)` are the underlying pure functions (what the hooks call after reading `useWindowDimensions()`) — used directly in `units.test.ts`/`breakpoint.test.ts`, no component rendering needed.

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

### `Root` — `src/root`

```
src/root/
  index.tsx       Root — mounted once in src/app/_layout.tsx: <Root><Stack /></Root>
  providers.tsx    Providers — every context provider (safe area, theme, ...)
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
