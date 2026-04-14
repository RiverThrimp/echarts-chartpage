import type { EChartsOption } from "echarts/types/dist/shared";

import type { ChartType, NormalizedChartPageSpec } from "../types/index.js";
import { inferFieldKind, sanitizeDataset, slugify, uniqueValues } from "../utils/data.js";

const PALETTE = ["#1677ff", "#ff7a45", "#00b96b", "#f6bd16", "#722ed1", "#13c2c2", "#eb2f96"];

function buildEmptyStateOption(theme: NormalizedChartPageSpec["theme"]): EChartsOption {
  return {
    backgroundColor: "transparent",
    xAxis: { show: false },
    yAxis: { show: false },
    series: [],
    graphic: {
      type: "text",
      left: "center",
      top: "middle",
      style: {
        text: "No data available",
        fill: theme === "dark" ? "#dce4ff" : "#4f6078",
        font: '600 18px "Avenir Next", "Segoe UI", sans-serif'
      }
    }
  };
}

function baseOption(): EChartsOption {
  return {
    color: PALETTE,
    animationDuration: 500,
    animationDurationUpdate: 250,
    backgroundColor: "transparent",
    textStyle: {
      fontFamily: '"Avenir Next", "Segoe UI", sans-serif'
    },
    tooltip: {
      confine: true
    }
  };
}

function buildSeriesName(chartType: ChartType, metric: string): Record<string, unknown> {
  const seriesType =
    chartType === "area" || chartType === "line"
      ? "line"
      : chartType === "stacked_bar"
        ? "bar"
        : chartType;

  return {
    type: seriesType,
    name: metric,
    smooth: chartType === "line" || chartType === "area",
    emphasis: {
      focus: "series"
    },
    areaStyle: chartType === "area" ? {} : undefined,
    stack: chartType === "stacked_bar" ? "total" : undefined
  };
}

function buildCartesianOption(
  spec: NormalizedChartPageSpec,
  chartType: "line" | "bar" | "stacked_bar" | "area" | "scatter"
): EChartsOption {
  if (spec.data.length === 0) {
    return buildEmptyStateOption(spec.theme);
  }

  const { fields } = spec;
  const xKind = inferFieldKind(spec.data, fields.x);
  const horizontal = spec.goal === "ranking" && (chartType === "bar" || chartType === "stacked_bar");
  const rawFields = [fields.x, ...fields.y, ...(fields.series ? [fields.series] : [])];
  const numericFields = [...fields.y, ...(chartType === "scatter" && xKind === "number" ? [fields.x] : [])];
  const source = sanitizeDataset(spec.data, rawFields, numericFields);
  const tooltipTrigger = chartType === "scatter" ? "item" : "axis";
  const primaryMetric = fields.y[0] ?? "";
  const axisType =
    chartType === "scatter"
      ? xKind === "time"
        ? "time"
        : "value"
      : xKind === "time"
        ? "time"
        : "category";

  const baseSeries =
    fields.series && fields.y.length === 1
      ? uniqueValues(source, fields.series).map((value) => {
          const name = String(value ?? "Unknown");
          const datasetId = `series-${slugify(name) || "unknown"}`;
          return {
            ...buildSeriesName(chartType, name),
            datasetId,
            encode: horizontal
              ? { x: primaryMetric, y: fields.x, tooltip: [fields.series!, fields.x, primaryMetric] }
              : { x: fields.x, y: primaryMetric, tooltip: [fields.series!, fields.x, primaryMetric] }
          };
        })
      : fields.y.map((metric) => ({
          ...buildSeriesName(chartType, metric),
          encode: horizontal
            ? { x: metric, y: fields.x, tooltip: [fields.x, metric] }
            : { x: fields.x, y: metric, tooltip: [fields.x, metric] }
        }));

  const datasets =
    fields.series && fields.y.length === 1
      ? [
          { id: "raw", source },
          ...uniqueValues(source, fields.series).map((value) => ({
            id: `series-${slugify(String(value ?? "unknown")) || "unknown"}`,
            fromDatasetId: "raw",
            transform: {
              type: "filter",
              config: {
                dimension: fields.series,
                "=": value
              }
            }
          }))
        ]
      : [{ id: "raw", source }];

  const sharedBase = baseOption();

  return {
    ...sharedBase,
    dataset: datasets,
    legend: {
      top: 0,
      type: "scroll"
    },
    grid: {
      left: 24,
      right: 24,
      top: 52,
      bottom: 24,
      containLabel: true
    },
    tooltip: {
      confine: true,
      trigger: tooltipTrigger
    },
    xAxis: horizontal
      ? { type: "value", nameLocation: "middle" }
      : {
          type: axisType,
          boundaryGap: chartType === "bar" || chartType === "stacked_bar",
          axisLabel: {
            hideOverlap: true
          }
        },
    yAxis: horizontal
      ? {
          type: "category",
          axisLabel: {
            width: 180,
            overflow: "truncate"
          }
        }
      : {
          type: "value",
          splitLine: {
            lineStyle: {
              type: "dashed"
            }
          }
        },
    series: baseSeries
  };
}

function buildPieOption(
  spec: NormalizedChartPageSpec,
  chartType: "pie" | "donut"
): EChartsOption {
  if (spec.data.length === 0) {
    return buildEmptyStateOption(spec.theme);
  }

  const labelField = spec.fields.category ?? spec.fields.x;
  const metric = spec.fields.y[0] ?? "";
  const source = sanitizeDataset(spec.data, [labelField, metric], [metric]);
  const sharedBase = baseOption();

  return {
    ...sharedBase,
    dataset: [{ id: "raw", source }],
    legend: {
      bottom: 0,
      type: "scroll"
    },
    tooltip: {
      confine: true,
      trigger: "item"
    },
    series: [
      {
        type: "pie",
        radius: chartType === "donut" ? ["46%", "72%"] : "70%",
        center: ["50%", "45%"],
        avoidLabelOverlap: true,
        itemStyle: {
          borderRadius: 8,
          borderColor: "rgba(255,255,255,0.15)",
          borderWidth: 1
        },
        encode: {
          itemName: labelField,
          value: metric,
          tooltip: [labelField, metric]
        }
      }
    ]
  };
}

export function buildChartOption(
  spec: NormalizedChartPageSpec,
  chartType: ChartType
): { option: EChartsOption | null; warnings: string[] } {
  if (chartType === "table") {
    return {
      option: null,
      warnings: ["The selected configuration falls back to a table view instead of an ECharts series chart."]
    };
  }

  if (chartType === "pie" || chartType === "donut") {
    return { option: buildPieOption(spec, chartType), warnings: [] };
  }

  if (chartType === "line" || chartType === "bar" || chartType === "stacked_bar" || chartType === "area") {
    return { option: buildCartesianOption(spec, chartType), warnings: [] };
  }

  if (chartType === "scatter") {
    return { option: buildCartesianOption(spec, "scatter"), warnings: [] };
  }

  return {
    option: null,
    warnings: ["Unsupported chart type requested."]
  };
}
