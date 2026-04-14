import { describe, expect, it } from "vitest";

import { patchChartPage } from "../src/index.js";
import { comparisonInput } from "./fixtures.js";

describe("patchChartPage", () => {
  it("updates theme and metric selection", () => {
    const result = patchChartPage({
      base: comparisonInput,
      patch: {
        theme: "dark",
        removeY: ["planned"]
      }
    });

    expect(result.spec.theme).toBe("dark");
    expect(result.spec.fields.y).toEqual(["actual"]);
  });
});
