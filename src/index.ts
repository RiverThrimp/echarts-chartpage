export { generateChartPage } from "./core/generator.js";
export { recommendChartType } from "./core/chart-recommender.js";
export { validateChartInput, validateChartPageRequest, validateGeneratedHtml } from "./core/validator.js";
export { patchChartPage } from "./core/patcher.js";
export { buildChartOption } from "./core/option-builder.js";
export { buildChartHtml } from "./core/html-builder.js";
export {
  generateChartPageInputSchema,
  patchChartPageChangesSchema,
  patchChartPageInputSchema,
  validateChartPageInputSchema
} from "./schemas/chart.js";
export type {
  ChartDataRecord,
  ChartGoal,
  ChartRecommendation,
  ChartType,
  ChartValidationResult,
  FieldsMapping,
  FieldsMappingInput,
  GenerateChartPageInput,
  GenerateChartPageResult,
  NormalizedChartPageSpec,
  OutputMode,
  PatchChartPageChanges,
  PatchChartPageInput,
  ThemeMode,
  ValidateChartPageInput
} from "./types/index.js";
