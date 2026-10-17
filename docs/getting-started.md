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

2. Environment variables and brand

   `yarn install` already created `.env` from `.env.example` and applied the brand in `assets/brand` (its postinstall runs `yarn brand`). After changing anything in `assets/brand`, run it again:

   ```bash
   yarn brand
   ```

   See [Brand](../assets/brand/README.md). `.env` is read by Expo CLI (via `@expo/env`) and used both by `app.config.ts` (app name/slug/scheme/bundle id) and by the app itself through [`src/constants/env`](../src/constants/env/index.js). Only `EXPO_PUBLIC_*`-prefixed vars are available at runtime — Metro inlines them into the bundle at build time, so they must be referenced as a static `process.env.EXPO_PUBLIC_X`, never a dynamic key. See the comment in `src/constants/env/index.js` before adding new ones.

   **The brand keys are rewritten on every `yarn brand`** — change `assets/brand/brand.json` instead. Other keys (map tiles) are left alone. If you ever set a hex colour by hand, quote it: an unquoted `#` starts a comment in a `.env` file, so `KEY=#208AEF` reads as empty.

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
| `yarn web:build`                  | Export the web app and API routes into `dist/` (server output)          |
| `yarn native:bundle`              | Build the iOS and Android JS bundles — catches Metro errors on native   |
| `yarn doctor`                     | Expo Doctor: SDK versions, peer dependencies, project setup             |
| `yarn lint`                       | ESLint (`expo lint`)                                                    |
| `yarn typecheck`                  | `tsc --noEmit`                                                          |
| `yarn test`                       | Jest                                                                    |
| `yarn test:coverage`              | Jest with a coverage summary (`coverage/`)                              |
| `yarn format` / `format:check`    | Prettier write / check                                                  |
| `yarn secrets:check`              | Scan the repo for committed secrets                                     |
| `yarn verify`                     | The fast gates in one go: format, lint, types, secrets, tests           |
| `yarn storybook:native`           | On-device Storybook (Metro, opens on whatever device/emulator you pick) |
| `yarn storybook:ios` / `:android` | On-device Storybook, direct to one platform                             |
| `yarn storybook:web`              | Web Storybook (Vite) at `localhost:6006`                                |
| `yarn storybook:web:build`        | Build the web Storybook for static hosting                              |

---

## Storybook

Two separate setups, both driven by the same `*.stories.tsx` files under `src/`:

- **On-device** (`.rnstorybook/`): `yarn storybook:native` / `:ios` / `:android` sets `STORYBOOK_ENABLED=true`, which makes `metro.config.js` swap the app's entry point for the Storybook UI — the regular `yarn ios`/`yarn android`/`yarn web` builds are unaffected when the flag isn't set.
- **Web** (`.storybook/`): a separate Vite-based build (`@storybook/react-native-web-vite`), since MMKV doesn't exist on web. `.env` is loaded manually here (Vite doesn't do Expo's env inlining) — see the `viteFinal` hook in `.storybook/main.ts`.

---

## Git hooks

Set up via [husky](https://typicode.github.io/husky) + [lint-staged](https://github.com/lint-staged/lint-staged), with the hooks in `.husky/` (installed by the `prepare` script).

- **pre-commit**: formats and lints staged files, and scans staged files for secrets ([secretlint](https://github.com/secretlint/secretlint)).
- **pre-push**: `yarn verify` — format, lint, types, secret scan and tests.

---

## CI

GitHub Actions, in `.github/`. **Every workflow is manual for now** (Actions tab → Run workflow); each file's header says which trigger to add to make it automatic.

| Workflow         | File                         | Jobs                                                                                                                                                                |
| ---------------- | ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Checks**       | `workflows/checks.yml`       | Formatting · Lint · Types · Unit tests (coverage in the job summary) · Secret scan · Expo Doctor · Web build · Native bundles · Storybook build · Dependency review |
| **Storybook**    | `workflows/storybook.yml`    | Checks → Build → Publish to GitHub Pages                                                                                                                            |
| **Pull request** | `workflows/pull-request.yml` | Title format — `type: 'Message'`, the house commit style, since a squash merge makes the title the commit                                                           |
| Dependabot       | `dependabot.yml`             | Weekly grouped updates for actions and npm, Expo SDK packages excluded. Paused (`open-pull-requests-limit: 0`)                                                      |

- **Checks run as separate jobs** so a pull request lists each by name ("Checks / Lint", "Checks / Web build") and branch protection can require the ones that matter.
- **The same commands run locally.** Every job is one `yarn` script from the table above, set up by `.github/actions/setup` (Node from `.nvmrc`, frozen-lockfile install).
- **Hardened by default.** Read-only token unless a job needs more, a timeout on every job, superseded runs cancelled, and third-party actions pinned to commit SHAs (the version in a comment beside each).
- **Dependency review** needs the repository's dependency graph turned on (Settings → Code security).

The workflows still to come — native builds, PR previews, releases, web deploy — are planned in [CI and EAS](plans/ci-and-eas.md).

---

[Docs index](index.md) · [Architecture](architecture.md) →
