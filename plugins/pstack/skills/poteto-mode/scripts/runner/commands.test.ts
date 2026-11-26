import { describe, expect, it } from "bun:test";
import { invocationCommand, mcpListCommand, opencodeConfig } from "./commands.ts";
import type { McpServerKey, RunnerOptions } from "./types.ts";

function options(overrides: Partial<RunnerOptions> = {}): RunnerOptions {
  return {
    parent: "claude",
    provider: "codex",
    model: "gpt-5.6-sol",
    effort: "max",
    mode: "read-only",
    promptPath: "/tmp/prompt.md",
    cwd: "/tmp/worktree",
    outputPath: "/tmp/output.md",
    receiptPath: "/tmp/receipt.json",
    timeoutMs: null,
    ...overrides,
  };
}

describe("invocationCommand", () => {
  it("pins Codex model, effort, sandbox, cwd, and JSONL output", () => {
    const spec = invocationCommand(options(), []);
    expect(spec.command).toBe("codex");
    expect(spec.stdin).toBe("prompt");
    expect(spec.args).toEqual([
      "exec",
      "--model",
      "gpt-5.6-sol",
      "--config",
      'model_reasoning_effort="max"',
      "--sandbox",
      "read-only",
      "--cd",
      "/tmp/worktree",
      "--skip-git-repo-check",
      "--ephemeral",
      "--disable",
      "plugins",
      "--disable",
      "multi_agent",
      "--disable",
      "hooks",
      "--disable",
      "memories",
      "--disable",
      "apps",
      "--json",
      "-",
    ]);
    expect(spec.args).not.toContain("danger-full-access");
  });

  it("runs OpenCode standalone as the pstack agent with the effort as variant", () => {
    const spec = invocationCommand(
      options({
        parent: "codex",
        provider: "opencode",
        model: "opencode/glm-5.3-flash",
        effort: "high",
      }),
      []
    );
    expect(spec.command).toBe("opencode");
    expect(spec.stdin).toBe("prompt");
    expect(spec.args).toEqual([
      "run",
      "--standalone",
      "--model",
      "opencode/glm-5.3-flash#high",
      "--agent",
      "pstack-lane",
      "--format",
      "json",
      "--archived",
    ]);
    expect(Object.keys(spec.env ?? {})).toEqual(["OPENCODE_CONFIG_CONTENT"]);
  });

  it("gives OpenCode read-only lanes only read tools and writers no outside paths", () => {
    const rules = (mode: "read-only" | "isolated-write") =>
      JSON.parse(opencodeConfig(mode)).agents["pstack-lane"].permissions;
    const deny = { action: "*", resource: "*", effect: "deny" };
    const allow = (action: string) => ({ action, resource: "*", effect: "allow" });
    expect(rules("read-only")).toEqual([
      deny,
      allow("read"),
      allow("grep"),
      allow("glob"),
      allow("external_directory"),
    ]);
    expect(rules("isolated-write")).toEqual([
      deny,
      allow("read"),
      allow("grep"),
      allow("glob"),
      allow("edit"),
      allow("shell"),
    ]);
  });

  it("passes Claude model, effort, permissions, and no-recursion controls", () => {
    const spec = invocationCommand(
      options({
        parent: "codex",
        provider: "claude",
        model: "fable",
      }),
      []
    );
    expect(spec.command).toBe("claude");
    expect(spec.stdin).toBe("prompt");
    expect(spec.args).toEqual([
      "-p",
      "--model",
      "fable",
      "--effort",
      "max",
      "--permission-mode",
      "plan",
      "--setting-sources",
      "project",
      "--strict-mcp-config",
      "--tools",
      "Read,Grep,Glob,Bash",
      "--no-session-persistence",
      "--disable-slash-commands",
      "--disallowed-tools",
      "Agent,Task,WebSearch,WebFetch,Edit,Write,NotebookEdit",
      "--output-format",
      "json",
    ]);
    expect(spec.args).not.toContain("bypassPermissions");
  });

  it("limits Grok to the assigned cwd and disables recursive agents", () => {
    const spec = invocationCommand(
      options({ provider: "grok", model: "grok-4.6", effort: "xhigh" }),
      []
    );
    expect(spec.command).toBe("grok");
    expect(spec.stdin).toBe("none");
    expect(spec.args).toEqual([
      "--prompt-file",
      "/tmp/prompt.md",
      "--model",
      "grok-4.6",
      "--reasoning-effort",
      "xhigh",
      "--permission-mode",
      "plan",
      "--sandbox",
      "read-only",
      "--tools",
      "read_file,grep,list_dir,run_terminal_cmd",
      "--disallowed-tools",
      "Agent,search_tool,use_tool",
      "--output-format",
      "streaming-messages-json",
      "--cwd",
      "/tmp/worktree",
      "--no-subagents",
      "--disable-web-search",
      "--verbatim",
    ]);
  });

  it("uses bounded write modes without blanket bypasses", () => {
    const codex = invocationCommand(options({ mode: "isolated-write" }), []);
    expect(codex.args).toEqual(
      expect.arrayContaining(["--sandbox", "workspace-write"])
    );
    const grok = invocationCommand(
      options({ provider: "grok", model: "grok-4.6", mode: "isolated-write" }),
      []
    );
    expect(grok.args).toEqual(
      expect.arrayContaining([
        "--permission-mode",
        "acceptEdits",
        "--sandbox",
        "workspace",
        "--tools",
        "read_file,grep,list_dir,run_terminal_cmd,search_replace",
      ])
    );
    expect(grok.args).not.toContain("--always-approve");

    const claude = invocationCommand(
      options({ provider: "claude", model: "fable", mode: "isolated-write" }),
      []
    );
    expect(claude.args).toEqual(
      expect.arrayContaining([
        "--permission-mode",
        "acceptEdits",
        "--tools",
        "Read,Write,Edit,Grep,Glob,Bash",
      ])
    );
  });

  it("covers low, medium, and high for every external provider", () => {
    const cases = [
      {
        provider: "claude" as const,
        model: "fable",
        flag: (effort: "low" | "medium" | "high") => ["--effort", effort],
      },
      {
        provider: "codex" as const,
        model: "gpt-5.6-sol",
        flag: (effort: "low" | "medium" | "high") => [
          "--config",
          `model_reasoning_effort="${effort}"`,
        ],
      },
      {
        provider: "opencode" as const,
        model: "opencode/glm-5.3-flash",
        flag: (effort: "low" | "medium" | "high") => [
          "--model",
          `opencode/glm-5.3-flash#${effort}`,
        ],
      },
      {
        provider: "grok" as const,
        model: "grok-4.6",
        flag: (effort: "low" | "medium" | "high") => [
          "--reasoning-effort",
          effort,
        ],
      },
    ];
    for (const { provider, model, flag } of cases) {
      for (const effort of ["low", "medium", "high"] as const) {
        const spec = invocationCommand(options({ provider, model, effort }), []);
        expect(spec.args).toEqual(expect.arrayContaining(flag(effort)));
      }
    }
  });
});

describe("Codex tool surface", () => {
  const servers = ["notion", "incident-io"] as McpServerKey[];

  it("disables apps and each listed MCP server for a codex lane", () => {
    const spec = invocationCommand(options(), servers);
    expect(spec.args).toEqual(expect.arrayContaining(["--disable", "apps"]));
    const configs = spec.args.filter((arg) => arg.startsWith("mcp_servers."));
    expect(configs).toEqual([
      "mcp_servers.notion.enabled=false",
      "mcp_servers.incident-io.enabled=false",
    ]);
    for (const config of configs) {
      expect(spec.args[spec.args.indexOf(config) - 1]).toBe("--config");
    }
    expect(mcpListCommand("codex")).toEqual({
      command: "codex",
      args: [
        "--disable", "plugins",
        "--disable", "multi_agent",
        "--disable", "hooks",
        "--disable", "memories",
        "--disable", "apps",
        "mcp", "list", "--json",
      ],
      stdin: "none",
    });
  });

  for (const provider of ["claude", "grok", "opencode"] as const) {
    it(`leaves the ${provider} lane without a Codex MCP listing`, () => {
      expect(mcpListCommand(provider)).toBeNull();
      const spec = invocationCommand(options({ provider, model: "opus" }), servers);
      expect(spec.args.some((arg) => arg.includes("mcp_servers"))).toBe(false);
      expect(spec.args).not.toContain("apps");
    });
  }
});
