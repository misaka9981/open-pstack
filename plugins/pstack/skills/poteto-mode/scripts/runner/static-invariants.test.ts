import { describe, expect, it } from "bun:test";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { PROVIDERS } from "./types.ts";

const PLUGIN_ROOT = join(import.meta.dir, "../../../..");
const DISPATCH_PATH = join(
  PLUGIN_ROOT,
  "skills/poteto-mode/references/provider-dispatch.md"
);
const PARENTS = ["Claude Code", "Codex", "Pi"] as const;

function markdownFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return name === "node_modules" ? [] : markdownFiles(path);
    return name.endsWith(".md") ? [path] : [];
  });
}

function cells(line: string): string[] {
  return line.trim().slice(1, -1).split("|").map((cell) => cell.trim());
}

describe("static invariants", () => {
  it("resolves every relative markdown link in the plugin", () => {
    const broken = markdownFiles(PLUGIN_ROOT).flatMap((path) => {
      const text = readFileSync(path, "utf8").replace(/```[\s\S]*?```/g, "");
      return [...text.matchAll(/\]\(([^)\s]+)\)/g)]
        .map((match) => match[1].split("#")[0])
        // Skip URLs, anchors, and template placeholders such as `(url)`.
        .filter((target) => target !== "" && !/^[a-z]+:/.test(target) && /[./]/.test(target))
        .filter((target) => !existsSync(join(dirname(path), target)))
        .map((target) => `${relative(PLUGIN_ROOT, path)} -> ${target}`);
    });
    expect(broken).toEqual([]);
  });

  it("routes every runner provider from every parent", () => {
    const lines = readFileSync(DISPATCH_PATH, "utf8").split("\n");
    const start = lines.findIndex((line) => line.startsWith("| Parent | `claude:*` |"));
    expect(start).toBeGreaterThan(-1);
    const header = cells(lines[start]);
    expect(header.slice(1)).toEqual(PROVIDERS.map((provider) => `\`${provider}:*\``));
    const rows = lines
      .slice(start + 2)
      .filter((line, i, all) => all.slice(0, i + 1).every((entry) => entry.startsWith("|")))
      .map(cells);
    expect(rows.map((row) => row[0])).toEqual([...PARENTS]);
    for (const row of rows) {
      expect(row).toHaveLength(header.length);
      expect(row.every((cell) => cell.length > 0)).toBe(true);
    }
  });
});
