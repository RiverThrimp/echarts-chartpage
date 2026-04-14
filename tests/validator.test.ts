import { describe, expect, it } from "vitest";

import { validateChartInput } from "../src/index.js";
import { lineInput } from "./fixtures.js";

describe("validateChartInput", () => {
  it("accepts valid chart input", () => {
    const result = validateChartInput(lineInput);
    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it("rejects missing mapped fields", () => {
    const result = validateChartInput({
      ...lineInput,
      fields: {
        x: "missing",
        y: "revenue"
      }
    });

    expect(result.valid).toBe(false);
    expect(result.errors[0]).toContain("missing");
  });
});
