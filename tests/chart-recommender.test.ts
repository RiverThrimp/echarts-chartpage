import { describe, expect, it } from "vitest";

import { recommendChartType } from "../src/index.js";
import { comparisonInput, compositionInput, lineInput } from "./fixtures.js";

describe("recommendChartType", () => {
  it("recommends area/line charts for trend data", () => {
    const result = recommendChartType(lineInput);
    expect(["line", "area"]).toContain(result.chartType);
    expect(result.confidence).toBeTruthy();
  });

  it("recommends bar-like charts for compare goals", () => {
    const result = recommendChartType(comparisonInput);
    expect(["bar", "stacked_bar"]).toContain(result.chartType);
  });

  it("recommends pie-like charts for composition goals", () => {
    const result = recommendChartType(compositionInput);
    expect(["pie", "donut"]).toContain(result.chartType);
  });
});
