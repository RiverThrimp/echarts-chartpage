import { describe, expect, it } from "vitest";

import { buildChartOption } from "../src/index.js";
import { comparisonInput, lineInput } from "./fixtures.js";

describe("buildChartOption", () => {
  it("builds a dataset-driven option for line charts", () => {
    const { option } = buildChartOption(
      {
        ...lineInput,
        theme: "light",
        outputMode: "single_html",
        fields: {
          x: "month",
          y: ["revenue"]
        }
      },
      "line"
    );

    expect(option).toBeTruthy();
    expect(option?.dataset).toBeTruthy();
    expect(Array.isArray(option?.series)).toBe(true);
  });

  it("builds multiple series for multi-metric bar charts", () => {
    const { option } = buildChartOption(
      {
        ...comparisonInput,
        theme: "light",
        outputMode: "single_html",
        fields: {
          x: "department",
          y: ["planned", "actual"]
        }
      },
      "bar"
    );

    const series = option?.series as Array<Record<string, unknown>>;
    expect(series).toHaveLength(2);
    expect(series[0]?.type).toBe("bar");
  });
});
