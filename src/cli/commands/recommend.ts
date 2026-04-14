import { Command } from "commander";

import type { GenerateChartPageInput } from "../../types/index.js";
import { recommendChartType } from "../../core/chart-recommender.js";
import { printJson, readJsonInput } from "./shared.js";

export function createRecommendCommand(): Command {
  return new Command("recommend")
    .description("Recommend a safe chart type from the provided data mapping.")
    .requiredOption("-i, --input <file>", "Path to the JSON input file.")
    .action(async (options: { input: string }) => {
      const input = await readJsonInput<GenerateChartPageInput>(options.input);
      printJson(recommendChartType(input));
    });
}
