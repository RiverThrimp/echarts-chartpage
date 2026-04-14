import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

export async function readJsonFile<T>(filePath: string): Promise<T> {
  const content = await readFile(resolve(filePath), "utf8");
  return JSON.parse(content) as T;
}

export async function readTextFile(filePath: string): Promise<string> {
  return readFile(resolve(filePath), "utf8");
}

export async function writeTextFile(filePath: string, content: string): Promise<void> {
  const absolutePath = resolve(filePath);
  await mkdir(dirname(absolutePath), { recursive: true });
  await writeFile(absolutePath, content, "utf8");
}
