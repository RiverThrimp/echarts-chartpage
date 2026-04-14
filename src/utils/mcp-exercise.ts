import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { CallToolResultSchema, ListToolsResultSchema } from "@modelcontextprotocol/sdk/types.js";

import type { GenerateChartPageInput, PatchChartPageChanges } from "../types/index.js";

export interface McpExerciseCheck {
  name: string;
  passed: boolean;
  details: Record<string, unknown>;
}

export interface McpExerciseResult {
  ok: boolean;
  toolNames: string[];
  checks: McpExerciseCheck[];
}

async function readJson<T>(relativePath: string): Promise<T> {
  const content = await readFile(resolve(process.cwd(), relativePath), "utf8");
  return JSON.parse(content) as T;
}

function extractStructuredContent(result: unknown): Record<string, unknown> {
  if (
    typeof result === "object" &&
    result !== null &&
    "structuredContent" in result &&
    typeof result.structuredContent === "object" &&
    result.structuredContent !== null
  ) {
    return result.structuredContent as Record<string, unknown>;
  }

  throw new Error("Missing structuredContent in MCP tool result.");
}

export async function runMcpExercise(serverArgs = ["dist/mcp/server.js"]): Promise<McpExerciseResult> {
  const client = new Client({
    name: "echarts-chartpage-exerciser",
    version: "0.1.0"
  });

  const transport = new StdioClientTransport({
    command: "node",
    args: serverArgs,
    cwd: process.cwd(),
    stderr: "pipe"
  });

  const checks: McpExerciseCheck[] = [];

  try {
    await client.connect(transport);

    const listResult = await client.request(
      {
        method: "tools/list",
        params: {}
      },
      ListToolsResultSchema
    );

    const toolNames = listResult.tools.map((tool) => tool.name).sort();
    checks.push({
      name: "tools.list",
      passed:
        JSON.stringify(toolNames) ===
        JSON.stringify([
          "generate_chart_page",
          "patch_chart_page",
          "recommend_chart_type",
          "validate_chart_page"
        ]),
      details: {
        toolNames
      }
    });

    const lineInput = await readJson<GenerateChartPageInput>("examples/inputs/line-chart.json");
    const patchBase = await readJson<GenerateChartPageInput>("examples/inputs/patch-base.json");
    const patchChanges = await readJson<PatchChartPageChanges>("examples/inputs/patch-update.json");

    const recommendResult = await client.request(
      {
        method: "tools/call",
        params: {
          name: "recommend_chart_type",
          arguments: lineInput
        }
      },
      CallToolResultSchema
    );
    const recommendStructured = extractStructuredContent(recommendResult);
    checks.push({
      name: "recommend_chart_type",
      passed:
        typeof recommendStructured.chartType === "string" &&
        ["line", "area"].includes(recommendStructured.chartType),
      details: {
        chartType: recommendStructured.chartType,
        confidence: recommendStructured.confidence
      }
    });

    const generateResult = await client.request(
      {
        method: "tools/call",
        params: {
          name: "generate_chart_page",
          arguments: lineInput
        }
      },
      CallToolResultSchema
    );
    const generateStructured = extractStructuredContent(generateResult);
    const generatedHtml =
      typeof generateStructured.html === "string" ? generateStructured.html : "";
    checks.push({
      name: "generate_chart_page",
      passed:
        typeof generateStructured.chartType === "string" &&
        generatedHtml.toLowerCase().includes("<!doctype html>") &&
        generatedHtml.includes("echarts.min.js"),
      details: {
        chartType: generateStructured.chartType,
        htmlSize: generatedHtml.length
      }
    });

    const validateResult = await client.request(
      {
        method: "tools/call",
        params: {
          name: "validate_chart_page",
          arguments: {
            input: lineInput,
            html: generatedHtml
          }
        }
      },
      CallToolResultSchema
    );
    const validateStructured = extractStructuredContent(validateResult);
    checks.push({
      name: "validate_chart_page.valid",
      passed: validateStructured.valid === true,
      details: {
        valid: validateStructured.valid,
        errors: validateStructured.errors,
        htmlChecks: validateStructured.htmlChecks
      }
    });

    const invalidValidateResult = await client.request(
      {
        method: "tools/call",
        params: {
          name: "validate_chart_page",
          arguments: {
            input: {
              ...lineInput,
              fields: {
                ...lineInput.fields,
                x: "missing_field"
              }
            }
          }
        }
      },
      CallToolResultSchema
    );
    const invalidValidateStructured = extractStructuredContent(invalidValidateResult);
    const invalidErrors = Array.isArray(invalidValidateStructured.errors)
      ? invalidValidateStructured.errors
      : [];
    checks.push({
      name: "validate_chart_page.invalid",
      passed:
        invalidValidateStructured.valid === false &&
        invalidErrors.some(
          (error) => typeof error === "string" && error.includes("missing_field")
        ),
      details: {
        valid: invalidValidateStructured.valid,
        errors: invalidErrors
      }
    });

    const patchResult = await client.request(
      {
        method: "tools/call",
        params: {
          name: "patch_chart_page",
          arguments: {
            base: patchBase,
            patch: patchChanges
          }
        }
      },
      CallToolResultSchema
    );
    const patchStructured = extractStructuredContent(patchResult);
    const patchSpec =
      typeof patchStructured.spec === "object" && patchStructured.spec !== null
        ? (patchStructured.spec as Record<string, unknown>)
        : {};
    checks.push({
      name: "patch_chart_page",
      passed:
        patchSpec.title === "Quarterly Pipeline Snapshot" &&
        patchSpec.theme === "dark" &&
        typeof patchStructured.html === "string",
      details: {
        title: patchSpec.title,
        theme: patchSpec.theme,
        chartType: patchStructured.chartType
      }
    });

    return {
      ok: checks.every((check) => check.passed),
      toolNames,
      checks
    };
  } finally {
    await transport.close();
  }
}
