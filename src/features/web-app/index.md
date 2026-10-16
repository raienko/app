[Docs](../../../docs/index.md) › [Features](../../../docs/features/index.md) › App services

# Web app

> The web build as an installable app (a PWA): add it to the home screen or dock, and it opens in its own window, offline too.

<sub>`src/features/web-app` · `public/`</sub>

```bash
yarn web:build   # dist/ — deploy it to any static host, over https
```

| Piece                             | Where                      | What it does                                                                                                      |
| --------------------------------- | -------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `manifest.json`, `icon-web-*.png` | `public/`, by `yarn brand` | Name, icons and window colours the browser installs with, from `assets/brand` (gitignored)                        |
| `index.html`                      | `public/`                  | Expo's page template plus the manifest link, the iOS home-screen tags and `viewport-fit=cover` for the notch      |
| `sw.js`                           | `public/`                  | The service worker: pages network first, hashed build files cache first, the rest refreshed in the background     |
| `<WebApp />`                      | `src/features/web-app`     | Mounted in Root. Registers `sw.js` in production builds, and keeps `theme-color` on the active theme's background |

- **Production only.** The service worker isn't registered by `yarn web`: it would answer with cached bundles over Metro's live ones. Try it with `yarn web:build` and any static server over `dist/`, e.g. `python3 -m http.server -d dist`. The script passes `.env` to Node itself because `expo export` reads `app.config.ts` before it loads `.env`.
- **Updates need nothing.** Pages come from the network first, so a deploy shows on the next launch; build files have content hashes, so a cached one is never stale. Bump `VERSION` in `sw.js` only to drop every cache after changing its rules.
- **Same-origin only.** API calls to another host, map tiles and fonts from a CDN are never cached by the worker; offline, the app opens and those requests fail as they would anyway.
- **Native is untouched.** `index.ts` is a no-op; only `index.web.ts` does anything.

---

[All features](../../../docs/features/index.md) · [Docs index](../../../docs/index.md)
