# MCP Usage

Example tool call for `generate_chart_page`:

```json
{
  "title": "Monthly Revenue Trend",
  "goal": "trend",
  "theme": "light",
  "outputMode": "single_html",
  "data": [
    { "month": "2025-01", "revenue": 120 },
    { "month": "2025-02", "revenue": 132 },
    { "month": "2025-03", "revenue": 148 }
  ],
  "fields": {
    "x": "month",
    "y": "revenue"
  }
}
```

Example tool call for `patch_chart_page`:

```json
{
  "base": {
    "title": "Quarterly Pipeline",
    "goal": "compare",
    "theme": "light",
    "outputMode": "single_html",
    "data": [
      { "quarter": "Q1", "pipeline": 320, "won": 118 },
      { "quarter": "Q2", "pipeline": 360, "won": 132 }
    ],
    "fields": {
      "x": "quarter",
      "y": ["pipeline", "won"]
    }
  },
  "patch": {
    "theme": "dark",
    "chartType": "bar",
    "removeY": ["pipeline"]
  }
}
```
