import { Command } from "commander";

import type { GenerateChartPageInput } from "../../types/index.js";
import { generateChartPage } from "../../core/generator.js";
import { printJson, readJsonInput, writeHtmlOutput } from "./shared.js";

export function createGenerateCommand(): Command {
  return new Command("generate")
    .description("Generate a runnable single-file HTML chart page from structured JSON input.")
    .requiredOption("-i, --input <file>", "Path to the JSON input file.")
    .option("-o, --output <file>", "Path to write the generated HTML file.")
    .action(async (options: { input: string; output?: string }) => {
      const input = await readJsonInput<GenerateChartPageInput>(options.input);
      const result = generateChartPage(input);
      await writeHtmlOutput(options.output, result.html);

      if (options.output) {
        printJson({
          ok: true,
          chartType: result.chartType,
          output: options.output,
          warnings: result.warnings
        });
      }
    });
}
