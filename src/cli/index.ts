#!/usr/bin/env node

import { existsSync, realpathSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { Command } from "commander";

import { createGenerateCommand } from "./commands/generate.js";
import { createPatchCommand } from "./commands/patch.js";
import { createRecommendCommand } from "./commands/recommend.js";
import { createValidateCommand } from "./commands/validate.js";

export async function runCli(argv = process.argv): Promise<void> {
  const program = new Command();

  program
    .name("echarts-chartpage")
    .description("Generate controlled Apache ECharts HTML pages from structured JSON data.")
    .version("0.1.0");

  program.addCommand(createGenerateCommand());
  program.addCommand(createRecommendCommand());
  program.addCommand(createValidateCommand());
  program.addCommand(createPatchCommand());

  await program.parseAsync(argv);
}

function isDirectExecution(): boolean {
  if (!process.argv[1] || !existsSync(process.argv[1])) {
    return false;
  }

  return realpathSync(process.argv[1]) === fileURLToPath(import.meta.url);
}

if (isDirectExecution()) {
  runCli().catch((error: unknown) => {
    const message = error instanceof Error ? error.message : String(error);
    process.stderr.write(`${message}\n`);
    process.exitCode = 1;
  });
}
