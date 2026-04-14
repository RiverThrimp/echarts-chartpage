# Contributing

## Development Setup

```bash
npm install
npm run lint
npm run typecheck
npm run test
npm run build
```

## Contribution Guidelines

- Keep core logic inside `src/core/`.
- Reuse core modules from CLI and MCP layers instead of duplicating behavior.
- Preserve controlled output rules. Do not add arbitrary formatter or script injection points.
- Add or update tests for behavior changes.
- Keep README and examples aligned with user-facing changes.

## Pull Requests

- Describe the user-facing change clearly.
- Include tests for bug fixes and new features.
- Update docs when the behavior or API changes.
- Keep changes scoped and reviewable.

## Issue Reports

Include:

- input JSON
- expected behavior
- actual behavior
- Node.js version
- command or API call used
