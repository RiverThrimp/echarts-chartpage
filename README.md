# ECharts ChartPage

`echarts-chartpage` is a TypeScript toolkit that turns structured JSON data, visualization goals, and field mappings into safe, runnable HTML chart pages powered by Apache ECharts.

It ships as:

- an npm package for programmatic use
- a CLI for local automation
- an MCP server for agent workflows

The project is designed for deterministic output, controlled option generation, strong validation, and public open-source maintainability.

## Features

- Generate complete single-file HTML chart pages with Apache ECharts CDN included
- Depend on the official `echarts` npm package in source code for types and integration correctness
- Accept structured data plus `goal`, `theme`, and field mapping input
- Recommend safe chart types from a controlled whitelist
- Build controlled ECharts options without arbitrary JS formatter injection
- Validate schema, field mappings, chart compatibility, and generated HTML basics
- Patch existing chart specs and regenerate output
- Reuse one shared core across npm API, CLI, and MCP server
- Ship with tests, CI, examples, contribution docs, and release-ready packaging

## Supported Goals

- `trend`
- `compare`
- `composition`
- `distribution`
- `ranking`
- `correlation`

## Supported Chart Types

- `line`
- `bar`
- `stacked_bar`
- `pie`
- `donut`
- `scatter`
- `area`
- `table`

## Installation

```bash
npm install echarts-chartpage
```

For local development:

```bash
npm install
```

## Quick Start

### CLI

```bash
npx echarts-chartpage generate \
  --input examples/inputs/line-chart.json \
  --output revenue-trend.html
```

### npm API

```ts
import { generateChartPage } from "echarts-chartpage";

const result = generateChartPage({
  title: "Monthly Revenue Trend",
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
});

console.log(result.chartType);
console.log(result.html);
```

### MCP Server

Build first, then start the stdio server:

```bash
npm run build
npm run mcp:start
```

## Input Model

```ts
type GenerateChartPageInput = {
  title: string;
  description?: string;
  goal: "trend" | "compare" | "composition" | "distribution" | "ranking" | "correlation";
  data: Array<Record<string, string | number | boolean | null>>;
  fields: {
    x: string;
    y: string | string[];
    series?: string;
    category?: string;
  };
  theme?: "light" | "dark";
  outputMode?: "single_html";
  chartType?: "line" | "bar" | "stacked_bar" | "pie" | "donut" | "scatter" | "area" | "table";
};
```

## Output

`generateChartPage()` returns:

- normalized spec
- resolved chart type
- warnings
- controlled ECharts option or `null` for table fallback
- complete runnable HTML

## CLI Usage

The CLI binary name is `echarts-chartpage`.

### `generate`

Generate a single HTML page from JSON input:

```bash
echarts-chartpage generate \
  --input examples/inputs/line-chart.json \
  --output examples/generated/line-chart.html
```

### `recommend`

Recommend a chart type:

```bash
echarts-chartpage recommend \
  --input examples/inputs/bar-chart.json
```

### `validate`

Validate input and optionally validate generated HTML:

```bash
echarts-chartpage validate \
  --input examples/inputs/pie-chart.json \
  --html examples/generated/pie-chart.html
```

### `patch`

Patch a base chart spec and regenerate HTML:

```bash
echarts-chartpage patch \
  --base examples/inputs/patch-base.json \
  --patch examples/inputs/patch-update.json \
  --output examples/generated/patch-example.html
```

## MCP Usage

The server exposes these tools:

- `recommend_chart_type`
- `generate_chart_page`
- `validate_chart_page`
- `patch_chart_page`

All tool inputs and outputs are structured JSON. A typical MCP client configuration points to the built stdio server:

```json
{
  "mcpServers": {
    "echarts-chartpage": {
      "command": "node",
      "args": ["dist/mcp/server.js"]
    }
  }
}
```

See [examples/mcp-usage.md](examples/mcp-usage.md) for request payload samples.

## Programming API

Public API surface:

- `generateChartPage`
- `recommendChartType`
- `validateChartInput`
- `validateChartPageRequest`
- `validateGeneratedHtml`
- `patchChartPage`
- `buildChartOption`
- `buildChartHtml`

Runtime schemas are exported as well:

- `generateChartPageInputSchema`
- `patchChartPageChangesSchema`
- `patchChartPageInputSchema`
- `validateChartPageInputSchema`

## Input / Output Example

Input:

```json
{
  "title": "Traffic Source Mix",
  "goal": "composition",
  "theme": "light",
  "outputMode": "single_html",
  "data": [
    { "source": "Organic", "sessions": 4200 },
    { "source": "Paid", "sessions": 2100 },
    { "source": "Referral", "sessions": 1100 }
  ],
  "fields": {
    "x": "source",
    "y": "sessions",
    "category": "source"
  }
}
```

Output summary:

```json
{
  "chartType": "donut",
  "warnings": [],
  "html": "<!doctype html>..."
}
```

## Examples

The repository includes:

- [examples/inputs/line-chart.json](examples/inputs/line-chart.json)
- [examples/inputs/bar-chart.json](examples/inputs/bar-chart.json)
- [examples/inputs/pie-chart.json](examples/inputs/pie-chart.json)
- [examples/inputs/multi-series.json](examples/inputs/multi-series.json)
- [examples/inputs/patch-base.json](examples/inputs/patch-base.json)
- [examples/inputs/patch-update.json](examples/inputs/patch-update.json)
- [examples/cli-usage.md](examples/cli-usage.md)
- [examples/mcp-usage.md](examples/mcp-usage.md)

Generate all example HTML files with:

```bash
npm run examples:generate
```

Generated HTML files are written to `examples/generated/`.

## Agent Skill

This repository also includes a reusable Codex-style skill for agents that need to call the MCP server consistently:

- [skills/echarts-chartpage-mcp/SKILL.md](skills/echarts-chartpage-mcp/SKILL.md)

It documents:

- when to trigger this MCP
- how to choose among recommend / validate / generate / patch
- structured calling rules
- few-shot examples for model prompting

Install the bundled skill into the local Codex skill directory with:

```bash
npm run build
npm run skill:install
```

## Architecture

Project layout:

```text
src/
  core/
    chart-recommender.ts
    option-builder.ts
    html-builder.ts
    validator.ts
    patcher.ts
    generator.ts
  cli/
    index.ts
    commands/
  mcp/
    server.ts
  schemas/
  types/
  utils/
```

Design rules:

- core logic is shared across all interfaces
- output is controlled and deterministic
- no arbitrary formatter functions are accepted
- only whitelisted chart types are emitted
- dataset + encode is preferred where practical

See also:

- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)
- [docs/BACKGROUND.md](docs/BACKGROUND.md)
- [docs/PUBLISHING.md](docs/PUBLISHING.md)
- [SECURITY.md](SECURITY.md)

## Development Commands

```bash
npm install
npm run lint
npm run typecheck
npm run test
npm run build
npm run examples:generate
```

## Build Command

```bash
npm run build
```

Outputs are emitted to `dist/`.

## Test Command

```bash
npm run test
```

## Publish Notes

Before publishing:

1. Update repository URLs in `package.json`.
2. Ensure the npm account `daqiang901003` is authenticated on the publishing machine.
3. Review the `CHANGELOG.md`.
4. Run `npm run verify`.
5. Publish with `npm publish`.

The package is configured with:

- `exports`
- generated `.d.ts`
- `bin`
- `files`
- ESM-first output with CommonJS compatibility

## Roadmap

- richer ranking-specific sorting controls
- dashboard-oriented multi-panel HTML templates
- more chart recommendation heuristics
- configurable design presets
- richer MCP metadata and traces

## FAQ

### Does this execute arbitrary user JavaScript?

No. The generator does not accept arbitrary formatter functions, script fragments, or custom JS injection.

### Why does some input fall back to `table`?

The builder uses a conservative whitelist. If mappings or data types are incompatible with a controlled chart output, it falls back to a stable table rendering.

### Does the generated HTML need a build step?

No. It is a single HTML file intended to open directly in the browser.

### Can I force a chart type?

Yes. Set `chartType` in the input. If the requested chart is incompatible with the data mapping, validation warnings are returned and generation can fall back to `table`.

## Security

- no arbitrary script injection
- no arbitrary external JS injection beyond the fixed ECharts CDN
- no formatter function injection
- controlled HTML template shape
- schema validation before generation

This project is intended for trusted structured data pipelines. If you accept untrusted input from external users, validate and sanitize it at your own boundary as well.

For the full repository policy, see [SECURITY.md](SECURITY.md).

## ECharts Integration Note

This project uses ECharts in two places:

- source code depends on the official `echarts` npm package for typed option generation
- generated HTML uses the fixed Apache ECharts CDN runtime so the output file can open directly in a browser without a bundler

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

MIT. See [LICENSE](LICENSE).
