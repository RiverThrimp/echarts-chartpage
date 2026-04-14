import { resolve } from "node:path";

import type { ChartValidationResult } from "../../types/index.js";
import { readJsonFile, readTextFile, writeTextFile } from "../../utils/files.js";

export async function readJsonInput<T>(filePath: string): Promise<T> {
  return readJsonFile<T>(resolve(filePath));
}

export async function readOptionalHtml(filePath?: string): Promise<string | undefined> {
  return filePath ? readTextFile(resolve(filePath)) : undefined;
}

export async function writeHtmlOutput(filePath: string | undefined, html: string): Promise<void> {
  if (!filePath) {
    process.stdout.write(`${html}\n`);
    return;
  }

  await writeTextFile(resolve(filePath), html);
}

export function printJson(value: unknown): void {
  process.stdout.write(`${JSON.stringify(value, null, 2)}\n`);
}

export function exitOnInvalid(result: ChartValidationResult): void {
  if (!result.valid) {
    process.exitCode = 1;
  }
}
