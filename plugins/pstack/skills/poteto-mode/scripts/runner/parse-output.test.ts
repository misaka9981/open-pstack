import { describe, expect, it } from "bun:test";
import {
  parseCodexMcpListing,
  parseProviderOutput,
  reportedModelMatches,
} from "./parse-output.ts";

describe("parseCodexMcpListing", () => {
  it("returns only the enabled server names", () => {
    const listing = parseCodexMcpListing(JSON.stringify([
      { name: "notion", enabled: true, transport: {} },
      { name: "code-review", enabled: false },
      { name: "PlanetScale", enabled: true },
    ]));
    expect(listing.kind).toBe("ok");
    expect(listing.kind === "ok" ? listing.enabled.map(String) : null).toEqual([
      "notion",
      "PlanetScale",
    ]);
  });

  it("rejects output that is not an array of named entries", () => {
    for (const stdout of [
      "not json",
      JSON.stringify({ servers: [] }),
      JSON.stringify([{ name: "notion" }]),
      JSON.stringify([{ name: "", enabled: true }]),
      JSON.stringify([{ name: "notion", enabled: "true" }]),
    ]) {
      expect(parseCodexMcpListing(stdout).kind).toBe("malformed");
    }
  });

  it("reports enabled names that Codex --config cannot address", () => {
    const listing = parseCodexMcpListing(JSON.stringify([
      { name: "my.server", enabled: true },
      { name: "has space", enabled: true },
      { name: "off.server", enabled: false },
      { name: "notion", enabled: true },
    ]));
    expect(listing).toEqual({
      kind: "unaddressable",
      names: ["my.server", "has space"],
    });
  });
});

describe("parseProviderOutput", () => {
  it("extracts Claude text, model, usage, cost, and session", () => {
    const parsed = parseProviderOutput(
      "claude",
      JSON.stringify({
        result: "CLAUDE_OK",
        session_id: "claude-session",
        usage: { input_tokens: 10, output_tokens: 3 },
        total_cost_usd: 0.05,
        modelUsage: { "claude-fable-9-9": { inputTokens: 10 } },
      }),
      "",
      "fable"
    );
    expect(parsed).toMatchObject({
      text: "CLAUDE_OK",
      reportedModel: "claude-fable-9-9",
      sessionId: "claude-session",
      usage: { inputTokens: 10, outputTokens: 3 },
      costUsd: 0.05,
    });
  });

  it("extracts Codex JSONL without inventing a provider-reported model", () => {
    const parsed = parseProviderOutput(
      "codex",
      [
        JSON.stringify({ type: "thread.started", thread_id: "codex-session" }),
        JSON.stringify({
          type: "item.completed",
          item: { type: "agent_message", text: "CODEX_OK" },
        }),
        JSON.stringify({
          type: "turn.completed",
          usage: {
            input_tokens: 20,
            cached_input_tokens: 4,
            output_tokens: 5,
            reasoning_output_tokens: 2,
          },
        }),
      ].join("\n"),
      "model: gpt-5.6-sol\nreasoning effort: max\n",
      "gpt-5.6-sol"
    );
    expect(parsed).toMatchObject({
      text: "CODEX_OK",
      reportedModel: null,
      sessionId: "codex-session",
      usage: {
        inputTokens: 20,
        cachedInputTokens: 4,
        outputTokens: 5,
        reasoningTokens: 2,
      },
    });
  });

  it("accepts Grok's reported build suffix", () => {
    const parsed = parseProviderOutput(
      "grok",
      [
        JSON.stringify({
          type: "assistant",
          message: { content: [{ type: "text", text: "progress" }] },
        }),
        JSON.stringify({
          type: "result",
          subtype: "success",
          is_error: false,
          result: "GROK_OK",
          session_id: "grok-session",
          usage: {
            input_tokens: 30,
            cache_read_input_tokens: 6,
            output_tokens: 7,
            reasoning_tokens: 3,
            total_tokens: 43,
          },
          total_cost_usd: 0.02,
          modelUsage: { "grok-4.6-build": {} },
        }),
      ].join("\n"),
      "",
      "grok-4.6"
    );
    expect(parsed.text).toBe("GROK_OK");
    expect(parsed.reportedModel).toBe("grok-4.6-build");
    expect(reportedModelMatches("grok", "grok-4.6", parsed.reportedModel)).toBe(
      true
    );
  });

  it("selects the requested Claude model when usage includes a side model", () => {
    const parsed = parseProviderOutput(
      "claude",
      JSON.stringify({
        result: "CLAUDE_OK",
        modelUsage: {
          "claude-haiku-4-5-20251001": {},
          "claude-fable-9-9": {},
        },
      }),
      "",
      "fable"
    );
    expect(parsed.reportedModel).toBe("claude-fable-9-9");
  });

  it("matches only concrete Claude revisions from the requested rolling family", () => {
    expect(reportedModelMatches("claude", "fable", "claude-fable-9-9")).toBe(true);
    expect(reportedModelMatches("claude", "opus", "claude-opus-9")).toBe(true);
    expect(reportedModelMatches("claude", "fable", "claude-opus-9")).toBe(false);
    expect(reportedModelMatches("claude", "fable", "claude-fable-beta")).toBe(false);
    expect(reportedModelMatches("claude", "fable", "fable")).toBe(false);
    expect(reportedModelMatches("claude", "fable", "fable-preview")).toBe(false);
    expect(reportedModelMatches("grok", "fable", "claude-fable-9-9")).toBe(false);
    expect(reportedModelMatches("claude", "sonnet", "claude-sonnet-5-5")).toBe(true);
    expect(reportedModelMatches("claude", "haiku", "claude-haiku-5-5")).toBe(true);
    expect(reportedModelMatches("claude", "sonnet", "claude-haiku-5-5")).toBe(false);
    expect(reportedModelMatches("claude", "haiku", "claude-sonnet-5-5")).toBe(false);
  });

  it("rejects malformed or textless responses", () => {
    expect(() =>
      parseProviderOutput("claude", "not-json", "", "fable")
    ).toThrow("valid JSON");
    expect(() =>
      parseProviderOutput(
        "codex",
        JSON.stringify({ type: "turn.completed" }),
        "",
        "gpt-5.6-sol"
      )
    ).toThrow("final agent message");
  });
});
