import { describe, expect, it } from "bun:test";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { EFFORTS, type Effort } from "./types.ts";

const PLUGIN_ROOT = join(import.meta.dir, "../../../..");
const DISPATCH_PATH = join(
  PLUGIN_ROOT,
  "skills/poteto-mode/references/provider-dispatch.md"
);
const SETUP_PATH = join(PLUGIN_ROOT, "skills/setup-pstack/SKILL.md");
const HELP_PATH = join(PLUGIN_ROOT, "skills/poteto-help/SKILL.md");
const MIRROR_STATE_LINK =
  "../poteto-mode/references/provider-dispatch.md#mirror-state";
const MIRROR_STATE_HEADER = [
  "Sheet file",
  "Mirror block",
  "In effect",
  "Setup",
  "poteto-help",
] as const;
const MIRROR_STATES = [
  ["present", "same bytes", "the block"],
  ["present", "different bytes", "the block"],
  ["present", "none", "role defaults"],
  ["missing", "present", "the block"],
  ["missing", "none", "role defaults"],
  ["any", "malformed markers", "unknown"],
] as const;
const AGENTS_DIR = join(PLUGIN_ROOT, "agents");

const MATRIX_HEADER = [
  "Family",
  "Upstream pstack choice",
  "Provider",
  "Model",
  "Default effort",
  "Selectable efforts",
  "Claude-native agent stem",
] as const;

const RELAY_HEADER = [
  "Family",
  "Provider",
  "Model",
  "Selectable efforts",
] as const;

const ADDITIONAL_CLAUDE_HEADER = [
  "Family",
  "Provider",
  "Model",
  "Selectable efforts",
  "Claude-native agent stem",
] as const;

const FAMILY_ORDER = ["fable", "opus", "sol"] as const;
const MATRIX_PROVIDERS = ["claude", "codex"] as const;
const CLAUDE_CAP: Effort[] = ["low", "medium", "high"];
const XHIGH_CAP: Effort[] = ["low", "medium", "high", "xhigh"];
const BUDGET_TARGETS = {
  large: "xhigh",
  medium: "high",
  small: "medium",
} as const satisfies Record<string, Effort>;
const DESCRIPTOR_RE =
  /(claude|codex|grok):[a-z0-9.-]+@(low|medium|high|xhigh|max)/g;
const PANEL_ROLES = ["arena runners", "interrogate reviewers"] as const;
const JUDGE_POOL_ROLE = "arena cross-judge pool";
const SHEET_ROLES = [
  "feature, refactoring",
  "bug-fix",
  "perf-issue",
  "hillclimb",
  "judgment and prose",
  "arena runners",
  "arena cross-judge pool",
  "swarm workers",
  "interrogate reviewers",
] as const;
const SETUP_SECTION_ORDER = [
  "### 2. Load current state",
  "### 3. Parse per-family efforts",
  "### 4. Ask for a budget",
  "### 5. Choose role families",
  "### 6. Collect one requested effort per used family",
  "### 7. Probe the requested pairs",
  "### 8. Render, preserving role families",
  "### 9. Confirm and commit",
] as const;

interface MatrixRow {
  family: string;
  upstreamChoice: string;
  provider: string;
  model: string;
  defaultEffort: Effort;
  selectableEfforts: Effort[];
  claudeNativeAgentStem: string | null;
}

function splitRow(line: string): string[] {
  const trimmed = line.trim();
  if (!trimmed.startsWith("|") || !trimmed.endsWith("|")) {
    throw new Error(`matrix row must be a pipe table: ${line}`);
  }
  return trimmed
    .slice(1, -1)
    .split("|")
    .map((cell) => cell.trim().replaceAll("`", ""));
}

function isSeparator(cells: string[]): boolean {
  return cells.every((cell) => /^:?-{3,}:?$/.test(cell));
}

function asEffort(value: string): Effort {
  if ((EFFORTS as readonly string[]).includes(value)) {
    return value as Effort;
  }
  throw new Error(`not an effort: ${value}`);
}

function parseModelMatrix(markdown: string): MatrixRow[] {
  const lines = markdown.split(/\r?\n/);
  const start = lines.findIndex((line) => line.trim() === "## Model matrix");
  if (start < 0) {
    throw new Error("missing ## Model matrix");
  }
  let end = lines.length;
  for (let i = start + 1; i < lines.length; i++) {
    if (lines[i].startsWith("## ")) {
      end = i;
      break;
    }
  }
  const table = lines
    .slice(start + 1, end)
    .map((line) => line.trim())
    .filter((line) => line.startsWith("|"));
  if (table.length !== 2 + FAMILY_ORDER.length) {
    throw new Error(
      `model matrix must be header, separator, and ${FAMILY_ORDER.length} data rows, got ${table.length}`
    );
  }
  const header = splitRow(table[0]);
  if (header.join("|") !== MATRIX_HEADER.join("|")) {
    throw new Error(`unexpected matrix header: ${header.join(" | ")}`);
  }
  if (!isSeparator(splitRow(table[1]))) {
    throw new Error("matrix header separator missing");
  }
  return table.slice(2).map((line) => {
    const cells = splitRow(line);
    if (cells.length !== MATRIX_HEADER.length) {
      throw new Error(`matrix row has ${cells.length} cells: ${line}`);
    }
    const [
      family,
      upstreamChoice,
      provider,
      model,
      defaultEffortRaw,
      selectableRaw,
      stemRaw,
    ] = cells;
    if (!(MATRIX_PROVIDERS as readonly string[]).includes(provider)) {
      throw new Error(`invalid provider: ${provider}`);
    }
    const selectableEfforts = selectableRaw.split(/\s+/).map(asEffort);
    const claudeNativeAgentStem = stemRaw === "-" ? null : stemRaw;
    if (claudeNativeAgentStem !== null && !/^[a-z0-9-]+$/.test(claudeNativeAgentStem)) {
      throw new Error(`invalid Claude-native agent stem: ${stemRaw}`);
    }
    if ((provider === "claude") !== (claudeNativeAgentStem !== null)) {
      throw new Error(`${family} stem must be present iff provider is claude`);
    }
    const defaultEffort = asEffort(defaultEffortRaw);
    if (!selectableEfforts.includes(defaultEffort)) {
      throw new Error(`${family} default effort is not selectable`);
    }
    return {
      family,
      upstreamChoice,
      provider,
      model,
      defaultEffort,
      selectableEfforts,
      claudeNativeAgentStem,
    };
  });
}

interface RelayRow {
  family: string;
  provider: string;
  model: string;
  selectableEfforts: Effort[];
}

interface AdditionalClaudeRow extends RelayRow {
  claudeNativeAgentStem: string;
}

function parseSectionTable(
  markdown: string,
  heading: string,
  expectedHeader: readonly string[]
): string[][] {
  const lines = markdown.split(/\r?\n/);
  const start = lines.findIndex((line) => line.trim() === heading);
  if (start < 0) {
    throw new Error(`missing ${heading}`);
  }
  const end = lines.findIndex((line, i) => i > start && line.startsWith("## "));
  const table = lines
    .slice(start + 1, end < 0 ? lines.length : end)
    .map((line) => line.trim())
    .filter((line) => line.startsWith("|"));
  const header = splitRow(table[0]);
  if (header.join("|") !== expectedHeader.join("|")) {
    throw new Error(`unexpected ${heading} header: ${header.join(" | ")}`);
  }
  if (!isSeparator(splitRow(table[1]))) {
    throw new Error(`${heading} header separator missing`);
  }
  return table.slice(2).map((line) => {
    const cells = splitRow(line);
    if (cells.length !== expectedHeader.length) {
      throw new Error(`${heading} row has ${cells.length} cells: ${line}`);
    }
    return cells;
  });
}

function parseRelayFamilies(markdown: string): RelayRow[] {
  return parseSectionTable(markdown, "## Relay providers", RELAY_HEADER).map(
    ([family, provider, model, selectableRaw]) => ({
      family,
      provider,
      model,
      selectableEfforts: selectableRaw.split(/\s+/).map(asEffort),
    })
  );
}

function parseAdditionalClaudeFamilies(markdown: string): AdditionalClaudeRow[] {
  return parseSectionTable(
    markdown,
    "## Additional Claude families",
    ADDITIONAL_CLAUDE_HEADER
  ).map(([family, provider, model, selectableRaw, stem]) => {
    if (provider !== "claude") {
      throw new Error(`additional Claude family ${family} has provider ${provider}`);
    }
    if (!/^[a-z0-9-]+$/.test(stem)) {
      throw new Error(`invalid Claude-native agent stem: ${stem}`);
    }
    return {
      family,
      provider,
      model,
      selectableEfforts: selectableRaw.split(/\s+/).map(asEffort),
      claudeNativeAgentStem: stem,
    };
  });
}

function parseGrokFamily(markdown: string): RelayRow[] {
  return parseSectionTable(markdown, "## Additional Grok family", RELAY_HEADER).map(
    ([family, provider, model, selectableRaw]) => ({
      family,
      provider,
      model,
      selectableEfforts: selectableRaw.split(/\s+/).map(asEffort),
    })
  );
}

// Setup proposes one target effort per budget and clamps it to the highest
// effort the family can select.
function budgetProposal(target: Effort, selectable: Effort[]): Effort {
  const ceiling = EFFORTS.indexOf(target);
  const allowed = selectable.filter((effort) => EFFORTS.indexOf(effort) <= ceiling);
  const proposal = allowed.at(-1);
  if (proposal === undefined) {
    throw new Error(`no selectable effort at or below ${target}`);
  }
  return proposal;
}

function defaultDescriptors(rows: MatrixRow[]): string[] {
  return rows.map(
    (row) => `${row.provider}:${row.model}@${row.defaultEffort}`
  );
}

function parseFrontmatter(text: string): {
  fields: Record<string, string>;
  body: string;
} {
  if (!text.startsWith("---\n")) {
    throw new Error("missing frontmatter");
  }
  const end = text.indexOf("\n---\n", 4);
  if (end < 0) {
    throw new Error("unterminated frontmatter");
  }
  const fields: Record<string, string> = {};
  for (const line of text.slice(4, end).split("\n")) {
    const idx = line.indexOf(": ");
    if (idx < 0) {
      throw new Error(`bad frontmatter line: ${line}`);
    }
    fields[line.slice(0, idx)] = line.slice(idx + 2);
  }
  return { fields, body: text.slice(end + 5) };
}

function firstRunSheet(setup: string): string {
  const match = setup.match(
    /```markdown\n(# pstack model configuration\n[\s\S]*?)```/
  );
  if (!match) {
    throw new Error("setup-pstack is missing the first-run sheet fence");
  }
  return match[1];
}

describe("model matrix", () => {
  const rows = parseModelMatrix(readFileSync(DISPATCH_PATH, "utf8"));
  const additionalClaude = parseAdditionalClaudeFamilies(
    readFileSync(DISPATCH_PATH, "utf8")
  );
  const setup = readFileSync(SETUP_PATH, "utf8");
  const panel = defaultDescriptors(rows);

  it("owns the effort universe and first-run defaults", () => {
    expect([...EFFORTS]).toEqual(["low", "medium", "high", "xhigh", "max"]);
    expect(rows.map((row) => row.family)).toEqual([...FAMILY_ORDER]);
    for (const row of rows) {
      expect(row.upstreamChoice.length).toBeGreaterThan(0);
      expect(row.model.length).toBeGreaterThan(0);
      expect(row.selectableEfforts.length).toBeGreaterThan(0);
      expect(row.selectableEfforts).toEqual(
        EFFORTS.filter((effort) => row.selectableEfforts.includes(effort))
      );
    }
    expect(
      rows.map((row) => [row.family, row.defaultEffort])
    ).toEqual([
      ["fable", "high"],
      ["opus", "high"],
      ["sol", "xhigh"],
    ]);
    expect(
      rows
        .filter((row) => row.family === "fable" || row.family === "opus")
        .map((row) => [row.family, row.model])
    ).toEqual([
      ["fable", "fable"],
      ["opus", "opus"],
    ]);
  });

  it("ships exactly the declared Claude-native frontier agents", () => {
    const expected = new Set<string>();
    const familyBodies = new Map<string, string>();
    for (const row of [...rows, ...additionalClaude]) {
      const stem = row.claudeNativeAgentStem;
      if (stem === null) {
        continue;
      }
      for (const effort of row.selectableEfforts) {
        const name = `pstack-${stem}-${effort}`;
        expected.add(`${name}.md`);
        const text = readFileSync(join(AGENTS_DIR, `${name}.md`), "utf8");
        const { fields, body } = parseFrontmatter(text);
        expect(fields).toEqual({
          name,
          description: `Native Claude lane for routed workflow skill roles configured as ${row.provider}:${row.model}@${effort}. A poteto-mode delegate uses poteto-agent with model and effort instead.`,
          model: row.model,
          effort,
          background: "true",
          disallowedTools: "Agent, Task",
        });
        const prior = familyBodies.get(stem);
        if (prior === undefined) {
          familyBodies.set(stem, body);
        } else {
          expect(body).toBe(prior);
        }
      }
    }
    const declaredCount = [...rows, ...additionalClaude].reduce(
      (count, row) =>
        count +
        (row.claudeNativeAgentStem === null
          ? 0
          : row.selectableEfforts.length),
      0
    );
    expect(expected.size).toBe(declaredCount);
    const shipped = readdirSync(AGENTS_DIR)
      .filter((name) => name.startsWith("pstack-") && name.endsWith(".md"))
      .sort();
    expect(shipped).toEqual([...expected].sort());
  });

  it("keeps setup's first-run default panel copy aligned with the matrix", () => {
    const sheet = firstRunSheet(setup);
    expect(sheet).toContain("\n<!-- budget: large (xhigh) -->\n");
    const roles = sheet
      .split("\n")
      .filter((line) => line.includes(": ") && !line.startsWith("<!--"))
      .map((line) => line.slice(0, line.indexOf(": ")));
    expect(roles).toEqual([...SHEET_ROLES]);
    const byFamily = new Map<string, MatrixRow>(
      rows.map((row) => [`${row.provider}:${row.model}`, row])
    );
    for (const descriptor of sheet.match(DESCRIPTOR_RE) ?? []) {
      const at = descriptor.lastIndexOf("@");
      const key = descriptor.slice(0, at);
      const effort = descriptor.slice(at + 1);
      const row = byFamily.get(key);
      if (row === undefined) {
        throw new Error(`unknown first-run descriptor: ${descriptor}`);
      }
      expect(effort).toBe(row.defaultEffort);
    }
    const expectedPanel = panel.join(", ");
    for (const role of PANEL_ROLES) {
      const line = sheet
        .split("\n")
        .find((entry) => entry.startsWith(`${role}:`));
      if (line === undefined) {
        throw new Error(`missing first-run panel row: ${role}`);
      }
      expect(line).toBe(`${role}: ${expectedPanel}`);
    }
    const judgeLine = sheet
      .split("\n")
      .find((entry) => entry.startsWith(`${JUDGE_POOL_ROLE}:`));
    expect(judgeLine).toBe(
      `${JUDGE_POOL_ROLE}: ${panel.filter((entry) => !entry.startsWith("claude:fable@")).join(", ")}`
    );
  });

  it("keeps relay families selectable but outside the matrix defaults", () => {
    const relays = parseRelayFamilies(readFileSync(DISPATCH_PATH, "utf8"));
    expect(relays.map((row) => [row.family, row.provider, row.model])).toEqual([
      ["deepseek-flash", "magpie", "wevnal/deepseek-v4.1-flash"],
      ["glm-flash", "magpie", "wevnal/glm-5.3-flash"],
    ]);
    const matrixFamilies = new Set(rows.map((row) => row.family));
    const matrixPairs = new Set(rows.map((row) => `${row.provider}:${row.model}`));
    const sheet = firstRunSheet(setup);
    for (const row of relays) {
      expect(matrixFamilies.has(row.family)).toBe(false);
      expect(matrixPairs.has(`${row.provider}:${row.model}`)).toBe(false);
      expect(row.selectableEfforts).toEqual(
        EFFORTS.filter((effort) => row.selectableEfforts.includes(effort))
      );
      expect(sheet).not.toContain(`${row.provider}:${row.model}@`);
      expect(setup).toContain(
        `| ${row.family} relay row + selected effort | \`codex exec\` on \`magpie\` | \`codex exec\` on \`magpie\` | Lody session \`magpie/${row.model}\` |`
      );
    }
    const dispatch = readFileSync(DISPATCH_PATH, "utf8");
    expect(dispatch).toContain(
      "| Claude Code | native `Agent` | external runner | external runner | external runner |"
    );
    expect(dispatch).toContain("Claude Code itself never sends requests to the relay.");
    expect(setup).not.toContain("A Claude Code parent does not route relay families.");
  });

  it("keeps additional Claude families selectable but outside the matrix defaults", () => {
    expect(
      additionalClaude.map((row) => [
        row.family,
        row.provider,
        row.model,
        row.claudeNativeAgentStem,
      ])
    ).toEqual([
      ["sonnet", "claude", "sonnet", "sonnet"],
      ["haiku", "claude", "haiku", "haiku"],
    ]);
    const matrixFamilies = new Set(rows.map((row) => row.family));
    const matrixPairs = new Set(rows.map((row) => `${row.provider}:${row.model}`));
    const sheet = firstRunSheet(setup);
    for (const row of additionalClaude) {
      expect(matrixFamilies.has(row.family)).toBe(false);
      expect(matrixPairs.has(`${row.provider}:${row.model}`)).toBe(false);
      expect(sheet).not.toContain(`${row.provider}:${row.model}@`);
      // Claude plan mode serves a read-only Haiku lane with Sonnet, so a Codex
      // parent can reach Haiku only through an isolated-write lane.
      const codexRoute = row.family === "haiku"
        ? "Claude CLI for `isolated-write` only; a read-only Haiku lane is a dropout because Claude plan mode serves Sonnet"
        : "Claude CLI";
      expect(setup).toContain(
        `| ${row.family} additional Claude row + selected effort | native Agent \`pstack-${row.claudeNativeAgentStem}-<effort>\` | ${codexRoute} | not routed |`
      );
    }
  });

  it("keeps Grok selectable but outside the matrix defaults", () => {
    const grok = parseGrokFamily(readFileSync(DISPATCH_PATH, "utf8"));
    expect(grok.map((row) => [row.family, row.provider, row.model])).toEqual([
      ["grok", "grok", "grok-4.6"],
    ]);
    const sheet = firstRunSheet(setup);
    for (const row of grok) {
      expect(rows.some((matrix) => matrix.provider === row.provider)).toBe(false);
      expect(row.selectableEfforts).toEqual(XHIGH_CAP);
      expect(sheet).not.toContain(`${row.provider}:`);
    }
  });

  it("caps every Claude family at high", () => {
    const claudeRows = [...rows, ...additionalClaude].filter(
      (row) => row.provider === "claude"
    );
    expect(claudeRows.map((row) => row.family)).toEqual([
      "fable",
      "opus",
      "sonnet",
      "haiku",
    ]);
    for (const row of claudeRows) {
      expect(row.selectableEfforts).toEqual(CLAUDE_CAP);
    }
  });

  it("clamps each budget proposal to a selectable effort, so large proposes the first-run defaults", () => {
    const dispatch = readFileSync(DISPATCH_PATH, "utf8");
    const families = [
      ...rows,
      ...additionalClaude,
      ...parseGrokFamily(dispatch),
      ...parseRelayFamilies(dispatch),
    ];
    for (const row of families) {
      for (const target of Object.values(BUDGET_TARGETS)) {
        expect(row.selectableEfforts).toContain(
          budgetProposal(target, row.selectableEfforts)
        );
      }
    }
    for (const row of rows) {
      expect(budgetProposal(BUDGET_TARGETS.large, row.selectableEfforts)).toBe(
        row.defaultEffort
      );
    }
    for (const row of families) {
      expect(row.selectableEfforts).not.toContain("max");
    }
    expect(setup).toContain(
      "A proposal above a family's highest Selectable effort clamps to that effort."
    );
    expect(setup).toContain("`large` proposes the first-run defaults");
  });

  it("routes setup's Pi parent only to Sol and relay families", () => {
    const sol = rows.find((row) => row.family === "sol");
    expect(sol?.model).toBe("gpt-6.1-sol");
    expect(setup).toContain("Claude Code, Codex, or Pi.");
    expect(setup).toContain(`| Lody session \`magpie/codex/${sol?.model}\` |`);
    for (const family of ["Fable", "Grok", "Opus", "Sonnet", "Haiku"]) {
      const line = setup.split("\n").find((entry) => entry.startsWith(`| ${family} | `));
      expect(line?.split(" | ")[4]).toBe("not routed");
    }
    expect(setup).toContain("`~/.pi/agent/AGENTS.md`");
  });

  it("keeps setup's fail-closed reconfiguration order", () => {
    let previous = -1;
    for (const heading of SETUP_SECTION_ORDER) {
      const current = setup.indexOf(heading);
      expect(current).toBeGreaterThan(previous);
      previous = current;
    }
    expect(setup).toContain("Do not invent a precedence rule.");
    expect(setup).toContain("Do not probe or write while any inconsistency is unresolved.");
    expect(setup).toContain("A failed probe writes nothing:");
    expect(setup).toContain("Run one probe per family");
    expect(setup).toContain("Probe only the selected `provider:model@effort` pair of each used family.");
    expect(setup).toContain("Do not ask about an unused family.");
    expect(setup).toContain("or a family that step 7 did not probe.");
    expect(setup).toContain("Setup never substitutes a family on its own.");
    expect(setup).toContain("The descriptors keep the only effort values");
    for (const label of [
      "`large — xhigh reasoning`",
      "`medium — high reasoning`",
      "`small — medium reasoning`",
    ]) {
      expect(setup).toContain(label);
    }
    expect(setup).toContain("normalized complete role map from step 2");
    expect(setup).toContain(
      "starts with `claude-fable-`, `claude-opus-`, `claude-sonnet-`, or `claude-haiku-`"
    );
    expect(setup).toContain("preserving the provider, effort, role, and lane order");
    expect(setup).toContain("Show any rolling-alias migrations");
    expect(setup).toContain("Every documented role remains present.");
    expect(setup).toContain("An effort-only rerun cannot change a role's family.");
    expect(setup).toContain("<!-- pstack:models:begin -->");
    expect(setup).toContain("<!-- pstack:models:end -->");
  });

  it("binds Claude-native dispatch to the matrix mapping", () => {
    const dispatch = readFileSync(DISPATCH_PATH, "utf8");
    const nativeStart = dispatch.indexOf("## Native lanes");
    const externalStart = dispatch.indexOf("## External lanes");
    expect(nativeStart).toBeGreaterThan(-1);
    expect(externalStart).toBeGreaterThan(nativeStart);
    const nativeLanes = dispatch.slice(nativeStart, externalStart);
    expect(nativeLanes).toContain(
      "match the descriptor's `(provider, model)` to one model-matrix row or one additional Claude family row"
    );
    expect(nativeLanes).toContain(
      "Dispatch a poteto-mode delegate as `subagent_type: \"poteto-agent\"` with `model` set to that row's model alias"
    );
    expect(nativeLanes).toContain(
      "Dispatch a routed skill lane through `pstack-<stem>-<effort>`"
    );
  });

  it("normalizes old rolling-family pins before any runtime route", () => {
    const dispatch = readFileSync(DISPATCH_PATH, "utf8");
    const normalizationStart = dispatch.indexOf("## Read-time normalization");
    const parentStart = dispatch.indexOf("## The parent owns the route");
    expect(normalizationStart).toBeGreaterThan(-1);
    expect(parentStart).toBeGreaterThan(normalizationStart);
    const normalization = dispatch.slice(normalizationStart, parentStart);
    expect(normalization).toContain("replace that model component in memory");
    expect(normalization).toContain("Never pass the versioned predecessor to Claude.");
    expect(normalization).toContain("without writing user files");
    expect(normalization).toContain("`/setup-pstack` will rewrite it");
    expect(normalization).toContain(
      "runner rejects a missed version pin of any rolling Claude alias"
    );
    expect(normalization).toContain(
      "`claude-fable-`, `claude-opus-`, `claude-sonnet-`, or `claude-haiku-`"
    );
    expect(normalization).toContain(
      "Clamp that effort in memory to `high`, the highest effort every Claude family selects."
    );
    expect(normalization).toContain("Never pass the old effort to Claude.");
    expect(setup).toContain("Then clamp a Claude descriptor whose effort is `xhigh` or `max`");
  });
});

// Codex and Pi sessions load only the AGENTS.md mirror block, so setup and
// poteto-help must classify the sheet file and the block by one shared table.
describe("mirror state table", () => {
  const dispatch = readFileSync(DISPATCH_PATH, "utf8");
  const setup = readFileSync(SETUP_PATH, "utf8");
  const help = readFileSync(HELP_PATH, "utf8");
  const sheetSection = dispatch.slice(
    dispatch.indexOf("## Where the sheet lives"),
    dispatch.indexOf("## Read-time normalization")
  );
  const tableLines = sheetSection
    .split("\n")
    .filter((line) => line.startsWith("|"));

  it("defines one row per sheet-file and mirror-block state", () => {
    expect(tableLines.length).toBeGreaterThan(2);
    expect(splitRow(tableLines[0])).toEqual([...MIRROR_STATE_HEADER]);
    const states = tableLines.slice(2).map((line) => splitRow(line).slice(0, 3));
    expect(states).toEqual(MIRROR_STATES.map((state) => [...state]));
  });

  it("points setup step 2, setup step 10, and poteto-help at the table", () => {
    const stepTwo = setup.slice(
      setup.indexOf("### 2. Load current state"),
      setup.indexOf("### 3. Parse per-family efforts")
    );
    const stepTen = setup.slice(setup.indexOf("### 10. Wire it in"));
    for (const text of [stepTwo, stepTen, help]) {
      expect(text).toContain(MIRROR_STATE_LINK);
    }
    expect(stepTen).toContain("With no marker at all, insert one block at the end.");
    expect(help).not.toContain("no `~/.codex/pstack-models.md`");
  });
});
