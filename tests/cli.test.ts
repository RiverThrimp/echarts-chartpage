import { execFile } from "node:child_process";
import { mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import { promisify } from "node:util";

import { describe, expect, it } from "vitest";

import { lineInput } from "./fixtures.js";

const execFileAsync = promisify(execFile);

describe("CLI", () => {
  it("generates HTML from a JSON input file", async () => {
    const workdir = await mkdtemp(resolve(tmpdir(), "echarts-chartpage-"));
    const inputPath = resolve(workdir, "input.json");
    const outputPath = resolve(workdir, "output.html");

    await writeFile(inputPath, JSON.stringify(lineInput, null, 2), "utf8");

    await execFileAsync(process.execPath, [
      "--import",
      "tsx",
      "src/cli/index.ts",
      "generate",
      "--input",
      inputPath,
      "--output",
      outputPath
    ]);

    const html = await readFile(outputPath, "utf8");
    expect(html).toContain("<!doctype html>");
    expect(html).toContain("Monthly Revenue Trend");
  });
});
