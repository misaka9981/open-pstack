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

// Each family table names the provider, model, and selectable-efforts columns
// at different positions, so read them by header instead of by index.
function familyEfforts(heading: string): Map<string, string[]> {
  const dispatch = readFileSync(DISPATCH_PATH, "utf8");
  const start = dispatch.indexOf(`\n${heading}\n`);
  if (start < 0) throw new Error(`missing ${heading}`);
  const end = dispatch.indexOf("\n## ", start + 1);
  const rows = dispatch
    .slice(start, end < 0 ? undefined : end)
    .split("\n")
    .filter((line) => line.startsWith("| ") && !line.startsWith("|---"))
    .map((line) => line.slice(1, -1).split("|").map((cell) => cell.trim()));
  const [header, ...data] = rows;
  const column = (name: string): number => {
    const index = header?.indexOf(name) ?? -1;
    if (index < 0) throw new Error(`${heading} has no ${name} column`);
    return index;
  };
  const provider = column("Provider");
  const model = column("Model");
  const selectable = column("Selectable efforts");
  if (data.length === 0) throw new Error(`${heading} has no family rows`);
  const efforts = new Map<string, string[]>();
  for (const cells of data) {
    efforts.set(`${cells[provider]}:${cells[model]}`, (cells[selectable] ?? "").split(" "));
  }
  return efforts;
}

function selectableFamilies(): Map<string, string[]> {
  return new Map([
    ...familyEfforts("## Model matrix"),
    ...familyEfforts("## Additional Claude families"),
    ...familyEfforts("## Relay providers"),
  ]);
}

describe("shipped model sheet", () => {
  const sheet = readFileSync(SHEET_PATH, "utf8");

  it("lists every documented role once, in setup's order", () => {
    expect(roleRows(sheet).map(([role]) => role)).toEqual(setupRoles());
  });

  it("uses only declared families at selectable efforts", () => {
    const efforts = selectableFamilies();
    for (const [role, value] of roleRows(sheet)) {
      for (const entry of value.split(", ")) {
        if (ALIASES.has(entry)) continue;
        const match = entry.match(/^([a-z]+:[a-z0-9./-]+)@([a-z]+)$/);
        if (!match) throw new Error(`${role}: ${entry} is not a descriptor`);
        const selectable = efforts.get(match[1] ?? "");
        if (!selectable) throw new Error(`${role}: ${entry} is not a declared family`);
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
