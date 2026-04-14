import { existsSync, realpathSync } from "node:fs";
import { cp, mkdir, stat } from "node:fs/promises";
import { homedir } from "node:os";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const SKILL_NAME = "echarts-chartpage-mcp";

function findProjectRoot(): string {
  const currentFile = fileURLToPath(import.meta.url);
  return resolve(dirname(currentFile), "../../");
}

export async function installSkill(targetRoot = resolve(homedir(), ".codex", "skills")): Promise<string> {
  const projectRoot = findProjectRoot();
  const sourceDir = resolve(projectRoot, "skills", SKILL_NAME);
  const targetDir = resolve(targetRoot, SKILL_NAME);

  await stat(sourceDir);
  await mkdir(targetRoot, { recursive: true });
  await cp(sourceDir, targetDir, { recursive: true, force: true });

  return targetDir;
}

async function main(): Promise<void> {
  const installedPath = await installSkill();
  process.stdout.write(
    `${JSON.stringify({ ok: true, installed: SKILL_NAME, path: installedPath }, null, 2)}\n`
  );
}

function isDirectExecution(): boolean {
  if (!process.argv[1] || !existsSync(process.argv[1])) {
    return false;
  }

  return realpathSync(process.argv[1]) === fileURLToPath(import.meta.url);
}

if (isDirectExecution()) {
  main().catch((error: unknown) => {
    const message = error instanceof Error ? error.stack ?? error.message : String(error);
    process.stderr.write(`${message}\n`);
    process.exitCode = 1;
  });
}
