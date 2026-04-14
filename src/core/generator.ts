import type { GenerateChartPageInput, GenerateChartPageResult } from "../types/index.js";
import { buildChartHtml } from "./html-builder.js";
import { buildChartOption } from "./option-builder.js";
import { checkChartCompatibility, validateChartInput } from "./validator.js";

export function generateChartPage(input: GenerateChartPageInput): GenerateChartPageResult {
  const validation = validateChartInput(input);
  if (!validation.valid || !validation.normalizedSpec || !validation.recommendation) {
    throw new Error(validation.errors.join("\n") || "Chart input validation failed.");
  }

  const spec = validation.normalizedSpec;
  const recommendation = validation.recommendation;
  const requestedChartType = spec.chartType ?? recommendation.chartType;
  const compatibility = checkChartCompatibility(spec, requestedChartType);
  const chartType = compatibility.compatible ? requestedChartType : "table";
  const optionResult = buildChartOption(spec, chartType);
  const warnings = [...validation.warnings, ...compatibility.warnings, ...optionResult.warnings];

  const result: GenerateChartPageResult = {
    html: "",
    option: optionResult.option,
    chartType,
    warnings,
    spec: {
      ...spec,
      chartType
    },
    recommendation
  };

  result.html = buildChartHtml(result);
  return result;
}
