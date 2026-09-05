import { Fragment, useMemo } from "react";
import { View } from "react-native";
import { matchFont } from "@shopify/react-native-skia";
import {
  Area,
  Bar,
  CartesianChart,
  Line,
  type CartesianChartRenderArg,
} from "victory-native";

import { disabledA11yProps } from "@/features/accessibility";
import { createStyles, useResponsive } from "@/features/responsive";
import { useTheme } from "@/features/theme";

import type { Series } from "./series";
import type { ChartRow, ChartType } from "./types";

/** Thin marks: a 2px line reads as data, a 6px one reads as decoration. */
const LINE_WIDTH = 2;
/** Rounds the top of a bar without rounding the baseline it stands on. */
const BAR_RADIUS = 4;
/** The fill under an `area`, faint enough that the line stays the subject. */
const AREA_OPACITY = 0.2;

type Props = {
  type: ChartType;
  data: ChartRow[];
  xKey: string;
  series: Series[];
  height: number;
  axes: boolean;
};

/**
 * The Skia half — everything that cannot render until CanvasKit is loaded.
 *
 * Split into its own module for that reason alone: on the web it is
 * imported lazily, behind `WithSkiaWeb`, so nothing in this file may be
 * reachable from `index.web.tsx`'s own imports. Native imports it directly.
 */
export default function ChartPlot({
  type,
  data,
  xKey,
  series,
  height,
  axes,
}: Props) {
  const theme = useTheme();
  const styles = useStyles();
  const { typography } = useResponsive();

  /**
   * Skia draws text with a font *object*, not a family name, so an axis
   * with no font renders its ticks and no labels at all — a grid, which is
   * not the same thing. `matchFont` asks the platform's own font manager
   * rather than making us bundle a `.ttf` for the sake of six numbers.
   *
   * **It returns nothing on the web, and that is CanvasKit, not us.**
   * CanvasKit's `FontMgr` exposes only `FromData` — there is no system font
   * manager in the WebAssembly build at all, verified in the browser — so
   * a font there has to be bundled and handed over as bytes. Native has a
   * real one and gets its labels.
   *
   * The failure is contained rather than fatal: Victory reads `null` as
   * "draw the axes without labels", so the web keeps its grid, its marks
   * and its accessible readout — which carries every number the labels
   * would have shown. Giving the web labels too means shipping a `.ttf`
   * and `useFont`, which is a bundle-size decision rather than a bug fix.
   */
  const font = useMemo(() => {
    try {
      // The rule exists to stop ad-hoc type styles being invented in
      // components; this is the opposite — Skia's font API takes a number,
      // and the number is the type scale's own `caption2` step, so the axis
      // labels scale with the device like every other size in the app.
      // eslint-disable-next-line no-restricted-syntax -- see above
      return matchFont({ fontSize: typography.caption2.fontSize });
    } catch {
      return null;
    }
  }, [typography.caption2.fontSize]);

  const yKeys = series.map((entry) => entry.key);

  return (
    // The canvas is a picture with nothing inside it to read — the readout
    // on the container above is what a screen reader gets instead.
    <View {...disabledA11yProps()} style={[styles.plot, { height }]}>
      <CartesianChart
        data={data as never}
        xKey={xKey as never}
        yKeys={yKeys as never}
        domainPadding={{ left: BAR_RADIUS * 4, right: BAR_RADIUS * 4, top: 12 }}
        axisOptions={
          axes
            ? {
                font,
                // Recessive on purpose. `border` is the token for an edge
                // that has to be *seen* — a control's boundary — and a grid
                // is not that: it is a reference the eye should be able to
                // ignore while reading the marks. This step is the faintest
                // the palette has that still resolves against both
                // schemes' backgrounds.
                lineColor: theme.colors.backgroundElementSelected,
                labelColor: theme.colors.textSecondary,
                lineWidth: 1,
              }
            : { font: null, lineWidth: 0, labelColor: "transparent" }
        }
      >
        {({ points, chartBounds }: CartesianChartRenderArg<never, never>) =>
          series.map((entry) => {
            const seriesPoints = (points as Record<string, never>)[entry.key];
            if (!seriesPoints) return null;

            if (type === "bar") {
              return (
                <Bar
                  key={entry.key}
                  points={seriesPoints}
                  chartBounds={chartBounds}
                  color={entry.color}
                  // Anchored to the baseline: rounding all four corners
                  // detaches a bar from the axis it is measured against.
                  roundedCorners={{ topLeft: BAR_RADIUS, topRight: BAR_RADIUS }}
                />
              );
            }

            return (
              // A Fragment, not a View: everything inside the canvas is a
              // Skia node, and a react-native View dropped in there is
              // handed to Skia's reconciler as if it were one. It renders
              // nothing and throws out of a ResizeObserver on the web —
              // which is exactly how this was found, as an empty plot with
              // a console full of "unobserve: parameter 1 is not of type
              // Element".
              <Fragment key={entry.key}>
                {type === "area" ? (
                  <Area
                    points={seriesPoints}
                    y0={chartBounds.bottom}
                    color={entry.color}
                    opacity={AREA_OPACITY}
                  />
                ) : null}
                <Line
                  points={seriesPoints}
                  color={entry.color}
                  strokeWidth={LINE_WIDTH}
                />
              </Fragment>
            );
          })
        }
      </CartesianChart>
    </View>
  );
}

const useStyles = createStyles(() => ({
  plot: {
    alignSelf: "stretch",
  },
}));
