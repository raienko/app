[Docs](../../../docs/index.md) › [Components](../../../docs/components/index.md) › Media & rich content

# WebView

> An embedded web page with a two-way event bridge and the app's typography.

<sub>`src/components/web-view` · [Stories](index.stories.tsx) · Tests: [`bridge.test.ts`](bridge.test.ts), [`index.test.tsx`](index.test.tsx), [`injection.test.ts`](injection.test.ts), [`styling.test.tsx`](styling.test.tsx), [`theme-css.test.ts`](theme-css.test.ts)</sub>

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

---

[All components](../../../docs/components/index.md) · [Docs index](../../../docs/index.md)
