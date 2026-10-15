[Docs](index.md)

# Getting started

> Install, configure the environment, run the app, and the everyday scripts, Storybook and git hooks.

**On this page**

- [Get started](#get-started)
- [Scripts](#scripts)
- [Storybook](#storybook)
- [Git hooks](#git-hooks)

---

## Get started

1. Install dependencies

   ```bash
   yarn install
   ```

2. Set up environment variables

   ```bash
   cp .env.example .env
   ```

   `.env` is read by Expo CLI (via `@expo/env`) and used both by `app.config.ts` (app name/slug/scheme/bundle id) and by the app itself through [`src/constants/env`](../src/constants/env/index.js). Only `EXPO_PUBLIC_*`-prefixed vars are available at runtime — Metro inlines them into the bundle at build time, so they must be referenced as a static `process.env.EXPO_PUBLIC_X`, never a dynamic key. See the comment in `src/constants/env/index.js` before adding new ones.

   **`EXPO_PUBLIC_BRAND_ICON_BACKGROUND` and `EXPO_PUBLIC_BRAND_SPLASH_BACKGROUND` must be quoted.** They are hex colours, and an unquoted `#` starts a comment in a `.env` file — so `KEY=#208AEF` reads as empty while the line sits there looking correct. The validator says so by name when it finds one missing, because the error is otherwise indistinguishable from having forgotten the variable entirely.

3. Start the app

   ```bash
   yarn web       # browser
   yarn ios       # iOS simulator, real dev client (see caveat below)
   yarn android   # Android emulator, real dev client
   ```

   `yarn start` also works and lets you choose a platform from the Metro CLI (`w`/`i`/`a`), but note it opens **Expo Go** by default, which cannot load native modules like `react-native-mmkv` — use `yarn ios`/`yarn android` (or `expo run:ios`/`expo run:android`) for a real dev-client build instead when you need native storage to work.

   > **iOS build caveat:** building the native dev client currently requires **Xcode 26.4+**. Expo SDK 57's `expo-modules-jsi` fails to compile on Xcode 26.0–26.3 due to a Swift 6.2 C++ interop strictness change ([expo/expo#46242](https://github.com/expo/expo/issues/46242)). Web and Android are unaffected.

---

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
| `yarn verify`                     | Every gate in one go: format check, lint, typecheck, secretlint, tests  |
| `yarn storybook`                  | On-device Storybook (Metro, opens on whatever device/emulator you pick) |
| `yarn storybook:ios` / `:android` | On-device Storybook, direct to one platform                             |
| `yarn storybook:web`              | Web Storybook (Vite) at `localhost:6006`                                |
| `yarn storybook:web:build`        | Build the web Storybook for static hosting                              |

---

## Storybook

Two separate setups, both driven by the same `*.stories.tsx` files under `src/`:

- **On-device** (`.rnstorybook/`): `yarn storybook[:ios|:android]` sets `STORYBOOK_ENABLED=true`, which makes `metro.config.js` swap the app's entry point for the Storybook UI — the regular `yarn ios`/`yarn android`/`yarn web` builds are unaffected when the flag isn't set.
- **Web** (`.storybook/`): a separate Vite-based build (`@storybook/react-native-web-vite`), since MMKV doesn't exist on web. `.env` is loaded manually here (Vite doesn't do Expo's env inlining) — see the `viteFinal` hook in `.storybook/main.ts`.

---

## Git hooks

Set up via [husky](https://typicode.github.io/husky) + [lint-staged](https://github.com/lint-staged/lint-staged), with the hooks in `.husky/` (installed by the `prepare` script).

- **pre-commit**: formats and lints staged files, and scans staged files for secrets ([secretlint](https://github.com/secretlint/secretlint)).
- **pre-push**: full `lint` + `typecheck` + `test`.

---

[Docs index](index.md) · [Architecture](architecture.md) →
