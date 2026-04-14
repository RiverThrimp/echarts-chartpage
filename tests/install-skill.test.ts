import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

import { installSkill } from "../src/scripts/install-skill.js";

describe("installSkill", () => {
  it("copies the bundled skill into a target codex skill directory", async () => {
    const targetRoot = await mkdtemp(resolve(tmpdir(), "echarts-chartpage-skill-"));

    try {
      const installedPath = await installSkill(targetRoot);
      const skillFile = await readFile(resolve(installedPath, "SKILL.md"), "utf8");
      expect(installedPath).toContain("echarts-chartpage-mcp");
      expect(skillFile).toContain("recommend_chart_type");
    } finally {
      await rm(targetRoot, { recursive: true, force: true });
    }
  });
});
