# Background

## Problem

Large-language-model workflows often have structured data available, but not a reusable way to turn that data into a stable chart artifact. The gap is usually one of these:

- raw data exists but chart type selection is inconsistent
- generated code is unsafe or includes arbitrary script injection
- CLI, library, and MCP interfaces drift apart
- agents can describe charts but cannot reliably produce a runnable page artifact

## Why This Project Exists

`echarts-chartpage` exists to provide a constrained path from:

- structured records
- explicit visualization goal
- explicit field mapping

to:

- deterministic chart recommendation
- controlled ECharts option generation
- runnable single-file HTML output
- stable MCP tools for agent ecosystems

## Intended Users

- developers who need HTML chart artifacts quickly
- agents that need a structured visualization tool
- automation pipelines that want a predictable chart page generator
- teams that need safer output than “generate arbitrary frontend code”

## Non-Goals

This project is not trying to be:

- a full BI platform
- a free-form dashboard builder
- a generic HTML code generator
- an arbitrary ECharts option passthrough

The value comes from constrained, auditable output.
