import { describe, expect, it } from "vitest";

import { runMcpExercise } from "../src/utils/mcp-exercise.js";

describe("MCP integration", () => {
  it("calls the built server tools over stdio and validates each core workflow", async () => {
    const result = await runMcpExercise(["--import", "tsx", "src/mcp/server.ts"]);
    expect(result.ok).toBe(true);
    expect(result.checks).toHaveLength(6);
    expect(result.checks.every((check) => check.passed)).toBe(true);
  });
});
