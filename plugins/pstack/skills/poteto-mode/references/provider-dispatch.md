# Provider dispatch

pstack model choices are provider-qualified descriptors:

```text
<provider>:<model>@<effort>
```

## Model matrix

| Family | Upstream pstack choice | Provider | Model | Default effort | Selectable efforts | Claude-native agent stem |
|---|---|---|---|---|---|---|
| fable | fable | claude | fable | xhigh | low medium high xhigh max | fable |
| sol | gpt-5.6-sol-max | codex | gpt-6.1-sol | xhigh | low medium high xhigh max | - |
| grok | grok-4.7-xhigh-fast | grok | grok-4.6 | xhigh | low medium high xhigh max | - |
| opus | opus | claude | opus | xhigh | low medium high xhigh max | opus |

The allowed effort universe is exactly `low`, `medium`, `high`, `xhigh`, `max`. First-run requested efforts are the Default effort cell of each row. A Claude-native agent stem of `-` means the family has no Claude-native agent. Otherwise the shipped agent name is `pstack-<stem>-<effort>`.

`fable` and `opus` are Claude Code's rolling aliases. Claude resolves each alias to the latest available family revision. A runner receipt keeps the requested alias in `model` and the concrete provider-reported revision in `reportedModel`; verification accepts only a numeric `claude-fable-*` or `claude-opus-*` revision from the matching family.

## Relay providers

`magpie` is a local relay that Codex reaches through a `model_providers.magpie` entry in the user's `~/.codex/config.toml`. Its descriptors name the relay's model id, which may contain `/`: `magpie:wevnal/glm-5.3@high`. Split a descriptor on the first `:` and the last `@`. The runner never reads the relay URL; Codex resolves the provider name from the user's config.

Setup offers only the relay families below. They stay outside the model matrix, so they never join the first-run defaults or the default panel. A role uses one only when the operator assigns it. A relay model with the same name as a family model is still a different lane. Never rewrite `claude:opus` to `magpie:wevnal/claude-opus-5-5` or the reverse.

| Family | Provider | Model | Selectable efforts |
|---|---|---|---|
| deepseek-flash | magpie | wevnal/deepseek-v4.1-flash | low medium high xhigh max |
| glm-flash | magpie | wevnal/glm-5.3-flash | low medium high xhigh max |

Each selectable effort passed a one-turn runner probe through the relay. That proves the relay accepts the effort, not the reasoning depth it applies.

## Where the sheet lives

On Claude Code, a `pstack-models.md` at the plugin root is the model sheet. The SessionStart hook injects it inside a `<pstack-model-sheet>` block. It replaces `~/.claude/pstack-models.md`, so ignore a user sheet while the plugin ships one. Without a plugin sheet, Claude Code uses `~/.claude/pstack-models.md` from its `CLAUDE.md` include. Codex always uses `~/.codex/pstack-models.md` from its `AGENTS.md` block. Codex runs the plugin's SessionStart hook, but the Codex manifest passes `codex` to it, so the hook injects the poteto-mode mandate without the Claude Code sheet. Pi uses `~/.pi/agent/pstack-models.md`, mirrored into one bounded `<!-- pstack:models:begin -->` / `<!-- pstack:models:end -->` block in `~/.pi/agent/AGENTS.md` the same way.

### Mirror state

On Codex and Pi, a session loads the global `AGENTS.md`, not the sheet file. The mirror block is therefore the configuration in effect, and the sheet file is the copy that `/setup-pstack` reads and rewrites with it. Every reader classifies the two by this table and reports the state it found. A confirmed setup write puts the same render into both, which repairs every inconsistent row. Nothing repairs a row silently.

| Sheet file | Mirror block | In effect | Setup | poteto-help |
|---|---|---|---|---|
| present | same bytes | the block | Load the block. | Configured. |
| present | different bytes | the block | Load the block. Report that the file holds edits no session uses, and show the file's rows that differ. The operator can adopt them in steps 5 and 6. | Configured. When a model change had no effect, say that the file's edits wait for a setup run. |
| present | none | role defaults | Load the file as the seed. Report that no session uses it, its budget included, until setup adds the block. | Not configured. |
| missing | present | the block | Load the block. Report that the file is missing and that the next write recreates it. | Configured. |
| missing | none | role defaults | First run. | Not configured. |
| any | malformed markers | unknown | Report inconsistent state and stop before probing. The operator fixes the markers by hand. | Say that the block's markers are damaged and setup will not run until they are fixed. |

The block holds the same bytes when the text between its markers equals the file. Malformed markers are a begin or end marker without its pair, a duplicated marker, or an end marker before its begin marker. Role defaults are the first-run role map in `/setup-pstack`. Claude Code has no mirror block, because it loads the plugin sheet or the `@` include directly, so this table does not apply there.

## Read-time normalization

Normalize configured descriptors before matching them to the matrix or choosing a route. If a provider-qualified Claude model starts with `claude-fable-` or `claude-opus-` and its remaining revision contains only digits and hyphens, replace that model component in memory with `fable` or `opus`. Preserve provider, effort, role, and lane order. Use only the normalized descriptor for native dispatch or runner argv. Never pass the versioned predecessor to Claude.

This read-time rule makes an older installed sheet use the latest family revision immediately without writing user files. Once per parent run, report that the persisted sheet is stale and that `/setup-pstack` will rewrite it after its normal probes and confirmation. Unknown versioned Claude models remain invalid. The external runner rejects a missed Fable or Opus version pin instead of silently executing it.

`fast` is part of Cursor's Grok selector, not a Grok Build CLI model or effort flag. The portable Grok route pins the CLI model `grok-4.6`. Upstream moved to Grok 4.7; the port keeps 4.6 until `grok-4.7` passes a live runner probe. The first-run Grok effort is `xhigh`.

## The parent owns the route

The top-level harness resolves the route once. A child receives an assigned provider, model, effort, access mode, prompt, working directory, and output path. A child never detects the harness, chooses a provider, or launches another model. Environment markers may corroborate the top-level harness before fan-out, but nested processes inherit parent markers and must not use them for routing.

| Parent | `claude:*` | `codex:*` | `grok:*` | `magpie:*` |
|---|---|---|---|---|
| Claude Code | native `Agent` | external runner | external runner | not routed |
| Codex | external runner | native `spawn_agent` | external runner | external runner |
| Pi | not routed | native `subagent` (`magpie/codex/…`) | not routed | native `subagent` (`magpie`) |

A `not routed` cell is a named dropout. Claude Code keeps its configured providers and does not use the relay. A Pi parent reaches Codex models as the relay's `codex/` models and the other relay models directly, all through Pi's `magpie` provider; it has no route to Claude or Grok.

A Codex parent reaches `magpie:*` only through the external runner. `spawn_agent` has no provider parameter, and a spawned child ignores an agent profile's `model_provider`: the child keeps the parent's provider and rejects the relay model id. This table assumes the Codex parent runs on its default provider.

`inherit-parent` and `auto` remain aliases. They use the parent's current model and effort through its native subagent primitive. In a panel they still consume one lane, but they reduce provider diversity; say so in the synthesis record.

## Native lanes

Native dispatch avoids a second CLI startup and its base context.

- Claude Code: match the descriptor's `(provider, model)` to one model-matrix row, then dispatch it through `pstack-<stem>-<effort>` using that row's Claude-native agent stem and the descriptor's effort. Those definitions select the rolling model alias, requested effort, and `background: true`. `pstack-fable-max` and `pstack-opus-xhigh` remain in that set. Pass the complete task, grounding paths, access mode, and unique output location in the `Agent` prompt. Retain the task handle and drain it only after fan-out.
- Codex: call `spawn_agent` with the descriptor's model and `reasoning_effort`, the complete task, grounding paths, access mode, and unique output location. Use an isolated worktree for a writer. Codex subagents already run concurrently.
- Pi: launch every lane as a child of one async pi-subagents workflow with the mapped `<pi provider>/<model>:<effort>` and a pstack agent, as [`pi-tools.md`](pi-tools.md) specifies. Never use a foreground or single-agent launch, because those carry pi-subagents' implicit 30-minute deadline.

Do not send a same-provider descriptor to the external runner. It rejects that call because the native route is cheaper and already available.

## External lanes

The launcher lives at `skills/poteto-mode/scripts/runner/pstack-runner` under the installed plugin. The parent writes the complete candidate prompt to a unique file, creates a unique output directory or worktree, and invokes the launcher directly. Do not put another agent in front of it.

```text
pstack-runner \
  --parent <claude|codex> \
  --provider <claude|codex|grok|magpie> \
  --model <real CLI model> \
  --effort <low|medium|high|xhigh|max> \
  --mode <read-only|isolated-write> \
  --prompt <unique prompt file> \
  --cwd <repository or dedicated worktree> \
  --output <unique final-response file> \
  --receipt <unique receipt file> \
  [--timeout <seconds>]
```

Pass arguments as an argv array or quote every path. Never interpolate prompt text into a shell command. The launcher preflights the assigned CLI and authentication, invokes the model exactly once, disables recursive agents and ambient skill dispatch where the CLI supports it, restricts the built-in tool surface, and records the exact provider/model/effort flags. External lanes do not receive the parent's MCP surface. Keep MCP-dependent Why and Reflect roles on `inherit-parent` or `auto`. The launcher never falls back.

Grok authentication preflight has one bounded retry. If the first `grok models` result would be classified as unauthenticated, the runner waits five seconds and tries the same preflight once more. A second failure is terminal. The delay and second attempt share the runner's absolute deadline and cancellation latch, and the receipt keeps evidence from both attempts. Model execution is never retried.

The parent tool sandbox still governs whether a subscribed child CLI can reach its credentials and network. Run setup's live probe from the actual parent profile. A blocked external CLI is a loud dropout, not a reason to elevate permissions or substitute a model silently.

The parent invocation must itself be resumable background work:

- Claude Code: call the launcher through a Bash tool invocation with `run_in_background: true` and retain its task ID. A foreground Bash tool call has an automatic ten-minute ceiling even when the runner's own timeout is longer. Shelling out with `&` and losing the task handle is not equivalent.
- Codex: run the launcher in a persistent exec session that returns a session ID, then wait or poll that handle. Do not hold one foreground tool call open for the model's full runtime.

Start the background process, continue launching the other lanes, then drain their handles. Native and external lanes belong in the same fan-out phase.

The runner and its preflight have no implicit timeout. Do not invent a duration from role, mode, or a convenient round number; real implementation lanes can run for 90 minutes or much longer. Pass `--timeout` only when the user, an external service deadline, or a measured task contract supplies a real bound. That value starts at wrapper entry, before module loading and argument parsing, and remains one absolute deadline across setup, preflight, model execution, and output capture. It is never a fresh allowance per child, and long waits are armed in runtime-safe chunks without shortening the supplied deadline. Otherwise supervise liveness through the retained background task/session handle and cancel manually only on evidence that the run is dead. Cancel through that retained handle so the runner receives SIGINT or SIGTERM, sends it to an active child when one remains, stops waiting on inherited output pipes, removes the empty output reservation, and writes a `cancelled` receipt. Preserve that receipt; a retry is a new attempt with new unique output and receipt paths. Unchanged running state is not a dropout, and Claude's ten-minute foreground ceiling is never a reason to terminate a healthy lane.

A `magpie` lane runs `codex exec` with `model_provider="magpie"` and the same sandbox, feature, and output flags as a `codex` lane. Its preflight only proves that the Codex CLI exists, because Codex cannot list a custom provider's catalog. The one model invocation proves the relay and the model. A rejected model id is an `unavailable-model` dropout. A Codex parent in the `workspace-write` sandbox cannot start the nested Codex CLI, which fails with `Operation not permitted` while it initializes; that lane is a `child-failed` dropout. Do not loosen the sandbox to recover it.

Read-only mode maps to Claude plan mode with project-only settings and an explicit tool list, Codex's read-only sandbox, and Grok plan mode plus its `read-only` sandbox and read-oriented tool list. Grok's built-in read-only profile deliberately keeps its own state and system temporary directories writable, so point a read-only Grok lane at the actual checkout rather than a worktree under `/tmp`, `/var/tmp`, or the host's temporary directory. `isolated-write` maps to Claude `acceptEdits` with project-only settings, Codex `workspace-write`, and Grok `acceptEdits` plus its `workspace` sandbox and write-capable tool list. Give every writer only a dedicated worktree or output directory. Never route a writer into the primary checkout.

Every concurrent external lane needs distinct prompt, output, and receipt paths. The launcher reserves output and receipt paths exclusively and refuses to overwrite them.

## Completion and dropouts

Success requires all of these:

1. Exit status `0`.
2. Receipt status `complete`.
3. Either `modelVerified: true` with `modelEvidence: "provider-report"`, or a Codex or magpie receipt with `reportedModel: null`, `modelVerified: false`, and `modelEvidence: "pinned-argv"`. For Claude's `fable` and `opus` aliases, the concrete provider report must belong to the requested family. Codex 0.149.0 accepts the exact `--model` argument but does not report the served model in its JSONL stream.
4. A non-empty output file.

A Pi lane has no runner receipt. It succeeds when its workflow result has `ok: true` and a non-empty output, and its child transcript's assistant messages report the mapped provider and model. A child that fails, including one whose model is not in Pi's registry, is a dropout.

The receipt also carries elapsed time, token usage when the CLI exposes it, and cost when available. Keep it with the arena or review artifacts so parent-harness comparisons are evidence-based.

Any missing CLI, failed login, unavailable model, explicit timeout, cancellation, catchable post-reservation launcher failure, non-zero child exit, malformed result, or model mismatch is a receipt-bearing dropout. Record it and apply the calling skill's existing dropout policy. A `cancelled` receipt proves that the runner received the signal; its `signal` field is non-null only when the runner sent that signal to a still-active direct CLI child, and remains null when cancellation only stopped a post-exit pipe drain. The provider CLI owns any processes it starts beneath that direct child; the receipt does not claim a process-tree kill. Do not delete or overwrite the receipt. Never substitute the parent model, retry another provider, or reinterpret an external descriptor as a native model slug.

Start native and external lanes in the same fan-out phase, then wait for all of them before judging. A judge must not read candidate paths while their owners are still writing.
