export const CHART_GOALS = [
  "trend",
  "compare",
  "composition",
  "distribution",
  "ranking",
  "correlation"
] as const;

export const CHART_TYPES = [
  "line",
  "bar",
  "stacked_bar",
  "pie",
  "donut",
  "scatter",
  "area",
  "table"
] as const;

export const THEMES = ["light", "dark"] as const;
export const OUTPUT_MODES = ["single_html"] as const;

export type ChartGoal = (typeof CHART_GOALS)[number];
export type ChartType = (typeof CHART_TYPES)[number];
export type ThemeMode = (typeof THEMES)[number];
export type OutputMode = (typeof OUTPUT_MODES)[number];

export type ChartDataRecord = Record<string, string | number | boolean | null>;

export interface FieldsMappingInput {
  x: string;
  y: string | string[];
  series?: string;
  category?: string;
}

export interface FieldsMapping {
  x: string;
  y: string[];
  series?: string;
  category?: string;
}

export interface GenerateChartPageInput {
  title: string;
  description?: string;
  goal: ChartGoal;
  data: ChartDataRecord[];
  fields: FieldsMappingInput;
  theme?: ThemeMode;
  outputMode?: OutputMode;
  chartType?: ChartType;
}

export interface ChartRecommendation {
  chartType: ChartType;
  reason: string;
  confidence: "high" | "medium" | "low";
  alternatives: ChartType[];
}

export interface ChartValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  availableFields: string[];
  normalizedSpec?: NormalizedChartPageSpec;
  recommendation?: ChartRecommendation;
  htmlChecks?: string[];
}

export interface NormalizedChartPageSpec {
  title: string;
  description?: string;
  goal: ChartGoal;
  data: ChartDataRecord[];
  fields: FieldsMapping;
  theme: ThemeMode;
  outputMode: OutputMode;
  chartType?: ChartType;
}

export interface GenerateChartPageResult {
  html: string;
  option: EChartsOption | null;
  chartType: ChartType;
  warnings: string[];
  spec: NormalizedChartPageSpec;
  recommendation: ChartRecommendation;
}

export interface PatchChartPageChanges {
  title?: string;
  description?: string | null;
  theme?: ThemeMode;
  goal?: ChartGoal;
  chartType?: ChartType;
  data?: ChartDataRecord[];
  fields?: Partial<{
    x: string;
    y: string[];
    series: string | null;
    category: string | null;
  }>;
  addY?: string[];
  removeY?: string[];
}

export interface PatchChartPageInput {
  base: GenerateChartPageInput;
  patch: PatchChartPageChanges;
}

export interface ValidateChartPageInput {
  input: GenerateChartPageInput;
  html?: string;
}
import type { EChartsOption } from "echarts/types/dist/shared";
