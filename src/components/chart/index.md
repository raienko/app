[Docs](../../../docs/index.md) › [Components](../../../docs/components/index.md) › Media & rich content

# Chart

> Line, area and bar charts drawn on Skia, with an accessible text summary.

<sub>`src/components/chart` · [Stories](index.stories.tsx) · Tests: [`index.test.tsx`](index.test.tsx), [`series.test.ts`](series.test.ts), [`summary.test.ts`](summary.test.ts)</sub>

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

---

[All components](../../../docs/components/index.md) · [Docs index](../../../docs/index.md)
