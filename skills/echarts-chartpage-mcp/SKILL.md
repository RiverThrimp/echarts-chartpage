---
name: echarts-chartpage-mcp
description: Use this skill when an agent needs to turn structured data into a runnable Apache ECharts HTML page through the echarts-chartpage MCP server, or when it needs to validate, recommend, or patch an existing chart page spec.
---

# ECharts ChartPage MCP Skill

Use this skill when the task is about:

- generating a chart page from structured JSON data
- choosing a safe chart type for a data mapping
- validating chart input or generated HTML
- patching an existing chart spec instead of rebuilding it from scratch

Do not use this skill when:

- the user only wants a prose explanation about chart design
- the user wants a custom frontend app instead of a generated HTML artifact
- the user does not have structured data yet and only needs schema design help

## Trigger Rules

Prefer this MCP when the user can provide, or you can infer with high confidence:

- `title`
- `goal`
- `data`
- `fields.x`
- `fields.y`

Call the tools in this order:

1. `recommend_chart_type`
   Use when the user has data and mapping, but the chart type is not fixed yet.
2. `validate_chart_page`
   Use before generation when mappings may be incomplete, fields may be wrong, or the data source looks noisy.
3. `generate_chart_page`
   Use when the input is complete enough to produce a final HTML artifact.
4. `patch_chart_page`
   Use when the user wants to keep the same chart and only change title, theme, chart type, or field mapping.

## Required Calling Discipline

- Always send structured JSON only.
- Never pass arbitrary JavaScript, formatter functions, script snippets, or HTML fragments into tool arguments.
- Always keep `outputMode` as `single_html`.
- Keep `fields.y` to the minimum set needed for the chart.
- If the user asks for a small edit to an existing chart spec, prefer `patch_chart_page` over a full regenerate.
- If field existence is uncertain, run `validate_chart_page` first.
- If the user only says “pick the best chart”, run `recommend_chart_type` before `generate_chart_page`.

## Minimal Preflight Checklist

Before calling any tool, verify:

- `data` is an array of JSON records
- `fields.x` exists in the records
- every field in `fields.y` exists in the records
- `goal` is one of `trend | compare | composition | distribution | ranking | correlation`
- `theme` is `light` or `dark` when provided

If any of these are missing, ask for the missing structured input or normalize it first.

## Standard Workflows

### Workflow A: User wants a finished chart page

- If chart type is unspecified, call `recommend_chart_type`
- If mapping looks uncertain, call `validate_chart_page`
- Call `generate_chart_page`
- Return the `html`, resolved `chartType`, and any warnings

### Workflow B: User wants to update an existing chart page spec

- Use `patch_chart_page`
- Only include the fields that actually need to change
- Return the new `html`, resolved `chartType`, and warnings

### Workflow C: User gives questionable data

- Call `validate_chart_page`
- If invalid, surface the validation errors clearly
- Only generate after validation passes or after the mapping is corrected

## Response Shape To Prefer

After a successful tool call, summarize with:

- the tool used
- the resolved chart type
- whether warnings exist
- whether HTML was generated

If the tool returns validation errors, list the errors first and do not pretend generation succeeded.

## References

- Tool contract and selection rules: [references/tool-contract.md](references/tool-contract.md)
- Few-shot examples: [references/examples.md](references/examples.md)
