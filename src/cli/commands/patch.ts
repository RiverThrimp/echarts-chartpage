import { Command } from "commander";

import type { GenerateChartPageInput, PatchChartPageChanges } from "../../types/index.js";
import { patchChartPage } from "../../core/patcher.js";
import { printJson, readJsonInput, writeHtmlOutput } from "./shared.js";

export function createPatchCommand(): Command {
  return new Command("patch")
    .description("Patch an existing chart page spec and regenerate HTML.")
    .requiredOption("-b, --base <file>", "Path to the original JSON chart input file.")
    .requiredOption("-p, --patch <file>", "Path to the patch JSON file.")
    .option("-o, --output <file>", "Path to write the regenerated HTML file.")
    .action(async (options: { base: string; patch: string; output?: string }) => {
      const base = await readJsonInput<GenerateChartPageInput>(options.base);
      const patch = await readJsonInput<PatchChartPageChanges>(options.patch);
      const result = patchChartPage({ base, patch });
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
