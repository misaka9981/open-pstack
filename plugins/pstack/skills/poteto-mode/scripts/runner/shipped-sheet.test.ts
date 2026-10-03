import { describe, expect, it } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const PLUGIN_ROOT = join(import.meta.dir, "../../../..");
const SHEET_PATH = join(PLUGIN_ROOT, "pstack-models.md");
const HOOK_PATH = join(PLUGIN_ROOT, "hooks/session-start");
const DISPATCH_PATH = join(
  PLUGIN_ROOT,
  "skills/poteto-mode/references/provider-dispatch.md"
);
const SETUP_PATH = join(PLUGIN_ROOT, "skills/setup-pstack/SKILL.md");
const ALIASES = new Set(["inherit-parent", "auto"]);

function roleRows(sheet: string): [string, string][] {
  return sheet
    .split("\n")
    .filter((line) => line.includes(": ") && !line.startsWith("<!--"))
    .map((line) => {
      const at = line.indexOf(": ");
      return [line.slice(0, at), line.slice(at + 2)];
    });
}

function setupRoles(): string[] {
  const setup = readFileSync(SETUP_PATH, "utf8");
  const match = setup.match(/```markdown\n(# pstack model configuration\n[\s\S]*?)```/);
  if (!match) throw new Error("setup-pstack is missing the first-run sheet fence");
  return roleRows(match[1]).map(([role]) => role);
}

function matrixEfforts(): Map<string, string[]> {
  const dispatch = readFileSync(DISPATCH_PATH, "utf8");
  const start = dispatch.indexOf("## Model matrix");
  const end = dispatch.indexOf("\n## ", start + 1);
  const efforts = new Map<string, string[]>();
  for (const line of dispatch.slice(start, end).split("\n")) {
    if (!line.startsWith("| ") || line.startsWith("| Family") || line.startsWith("|---")) {
      continue;
    }
    const cells = line.slice(1, -1).split("|").map((cell) => cell.trim());
    const [, , provider, model, , selectable] = cells;
    efforts.set(`${provider}:${model}`, (selectable ?? "").split(" "));
  }
  return efforts;
}

describe("shipped model sheet", () => {
  const sheet = readFileSync(SHEET_PATH, "utf8");

  it("lists every documented role once, in setup's order", () => {
    expect(roleRows(sheet).map(([role]) => role)).toEqual(setupRoles());
  });

  it("uses only matrix families at selectable efforts", () => {
    const efforts = matrixEfforts();
    expect(efforts.size).toBeGreaterThan(0);
    for (const [role, value] of roleRows(sheet)) {
      for (const entry of value.split(", ")) {
        if (ALIASES.has(entry)) continue;
        const match = entry.match(/^([a-z]+:[a-z0-9.-]+)@([a-z]+)$/);
        if (!match) throw new Error(`${role}: ${entry} is not a descriptor`);
        const selectable = efforts.get(match[1] ?? "");
        if (!selectable) throw new Error(`${role}: ${entry} is not a matrix family`);
        expect(selectable).toContain(match[2] ?? "");
      }
    }
  });

  it("is injected verbatim by the SessionStart hook", () => {
    const run = Bun.spawnSync(["bash", HOOK_PATH]);
    expect(run.exitCode).toBe(0);
    const output = run.stdout.toString();
    expect(output).toContain("You have pstack.");
    expect(output).toContain(`\n<pstack-model-sheet>\n${sheet}</pstack-model-sheet>\n`);
  });

  it("is left out of the Codex SessionStart context", () => {
    const manifest = JSON.parse(
      readFileSync(join(PLUGIN_ROOT, ".codex-plugin/plugin.json"), "utf8")
    );
    const commands = manifest.hooks.hooks.SessionStart.flatMap(
      (entry: { hooks: { command: string }[] }) => entry.hooks.map((hook) => hook.command)
    );
    expect(commands).toEqual(['"${PLUGIN_ROOT}/hooks/run-hook.cmd" session-start codex']);
    const run = Bun.spawnSync(["bash", HOOK_PATH, "codex"]);
    expect(run.exitCode).toBe(0);
    const output = run.stdout.toString();
    expect(output).toContain("You have pstack.");
    expect(output).not.toContain("pstack-model-sheet");
  });
});
