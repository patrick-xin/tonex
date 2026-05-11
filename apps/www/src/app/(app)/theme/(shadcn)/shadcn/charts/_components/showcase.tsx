import { ChartAreaStackedExpand } from "./chart-area-stacked-expand";
import { ChartLineLabelCustom } from "./chart-line-label-custom";
import { ChartPieDonut } from "./chart-pie-donut";
import { ChartPieDonutText } from "./chart-pie-donut-text";
import { ChartPieLegend } from "./chart-pie-legend";
import { ChartRadarGridFill } from "./chart-radar-grid-fill";
import { ChartRadialGrid } from "./chart-radial-grid";
import { ChartRadialStacked } from "./chart-radial-stacked";
import { ChartTooltipIndicatorLine } from "./chart-tooltip-indicator-line";

export default function ShadcnChartsShowcase() {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <ChartPieLegend />
        <ChartPieDonut />
        <ChartPieDonutText />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <ChartRadarGridFill />
        <ChartAreaStackedExpand />
        <ChartLineLabelCustom />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <ChartRadialGrid />
        <ChartRadialStacked />
        <ChartTooltipIndicatorLine />
      </div>
    </div>
  );
}
