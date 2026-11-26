import type {
  CodexMcpListing,
  McpServerKey,
  NormalizedUsage,
  ParsedOutput,
  Provider,
} from "./types.ts";
import {
  concreteModelMatchesRollingAlias,
  isRollingClaudeAlias,
} from "./model-aliases.ts";

type JsonObject = Record<string, unknown>;

function object(value: unknown): JsonObject | null {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? (value as JsonObject)
    : null;
}

function finiteNumber(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

function nullableString(value: unknown): string | null {
  return typeof value === "string" && value.length > 0 ? value : null;
}

function normalizedUsage(value: unknown): NormalizedUsage | null {
  const usage = object(value);
  if (usage === null) return null;
  const result: NormalizedUsage = {
    inputTokens: finiteNumber(usage.input_tokens),
    cachedInputTokens: finiteNumber(
      usage.cached_input_tokens ?? usage.cache_read_input_tokens
    ),
    cacheCreationInputTokens: finiteNumber(
      usage.cache_creation_input_tokens ?? usage.cache_write_input_tokens
    ),
    outputTokens: finiteNumber(usage.output_tokens),
    reasoningTokens: finiteNumber(
      usage.reasoning_tokens ?? usage.reasoning_output_tokens
    ),
    totalTokens: finiteNumber(usage.total_tokens),
  };
  return Object.values(result).some((entry) => entry !== undefined)
    ? result
    : null;
}

function modelFromUsage(
  value: unknown,
  provider: Provider,
  requestedModel: string
): string | null {
  const usage = object(value);
  if (usage === null) return null;
  const models = Object.keys(usage);
  return models.find((model) =>
    reportedModelMatches(provider, requestedModel, model)
  )
    ?? models[0]
    ?? null;
}

function parseClaude(stdout: string, requestedModel: string): ParsedOutput {
  let raw: unknown;
  try {
    raw = JSON.parse(stdout);
  } catch {
    throw new Error("claude did not emit valid JSON");
  }
  const value = object(raw);
  if (value === null) throw new Error("claude emitted a non-object result");

  const text = nullableString(value.result);
  if (text === null) throw new Error("claude result did not contain final text");
  if (value.is_error === true) throw new Error("claude reported an error result");

  return {
    text,
    reportedModel: modelFromUsage(value.modelUsage, "claude", requestedModel),
    sessionId: nullableString(value.session_id ?? value.sessionId),
    usage: normalizedUsage(value.usage),
    costUsd: finiteNumber(value.total_cost_usd) ?? null,
  };
}

function parseGrok(stdout: string, requestedModel: string): ParsedOutput {
  let result: JsonObject | null = null;
  for (const line of stdout.split("\n")) {
    if (line.trim().length === 0) continue;
    let raw: unknown;
    try {
      raw = JSON.parse(line);
    } catch {
      throw new Error("grok emitted a non-JSON event");
    }
    const event = object(raw);
    if (event?.type === "result") result = event;
  }

  if (result === null) throw new Error("grok result did not contain a terminal event");
  if (result.is_error === true || result.subtype !== "success") {
    throw new Error("grok reported an error result");
  }
  const text = nullableString(result.result);
  if (text === null) throw new Error("grok result did not contain final text");

  return {
    text,
    reportedModel: modelFromUsage(result.modelUsage, "grok", requestedModel),
    sessionId: nullableString(result.session_id),
    usage: normalizedUsage(result.usage),
    costUsd: finiteNumber(result.total_cost_usd) ?? null,
  };
}

function parseCodex(stdout: string): ParsedOutput {
  let text: string | null = null;
  let usage: NormalizedUsage | null = null;
  let sessionId: string | null = null;

  for (const line of stdout.split("\n")) {
    if (line.trim().length === 0) continue;
    let raw: unknown;
    try {
      raw = JSON.parse(line);
    } catch {
      throw new Error("codex emitted a non-JSON event");
    }
    const event = object(raw);
    if (event === null) continue;
    if (event.type === "thread.started") {
      sessionId = nullableString(event.thread_id) ?? sessionId;
    }
    if (event.type === "item.completed") {
      const item = object(event.item);
      if (item?.type === "agent_message") {
        text = nullableString(item.text) ?? text;
      }
    }
    if (event.type === "turn.completed") {
      usage = normalizedUsage(event.usage) ?? usage;
    }
    if (event.type === "turn.failed") {
      const error = object(event.error);
      throw new Error(nullableString(error?.message) ?? "codex reported a failed turn");
    }
  }

  if (text === null) throw new Error("codex result did not contain a final agent message");
  return {
    text,
    reportedModel: null,
    sessionId,
    usage,
    costUsd: null,
  };
}

// `opencode run --format json` emits one event per line. Each model step opens
// with step_start and closes with step_finish, which carries that step's cost
// and tokens. The final answer is the text of the last step that wrote any.
// The stream never names the served model.
function parseOpencode(stdout: string): ParsedOutput {
  let stepText: string[] = [];
  let finalText: string[] = [];
  let sessionId: string | null = null;
  let costUsd: number | null = null;
  const usage: Record<keyof NormalizedUsage, number | undefined> = {
    inputTokens: undefined,
    cachedInputTokens: undefined,
    cacheCreationInputTokens: undefined,
    outputTokens: undefined,
    reasoningTokens: undefined,
    totalTokens: undefined,
  };
  const add = (key: keyof NormalizedUsage, value: unknown): void => {
    const count = finiteNumber(value);
    if (count !== undefined) usage[key] = (usage[key] ?? 0) + count;
  };

  for (const line of stdout.split("\n")) {
    if (line.trim().length === 0) continue;
    let raw: unknown;
    try {
      raw = JSON.parse(line);
    } catch {
      throw new Error("opencode emitted a non-JSON event");
    }
    const event = object(raw);
    if (event === null) continue;
    sessionId = nullableString(event.sessionID) ?? sessionId;
    const part = object(event.part);
    if (event.type === "error") {
      const error = object(event.error);
      throw new Error(nullableString(error?.message) ?? "opencode reported an error");
    }
    if (event.type === "step_start") stepText = [];
    if (event.type === "text") {
      const text = nullableString(part?.text);
      if (text !== null) stepText.push(text);
    }
    if (event.type === "step_finish") {
      if (stepText.length > 0) finalText = stepText;
      stepText = [];
      const cost = finiteNumber(part?.cost);
      if (cost !== undefined) costUsd = (costUsd ?? 0) + cost;
      const tokens = object(part?.tokens);
      const cache = object(tokens?.cache);
      add("inputTokens", tokens?.input);
      add("outputTokens", tokens?.output);
      add("reasoningTokens", tokens?.reasoning);
      add("cachedInputTokens", cache?.read);
      add("cacheCreationInputTokens", cache?.write);
    }
  }
  if (stepText.length > 0) finalText = stepText;

  const text = finalText.join("\n\n");
  if (text.length === 0) throw new Error("opencode result did not contain final text");
  return {
    text,
    reportedModel: null,
    sessionId,
    usage: Object.values(usage).some((entry) => entry !== undefined) ? usage : null,
    costUsd,
  };
}

export function parseProviderOutput(
  provider: Provider,
  stdout: string,
  stderr: string,
  requestedModel: string
): ParsedOutput {
  switch (provider) {
    case "claude":
      return parseClaude(stdout, requestedModel);
    case "codex":
      return parseCodex(stdout);
    case "opencode":
      return parseOpencode(stdout);
    case "grok":
      return parseGrok(stdout, requestedModel);
  }
}

export function reportedModelMatches(
  provider: Provider,
  requested: string,
  reported: string | null
): boolean {
  if (reported === null) return false;
  if (provider === "claude" && isRollingClaudeAlias(requested)) {
    return concreteModelMatchesRollingAlias(requested, reported);
  }
  if (reported === requested || reported.startsWith(`${requested}-`)) {
    return true;
  }
  return false;
}

// Codex 0.162.1 splits a --config key on every "." and keeps quote characters
// literally, so a TOML-quoted key names a new transport-less server and Codex
// refuses to start. Only bare names can be disabled through --config.
const ADDRESSABLE_MCP_SERVER = /^[A-Za-z0-9_-]+$/;

export function parseCodexMcpListing(stdout: string): CodexMcpListing {
  let raw: unknown;
  try {
    raw = JSON.parse(stdout);
  } catch {
    return { kind: "malformed", reason: "codex mcp list did not emit valid JSON" };
  }
  if (!Array.isArray(raw)) {
    return { kind: "malformed", reason: "codex mcp list did not emit a JSON array" };
  }
  const enabled: string[] = [];
  for (const entry of raw) {
    const server = object(entry);
    if (
      server === null ||
      typeof server.name !== "string" ||
      server.name.length === 0 ||
      typeof server.enabled !== "boolean"
    ) {
      return {
        kind: "malformed",
        reason: "codex mcp list entry lacks a string name or a boolean enabled",
      };
    }
    if (server.enabled) enabled.push(server.name);
  }
  const unaddressable = enabled.filter((name) => !ADDRESSABLE_MCP_SERVER.test(name));
  if (unaddressable.length > 0) return { kind: "unaddressable", names: unaddressable };
  return { kind: "ok", enabled: enabled as McpServerKey[] };
}
