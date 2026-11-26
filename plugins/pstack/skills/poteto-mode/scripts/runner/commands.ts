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
  // Variables added to the child environment for this command only.
  readonly env?: Readonly<Record<string, string>>;
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
    case "opencode":
      // The catalog lists a paid model only while its provider is signed in,
      // so one listing proves the CLI, the credentials, and the model.
      return {
        command: "opencode",
        args: ["models", "--standalone"],
        stdin: "none",
      };
  }
}

const CODEX_DISABLED_FEATURES = [
  "plugins",
  "multi_agent",
  "hooks",
  "memories",
  "apps",
] as const;

const codexFeatureFlags = CODEX_DISABLED_FEATURES.flatMap((feature) => [
  "--disable",
  feature,
]);

// Codex children load ChatGPT apps and every MCP server from the user's config.
// The runner lists the servers first so the invocation can disable each one.
// The listing takes the child's feature flags: disabled plugins drop their MCP
// servers, and an override for a server the child lacks creates an entry with
// no transport, which stops Codex from starting.
export function mcpListCommand(provider: Provider): CommandSpec | null {
  switch (provider) {
    case "codex":
      return {
        command: "codex",
        args: [...codexFeatureFlags, "mcp", "list", "--json"],
        stdin: "none",
      };
    case "claude":
    case "grok":
    case "opencode":
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

// OpenCode has no OS sandbox, so the lane runs as a config-defined agent whose
// permission rules deny every action and then allow the mode's tools. The last
// matching rule wins and a denied tool is removed from the model's tool list,
// which also hides MCP, skill, subagent, question, and web tools. Read-only
// lanes may read outside the cwd; writers keep their file tools inside it.
const OPENCODE_AGENT = "pstack-lane";

type OpencodePermission = {
  readonly action: string;
  readonly resource: string;
  readonly effect: "allow" | "deny";
};

function opencodePermissions(mode: AccessMode): readonly OpencodePermission[] {
  const allow = (action: string): OpencodePermission => ({
    action,
    resource: "*",
    effect: "allow",
  });
  const tools = mode === "read-only"
    ? ["read", "grep", "glob", "external_directory"]
    : ["read", "grep", "glob", "edit", "shell"];
  return [{ action: "*", resource: "*", effect: "deny" }, ...tools.map(allow)];
}

export function opencodeConfig(mode: AccessMode): string {
  return JSON.stringify({
    agents: {
      [OPENCODE_AGENT]: {
        mode: "primary",
        description: `pstack external ${mode} lane`,
        permissions: opencodePermissions(mode),
      },
    },
  });
}

function permissionMode(mode: AccessMode): string {
  return mode === "read-only" ? "plan" : "acceptEdits";
}

function effortOverride(effort: Effort): string {
  return `model_reasoning_effort=${JSON.stringify(effort)}`;
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
      return {
        command: "codex",
        args: [
          "exec",
          "--model",
          options.model,
          "--config",
          effortOverride(options.effort),
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
          ...codexFeatureFlags,
          "--json",
          "-",
        ],
        stdin: "prompt",
      };
    case "opencode":
      // --standalone keeps the config in this process. The shared background
      // service never sees OPENCODE_CONFIG_CONTENT and would not know the agent.
      return {
        command: "opencode",
        args: [
          "run",
          "--standalone",
          "--model",
          `${options.model}#${options.effort}`,
          "--agent",
          OPENCODE_AGENT,
          "--format",
          "json",
          "--archived",
        ],
        stdin: "prompt",
        env: { OPENCODE_CONFIG_CONTENT: opencodeConfig(options.mode) },
      };
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
