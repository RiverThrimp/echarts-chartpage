import { existsSync, realpathSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { z } from "zod";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

import { recommendChartType } from "../core/chart-recommender.js";
import { generateChartPage } from "../core/generator.js";
import { patchChartPage } from "../core/patcher.js";
import { validateChartPageRequest } from "../core/validator.js";
import { generateChartPageInputSchema, patchChartPageChangesSchema } from "../schemas/chart.js";

const toolInputSchema = {
  title: z.string().min(1),
  description: z.string().min(1).optional(),
  goal: z.enum(["trend", "compare", "composition", "distribution", "ranking", "correlation"]),
  data: z.array(z.record(z.union([z.string(), z.number(), z.boolean(), z.null()]))),
  fields: z.object({
    x: z.string().min(1),
    y: z.union([z.string().min(1), z.array(z.string().min(1)).min(1)]),
    series: z.string().min(1).optional(),
    category: z.string().min(1).optional()
  }),
  theme: z.enum(["light", "dark"]).optional(),
  outputMode: z.literal("single_html").optional(),
  chartType: z
    .enum(["line", "bar", "stacked_bar", "pie", "donut", "scatter", "area", "table"])
    .optional()
};

function toToolResult<T extends object>(data: T): {
  content: Array<{ type: "text"; text: string }>;
  structuredContent: T & Record<string, unknown>;
} {
  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(data, null, 2)
      }
    ],
    structuredContent: data as T & Record<string, unknown>
  };
}

export function createMcpServer(): McpServer {
  const server = new McpServer({
    name: "echarts-chartpage",
    version: "0.1.0"
  });

  server.registerTool(
    "recommend_chart_type",
    {
      title: "Recommend Chart Type",
      description: "Recommend a controlled chart type for the provided data and goal.",
      inputSchema: toolInputSchema
    },
    (args) => toToolResult(recommendChartType(generateChartPageInputSchema.parse(args)))
  );

  server.registerTool(
    "generate_chart_page",
    {
      title: "Generate Chart Page",
      description: "Generate a safe single-file HTML page powered by Apache ECharts.",
      inputSchema: toolInputSchema
    },
    (args) => {
      const result = generateChartPage(generateChartPageInputSchema.parse(args));
      return toToolResult({
        chartType: result.chartType,
        warnings: result.warnings,
        html: result.html,
        spec: result.spec
      });
    }
  );

  server.registerTool(
    "validate_chart_page",
    {
      title: "Validate Chart Page",
      description: "Validate chart input and optional generated HTML.",
      inputSchema: {
        input: z.object(toolInputSchema),
        html: z.string().min(1).optional()
      }
    },
    (args) => {
      const parsed = generateChartPageInputSchema.parse(args.input);
      const result = validateChartPageRequest({
        input: parsed,
        ...(args.html ? { html: args.html } : {})
      });
      return toToolResult(result);
    }
  );

  server.registerTool(
    "patch_chart_page",
    {
      title: "Patch Chart Page",
      description: "Patch an existing chart page spec and regenerate HTML.",
      inputSchema: {
        base: z.object(toolInputSchema),
        patch: patchChartPageChangesSchema
      }
    },
    (args) => {
      const result = patchChartPage({
        base: generateChartPageInputSchema.parse(args.base),
        patch: patchChartPageChangesSchema.parse(args.patch)
      });

      return toToolResult({
        chartType: result.chartType,
        warnings: result.warnings,
        html: result.html,
        spec: result.spec
      });
    }
  );

  return server;
}

export async function startMcpServer(): Promise<void> {
  const server = createMcpServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

function isDirectExecution(): boolean {
  if (!process.argv[1] || !existsSync(process.argv[1])) {
    return false;
  }

  return realpathSync(process.argv[1]) === fileURLToPath(import.meta.url);
}

if (isDirectExecution()) {
  startMcpServer().catch((error: unknown) => {
    const message = error instanceof Error ? error.stack ?? error.message : String(error);
    process.stderr.write(`${message}\n`);
    process.exitCode = 1;
  });
}
