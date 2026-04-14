import { mkdir, readFile } from "node:fs/promises";
import { resolve } from "node:path";

import type { GenerateChartPageInput, PatchChartPageChanges } from "../src/index.js";
import { generateChartPage, patchChartPage } from "../src/index.js";
import { writeTextFile } from "../src/utils/files.js";

async function readJson<T>(relativePath: string): Promise<T> {
  const absolutePath = resolve(process.cwd(), relativePath);
  const content = await readFile(absolutePath, "utf8");
  return JSON.parse(content) as T;
}

async function main(): Promise<void> {
  const outputDir = resolve(process.cwd(), "examples/generated");
  await mkdir(outputDir, { recursive: true });

  const examplePairs = [
    ["examples/inputs/line-chart.json", "line-chart.html"],
    ["examples/inputs/bar-chart.json", "bar-chart.html"],
    ["examples/inputs/pie-chart.json", "pie-chart.html"],
    ["examples/inputs/multi-series.json", "multi-series.html"]
  ] as const;

  for (const [inputPath, outputName] of examplePairs) {
    const input = await readJson<GenerateChartPageInput>(inputPath);
    const result = generateChartPage(input);
    await writeTextFile(resolve(outputDir, outputName), result.html);
  }

  const base = await readJson<GenerateChartPageInput>("examples/inputs/patch-base.json");
  const patch = await readJson<PatchChartPageChanges>("examples/inputs/patch-update.json");
  const patched = patchChartPage({ base, patch });
  await writeTextFile(resolve(outputDir, "patch-example.html"), patched.html);
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.stack ?? error.message : String(error);
  process.stderr.write(`${message}\n`);
  process.exitCode = 1;
});
