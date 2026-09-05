import { View } from "react-native";
import { WithSkiaWeb } from "@shopify/react-native-skia/lib/module/web";

import Spinner from "@/components/spinner";
import { createStyles } from "@/features/responsive";

import ChartFrame from "./frame";
import type { ChartProps, ChartRow } from "./types";

export type { ChartProps, ChartRow, ChartType } from "./types";
export { MAX_SERIES } from "./series";

/**
 * The browser's `Chart`. Same props, same frame, same readout — the one
 * difference is that the plot cannot be drawn until CanvasKit is loaded.
 *
 * Skia on the web is a WebAssembly build of the same engine, ~8MB of it,
 * fetched at runtime. `WithSkiaWeb` is Skia's own answer: it code-splits
 * the Skia-dependent module behind a `lazy` import and awaits the load
 * first. So `./plot` must be reachable *only* through that dynamic import —
 * a static import of it anywhere in this file's graph would pull Skia into
 * the main bundle and undo the split.
 *
 * The frame renders immediately either way, which is what makes the wait
 * tolerable: the legend and the accessible readout are there from the first
 * paint, and only the picture arrives late. A screen-reader user therefore
 * never waits for CanvasKit at all — they were never going to read the
 * canvas.
 *
 * See ./index.tsx for the component's own documentation.
 */
export default function Chart<Row extends ChartRow>(props: ChartProps<Row>) {
  const styles = useStyles();

  return (
    <ChartFrame {...props}>
      {({ series, height, data }) => (
        <View style={[styles.plot, { height }]}>
          <WithSkiaWeb
            getComponent={() => import("./plot")}
            componentProps={{
              type: props.type ?? "line",
              data,
              xKey: props.xKey,
              series,
              height,
              axes: props.axes ?? true,
            }}
            fallback={
              <View style={styles.loading}>
                {/* Named, because on a slow connection this is on screen
                    long enough to be the only thing there. */}
                <Spinner label="Loading chart" />
              </View>
            }
          />
        </View>
      )}
    </ChartFrame>
  );
}

const useStyles = createStyles(() => ({
  plot: {
    alignSelf: "stretch",
  },
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
}));
