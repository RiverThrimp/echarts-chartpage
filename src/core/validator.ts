import { generateChartPageInputSchema, validateChartPageInputSchema } from "../schemas/chart.js";
import type {
  ChartType,
  ChartValidationResult,
  GenerateChartPageInput,
  NormalizedChartPageSpec,
  ValidateChartPageInput
} from "../types/index.js";
import { collectFieldNames, inferFieldKind, normalizeFields } from "../utils/data.js";
import { ECHARTS_CDN } from "./templates/page-template.js";
import { recommendChartType } from "./chart-recommender.js";

function normalizeSpec(input: GenerateChartPageInput): NormalizedChartPageSpec {
  return {
    ...input,
    description: input.description,
    theme: input.theme ?? "light",
    outputMode: input.outputMode ?? "single_html",
    fields: normalizeFields(input.fields)
  };
}

export function checkChartCompatibility(
  spec: NormalizedChartPageSpec,
  chartType: ChartType
): { compatible: boolean; warnings: string[] } {
  const warnings: string[] = [];
  const xKind = inferFieldKind(spec.data, spec.fields.x);
  const yKinds = spec.fields.y.map((field) => inferFieldKind(spec.data, field));
  const allNumericY = yKinds.every((kind) => kind === "number");

  if (chartType === "table") {
    return { compatible: true, warnings };
  }

  if (!allNumericY) {
    warnings.push("The selected y field mapping must resolve to numeric values for chart rendering.");
  }

  if (spec.fields.series && spec.fields.y.length > 1) {
    warnings.push("A series split combined with multiple y metrics is not supported in the controlled builder.");
  }

  if ((chartType === "pie" || chartType === "donut") && spec.fields.y.length !== 1) {
    warnings.push("Pie and donut charts require exactly one y metric.");
  }

  if (chartType === "scatter" && spec.fields.y.length !== 1) {
    warnings.push("Scatter charts require exactly one y metric.");
  }

  if (chartType === "scatter" && xKind !== "number" && xKind !== "time") {
    warnings.push("Scatter charts require the x field to be numeric or time-like.");
  }

  if ((chartType === "pie" || chartType === "donut") && spec.fields.series) {
    warnings.push("Pie and donut charts ignore the series mapping in this controlled builder.");
  }

  const compatible = warnings.length === 0;
  return { compatible, warnings };
}

export function validateGeneratedHtml(html: string): string[] {
  const checks: string[] = [];
  if (!html.toLowerCase().includes("<!doctype html>")) {
    checks.push("Missing HTML doctype.");
  }
  if (!html.includes(ECHARTS_CDN)) {
    checks.push("Missing ECharts CDN script tag.");
  }
  if (!html.includes('id="chart-root"')) {
    checks.push("Missing chart root container.");
  }
  if (!html.includes("window.addEventListener(\"resize\"")) {
    checks.push("Missing responsive resize binding.");
  }
  if (!html.includes("Generated with echarts-chartpage")) {
    checks.push("Missing generator attribution footer.");
  }
  return checks;
}

export function validateChartInput(input: GenerateChartPageInput): ChartValidationResult {
  const parsed = generateChartPageInputSchema.safeParse(input);

  if (!parsed.success) {
    return {
      valid: false,
      errors: parsed.error.issues.map((issue) => `${issue.path.join(".") || "input"}: ${issue.message}`),
      warnings: [],
      availableFields: []
    };
  }

  const spec = normalizeSpec(parsed.data);
  const errors: string[] = [];
  const warnings: string[] = [];
  const availableFields = collectFieldNames(spec.data);
  const mappedFields = [
    spec.fields.x,
    ...spec.fields.y,
    spec.fields.series,
    spec.fields.category
  ].filter((field): field is string => Boolean(field));

  if (spec.fields.y.length === 0) {
    errors.push("At least one y field is required.");
  }

  if (new Set(spec.fields.y).size !== spec.fields.y.length) {
    errors.push("Duplicate y fields are not allowed.");
  }

  if (spec.data.length === 0) {
    warnings.push("The dataset is empty. Generation will fall back to an empty-state chart or table.");
  }

  if (availableFields.length > 0) {
    for (const field of mappedFields) {
      if (!availableFields.includes(field)) {
        errors.push(`Mapped field "${field}" does not exist in the dataset.`);
      }
    }
  }

  const recommendation = recommendChartType(spec);
  if (spec.chartType) {
    const compatibility = checkChartCompatibility(spec, spec.chartType);
    warnings.push(...compatibility.warnings);
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    availableFields,
    normalizedSpec: spec,
    recommendation
  };
}

export function validateChartPageRequest(request: ValidateChartPageInput): ChartValidationResult {
  const parsed = validateChartPageInputSchema.safeParse(request);

  if (!parsed.success) {
    return {
      valid: false,
      errors: parsed.error.issues.map((issue) => `${issue.path.join(".") || "input"}: ${issue.message}`),
      warnings: [],
      availableFields: []
    };
  }

  const result = validateChartInput(parsed.data.input);
  if (parsed.data.html) {
    result.htmlChecks = validateGeneratedHtml(parsed.data.html);
    if (result.htmlChecks.length > 0) {
      result.valid = false;
      result.errors.push(...result.htmlChecks);
    }
  }

  return result;
}
