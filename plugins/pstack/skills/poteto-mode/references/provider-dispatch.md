# Provider dispatch

pstack model choices are provider-qualified descriptors:

```text
<provider>:<model>@<effort>
```

## Model matrix

| Family | Upstream pstack choice | Provider | Model | Default effort | Selectable efforts | Claude-native agent stem |
|---|---|---|---|---|---|---|
| fable | fable | claude | fable | high | low medium high | fable |
| opus | opus | claude | opus | high | low medium high | opus |
| sol | gpt-5.6-sol-max | codex | gpt-6.2-sol | xhigh | low medium high xhigh | - |

The allowed effort universe is exactly `low`, `medium`, `high`, `xhigh`, `max`. First-run requested efforts are the Default effort cell of each row. No family selects `max`, because upstream runs no role above `xhigh`. Every Claude family selects at most `high`, which is the maintainer's cap. Sol takes the panel seat that upstream gives Gemini. The port has no Gemini route, and Sol is the family that a Codex parent runs natively. A Claude-native agent stem of `-` means the family has no Claude-native agent. Otherwise the shipped agent name is `pstack-<stem>-<effort>`.

`fable`, `opus`, `sonnet`, and `haiku` are Claude Code's rolling aliases. Claude resolves each alias to the latest available family revision. A runner receipt keeps the requested alias in `model` and the concrete provider-reported revision in `reportedModel`; verification accepts only a numeric `claude-<alias>-*` revision from the matching family.

## Additional Claude families

Setup also offers the Claude families below. They stay outside the model matrix, so they never join the first-run defaults or the default panels. A role uses one only when the operator assigns it.

| Family | Provider | Model | Selectable efforts | Claude-native agent stem |
|---|---|---|---|---|
| sonnet | claude | sonnet | low medium high | sonnet |
| haiku | claude | haiku | low medium high | haiku |

Each selectable effort passed a one-turn `claude -p` probe, and the reported models were `claude-sonnet-5-5` and `claude-haiku-5-5`. That proves Claude accepts the effort, not the reasoning depth it applies.

From a Codex parent, run `claude:haiku` only in `isolated-write`. The runner maps read-only to Claude plan mode, and `claude -p --model haiku --permission-mode plan` is served by `claude-sonnet-5-5`, so a read-only Haiku lane always ends as a model-mismatch dropout. Native Claude Code dispatch through `pstack-haiku-<effort>` does not use plan mode and is not affected.

## Additional Codex family

Setup also offers Astra. It stays outside the model matrix, so it never joins the first-run defaults or the default panels. A role uses it only when the operator assigns it. It routes like Sol, natively on a Codex parent and through the runner on a Claude Code parent.

| Family | Provider | Model | Selectable efforts |
|---|---|---|---|
| astra | codex | gpt-6.2-astra | low medium high xhigh |

Each selectable effort passed a one-turn runner probe from a Claude Code parent. That proves Codex accepts the effort, not the reasoning depth it applies.

## Additional Grok family

Setup also offers Grok. It stays outside the model matrix, so it never joins the first-run defaults or the default panels. A role uses it only when the operator assigns it.

| Family | Provider | Model | Selectable efforts |
|---|---|---|---|
| grok | grok | grok-4.6 | low medium high xhigh |

`fast` is part of Cursor's Grok selector, not a Grok Build CLI model or effort flag. The portable Grok route pins the CLI model `grok-4.6`. Upstream moved to Grok 4.7; the port keeps 4.6 until `grok-4.7` passes a live runner probe.

## Additional OpenCode families

`opencode` runs a model through the OpenCode CLI on the provider that OpenCode signs in to. Its descriptors name OpenCode's `<provider>/<model>` id, which contains `/`: `opencode:opencode/glm-5.3-flash@high`. Split a descriptor on the first `:` and the last `@`. The runner passes the effort as OpenCode's model variant, so that descriptor runs `--model opencode/glm-5.3-flash#high`.

Setup offers the OpenCode families below. They stay outside the model matrix, so they never join the first-run defaults or the default panels. A role uses one only when the operator assigns it. An OpenCode model with the same name as a family model is still a different lane. Never rewrite `codex:gpt-6.2-sol` to `opencode:opencode/gpt-6.2-sol` or the reverse.

| Family | Provider | Model | Selectable efforts |
|---|---|---|---|
| deepseek-flash | opencode | opencode/deepseek-v4.1-flash | low high |
| glm-flash | opencode | opencode/glm-5.3-flash | low high |

Both models accept the variants `low`, `high`, and `max`, and reject `medium` and `xhigh` as `Variant unavailable`. `max` stays out because no family selects it. Each selectable effort passed a one-turn `opencode run` probe. That proves OpenCode accepts the variant, not the reasoning depth it applies.

## Where the sheet lives

On Claude Code, a `pstack-models.md` at the plugin root is the model sheet. The SessionStart hook injects it inside a `<pstack-model-sheet>` block. It replaces `~/.claude/pstack-models.md`, so ignore a user sheet while the plugin ships one. Without a plugin sheet, Claude Code uses `~/.claude/pstack-models.md` from its `CLAUDE.md` include. Codex always uses `~/.codex/pstack-models.md`, mirrored into one bounded `<!-- pstack:models:begin -->` / `<!-- pstack:models:end -->` block in `~/.codex/AGENTS.md`. Codex runs the plugin's SessionStart hook, but the Codex manifest passes `codex` to it, so the hook injects the poteto-mode mandate without the Claude Code sheet.

### Mirror state

On Codex, a session loads the global `AGENTS.md`, not the sheet file. The mirror block is therefore the configuration in effect, and the sheet file is the copy that `/setup-pstack` reads and rewrites with it. Every reader classifies the two by this table and reports the state it found. A confirmed setup write puts the same render into both, which repairs every inconsistent row. Nothing repairs a row silently.

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

Normalize configured descriptors before matching them to a family or choosing a route. If a provider-qualified Claude model starts with `claude-fable-`, `claude-opus-`, `claude-sonnet-`, or `claude-haiku-` and its remaining revision contains only digits and hyphens, replace that model component in memory with `fable`, `opus`, `sonnet`, or `haiku`. Preserve provider, effort, role, and lane order. Use only the normalized descriptor for native dispatch or runner argv. Never pass the versioned predecessor to Claude.

An older sheet can also hold a Claude descriptor at `xhigh` or `max`, above its family's Selectable efforts. Clamp that effort in memory to `high`, the highest effort every Claude family selects. Preserve provider, model, role, and lane order. Never pass the old effort to Claude. An older sheet can also hold any other descriptor at `max`. Clamp it in memory to `xhigh` the same way.

These read-time rules make an older installed sheet use the latest family revision and a selectable effort immediately without writing user files. Once per parent run, report that the persisted sheet is stale and that `/setup-pstack` will rewrite it after its normal probes and confirmation. Unknown versioned Claude models remain invalid. The external runner rejects a missed version pin of any rolling Claude alias instead of silently executing it.

## The parent owns the route

The top-level harness resolves the route once. A child receives an assigned provider, model, effort, access mode, prompt, working directory, and output path. A child never detects the harness, chooses a provider, or launches another model. Environment markers may corroborate the top-level harness before fan-out, but nested processes inherit parent markers and must not use them for routing.

| Parent | `claude:*` | `codex:*` | `grok:*` | `opencode:*` |
|---|---|---|---|---|
| Claude Code | native `Agent` | external runner | external runner | external runner |
| Codex | external runner | native `spawn_agent` | external runner | external runner |

Both parents reach `opencode:*` only through the external runner. `spawn_agent` has no provider parameter, so a Codex parent cannot run an OpenCode model natively.

`inherit-parent` and `auto` remain aliases. They use the parent's current model and effort through its native subagent primitive. In a panel they still consume one lane, but they reduce provider diversity; say so in the synthesis record.

When poteto-mode's Subagents section adjusts a lane's effort for the job, the adjusted effort replaces the descriptor's effort on every route. On Claude Code it is the `Agent` call's `effort` for a `poteto-agent` delegate and the `pstack-<stem>-<effort>` agent for a routed skill lane. On Codex it is `reasoning_effort`, and on an external lane the runner's `--effort`. The provider and model stay the descriptor's.

## Native lanes

Native dispatch avoids a second CLI startup and its base context. The spawner decides what the child loads. A poteto-mode delegate is a subagent that poteto-mode or one of its playbooks spawns for a configured role, such as a code delegate or a `judgment and prose` delegate. It gets poteto-mode plus the role's model and effort. A routed skill lane is a subagent that `arena`, `interrogate`, `swarm`, or `how` spawns. It gets only the model and effort, and it never starts a pstack workflow.

- Claude Code: match the descriptor's `(provider, model)` to one model-matrix row or one additional Claude family row. Dispatch a poteto-mode delegate as `subagent_type: "poteto-agent"` with `model` set to that row's model alias (`fable`, `opus`, `sonnet`, or `haiku`) and `effort` set to the descriptor's effort. The `Agent` tool applies both to the child. A probe from an Opus `high` parent with `model: sonnet` and `effort: low` produced a child whose turns record `claude-sonnet-5-5` and effort `low`. Dispatch a routed skill lane through `pstack-<stem>-<effort>` using that row's Claude-native agent stem and the descriptor's effort. Those definitions select the rolling model alias, requested effort, and `background: true`, and they tell the child not to start a pstack workflow. Each Claude family ships agents only at its Selectable efforts, so no Claude agent runs at `xhigh` or `max`. Pass the complete task, grounding paths, access mode, and unique output location in the `Agent` prompt. Retain the task handle and drain it only after fan-out.
- Codex: call `spawn_agent` with the descriptor's model and `reasoning_effort`, the complete task, grounding paths, access mode, and unique output location. For a poteto-mode delegate, the instructions also tell the child to read poteto-mode's `SKILL.md` in full first, at the absolute path the parent passes. Use an isolated worktree for a writer. Codex subagents already run concurrently.

Do not send a same-provider descriptor to the external runner. It rejects that call because the native route is cheaper and already available.

## External lanes

The launcher lives at `skills/poteto-mode/scripts/runner/pstack-runner` under the installed plugin. The parent writes the complete candidate prompt to a unique file, creates a unique output directory or worktree, and invokes the launcher directly. Do not put another agent in front of it.

```text
pstack-runner \
  --parent <claude|codex> \
  --provider <claude|codex|grok|opencode> \
  --model <real CLI model> \
  --effort <low|medium|high|xhigh|max> \
  --mode <read-only|isolated-write> \
  --prompt <unique prompt file> \
  --cwd <repository or dedicated worktree> \
  --output <unique final-response file> \
  --receipt <unique receipt file> \
  [--timeout <seconds>]
```

Pass arguments as an argv array or quote every path. Never interpolate prompt text into a shell command. The launcher preflights the assigned CLI and authentication, invokes the model exactly once, disables recursive agents and ambient skill dispatch where the CLI supports it, restricts the built-in tool surface, and records the exact provider/model/effort flags. External lanes do not receive the parent's MCP surface. Keep the MCP-dependent Reflect roles on `inherit-parent` or `auto`. The launcher never falls back.

A `codex` child also runs without ChatGPT apps and with every MCP server in the user's Codex config disabled. During preflight the runner reads `codex mcp list --json` with the child's `--disable` feature flags, because a disabled plugin drops the MCP servers it provides and an override for a server the child lacks stops Codex from starting. It then passes `--disable apps` and one `--config mcp_servers.<name>.enabled=false` for each server the listing reports as enabled. The listing shares the preflight's absolute deadline and cancellation latch and is never retried. The receipt's preflight evidence names the disabled servers. A failed listing, a listing that is not a JSON array of `name` and `enabled` entries, or an enabled server whose name is not made of letters, digits, `_`, and `-` is a preflight dropout, and the model never starts. Codex's `--config` parser splits a key on every `.` and keeps quotes literally, so it cannot address such a name; rename that server or set `enabled = false` for it in the Codex config.

Grok authentication preflight has one bounded retry. If the first `grok models` result would be classified as unauthenticated, the runner waits five seconds and tries the same preflight once more. A second failure is terminal. The delay and second attempt share the runner's absolute deadline and cancellation latch, and the receipt keeps evidence from both attempts. Model execution is never retried.

The parent tool sandbox still governs whether a subscribed child CLI can reach its credentials and network. Run setup's live probe from the actual parent profile. A blocked external CLI is a loud dropout, not a reason to elevate permissions or substitute a model silently.

The parent invocation must itself be resumable background work:

- Claude Code: call the launcher through a Bash tool invocation with `run_in_background: true` and retain its task ID. A foreground Bash tool call has an automatic ten-minute ceiling even when the runner's own timeout is longer. Shelling out with `&` and losing the task handle is not equivalent.
- Codex: run the launcher in a persistent exec session that returns a session ID, then wait or poll that handle. Do not hold one foreground tool call open for the model's full runtime.

Start the background process, continue launching the other lanes, then drain their handles. Native and external lanes belong in the same fan-out phase.

The runner and its preflight have no implicit timeout. Do not invent a duration from role, mode, or a convenient round number; real implementation lanes can run for 90 minutes or much longer. Pass `--timeout` only when the user, an external service deadline, or a measured task contract supplies a real bound. That value starts at wrapper entry, before module loading and argument parsing, and remains one absolute deadline across setup, preflight, model execution, and output capture. It is never a fresh allowance per child, and long waits are armed in runtime-safe chunks without shortening the supplied deadline. Otherwise supervise liveness through the retained background task/session handle and cancel manually only on evidence that the run is dead. Cancel through that retained handle so the runner receives SIGINT or SIGTERM, sends it to an active child when one remains, stops waiting on inherited output pipes, removes the empty output reservation, and writes a `cancelled` receipt. Preserve that receipt; a retry is a new attempt with new unique output and receipt paths. Unchanged running state is not a dropout, and Claude's ten-minute foreground ceiling is never a reason to terminate a healthy lane.

An `opencode` lane runs `opencode run --standalone --model <provider>/<model>#<effort> --agent pstack-lane --format json --archived` with the prompt on stdin. The runner looks for `opencode` on `PATH`, then in `~/.opencode/bin`, where OpenCode's installer puts it without always adding that directory to `PATH`. Preflight runs `opencode models --standalone` and passes only when the exact model id is a line of the output. OpenCode lists a paid model only while its provider is signed in, so that one listing proves the CLI, the credentials, and the model. A missing entry is an `unavailable-model` dropout before the model starts; run `opencode auth login` when the id is right. A model or variant that OpenCode rejects at run time is also an `unavailable-model` dropout. A Codex parent in the `workspace-write` sandbox cannot start the OpenCode CLI, because the sandbox denies its log file under `~/.local/share/opencode`; that lane is a `child-failed` preflight dropout. Do not loosen the sandbox to recover it.

OpenCode has no OS sandbox, so the runner defines the `pstack-lane` agent in `OPENCODE_CONFIG_CONTENT`. Its permission rules deny every action, then allow the mode's tools. OpenCode applies the last matching rule and removes a denied tool from the model's tool list, so the child never sees MCP, skill, subagent, question, web, or code-execution tools. MCP servers in the user's OpenCode config still start: OpenCode 2.4.2 ignores `enabled: false` from `OPENCODE_CONFIG_CONTENT`, so the lane hides their tools but cannot stop the servers. `--standalone` keeps that config in the child process. Without it, `opencode run` joins the shared background service, which never reads the variable and fails with `Agent not found`. The runner also sets `OPENCODE_DISABLE_AUTOUPDATE=1` and `OPENCODE_DISABLE_CLAUDE_CODE=1`, so the child neither updates itself mid-lane nor loads Claude Code's `CLAUDE.md` and skills. It still loads OpenCode's own global `AGENTS.md`, as a Codex child loads Codex's. OpenCode does not report the served model in its JSON stream, so the receipt pins the model by argv. The output file holds the text of the last step that wrote any, and the receipt sums every step's tokens and cost.

Read-only mode maps to Claude plan mode with project-only settings and an explicit tool list, Codex's read-only sandbox, Grok plan mode plus its `read-only` sandbox and read-oriented tool list, and an OpenCode agent whose only tools are `read`, `grep`, and `glob`, with paths outside `--cwd` allowed for reading. A read-only OpenCode lane has no shell, because OpenCode's shell runs unsandboxed and its permission rules match commands, not effects. Grok's built-in read-only profile deliberately keeps its own state and system temporary directories writable, so point a read-only Grok lane at the actual checkout rather than a worktree under `/tmp`, `/var/tmp`, or the host's temporary directory. `isolated-write` maps to Claude `acceptEdits` with project-only settings, Codex `workspace-write`, Grok `acceptEdits` plus its `workspace` sandbox and write-capable tool list, and an OpenCode agent with `read`, `grep`, `glob`, `edit`, and `shell`. OpenCode's file tools refuse paths outside `--cwd`, but its shell does not, so an OpenCode writer is confined by its worktree and brief, like a Claude writer's Bash, not by a sandbox. Give every writer only a dedicated worktree or output directory. Never route a writer into the primary checkout.

An external child cannot preload a skill. For a poteto-mode delegate on a `codex` lane in either mode, or on a `claude` or `opencode` lane in `read-only`, start the prompt file with the body of `agents/poteto-agent.md` under the installed plugin and poteto-mode's absolute `SKILL.md` path. That body tells the child that it is a delegate of the chat that owns the playbook, and that it reads poteto-mode in full before any work. Probes from a scratch `--cwd` read the installed `SKILL.md` and a principle leaf by absolute path on Codex in both modes, on Claude in `read-only`, and on OpenCode in `read-only`. A `claude` lane in `isolated-write` cannot read that path. Claude print mode with `acceptEdits` blocks both `Read` and `Bash` reads outside `--cwd`, and the runner adds no other directory. An `opencode` lane in `isolated-write` cannot read it with its `read` tool, which refuses paths outside `--cwd`. The Grok route has not been probed. Those three lanes get the task without poteto-mode. A routed skill lane never gets that body.

Every concurrent external lane needs distinct prompt, output, and receipt paths. The launcher reserves output and receipt paths exclusively and refuses to overwrite them.

## Completion and dropouts

Success requires all of these:

1. Exit status `0`.
2. Receipt status `complete`.
3. Either `modelVerified: true` with `modelEvidence: "provider-report"`, or a Codex or OpenCode receipt with `reportedModel: null`, `modelVerified: false`, and `modelEvidence: "pinned-argv"`. For Claude's rolling aliases, the concrete provider report must belong to the requested family. Codex 0.149.0 accepts the exact `--model` argument but does not report the served model in its JSONL stream. OpenCode 2.4.2 rejects an unknown model or variant with `provider.no-route` instead of falling back, and does not report the served model either.
4. A non-empty output file.

The receipt also carries elapsed time, token usage when the CLI exposes it, and cost when available. Keep it with the arena or review artifacts so parent-harness comparisons are evidence-based.

Any missing CLI, failed login, unavailable model, explicit timeout, cancellation, catchable post-reservation launcher failure, non-zero child exit, malformed result, or model mismatch is a receipt-bearing dropout. Record it and apply the calling skill's existing dropout policy. A `cancelled` receipt proves that the runner received the signal; its `signal` field is non-null only when the runner sent that signal to a still-active direct CLI child, and remains null when cancellation only stopped a post-exit pipe drain. The provider CLI owns any processes it starts beneath that direct child; the receipt does not claim a process-tree kill. Do not delete or overwrite the receipt. Never substitute the parent model, retry another provider, or reinterpret an external descriptor as a native model slug.

Start native and external lanes in the same fan-out phase, then wait for all of them before judging. A judge must not read candidate paths while their owners are still writing.
