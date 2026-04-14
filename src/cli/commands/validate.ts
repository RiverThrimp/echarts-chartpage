import { Command } from "commander";

import type { GenerateChartPageInput } from "../../types/index.js";
import { validateChartPageRequest } from "../../core/validator.js";
import { exitOnInvalid, printJson, readJsonInput, readOptionalHtml } from "./shared.js";

export function createValidateCommand(): Command {
  return new Command("validate")
    .description("Validate chart input and optionally validate generated HTML output.")
    .requiredOption("-i, --input <file>", "Path to the JSON input file.")
    .option("--html <file>", "Optional path to an HTML file for output validation.")
    .action(async (options: { input: string; html?: string }) => {
      const input = await readJsonInput<GenerateChartPageInput>(options.input);
      const html = await readOptionalHtml(options.html);
      const result = validateChartPageRequest({ input, html });
      printJson(result);
      exitOnInvalid(result);
    });
}
