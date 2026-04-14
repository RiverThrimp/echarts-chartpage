# Architecture

## Intent

`echarts-chartpage` is structured as a shared core plus thin integration layers. The same logic is reused by:

- npm API
- CLI
- MCP server

This keeps behavior stable across all entry points.

## Module Layout

### `src/core`

- `chart-recommender.ts`
  Recommends a safe chart type from goal, field mapping, and inferred data shape.
- `validator.ts`
  Validates schema, field existence, compatibility, and generated HTML basics.
- `option-builder.ts`
  Produces controlled ECharts options from a whitelist of supported patterns.
- `html-builder.ts`
  Builds the final single-file HTML artifact with a fixed structure and runtime bootstrap.
- `patcher.ts`
  Applies partial mutations to a base spec and regenerates output.
- `generator.ts`
  Orchestrates validation, recommendation, option building, and HTML generation.

### `src/cli`

Thin commands that parse files and delegate to core functions.

### `src/mcp`

Thin MCP tool registration layer that exposes structured tool inputs and outputs over stdio.

### `src/schemas`

Zod schemas for input and patch contracts.

### `src/utils`

Helpers for field normalization, HTML escaping, file IO, and MCP exercise tooling.

## Data Flow

1. Input is validated by Zod.
2. Field mappings are normalized.
3. Recommendation logic resolves a safe chart type when one is not fixed.
4. Compatibility checks run against the requested or recommended chart type.
5. Controlled ECharts option output is generated, or falls back to table mode.
6. HTML is assembled with a fixed layout and runtime bootstrap.

## Safety Boundaries

- no arbitrary formatter callbacks
- no arbitrary script concatenation
- no unbounded chart type selection
- fixed HTML shell
- fixed ECharts CDN reference

## Test Strategy

The repository verifies behavior at three levels:

- unit tests for recommendation, validation, option building, patching, and HTML generation
- CLI tests that execute the command end-to-end
- MCP integration tests that spawn the server over stdio and call the registered tools through the SDK client
