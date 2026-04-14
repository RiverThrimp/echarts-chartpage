import type {
  ChartRecommendation,
  ChartType,
  GenerateChartPageInput,
  NormalizedChartPageSpec
} from "../types/index.js";
import { inferFieldKind, normalizeFields, uniqueValues } from "../utils/data.js";

function normalizeSpec(input: GenerateChartPageInput | NormalizedChartPageSpec): NormalizedChartPageSpec {
  return {
    ...input,
    description: input.description,
    theme: input.theme ?? "light",
    outputMode: input.outputMode ?? "single_html",
    fields: normalizeFields(input.fields)
  };
}

function buildAlternatives(primary: ChartType, alternatives: ChartType[]): ChartType[] {
  return Array.from(new Set(alternatives.filter((item) => item !== primary)));
}

export function recommendChartType(
  input: GenerateChartPageInput | NormalizedChartPageSpec
): ChartRecommendation {
  const spec = normalizeSpec(input);
  const { data, fields, goal } = spec;
  const xKind = inferFieldKind(data, fields.x);
  const yKinds = fields.y.map((field) => inferFieldKind(data, field));
  const hasNumericY = yKinds.some((kind) => kind === "number");
  const categoryField = fields.category ?? fields.x;
  const categoryCount = uniqueValues(data, categoryField).length;

  if (data.length === 0) {
    return {
      chartType: "table",
      reason: "The dataset is empty, so a table fallback is the safest stable output.",
      confidence: "high",
      alternatives: ["bar", "line"]
    };
  }

  if (!hasNumericY) {
    return {
      chartType: "table",
      reason: "No numeric metric field was detected, so an ECharts quantitative chart would be unreliable.",
      confidence: "high",
      alternatives: ["bar"]
    };
  }

  if (goal === "correlation") {
    if ((xKind === "number" || xKind === "time") && fields.y.length === 1 && yKinds[0] === "number") {
      return {
        chartType: "scatter",
        reason: "Correlation is best represented by numeric x/y pairs in a scatter plot.",
        confidence: "high",
        alternatives: ["line", "table"]
      };
    }
    return {
      chartType: "table",
      reason: "Correlation requires one numeric x field and one numeric y field.",
      confidence: "high",
      alternatives: ["scatter"]
    };
  }

  if (goal === "composition") {
    if (fields.y.length === 1 && yKinds[0] === "number") {
      return {
        chartType: categoryCount <= 6 ? "donut" : "pie",
        reason: "Composition is easiest to read as part-to-whole slices when a single numeric metric is present.",
        confidence: "high",
        alternatives: buildAlternatives(categoryCount <= 6 ? "donut" : "pie", [
          "stacked_bar",
          "bar",
          "table"
        ])
      };
    }
    return {
      chartType: "stacked_bar",
      reason: "Composition with multiple metrics is more stable as stacked bars.",
      confidence: "medium",
      alternatives: ["bar", "table"]
    };
  }

  if (goal === "trend") {
    return {
      chartType: fields.y.length === 1 && !fields.series ? "area" : "line",
      reason: "Trend analysis is usually clearest with continuous line-based charts.",
      confidence: xKind === "time" ? "high" : "medium",
      alternatives: buildAlternatives(fields.y.length === 1 && !fields.series ? "area" : "line", [
        "line",
        "area",
        "bar"
      ])
    };
  }

  if (goal === "ranking") {
    return {
      chartType: "bar",
      reason: "Ranking is easiest to scan in bars ordered against a categorical dimension.",
      confidence: "high",
      alternatives: ["stacked_bar", "table"]
    };
  }

  if (goal === "distribution") {
    if ((xKind === "number" || xKind === "time") && fields.y.length === 1 && yKinds[0] === "number") {
      return {
        chartType: "scatter",
        reason: "A numeric distribution with two measures is best surfaced by scatter points.",
        confidence: "medium",
        alternatives: ["bar", "table"]
      };
    }
    return {
      chartType: "bar",
      reason: "Categorical distribution is stable and readable as a bar chart.",
      confidence: "medium",
      alternatives: ["pie", "table"]
    };
  }

  if (goal === "compare") {
    if (fields.series && fields.y.length === 1) {
      return {
        chartType: "stacked_bar",
        reason: "A split series metric compares well as stacked bars over a shared category axis.",
        confidence: "high",
        alternatives: ["bar", "line"]
      };
    }
    return {
      chartType: "bar",
      reason: "Compare goals are typically easiest to scan in grouped or multi-metric bars.",
      confidence: "high",
      alternatives: ["stacked_bar", "table"]
    };
  }

  return {
    chartType: "table",
    reason: "No safe chart recommendation matched the current field combination.",
    confidence: "low",
    alternatives: ["bar", "line"]
  };
}
