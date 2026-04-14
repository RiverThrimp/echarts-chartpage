# Tool Contract

Current MCP tool names:

- `recommend_chart_type`
- `generate_chart_page`
- `validate_chart_page`
- `patch_chart_page`

## `recommend_chart_type`

Use when:

- the user has data and mappings
- the chart type is not fixed
- the agent needs a safe default before generation

Input expectations:

- full chart input except `chartType` is optional

Return fields to use:

- `chartType`
- `reason`
- `confidence`
- `alternatives`

## `generate_chart_page`

Use when:

- the input is complete enough for final generation
- the agent needs a runnable HTML artifact

Input expectations:

- `title`
- `goal`
- `data`
- `fields`
- optional `description`
- optional `theme`
- optional `chartType`
- `outputMode` should remain `single_html`

Return fields to use:

- `chartType`
- `warnings`
- `html`
- `spec`

## `validate_chart_page`

Use when:

- field existence is uncertain
- data quality is questionable
- the agent wants a safe preflight check
- the agent wants to validate generated HTML as well

Return fields to use:

- `valid`
- `errors`
- `warnings`
- `availableFields`
- `recommendation`
- `htmlChecks`

## `patch_chart_page`

Use when:

- the user wants to modify an existing spec
- only a small subset of properties should change

Supported patch intent:

- change title
- change description
- change theme
- change goal
- change chart type
- replace data
- replace `fields.x`
- replace `fields.y`
- add or remove y fields
- set or clear `series`
- set or clear `category`

## Selection Rules

- Prefer `patch_chart_page` over `generate_chart_page` for incremental edits
- Prefer `validate_chart_page` before generation if mappings were inferred instead of explicitly given
- Prefer `recommend_chart_type` when the user asks for “best chart”, “most suitable chart”, or “auto choose”
- Use `generate_chart_page` directly only when the chart intent is already sufficiently clear

## Safe Calling Rules

- Never inject JS code into the tool input
- Never pass formatter functions
- Never send free-form HTML into generation input
- Keep tool calls deterministic and structured
