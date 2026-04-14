# Few-Shot Examples

## Example 1: Recommend then generate

User intent:

“给你销售数据，帮我生成一个可直接打开的图表页面，图表类型你自己选。”

Agent flow:

1. Call `recommend_chart_type`
2. If the mapping is valid, call `generate_chart_page`

Recommendation input:

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

Preferred response summary:

- tool: `recommend_chart_type`
- resolved chart type: `area` or `line`
- next action: `generate_chart_page`

## Example 2: Validate before generation

User intent:

“帮我看看这个字段映射能不能生成图。”

Agent flow:

1. Call `validate_chart_page`
2. If invalid, return errors first
3. If valid, offer generation or continue automatically if requested

## Example 3: Patch an existing chart

User intent:

“保留这个图，把主题改成 dark，把 title 改成 Quarterly Pipeline Snapshot。”

Patch input:

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
    "title": "Quarterly Pipeline Snapshot",
    "theme": "dark"
  }
}
```

Preferred response summary:

- tool: `patch_chart_page`
- resolved chart type: include returned type
- warnings: include only if present
- output: regenerated HTML available
