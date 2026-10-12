import type {
  AccessMode,
  Effort,
  McpServerKey,
  Provider,
  RunnerOptions,
} from "./types.ts";

export interface CommandSpec {
  readonly command: string;
  readonly args: readonly string[];
  readonly stdin: "prompt" | "none";
}

export function preflightCommand(provider: Provider): CommandSpec {
  switch (provider) {
    case "claude":
      return {
        command: "claude",
        args: ["auth", "status", "--json"],
        stdin: "none",
      };
    case "codex":
      return {
        command: "codex",
        args: ["login", "status"],
        stdin: "none",
      };
    case "grok":
      return { command: "grok", args: ["models"], stdin: "none" };
    case "magpie":
      // Codex cannot list a custom provider's catalog, so the relay and model
      // are proven by the invocation itself.
      return { command: "codex", args: ["--version"], stdin: "none" };
  }
}

// Codex children load ChatGPT apps and every MCP server from the user's config.
// The runner lists the servers first so the invocation can disable each one.
export function mcpListCommand(provider: Provider): CommandSpec | null {
  switch (provider) {
    case "codex":
    case "magpie":
      return { command: "codex", args: ["mcp", "list", "--json"], stdin: "none" };
    case "claude":
    case "grok":
      return null;
  }
}

function claudeDeniedTools(mode: AccessMode): string {
  const always = ["Agent", "Task", "WebSearch", "WebFetch"];
  const readonly = ["Edit", "Write", "NotebookEdit"];
  return [...always, ...(mode === "read-only" ? readonly : [])].join(",");
}

function claudeTools(mode: AccessMode): string {
  return mode === "read-only"
    ? "Read,Grep,Glob,Bash"
    : "Read,Write,Edit,Grep,Glob,Bash";
}

function codexSandbox(mode: AccessMode): string {
  return mode === "read-only" ? "read-only" : "workspace-write";
}

function grokSandbox(mode: AccessMode): string {
  return mode === "read-only" ? "read-only" : "workspace";
}

function grokTools(mode: AccessMode): string {
  const readonly = ["read_file", "grep", "list_dir", "run_terminal_cmd"];
  return [...readonly, ...(mode === "isolated-write" ? ["search_replace"] : [])].join(",");
}

function permissionMode(mode: AccessMode): string {
  return mode === "read-only" ? "plan" : "acceptEdits";
}

function effortOverride(effort: Effort): string {
  return `model_reasoning_effort=${JSON.stringify(effort)}`;
}

function codexExec(
  options: RunnerOptions,
  config: readonly string[],
  enabledMcpServers: readonly McpServerKey[]
): CommandSpec {
  return {
    command: "codex",
    args: [
      "exec",
      "--model",
      options.model,
      "--config",
      effortOverride(options.effort),
      ...config,
      ...enabledMcpServers.flatMap((name) => [
        "--config",
        `mcp_servers.${name}.enabled=false`,
      ]),
      "--sandbox",
      codexSandbox(options.mode),
      "--cd",
      options.cwd,
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
    ],
    stdin: "prompt",
  };
}

export function invocationCommand(
  options: RunnerOptions,
  enabledMcpServers: readonly McpServerKey[]
): CommandSpec {
  switch (options.provider) {
    case "claude":
      return {
        command: "claude",
        args: [
          "-p",
          "--model",
          options.model,
          "--effort",
          options.effort,
          "--permission-mode",
          permissionMode(options.mode),
          "--setting-sources",
          "project",
          "--strict-mcp-config",
          "--tools",
          claudeTools(options.mode),
          "--no-session-persistence",
          "--disable-slash-commands",
          "--disallowed-tools",
          claudeDeniedTools(options.mode),
          "--output-format",
          "json",
        ],
        stdin: "prompt",
      };
    case "codex":
      return codexExec(options, [], enabledMcpServers);
    case "magpie":
      return codexExec(
        options,
        ["--config", 'model_provider="magpie"'],
        enabledMcpServers
      );
    case "grok":
      return {
        command: "grok",
        args: [
          "--prompt-file",
          options.promptPath,
          "--model",
          options.model,
          "--reasoning-effort",
          options.effort,
          "--permission-mode",
          permissionMode(options.mode),
          "--sandbox",
          grokSandbox(options.mode),
          "--tools",
          grokTools(options.mode),
          "--disallowed-tools",
          "Agent,search_tool,use_tool",
          "--output-format",
          "streaming-messages-json",
          "--cwd",
          options.cwd,
          "--no-subagents",
          "--disable-web-search",
          "--verbatim",
        ],
        stdin: "none",
      };
  }
}
