import { z } from "zod";

import { CHART_GOALS, CHART_TYPES, OUTPUT_MODES, THEMES } from "../types/index.js";

const primitiveValueSchema = z.union([z.string(), z.number(), z.boolean(), z.null()]);

export const chartDataRecordSchema = z.record(primitiveValueSchema);

export const fieldsMappingSchema = z.object({
  x: z.string().min(1),
  y: z.union([z.string().min(1), z.array(z.string().min(1)).min(1)]),
  series: z.string().min(1).optional(),
  category: z.string().min(1).optional()
});

export const generateChartPageInputSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1).optional(),
  goal: z.enum(CHART_GOALS),
  data: z.array(chartDataRecordSchema),
  fields: fieldsMappingSchema,
  theme: z.enum(THEMES).optional(),
  outputMode: z.enum(OUTPUT_MODES).optional(),
  chartType: z.enum(CHART_TYPES).optional()
});

export const patchChartPageChangesSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().min(1).nullable().optional(),
  theme: z.enum(THEMES).optional(),
  goal: z.enum(CHART_GOALS).optional(),
  chartType: z.enum(CHART_TYPES).optional(),
  data: z.array(chartDataRecordSchema).optional(),
  fields: z
    .object({
      x: z.string().min(1).optional(),
      y: z.array(z.string().min(1)).min(1).optional(),
      series: z.string().min(1).nullable().optional(),
      category: z.string().min(1).nullable().optional()
    })
    .optional(),
  addY: z.array(z.string().min(1)).optional(),
  removeY: z.array(z.string().min(1)).optional()
});

export const patchChartPageInputSchema = z.object({
  base: generateChartPageInputSchema,
  patch: patchChartPageChangesSchema
});

export const validateChartPageInputSchema = z.object({
  input: generateChartPageInputSchema,
  html: z.string().min(1).optional()
});
