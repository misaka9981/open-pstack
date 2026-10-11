import { describe, expect, it } from "bun:test";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const PLUGIN_ROOT = join(import.meta.dir, "../../../..");
const REPO_ROOT = join(PLUGIN_ROOT, "../..");
const SKILLS_DIR = join(PLUGIN_ROOT, "skills");

function markdownFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return name === "node_modules" ? [] : markdownFiles(path);
    return name.endsWith(".md") ? [path] : [];
  });
}

describe("Pi package", () => {
  it("points the Pi manifest at the shared skills and ships no agents", () => {
    const manifest = JSON.parse(readFileSync(join(REPO_ROOT, "package.json"), "utf8"));
    expect(manifest.pi.skills).toEqual(["./plugins/pstack/skills"]);
    expect(manifest.pi.subagents).toBeUndefined();
    for (const path of manifest.pi.skills) {
      expect(existsSync(join(REPO_ROOT, path))).toBe(true);
    }
  });

  it("pairs every codex-tools.md reference with pi-tools.md", () => {
    const unpaired = markdownFiles(SKILLS_DIR)
      .filter((path) => !path.endsWith("codex-tools.md") && !path.endsWith("pi-tools.md"))
      .flatMap((path) =>
        readFileSync(path, "utf8")
          .split("\n")
          .filter((line) => line.includes("codex-tools.md") && !line.includes("pi-tools.md"))
          .map((line) => `${relative(SKILLS_DIR, path)}: ${line.slice(0, 80)}`)
      );
    expect(unpaired).toEqual([]);
  });
});
