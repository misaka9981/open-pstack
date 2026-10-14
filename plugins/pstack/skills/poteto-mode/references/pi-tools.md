# Pi tool mapping for pstack

pstack skills keep Claude Code tool language (`Skill`, `Agent`, `AskUserQuestion`) in shared prose. On Pi the files are the same; only those tool names resolve differently. Pi delegates through Lody's session tools, so Pi must run inside Lody. Read [`provider-dispatch.md`](provider-dispatch.md) for the parent-owned route table and provider-qualified descriptors.

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
| `disable-model-invocation: true` frontmatter makes a skill typed-only | Pi hides `correct`, `in-your-own-words`, `ketchup`, and `poteto-help` from the model. The user runs one with `/skill:<name>`. |
| Dispatch subagents (the `Agent`/`Task` tool) | One `lody_session_create_many` call per fan-out phase; see Dispatch below |
| Wait for subagent results | Lody delivers the batch result as one continuation; see Completion evidence below |
| Track tasks (the todolist / `TodoWrite`) | Keep the checklist in the reply or in a working file. Pi has no todo tool. |
| Ask the human a fixed-choice question (`AskUserQuestion`) | The session's question tool when one is loaded; otherwise ask in plain text |

## Dispatch

Lody runs each agent in its own session and worktree. Inside a Lody Pi session its tools carry the `mcp_lody_` prefix, so `lody_session_create_many` appears as `mcp_lody_lody_session_create_many`. Every Pi lane is one Lody session created with `lody_session_create_many`. A Pi session without these tools has no delegation route, and every lane is a named dropout. Do not use Lody's `subagent` tool for a pstack lane, because it cannot pin a model or start a worktree.

Discover the targets once per parent run. Call `lody_session_create_options` with no arguments. Take `defaultMachineId`, the `agentConfigId` of the config whose `agentType` is `pi`, `current.workContext.projectId`, and that config's `runConfig.models[].id` and `runConfig.reasoningEffortValues`. A descriptor whose mapped model id or effort is not listed is a named dropout. Never substitute. When `current.workContext` has no `projectId`, the parent session is not in a local project, and every lane that needs the repository is a named dropout. Start the parent session in the project.

Launch one `lody_session_create_many` call per fan-out phase. One call takes 1 to 20 items, so a phase with more lanes makes more calls in the same phase. Choose an `operationId` (`[A-Za-z0-9._-]`, at most 64 characters) and pass `deadlineSeconds: 604800`. That is Lody's maximum. Lody enforces this bound on every Operation; it is not a pstack timeout, and pstack adds no other limit. Put the fields every lane shares in `defaults` and the rest in `items`.

Each item carries `prompt`, `label` (at most 128 characters), `machineId`, `agentConfigId`, `workContext`, and the `modelId` and `reasoningEffort` from the table below.

| Descriptor | `modelId` | `reasoningEffort` |
|---|---|---|
| `codex:<model>@<effort>` | `magpie/codex/<model>` | `<effort>` |
| `magpie:<model>@<effort>` | `magpie/<model>` | `<effort>` |
| `inherit-parent`, `auto` | omit | omit |
| `claude:*`, `grok:*` | not routed (named dropout) | |

An item without `modelId` runs Pi's configured default model. Lody cannot report the parent's current model, so record in the synthesis that the lane ran the configured default.

A lane that reads or writes the repository gets `workContext: { kind: "local", projectId, worktree: true }`. A lane that needs no checkout gets `{ kind: "chat" }`. Never pass `useCurrentSessionAsParent: true`. It shares the parent's directory, which breaks writer isolation and transcript evidence. When a lane must see uncommitted parent work, commit that work to a branch first and pass the branch as `branch`.

## Lane prompts

pstack ships no Pi agent definitions. Every item `prompt` carries the complete task, grounding paths, access mode, the absolute output path, and the contract for its role. The output path may sit outside the lane's worktree, for example under the parent's scratch or run directory.

The writer contract:

> You are one pstack lane. The parent assigned your model, access mode, working directory, and output path. Do not choose another model, provider, or route. Do not call Lody session tools or `subagent`. Write only inside your working directory and output path. Report what you did and the evidence for it.

The read-only contract is the writer contract plus:

> Do not edit, create, or delete files except the output file. Use the shell only for read-only commands.

Pi under Lody has no permission or read-only mode, so the contract is the only guard.

| pstack role | Prompt |
|---|---|
| Writer lane (implementation, arena candidate, swarm writer) | The writer contract, then the task. |
| Read-only lane (review, exploration, judgment) | The read-only contract, then the task. |
| `poteto-agent` | `/skill:poteto-mode ` followed by the writer contract, or the read-only contract for a read-only helper, then the task. Pi expands the command into the skill body. |
| `comment-sicko` (the **no-comments** skill) | The read-only contract, then "Find the `no-comments` skill; read `../../agents/comment-sicko.md` relative to its SKILL.md in full and act as that agent; report findings only." |

## Completion evidence

Wait for Lody's continuation. The batch completes as one continuation, so do not poll `lody_operation_get`. Each finished item reports `status` (`succeeded`, `failed`, or `cancelled`), `target.sessionId`, and on success a truncated `output` preview. Read the output file, not the preview.

A lane succeeds when its item is `succeeded`, its output file is non-empty, and its transcript reports the mapped provider and model. Pi writes each transcript under `~/.pi/agent/sessions/` (or `$PI_CODING_AGENT_DIR/sessions/`) in a directory named from the session cwd. A Lody chat session's cwd is `~/.lody/chats/<session id>`, and a Lody worktree's cwd is `~/.lody/repos/<repo id>/worktrees/<session id>/`, so the transcript directory whose name contains the item's `target.sessionId` is the lane's. Its assistant messages carry the `provider` and `model` that Pi requested, and they must match the mapped descriptor. Pi's `openai-responses` client never writes `responseModel`. Its `openai-completions` client writes it only when the served id differs from the requested id. The relay's `codex/` models use the `openai-responses` client, so their transcripts usually have no `responseModel`. When `responseModel` is present, it must name the requested model, with or without the relay's `<vendor>/` prefix. A mismatch is a dropout. When it is absent, record the model evidence as pinned, not provider-reported. Record the Lody session id with the lane result.

An item that fails with error code `TARGET_TIMEOUT` hit the deadline. Lody stopped waiting and did not cancel the session, so the child may still run. Check it with `lody_session_status_many`, cancel a still-running child with `lody_session_cancel`, then record the dropout with its session id.

Archive lane sessions with `lody_session_archive` only after you have read their output and taken what you need from their branches. Archiving removes the worktree after a backup commit.

## Claude built-in skills pstack references

| Claude built-in named in pstack | On Pi |
|---------------------------------|-------|
| `run` (drive a CLI/TUI to see a change work) | Run the app yourself with `bash` and observe the real output. |
| `verify` (drive a UI to confirm a fix) | Drive the UI with whatever automation the session has, or hand the user a concrete manual check. Do not claim done without observing the artifact. |
| `plugin-dev:skill-development` | Follow Pi's skill format: `name` + `description` frontmatter and progressive disclosure. |
| `loop` (recurring re-invocation, used by `babysit`) | Re-run the step yourself on a cadence, or propose a Lody schedule with `lody_schedule_propose`. |

## Vendored scripts

`skills/poteto-mode/scripts/` runs the same on Pi through `bash`. The external runner (`pstack-runner`) serves Claude Code and Codex parents only; a Pi parent reaches every routed provider natively.

## Instructions file

Where a pstack skill says "your instructions file", on Pi that is `AGENTS.md` (project root, plus `~/.pi/agent/AGENTS.md` global).
