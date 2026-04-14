import { patchChartPageInputSchema } from "../schemas/chart.js";
import type {
  FieldsMappingInput,
  GenerateChartPageInput,
  GenerateChartPageResult,
  PatchChartPageChanges,
  PatchChartPageInput
} from "../types/index.js";
import { normalizeFields } from "../utils/data.js";
import { generateChartPage } from "./generator.js";

function applyFieldPatch(
  currentFields: FieldsMappingInput,
  patch: PatchChartPageChanges
): FieldsMappingInput {
  const normalizedCurrent = normalizeFields(currentFields);
  const nextY = patch.fields?.y
    ? [...patch.fields.y]
    : normalizedCurrent.y
        .filter((field) => !patch.removeY?.includes(field))
        .concat(patch.addY ?? []);

  return {
    x: patch.fields?.x ?? normalizedCurrent.x,
    y: Array.from(new Set(nextY)),
    series:
      patch.fields?.series === null
        ? undefined
        : patch.fields?.series ?? normalizedCurrent.series,
    category:
      patch.fields?.category === null
        ? undefined
        : patch.fields?.category ?? normalizedCurrent.category
  };
}

export function patchChartPage(input: PatchChartPageInput): GenerateChartPageResult {
  const parsed = patchChartPageInputSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error(parsed.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`).join("\n"));
  }

  const nextSpec: GenerateChartPageInput = {
    ...parsed.data.base,
    title: parsed.data.patch.title ?? parsed.data.base.title,
    description:
      parsed.data.patch.description === null
        ? undefined
        : parsed.data.patch.description ?? parsed.data.base.description,
    goal: parsed.data.patch.goal ?? parsed.data.base.goal,
    data: parsed.data.patch.data ?? parsed.data.base.data,
    theme: parsed.data.patch.theme ?? parsed.data.base.theme,
    outputMode: parsed.data.base.outputMode ?? "single_html",
    chartType: parsed.data.patch.chartType ?? parsed.data.base.chartType,
    fields: applyFieldPatch(parsed.data.base.fields, parsed.data.patch)
  };

  return generateChartPage(nextSpec);
}
