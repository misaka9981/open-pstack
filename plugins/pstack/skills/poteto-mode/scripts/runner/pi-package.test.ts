import { describe, expect, it } from "bun:test";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, relative } from "node:path";

const PLUGIN_ROOT = join(import.meta.dir, "../../../..");
const REPO_ROOT = join(PLUGIN_ROOT, "../..");
const SKILLS_DIR = join(PLUGIN_ROOT, "skills");
const PI_AGENTS_DIR = join(PLUGIN_ROOT, "pi-agents");

function markdownFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return name === "node_modules" ? [] : markdownFiles(path);
    return name.endsWith(".md") ? [path] : [];
  });
}

function frontmatter(text: string): Record<string, string> {
  const end = text.indexOf("\n---\n", 4);
  if (!text.startsWith("---\n") || end < 0) throw new Error("missing frontmatter");
  return Object.fromEntries(
    text
      .slice(4, end)
      .split("\n")
      .map((line) => [line.slice(0, line.indexOf(": ")), line.slice(line.indexOf(": ") + 2)])
  );
}

describe("Pi package", () => {
  it("points the Pi manifest at the shared skills and pstack agents", () => {
    const manifest = JSON.parse(readFileSync(join(REPO_ROOT, "package.json"), "utf8"));
    expect(manifest.pi.skills).toEqual(["./plugins/pstack/skills"]);
    expect(manifest.pi.subagents.agents).toEqual(["./plugins/pstack/pi-agents"]);
    for (const path of [...manifest.pi.skills, ...manifest.pi.subagents.agents]) {
      expect(existsSync(join(REPO_ROOT, path))).toBe(true);
    }
  });

  it("namespaces every Pi agent and resolves its default reads", () => {
    const names = readdirSync(PI_AGENTS_DIR).filter((name) => name.endsWith(".md")).sort();
    expect(names).toEqual(["comment-sicko.md", "lane-readonly.md", "lane.md", "poteto-agent.md"]);
    for (const name of names) {
      const fields = frontmatter(readFileSync(join(PI_AGENTS_DIR, name), "utf8"));
      expect(fields.name).toBe(name.slice(0, -3));
      expect(fields.package).toBe("pstack");
      expect(fields.tools.length).toBeGreaterThan(0);
      if (fields.defaultReads !== undefined) {
        expect(existsSync(join(PI_AGENTS_DIR, fields.defaultReads))).toBe(true);
      }
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
    for (const path of markdownFiles(SKILLS_DIR)) {
      for (const match of readFileSync(path, "utf8").matchAll(/\]\(([^)]*pi-tools\.md)\)/g)) {
        expect(existsSync(join(dirname(path), match[1]))).toBe(true);
      }
    }
  });
});
