# Publishing

## Release Checklist

1. Run `npm run release:check`
2. Confirm `npm pack --dry-run` contains only intended files
3. Confirm `package.json` repository metadata matches the public repo
4. Confirm `.gitignore` and package `files` prevent accidental publication of local artifacts
5. Confirm no credentials or local-only config files are tracked

## GitHub

Create the public repository first, then set the remote:

```bash
git remote add origin <your-github-repo-url>
git branch -M main
git push -u origin main
```

## npm

Confirm auth:

```bash
npm whoami
```

Publish:

```bash
npm publish
```

## Codex Skill

After installation from npm or from source:

```bash
npm run build
npm run skill:install
```

This copies the bundled `echarts-chartpage-mcp` skill into `~/.codex/skills/`.
