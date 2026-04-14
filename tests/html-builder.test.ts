import { describe, expect, it } from "vitest";

import { generateChartPage } from "../src/index.js";
import { lineInput } from "./fixtures.js";

describe("buildChartHtml", () => {
  it("produces runnable HTML with ECharts CDN and chart root", () => {
    const result = generateChartPage(lineInput);
    expect(result.html).toContain("<!doctype html>");
    expect(result.html).toContain("echarts.min.js");
    expect(result.html).toContain('id="chart-root"');
    expect(result.html).toContain("Generated with echarts-chartpage");
    expect(result.html).toContain('window.addEventListener("load", bootstrap, { once: true })');
  });
});
