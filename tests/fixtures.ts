import type { GenerateChartPageInput } from "../src/index.js";

export const lineInput: GenerateChartPageInput = {
  title: "Monthly Revenue Trend",
  description: "Revenue growth across the first half of the year.",
  goal: "trend",
  theme: "light",
  outputMode: "single_html",
  data: [
    { month: "2025-01", revenue: 120 },
    { month: "2025-02", revenue: 132 },
    { month: "2025-03", revenue: 148 }
  ],
  fields: {
    x: "month",
    y: "revenue"
  }
};

export const comparisonInput: GenerateChartPageInput = {
  title: "Department Spend Comparison",
  goal: "compare",
  theme: "light",
  outputMode: "single_html",
  data: [
    { department: "Product", planned: 82, actual: 78 },
    { department: "Marketing", planned: 64, actual: 69 },
    { department: "Sales", planned: 74, actual: 80 }
  ],
  fields: {
    x: "department",
    y: ["planned", "actual"]
  }
};

export const compositionInput: GenerateChartPageInput = {
  title: "Traffic Source Mix",
  goal: "composition",
  theme: "light",
  outputMode: "single_html",
  data: [
    { source: "Organic", sessions: 4200 },
    { source: "Paid", sessions: 2100 },
    { source: "Referral", sessions: 1100 }
  ],
  fields: {
    x: "source",
    y: "sessions",
    category: "source"
  }
};
