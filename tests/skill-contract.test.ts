import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

const skillRoot = resolve(process.cwd(), "skills/echarts-chartpage-mcp");

describe("echarts-chartpage MCP skill", () => {
  it("documents all MCP tool names and core workflows", async () => {
    const skill = await readFile(resolve(skillRoot, "SKILL.md"), "utf8");
    const contract = await readFile(resolve(skillRoot, "references/tool-contract.md"), "utf8");

    for (const toolName of [
      "recommend_chart_type",
      "generate_chart_page",
      "validate_chart_page",
      "patch_chart_page"
    ]) {
      expect(skill).toContain(toolName);
      expect(contract).toContain(toolName);
    }

    expect(skill).toContain("Minimal Preflight Checklist");
    expect(skill).toContain("Standard Workflows");
    expect(contract).toContain("Safe Calling Rules");
  });
});
