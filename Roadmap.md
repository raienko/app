# Core codebase roadmap

Last audited: 2026-09-04  
Scope: `core/` (Expo SDK 57, React Native 0.86, React 19.2)  
Planning assumption: estimates are for one engineer and should be re-estimated after Phase 0.

## Executive assessment

The codebase is a strong application foundation and component showcase, but it is not yet a production-ready product shell. Its best qualities are strict TypeScript, centralized providers, typed component APIs, semantic theme and typography systems, unusually thorough unit tests, and accessibility behavior designed into components rather than added afterward.

The next work should not be a broad rewrite. The highest-value work is to make the existing quality reproducible in CI, remove native dependency ambiguity, harden persisted/global state, close the remaining localization and third-party-control gaps, then decide whether `core` is an application or a reusable design-system package. Performance changes should follow measurements; the current showcase bundle is useful as a baseline but is not representative of a real product route because it deliberately imports nearly everything.

### Current baseline

| Area                  | Observed state                                                              |
| --------------------- | --------------------------------------------------------------------------- |
| Source                | 361 TypeScript/TSX files; about 17.4k production lines and 10.4k test lines |
| Tests                 | 88 suites and 737 tests pass                                                |
| Coverage              | 79.1% statements, 79.1% branches, 70.4% functions, 80.6% lines              |
| Static checks         | Lint, strict type-check, formatting, and secret scan pass                   |
| Storybook             | 46 story files; production web Storybook build passes                       |
| Production web export | 3.9 MB JS, about 951 KB gzipped; 5.4 MB total output                        |
| Navigation            | One product route, currently the 31-section component showcase              |
| Delivery              | Local Git hooks exist; no repository CI workflow or `eas.json` exists       |

The coverage percentages are optimistic because Jest has no `collectCoverageFrom` configuration; untouched source files are not part of the denominator. Establish representative collection before using the numbers as a gate.

## What is already working well

- Design-system boundaries are enforced by ESLint: application UI cannot import raw React Native `Text`, raw `expo-image`, direct Expo UI `Host`, hard-coded UI colors, or ad hoc typography declarations.
- Third-party controls are generally behind app-owned adapters. `ExpoUIHost` supplies scheme, primary seed color, and layout direction; the date picker maps exposed color and text slots to semantic tokens.
- Shared behavior is already factored at useful boundaries: `BinaryControlRow`, `BaseInput`, `Modal`, `createEventBus`, `LocalValue`, `Providers`, and the responsive/theme/accessibility helpers avoid obvious copy-paste implementations.
- Accessibility coverage is substantially above a typical starter: semantic helpers, reduced-motion support, screen-reader-aware toast timing, keyboard behavior, adjustable controls, RTL behavior, and explicit control labels are tested.
- Deep links have a centralized parser, route registry, readiness/auth-style gates, bounded queue, cold-start deduplication, and unit coverage.
- Public components mostly have colocated tests and stories, and the Storybook environments share the same providers as the application.

Do not replace these systems with new libraries without a measured deficiency. In particular, do not add a state library, blanket memoization, a virtualized-list dependency, or a new overlay framework merely for consistency.

## Main risks and opportunities

| Priority | Finding                                             | Evidence and impact                                                                                                                                                                                                                                                           |
| -------- | --------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| P0       | Quality is not enforced remotely                    | Pre-push hooks run lint, type-check, and tests, but there is no CI. Hooks can be skipped and do not validate a production export or Storybook build.                                                                                                                          |
| P0       | Native dependency graph is not singular             | The install contains `react-native-screens` 4.26.2 at the root and 4.27.0 under Expo Router, plus `expo-constants` 57.0.13 at the root and 57.0.17 under notifications. Multiple JS copies around one autolinked native module can create hard-to-debug native/JS mismatches. |
| P0       | Persisted data can crash startup                    | `StorageValue.parse()` calls `JSON.parse` without recovery or schema validation. Permission objects are read during module construction, so corrupt or old data can fail before the root UI mounts.                                                                           |
| P0       | Build environment is not reproducible yet           | A production export failed until the required public variables were injected directly. `app.config.ts` also writes `extra.eas.projectId: 0` when no project ID exists instead of omitting the configuration.                                                                  |
| P1       | Overlay completion contracts are timer-based        | `Modal.show/hide` and `Toast.show/hide` resolve after fixed delays instead of the actual transition lifecycle. This disagrees with reduced motion and is vulnerable to rapid show/hide/replacement sequences or unmounts.                                                     |
| P1       | One reusable component bypasses localization        | `ImagePicker` owns the visible strings “Choose image”, “Gallery”, and “Camera” rather than using translation keys or injected labels. Errors are logged in development but cannot be surfaced through a public callback.                                                      |
| P1       | Caught failures disappear in production             | The shared logger is intentionally development-only, but several components and services catch and swallow operational failures after logging. Those paths do not automatically become production telemetry or user-visible feedback.                                         |
| P1       | One third-party adapter weakens its public contract | Expo segmented control cannot disable one segment. The adapter currently ignores per-option `disabled`, although the custom implementation supports it. Silent capability loss should become an automatic fallback, explicit validation, or documented type constraint.       |
| P1       | Documentation is stale                              | The 919-line README still describes Moment locale registration and an `rtl.ts` reload flow that no longer exists. It also states that every component has a story, while `Popup` has none and some intentionally internal primitives should not require one.                  |
| P1       | A patched dependency is release-critical            | `react-native-ui-datepicker` is patched for wheel timing and accessibility. The patch is justified, but upgrades need an explicit upstream/removal plan and device regression tests.                                                                                          |
| P2       | The bundle imports the entire catalogue             | The only route eagerly imports all 31 showcase sections. The production web export includes 2,047 modules and cannot represent product startup performance.                                                                                                                   |
| P2       | Icon assets are expensive                           | Seven vector-icon font assets total about 1.64 MB, including Font Awesome regular and brands even though the wrapper exposes its solid set.                                                                                                                                   |
| P2       | Device behavior is not continuously verified        | Unit tests and web Storybook are strong, but there are no automated iOS/Android end-to-end, screenshot, deep-link, permissions, notification, or assistive-technology smoke tests.                                                                                            |
| P2       | Production operations are incomplete                | Version is fixed at `0.0.1`; iOS build number and Android version code are absent; predictive back is disabled; release profiles, submission configuration, rollback policy, and observability verification are not documented.                                               |

## Phase 0 — Make the baseline trustworthy

Indicative effort: 2–4 days  
Outcome: every change is checked the same way locally and remotely, and a clean checkout can produce deterministic artifacts.

### Work

1. Add one non-mutating `check` script that runs formatting validation, lint, type-check, unit tests, and secret scanning.
2. Add CI for supported Node/Yarn versions with:
   - dependency install from the lockfile;
   - `yarn check`;
   - web Storybook production build;
   - at least one Expo production export;
   - retained test and bundle artifacts on failure.
3. Configure Jest `collectCoverageFrom` for production `src/**/*.{ts,tsx}` while excluding declarations, generated files, tests, and stories. Record the honest baseline, set modest initial thresholds below it, then ratchet them upward rather than selecting an arbitrary target.
4. Make build configuration deterministic:
   - validate required variables before build with one documented command;
   - ensure local export, CI, Storybook, and EAS use the same environment source;
   - omit the EAS block when `EXPO_PUBLIC_EAS_PROJECT_ID` is absent instead of substituting `0`;
   - validate bundle ID, scheme, link domains, and project ID formats;
   - make the Node version explicit (`.node-version`, `.nvmrc`, or package `engines`).
5. Reconcile native-capable package duplicates. Start with `react-native-screens` and `expo-constants`; use SDK-compatible versions/resolutions, regenerate the lockfile, and confirm one effective JS version per autolinked native module. Run the network-backed Expo dependency check when available.
6. Audit direct dependencies with source search, `yarn why`, a production export, and native builds before removing anything. Initial candidates with no direct source imports include AsyncStorage, `expo-device`, `expo-status-bar`, and `expo-web-browser`. Keep packages required by configuration or peer/native integration, such as `expo-system-ui`, screens, worklets, and Nitro modules.
7. Refresh the README immediately: replace the Moment/RTL-reload material, clarify which components are public versus internal, and correct the story/test policy. Move detailed subsystem design notes to `docs/` so the README remains an entry point.

### Exit criteria

- CI passes from a clean checkout and blocks merges when any check fails.
- The regular production export works through the documented command without ad hoc shell setup.
- Coverage includes source files never imported by a test.
- Native module version duplication is resolved or explicitly documented with a verified compatibility reason.
- Setup and architecture documentation describe the code that exists today.

## Phase 1 — Harden persistence and global UI lifecycles

Indicative effort: 4–7 days  
Outcome: corrupted data, rapid user actions, reduced motion, and missing native services fail predictably instead of silently or by timing coincidence.

### Work

1. Make stored values safe and evolvable:
   - catch malformed JSON and recover by resetting/quarantining the key;
   - accept a per-value validator/decoder instead of trusting `T` after parsing;
   - add schema versions and migrations for values whose shape can change;
   - test corrupted JSON, obsolete shapes, migration failure, and unavailable web persistence;
   - avoid module-import crashes from persisted permission state.
2. Replace fixed overlay waits with completion signals:
   - have modal enter/exit promises settle from Reanimated/native completion callbacks;
   - have toast promises settle from store transition completion, including zero-duration reduced motion;
   - define behavior for show-during-hide, hide-before-show-completes, replacement by ID, duplicate modal IDs, provider unmount, and repeated calls;
   - keep Modal, Toast, Popup, StateView, and ImagePicker as separate domain APIs. Extract a shared transition/completion primitive only after their tests reveal truly identical behavior.
3. Separate developer diagnostics from operational error reporting. Audit caught errors in ImagePicker, Popup, StateView actions, deep links, permissions, and image loading; report actionable failures to production telemetry with redaction, and expose outcomes/callbacks when the owning screen must decide whether to show inline state, a toast, or nothing.
4. Harden deep-link trust boundaries:
   - document which call sites may pass untrusted server/push URLs;
   - allowlist external schemes that may be handed to the OS;
   - add tests for malformed authorities, encoded path separators, repeated parameters, unsupported schemes, and hostile query keys;
   - decide whether queued links should survive process death or intentionally remain memory-only.
5. Make observability testable in production:
   - verify EAS Observe receives a controlled error and route event in a preview build;
   - report initialization failure somewhere diagnosable instead of silently losing all production telemetry;
   - define redaction rules for deep-link parameters, image metadata, and permission state.

### Exit criteria

- Bad persisted data cannot prevent the app from rendering a recoverable state.
- Awaitable overlay methods represent actual completion on normal and reduced-motion paths.
- Race-condition tests cover all global UI stores and static APIs.
- External navigation and telemetry have documented data/trust policies.

## Phase 2 — Complete the design-system, localization, and accessibility contract

Indicative effort: 4–6 days  
Outcome: public UI behaves consistently across implementation type, platform, theme, locale, keyboard, and assistive technology.

### Work

1. Localize all component-owned copy. Begin with ImagePicker’s chooser title and source buttons. Prefer translation keys for built-in defaults while allowing callers to override product-specific wording.
2. Define a public-component manifest. Require a focused behavior test and a visual story for every public visual component; allow internal orchestration primitives such as `BinaryControlRow` and `ExpoUIHost` to be covered through direct unit tests and their public consumers. Add the missing `Popup` story.
3. Turn third-party adapter expectations into a test matrix for iOS, Android, and web:
   - light and dark themes;
   - LTR and RTL;
   - minimum and maximum supported dynamic type;
   - enabled, disabled, selected, error, and focus states;
   - keyboard navigation on web;
   - VoiceOver and TalkBack labels, roles, values, and actions.
4. Resolve adapter capability gaps explicitly. For segmented control, either fall back to the custom implementation when an option is disabled, reject that prop combination in development/types, or change the public API so the loss cannot be silent. Record where a native control does not expose typography slots; use the custom implementation when exact app typography is a product requirement.
5. Add visual regression snapshots for stable Storybook states. Prioritize inputs, date/time picker, Expo UI controls, overlays, RTL, dark theme, and large text. Keep behavioral assertions in Jest/device tests rather than relying on screenshots alone.
6. Centralize build-time brand colors used by icons/splash separately from runtime semantic theme colors. Add a small validation test or config check so brand assets and app config do not drift unintentionally.
7. Review component APIs for platform leakage. Product call sites should choose a semantic component behavior; implementation switches (`custom`/`expo`) should remain a deliberate design-system decision and not spread through screens.

### Exit criteria

- No reusable component renders untranslated built-in copy.
- Every public visual component has a story; every internal exception is intentional.
- The third-party matrix passes on supported platforms, with limitations encoded rather than only documented in comments.
- Theme/typography ESLint guardrails remain enabled with no new broad exceptions.

## Phase 3 — Choose and enforce the product architecture

Indicative effort: 5–10 days, depending on product scope  
Outcome: the repository has one clear role and production routes do not inherit showcase-only structure or dependencies.

### Decision gate

Choose one direction before adding substantial feature work:

- **Application:** keep components inside `core`, move the catalogue behind a development-only route or Storybook, and build product route groups/features around the existing providers.
- **Reusable kit:** extract the design system into a package/workspace with explicit exports and peer dependencies; keep `core` as its example/test application.

Do not maintain a half-package/half-application layout: it makes dependency ownership, public APIs, and release responsibilities ambiguous.

### Application path

1. Create route groups for product flows and keep screens thin: route parsing and composition in `src/app`, screen UI in `src/screens`, domain behavior in feature modules.
2. Add route-level error/not-found/loading behavior and a recoverable root error experience. Preserve EAS Observe integration as telemetry, not as the only user-facing failure mechanism.
3. Define data-access boundaries before the first API feature: typed client, cancellation, retries, auth/session handling, cache policy, offline expectations, and error mapping. Do not introduce a global server-state library until those needs exist.
4. Keep providers minimal and ordered by actual dependencies. Global listeners should expose teardown and test reset behavior.

### Reusable-kit path

1. Publish only deliberate entry points; prevent consumers from importing component internals.
2. Move host application packages to peer/dev dependencies where appropriate and test the supported version matrix.
3. Add package API compatibility checks and a changelog/versioning policy.
4. Keep Storybook and an example app as integration consumers of the package, not privileged internal paths.

### Cohesion refactors in either path

- Split `features/accessibility/props.ts`, input types, deep-link registry/URL code, and toast storage only when the resulting modules align with stable responsibilities. File length alone is not a reason to refactor.
- Preserve the current useful seams (`BaseInput`, `BinaryControlRow`, `ExpoUIHost`, event bus, storage adapter). Avoid a “universal manager” that merges unrelated modal, toast, permission, link, and storage semantics.
- Add architecture checks only for boundaries the chosen direction needs; do not add rules for hypothetical layers.

### Exit criteria

- `core` is explicitly an application or an example consumer of a package.
- Production startup no longer imports the component catalogue.
- Public imports and ownership boundaries are documented and mechanically enforced where practical.

## Phase 4 — Optimize measured startup, bundle size, and interaction performance

Indicative effort: 3–6 days for the first pass  
Outcome: performance work is tied to budgets and product flows rather than intuition.

### Measured baseline from this audit

- Web production export: 3.9 MB JavaScript, approximately 951 KB gzipped.
- Export output: 5.4 MB with 27 assets.
- Icon fonts: approximately 1.64 MB across seven font files.
- Largest transformed module groups reported by Expo Atlas include Reanimated (~763 KB), Expo Router (~460 KB), application source (~388 KB), React Native Web (~304 KB), libphonenumber (~229 KB), and Reanimated Carousel (~214 KB). These are transformed input sizes, not direct savings estimates.
- All 31 showcase sections render under one `ScrollView`; this is intentionally worst-case catalogue behavior.

### Work

1. Define budgets for a real product route: cold start/TTI on representative low-end iOS and Android devices, JS bundle size per platform, peak memory, dropped frames in named interactions, and web Lighthouse targets.
2. Capture repeatable release-mode traces before changing code. Store the command, device, build profile, route, and measurement so future comparisons are valid.
3. Remove the showcase from production startup or lazy-load its sections. Profile again before changing individual components.
4. Reduce icon cost:
   - inventory glyphs used by the product rather than the showcase;
   - prefer one primary family plus custom SVGs/subsets where it materially lowers assets;
   - avoid bundling Font Awesome regular/brands when only solid is exposed;
   - confirm visual and accessibility parity after any change.
5. Route-split heavyweight optional features such as phone parsing, date/time picker, and carousel when product navigation makes them non-critical. Consider locale-pack lazy loading only if its measured cost is worth added loading/error states.
6. Establish a supported carousel data-size contract. Profile large datasets and memory before deciding between limits, windowing, or a different implementation.
7. Use React DevTools/Profiler and native performance tools to locate real rerenders and JS/UI-thread stalls. React Compiler is already enabled; do not layer manual memoization on every component.
8. Add a lightweight CI bundle report and fail only on agreed regression budgets, not on absolute package-size guesses.

### Exit criteria

- Performance budgets and repeatable measurements exist for at least one product-critical flow.
- Production startup does not pay for the entire showcase.
- Bundle/asset regressions are visible in CI.
- Every optimization has before/after evidence and no accessibility regression.

## Phase 5 — Build, device, and release readiness

Indicative effort: 5–8 days plus store review lead time  
Outcome: preview and production artifacts are versioned, testable, observable, and recoverable.

### Work

1. Add `eas.json` profiles for development, preview/internal distribution, and production. Define environment ownership, credentials source, update channel/runtime policy, and submission behavior.
2. Add a versioning policy covering app version, iOS build number, Android version code, and OTA runtime compatibility.
3. Create a native smoke suite for both platforms covering startup, navigation, keyboard/input, modal/toast/state-view races, image permission flows, notifications, cold/warm deep links, RTL, dark mode, large text, reduced motion, and screen-reader basics.
4. Verify universal/app-link association files on every configured domain and test them in signed preview builds. Development-client behavior is not sufficient evidence for cold-start linking.
5. Test and enable Android predictive back if navigation/overlay behavior is correct. Verify native dependencies and shipped libraries meet current Android page-size/alignment and store requirements.
6. Decide whether web remains a single-page export or needs static/server output for discoverability and server features. The current `single` setting produces one non-indexable HTML entry by design.
7. Review permission descriptions, privacy disclosures, data retention, notification setup, and store metadata against actual product behavior.
8. Define release gates and rollback: signed preview approval, crash-free/telemetry check, staged rollout, OTA compatibility check, and a documented rollback owner/process.

### Exit criteria

- Signed preview and production builds are reproducible from CI/EAS.
- Version/build identifiers advance automatically or through one documented release command.
- Critical platform flows pass on real iOS and Android devices.
- Observability and rollback are verified before the first production rollout.

## Phase 6 — Ongoing maintenance

Cadence: recurring

- Schedule dependency updates and Expo SDK upgrades; validate against the exact versioned Expo documentation and native compatibility map.
- Track the date-picker patch upstream. For every upgrade, test whether the patch is still necessary, refresh it if needed, and remove it as soon as upstream behavior is sufficient.
- Run periodic dependency, license, secret, and native-module duplication audits.
- Ratchet coverage and bundle budgets gradually; do not let them become frozen vanity metrics.
- Keep short architecture decision records for the app/package decision, global store conventions, deep-link trust model, update runtime policy, and supported platform matrix.
- Review README/docs in the same change whenever behavior or architecture changes.

## Recommended execution order

1. CI/check script, representative coverage, deterministic environment, and dependency deduplication.
2. Safe storage parsing/migrations and overlay completion/race hardening.
3. ImagePicker localization/error contract, segmented-control capability handling, and third-party device matrix.
4. Decide application versus reusable-kit architecture; remove the showcase from production startup.
5. Measure and reduce bundle/startup cost, beginning with icon fonts and route-level imports.
6. Add EAS profiles, native smoke coverage, versioning, observability verification, and release/rollback procedures.

## Deferred until evidence requires it

- A new state-management library.
- Blanket `memo`, `useMemo`, or `useCallback` changes.
- FlashList or another list implementation solely because the showcase is long.
- A rewrite of event buses/global stores that already have focused responsibilities and tests.
- File splitting based only on line count.
- Replacing accessible app-owned wrappers with raw third-party controls.

## Audit limitations

This audit included static inspection, dependency/configuration analysis, unit coverage, Storybook production build, Expo web production export, and Expo Atlas data. It did not include signed iOS/Android release builds, real-device performance traces, VoiceOver/TalkBack sessions, live notification delivery, or verified universal-link domains. Those are explicit roadmap work rather than assumed successes.

## Reference documentation

- [Expo SDK 57 reference](https://docs.expo.dev/versions/v57.0.0/)
- [Expo SDK 57 app configuration](https://docs.expo.dev/versions/v57.0.0/config/app/)
- [Expo Atlas bundle analysis](https://docs.expo.dev/guides/analyzing-bundles/)
- [EAS configuration](https://docs.expo.dev/eas/json/)
