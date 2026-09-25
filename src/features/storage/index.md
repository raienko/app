[Docs](../../../docs/index.md) › [Features](../../../docs/features/index.md) › App services

# Local storage

> `LocalValue<T>` — a small MMKV-backed reactive value.

<sub>`src/features/storage` · Tests: [`persistence.test.ts`](persistence.test.ts)</sub>

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

---

[All features](../../../docs/features/index.md) · [Docs index](../../../docs/index.md)
