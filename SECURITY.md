# Security Policy

## Scope

`echarts-chartpage` is an open-source generator that transforms structured JSON into controlled Apache ECharts HTML pages. The project is intentionally conservative about output generation.

## Security Design

- only whitelisted chart types are generated
- no arbitrary JavaScript injection is accepted
- no formatter functions are accepted from user input
- generated HTML uses a fixed ECharts CDN URL instead of arbitrary external script injection
- schema validation runs before generation
- incompatible chart requests fall back to controlled output instead of executing custom logic

## Maintainer Guidance

Before publishing:

- run `npm run release:check`
- confirm the npm tarball contents with `npm pack --dry-run`
- confirm no credentials or local paths were added to tracked files
- confirm `package.json` repository metadata matches the real public repository

## Reporting

If you discover a security issue, do not publish exploit details in a public issue first. Share:

- affected version
- reproduction input
- observed impact
- proposed mitigation if available

## Non-Goals

This package does not sandbox third-party browser execution after the generated HTML is opened. Consumers are still responsible for:

- where generated HTML is hosted
- what input data is accepted upstream
- browser CSP and deployment controls
