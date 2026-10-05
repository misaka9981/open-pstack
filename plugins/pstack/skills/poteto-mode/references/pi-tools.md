# Pi tool mapping for pstack

pstack skills keep Claude Code tool language (`Skill`, `Agent`, `AskUserQuestion`) in shared prose. On Pi the files are the same; only those tool names resolve differently. Pi delegates through the [pi-subagents](https://github.com/nicobailon/pi-subagents) `subagent` tool, which must be installed. Read [`provider-dispatch.md`](provider-dispatch.md) for the parent-owned route table and provider-qualified descriptors.

## Tool actions

| pstack / Claude action | Pi equivalent |
|------------------------|---------------|
| Read a file | `read` |
| Create / edit a file | `write` / `edit` |
| Run a shell command | `bash` |
| Search file contents / find files | `grep`, `find`, `ls`, or `bash` with `rg` |
| Fetch a URL / search the web | The web tools the session has loaded; otherwise `bash` with `curl` |
| Invoke a skill (the `Skill` tool, `/command`) | Read the named skill's `SKILL.md` from the catalog and follow it. The user invokes one with `/skill:<name>`. |
| `paths` frontmatter scopes automatic loading | Claude Code only. On Pi, invoke `typescript-best-practices` by name. |
| Dispatch subagents (the `Agent`/`Task` tool) | One async workflow; see Dispatch below |
| Wait for subagent results | `await` inside the workflow; the async run notifies on completion |
| Track tasks (the todolist / `TodoWrite`) | Keep the checklist in the reply or in a working file. Pi has no todo tool. |
| Ask the human a fixed-choice question (`AskUserQuestion`) | The session's question tool when one is loaded; otherwise ask in plain text |

## Dispatch

Every pstack launch is one async workflow. Write the script as a ```` ```js workflow ```` block and call `subagent({ workflow: true, cwd })` in the same reply. Use `runs.all([...])` for a fan-out and `runs.run(key, {...})` for one lane.

- Never pass `async: false`, `timeoutMs`, or `maxRuntimeMs`, and never launch a lone `subagent({ agent, task })`. pi-subagents gives foreground and single-agent launches an implicit 30-minute deadline. Async workflows have no default deadline, and pstack forbids an implicit one.
- Each child is `{ key, agent, model, task }`. Add `worktree: true` for every writer so concurrent writers never share a checkout.
- `model` is always the fully qualified `<pi provider>/<model>:<effort>` from the descriptor mapping below. A bare id can resolve to another provider.
- `runs.all` resolves with one result per child even when some children fail. A child whose `ok` is false is a named dropout. Proceed with the others under the calling skill's dropout policy.

| Descriptor | Pi `model` |
|---|---|
| `codex:<model>@<effort>` | `magpie/codex/<model>:<effort>` |
| `magpie:<model>@<effort>` | `magpie/<model>:<effort>` |
| `inherit-parent`, `auto` | omit `model` |
| `claude:*`, `grok:*` | not routed (named dropout) |

## Agents

pstack ships its Pi agents under the `pstack` package namespace, so same-named agents in `~/.pi/agent/agents/` do not shadow them.

| pstack role | Pi agent |
|---|---|
| Writer lane (implementation, arena candidate, swarm writer) | `pstack.lane` |
| Read-only lane (review, exploration, judgment) | `pstack.lane-readonly` |
| `poteto-agent` | `pstack.poteto-agent` |
| `comment-sicko` (the **no-comments** skill) | `pstack.comment-sicko` |

`pstack.poteto-agent` loads `preload-poteto-mode.ts` through `subagentOnlyExtensions`, so its first prompt becomes `/skill:poteto-mode` and the child starts with that skill's body.

Pass the complete task, grounding paths, access mode, and output location in `task`. Children never choose a model or launch subagents.

## Completion evidence

A lane succeeds when its result has `ok: true` and a non-empty output. Prove the model from the child transcript `<session dir>/subagent-artifacts/<child run id>_<agent>_transcript.jsonl`. Its assistant messages carry the `provider` and `model` that Pi requested, and they must match the mapped descriptor. Pi's `openai-responses` client never writes `responseModel`. Its `openai-completions` client writes it only when the served id differs from the requested id. The relay's `codex/` models use the `openai-responses` client, so their transcripts usually have no `responseModel`. When `responseModel` is present, it must name the requested model, with or without the relay's `<vendor>/` prefix. A mismatch is a dropout. When it is absent, record the model evidence as pinned, not provider-reported. Record the child run id with the lane result.

## Claude built-in skills pstack references

| Claude built-in named in pstack | On Pi |
|---------------------------------|-------|
| `run` (drive a CLI/TUI to see a change work) | Run the app yourself with `bash` and observe the real output. |
| `verify` (drive a UI to confirm a fix) | Drive the UI with whatever automation the session has, or hand the user a concrete manual check. Do not claim done without observing the artifact. |
| `plugin-dev:skill-development` | Follow Pi's skill format: `name` + `description` frontmatter and progressive disclosure. |
| `loop` (recurring re-invocation, used by `babysit`) | Re-run the step yourself on a cadence, or use a pi-subagents schedule (`action: "schedule.create"`). |

## Vendored scripts

`skills/poteto-mode/scripts/` runs the same on Pi through `bash`. The external runner (`pstack-runner`) serves Claude Code and Codex parents only; a Pi parent reaches every routed provider natively.

## Instructions file

Where a pstack skill says "your instructions file", on Pi that is `AGENTS.md` (project root, plus `~/.pi/agent/AGENTS.md` global).
