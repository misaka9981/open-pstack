import { afterAll, describe, expect, it } from "bun:test";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const HOOK_PATH = join(import.meta.dir, "../../../../hooks/session-start");
const SKILL_CALL = '{"type":"tool_use","name":"Skill","input":{"skill":"pstack:poteto-mode"}}';
const SLASH_COMMAND = '{"content":"<command-name>/pstack:poteto-mode</command-name>"}';
const REINVOKE = "<pstack-compaction>";

const scratch = mkdtempSync(join(tmpdir(), "pstack-session-start-"));
afterAll(() => rmSync(scratch, { recursive: true, force: true }));

function transcript(name: string, lines: string[]): string {
  const path = join(scratch, name);
  writeFileSync(path, `${lines.join("\n")}\n`);
  return path;
}

function hookInput(source: string, transcriptPath: string): string {
  return JSON.stringify({
    session_id: "s",
    transcript_path: transcriptPath,
    cwd: scratch,
    hook_event_name: "SessionStart",
    source,
  });
}

function runHook(stdin: string | "ignore", args: string[] = []): string {
  const run = Bun.spawnSync(["bash", HOOK_PATH, ...args], {
    stdin: stdin === "ignore" ? "ignore" : Buffer.from(stdin),
  });
  expect(run.stderr.toString()).toBe("");
  expect(run.exitCode).toBe(0);
  return run.stdout.toString();
}

describe("SessionStart hook after compaction", () => {
  const baseline = runHook("ignore");

  it("prints only the context and the model sheet with no stdin", () => {
    const context = readFileSync(join(HOOK_PATH, "../session-start-context.md"), "utf8");
    const sheet = readFileSync(join(HOOK_PATH, "../../pstack-models.md"), "utf8");
    expect(baseline).toBe(`${context}\n<pstack-model-sheet>\n${sheet}</pstack-model-sheet>\n`);
  });

  it("asks to reinvoke poteto-mode when a Skill call used it", () => {
    const path = transcript("skill.jsonl", ['{"type":"user"}', SKILL_CALL]);
    const output = runHook(hookInput("compact", path));
    expect(output.startsWith(baseline)).toBe(true);
    expect(output).toContain(REINVOKE);
    expect(output.slice(baseline.length)).not.toContain('"skill":"pstack:poteto-mode"');
    expect(output.slice(baseline.length)).not.toContain(
      "<command-name>/pstack:poteto-mode</command-name>"
    );
  });

  it("asks to reinvoke poteto-mode when the user typed the slash command", () => {
    const path = transcript("slash.jsonl", [SLASH_COMMAND]);
    expect(runHook(hookInput("compact", path))).toContain(REINVOKE);
  });

  it("reads a transcript path whose JSON escapes a backslash", () => {
    const dir = join(scratch, "back\\slash");
    mkdirSync(dir);
    const path = join(dir, "t.jsonl");
    writeFileSync(path, `${SKILL_CALL}\n`);
    expect(runHook(hookInput("compact", path))).toContain(REINVOKE);
  });

  it("stays quiet when the compacted session never used poteto-mode", () => {
    const path = transcript("plain.jsonl", ['{"skill":"pstack:tdd"}']);
    expect(runHook(hookInput("compact", path))).toBe(baseline);
  });

  it("stays quiet on startup even when the transcript used poteto-mode", () => {
    const path = transcript("startup.jsonl", [SKILL_CALL]);
    expect(runHook(hookInput("startup", path))).toBe(baseline);
  });

  it("stays quiet on Codex", () => {
    const path = transcript("codex.jsonl", [SKILL_CALL]);
    const output = runHook(hookInput("compact", path), ["codex"]);
    expect(output).toContain("You have pstack.");
    expect(output).not.toContain(REINVOKE);
  });

  it("prints the plain context with empty stdin", () => {
    expect(runHook("")).toBe(baseline);
  });

  it("does not fail when the transcript file is missing", () => {
    expect(runHook(hookInput("compact", join(scratch, "missing.jsonl")))).toBe(baseline);
  });
});
