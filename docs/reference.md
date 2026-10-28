# open-pstack technical reference

This page contains the full skill, dependency, runtime, and porting reference. For the plain-English introduction and quick start, see the [main README](../README.md).

[Poteto](https://x.com/poteto)'s [pstack](https://github.com/cursor/plugins/tree/main/pstack), adapted to run in Claude Code and Codex without Cursor. One shared skill tree serves both harnesses; Grok remains available as a model-provider lane. Version 1.23.0 is synced to Cursor pstack v0.15.32 at `e73df471cd4bd918367e99f3dd9c51bd53ddf5f0`. See [UPSTREAM.md](../UPSTREAM.md) for the exact sync contract.

Original by Lauren Tan. This distribution builds on Michael Denyer's [pstack-claude](https://github.com/michael-denyer/pstack-claude) port and retains its history and MIT attribution. It imports one MIT-licensed skill, `deslop`, from [cursor-team-kit](https://github.com/cursor/plugins/tree/main/cursor-team-kit), because pstack routes to it.

> if you want to go fast, go deep first. pstack helps you write less, but higher quality code. rigorous agent workflows you can parallelize with confidence.

This is not a verbatim copy. Skill bodies have been edited so every Cursor-specific primitive resolves to its Claude Code or Codex equivalent — see [Differences from upstream](#differences-from-upstream) for the full list. The exhaustive per-skill audit lives in [CHANGES.md](../CHANGES.md); license attribution lives in [NOTICE.md](../NOTICE.md); the upstream README is preserved verbatim at [README-UPSTREAM.md](../README-UPSTREAM.md).

## Install

### Claude Code

This repo ships as a Claude Code marketplace containing one plugin (`pstack`).

```text
/plugin marketplace add misaka9981/open-pstack
/plugin install pstack@open-pstack
/reload-plugins
```

The plugin auto-fires through a `SessionStart` hook on startup, `/clear`, and post-compact. The hook injects a small mandate that routes non-trivial engineering work into `poteto-mode`; the full skill loads only when invoked. After a compaction in a session whose transcript shows poteto-mode was invoked, the hook also tells the model to invoke it again, because Claude Code can drop or truncate the skill text at compaction. Subagents that a subagent tool spawned ignore the mandate. A session that a person, the app, or another session started with a brief follows it. Explicit user instructions take precedence. To opt out, delete `hooks/hooks.json` from the installed copy at `~/.claude/plugins/cache/open-pstack/pstack/<version>/hooks/hooks.json`; a plugin update restores it.

### Codex

The same plugin carries a `.codex-plugin/plugin.json` manifest and a root `.agents/plugins/marketplace.json`. Install it through the Codex marketplace:

```shell
codex plugin marketplace add misaka9981/open-pstack --ref main
codex plugin add pstack@open-pstack
```

Codex discovers the plugin skills under the `pstack` namespace, so they list as `pstack:poteto-mode`, `pstack:tdd`, and so on. The namespace comes from `plugins/pstack/.codex-plugin/plugin.json`. To enable the multi-model and parallel-subagent skills (`interrogate`, `arena`, `how`, `why`, `reflect`, `architect`), turn on subagents in `~/.codex/config.toml`:

```toml
[features]
multi_agent = true
```

For local plugin development, you can clone the repository and link its skills directly:

```shell
git clone https://github.com/misaka9981/open-pstack
cd open-pstack
for s in plugins/pstack/skills/*/; do ln -s "$PWD/$s" ~/.agents/skills/"$(basename "$s")"; done
```

The marketplace install is the normal user path. Direct links are only for testing a checkout before publishing it. Remove the linked skill directories when the test is over.

## Layout

```text
.
├── .claude-plugin/marketplace.json   # Claude Code marketplace manifest (repo root)
├── .agents/plugins/marketplace.json  # Codex marketplace manifest (repo root)
├── plugins/pstack/                   # the plugin itself
│   ├── .claude-plugin/plugin.json    # Claude Code manifest
│   ├── .codex-plugin/plugin.json     # Codex manifest (skills: ./skills/)
│   ├── skills/                       # 59 skills shared by Claude Code, Codex, and Pi
│   │   ├── poteto-mode/references/{codex-tools,pi-tools,provider-dispatch}.md  # tool + provider routing
│   │   └── poteto-mode/scripts/      # bun/bash/node tooling: watch-pr, runner, check-plan.mjs, worktree-audit.sh
│   ├── hooks/                        # SessionStart auto-fire: injects the poteto-mode mandate (the model sheet only on Claude Code)
│   └── agents/                       # Claude subagents, including native Fable, Opus, Sonnet, and Haiku lanes at each selectable effort
├── tests/skill-collision-repro.sh    # native-skill package invariants and Claude invocation checks
├── LICENSE                           # pstack upstream MIT
├── LICENSE-cursor-team-kit           # cursor-team-kit upstream MIT
├── LICENSE-superpowers               # superpowers upstream MIT (hook runner)
├── NOTICE.md                         # attribution table
├── UPSTREAM.md                       # current Cursor sync point and update procedure
├── CHANGES.md                        # per-skill substitution audit
├── README.md                         # plain-English introduction and quick start
└── docs/reference.md                 # this technical reference
```

Plugin-internal `skills/<name>/` path references in the docs below are relative to `plugins/pstack/`.

## Running on Codex

The Codex build shares one `skills/` tree with the Claude Code build. Nothing is forked or generated. Two narrow references keep runtime translation separate: `codex-tools.md` maps harness primitives and `provider-dispatch.md` maps model providers. pstack otherwise keeps the upstream Claude-native prose and adds a one-line Platform note to each skill that names a Claude primitive, so the port stays in lockstep with upstream sync.

- **Skill invocation.** Codex loads `SKILL.md` natively. There is no `Skill` tool. You invoke a skill by name (ask for it, or pick `pstack:poteto-mode` from the list).
- **Package surface.** The native `skills/` tree is the only workflow source. The plugin ships no `commands/` layer and does not link prompts into `~/.codex/prompts/`. Codex would migrate such files into duplicate source-command skills while loading the native skill tree. The 24 `principle-*` leaves declare `user-invocable: false`. Claude keeps them out of its user picker; Codex 0.149.0 currently shows them despite that metadata ([ericlitman/open-pstack#8](https://github.com/ericlitman/open-pstack/issues/8)).
- **Tool and built-in mapping.** Claude tool names and built-in skills resolve through [`codex-tools.md`](../plugins/pstack/skills/poteto-mode/references/codex-tools.md). Model execution resolves separately through [`provider-dispatch.md`](../plugins/pstack/skills/poteto-mode/references/provider-dispatch.md), so Codex can keep Sol native while invoking Claude and Grok externally.
- **Subagents.** The `Agent` tool maps to Codex `spawn_agent` / `wait_agent`, enabled by `multi_agent = true`. Parallel fan-out is multiple `spawn_agent` calls in one turn. If the native Codex lane is unavailable, record that lane as a dropout; external Claude and Grok lanes still run, and no provider is silently substituted. There is no `poteto-agent` subagent type on Codex; route ad-hoc subagents by dispatching a `spawn_agent` told to read `poteto-mode` first.
- **Auto-fire.** Codex runs plugin SessionStart hooks. The Codex manifest declares its own hook, which runs the same `hooks/session-start` script with a `codex` argument. Codex sessions get the poteto-mode mandate but not the Claude Code model sheet, because Codex reads its sheet from `~/.codex/AGENTS.md`. That block, not `~/.codex/pstack-models.md`, is the configuration in effect. `/setup-pstack` and `/poteto-help` classify the file and the block by the mirror state table in `provider-dispatch.md` and report a mismatch. Codex runs a plugin hook only after you trust it. The hook source changed in 1.6.2, so Codex asks for that trust again after the update, and the hook does not run until you give it.
- **Models.** `/setup-pstack` writes provider-qualified descriptors. It asks for a reasoning budget (`unlimited`, `large`, `medium`, `small`), lets you move roles between families, then asks one requested effort per family the sheet uses (`low`, `medium`, `high`, `xhigh`, `max`). It probes only those families, so a Claude-only sheet needs no Codex or Grok CLI. The first-run code roles (feature, refactoring, bug-fix, perf-issue, hillclimb) use Grok 4.6 xhigh, judgment and prose roles use Opus xhigh, and the panel is Fable, GPT-6.1 Sol, Grok 4.6, and Opus, all at xhigh. The `large` budget proposes these defaults, and `unlimited` proposes `max` for every family. Setup also offers Sonnet and Haiku as additional Claude families and two `magpie` relay families. They never join the first-run defaults or panels, so a role uses one only when you assign it. Fable, Opus, Sonnet, and Haiku use Claude's rolling aliases. Runtime dispatch normalizes older versioned descriptors in memory, so an installed sheet stops pinning immediately. A setup rerun persists that migration while keeping each role's family and effort. In Codex, Sol uses native `spawn_agent`; Claude, Grok, and relay models use the deterministic external runner. In Claude Code, Fable, Opus, Sonnet, and Haiku use native agents; Sol, Grok, and relay models use the runner. A relay lane runs `codex exec` against the `magpie` provider, so Claude Code itself never calls the relay. Children never detect the parent or reroute themselves.

Verified in fresh installed Claude Code and Codex sessions: the user-facing skills are discovered and namespaced under `pstack`; both parents fan out the frontier quad through the documented native/external route table, retain long-running handles without a default timeout, and cross-judge only after every candidate is terminal. The `principle-*` leaves remain available for `poteto-mode` to read by path. Claude honors their `user-invocable: false` metadata; Codex 0.149.0 does not ([ericlitman/open-pstack#8](https://github.com/ericlitman/open-pstack/issues/8)).

## Dependencies

Nothing is declared in `plugin.json`. Install the one companion plugin yourself:

- **`plugin-dev`** (from the `claude-plugins-official` marketplace) — the rewiring routes skill-authoring tasks (in `automate-me`, `reflect`, `poteto-mode`) to the `plugin-dev:skill-development` skill:

  ```shell
  /plugin marketplace add anthropics/claude-plugins-official
  /plugin install plugin-dev@claude-plugins-official
  ```

  Until 0.9.2 this was a `dependencies` entry in `plugin.json`. The desktop app's `--plugin-dir` load mode can never resolve cross-marketplace dependencies and hard-disables the whole plugin, so 0.9.3 removed the declaration — full mechanism in the 0.9.3 entry of [CHANGES.md](../CHANGES.md). Without `plugin-dev` installed, only the skill-authoring routes degrade; everything else works.

Not declared as deps, but referenced in skill bodies:

- **`run`, `verify`, `loop`** — Claude Code CLI built-ins (ship with the binary, always available).
- **`gh` (GitHub CLI).** This is the default forge for every stack playbook and a system-level requirement of the standalone `babysit` skill. Install it with [`brew install gh`](https://cli.github.com) and authenticate with `gh auth login`. If Origin's `origin` CLI is installed and can resolve the repository, the stack playbooks use it instead. No playbook requires Graphite (`gt`). Orchestrate checks each PR's live state with `gh`, or with `origin` when the program resolved the forge to Origin.
- **`bun`** — runs the vendored `skills/poteto-mode/scripts/` tooling (`watch-pr`, `runner`). Install via [`brew install oven-sh/bun/bun`](https://bun.sh). `bootstrap.ts` installs dependencies for `watch-pr`; the runner uses only Bun and Node built-ins, so it launches directly without an install/re-exec layer.
- **`node`** — runs `skills/poteto-mode/scripts/check-plan.mjs`. The checker uses only Node built-ins and does not need Bun.
- **Claude Code, Codex, and Grok Build CLIs** — the external runner uses the assigned subscribed CLI directly. Install and authenticate only the providers present in your model sheet. Same-provider work stays native; the runner refuses it.
- **`mise`, `npm`, and the network.** Only `statechart` needs them. Its first TLC run installs TLC and Java with mise, about 305 MB. To render a chart as an image, the agent installs the `pele` npm package once, outside the repo. Set `TLA2TOOLS` and `JAVA` to use a TLC and Java that you already have. The command itself needs Node 22.18 or later, Bun 1.1.5 or later, or Deno 2.0 or later.
- **`jq` and `rg` (ripgrep)** — only for `scripts/worktree-audit.sh` (the Worktree cleanup playbook). Without them the audit still runs but blanks its PR and LAST_CHAT columns, so it warns on stderr rather than returning a table that looks complete.

No third-party plugins.

## Skills

The table uses the short upstream names. Claude Code exposes each native skill with a `/pstack:` prefix, such as `/pstack:poteto-mode`. In Codex, ask for the namespaced skill, such as `pstack:poteto-mode`.

| skill | use it when |
| --- | --- |
| `/poteto-mode` | default entry point for any non-trivial task |
| `/poteto-help` | learn how to set up and use pstack, or find which skill, playbook, or principle fits a task (user-invoked only on Claude Code and Pi) |
| `/in-your-own-words` | have the agent play back your goal and the problem before it starts |
| `/sharpen` | rewrite a prompt to be deeper, not bigger, with what a top professional would add and an outside check, and hand it back without doing the task (user-invoked only on Claude Code and Pi) |
| `/how` | walk through how a subsystem works |
| `/why` | investigate why something was built this way (parallel multi-MCP evidence) |
| `/architect` | settle types and module shape before writing code that crosses a function boundary |
| `/arena` | run N parallel attempts at the same task and pick the best parts |
| `/interrogate` | have four different models try to break a diff |
| `/automate-me` | draft your own personal -mode skill from recent transcripts |
| `/reflect` | capture a long task's lessons as a skill edit (user-invoked only on Claude Code and Pi) |
| `/correct` | make a mistake agents keep repeating in this repo impossible, enforced by architecture, types, lint, or tests before docs (user-invoked only on Claude Code and Pi) |
| `/tdd` | fix a bug by writing the failing test first, then the fix |
| `/benchmark-checklist` | vet a benchmark, speedup, or regression you measured before you report or act on it |
| `/typescript-best-practices` | ground type-system discipline in TypeScript syntax |
| `/teach` | understand a change or subsystem for real: `how` + `why` woven into one plain explanation (user-invoked only on Claude Code and Pi) |
| `/swarm` | fan out N parallel workers across slices or races, then one aggregated report |
| `/technical-writing` | write docs, RFCs, readmes, PR descriptions, and commit messages to one layered standard |
| `/bro` | restate the last message in plain human language, no jargon (user-invoked only on Claude Code and Pi) |
| `/figure-it-out` | design a rigorous, auditable playbook for a task no bundled playbook fits |
| `/show-me-your-work` | log decisions to a reviewable tsv decision trail |
| `/blast-radius` | find what a change could break beyond the diff and prove safety by running code (user-invoked only on Claude Code and Pi) |
| `/recall` | catch up on recent working context from chat history, live state, and the shared record (user-invoked only on Claude Code and Pi) |
| `/ketchup` | catch up on what changed in this chat since your last message, with every item waiting on you listed and decidable from the reply alone (user-invoked only on Claude Code and Pi) |
| `/ketchup-video` | catch up like `/ketchup`, with what happened as a short subtitled video of slides and the waiting calls as text under it (user-invoked only on Claude Code and Pi) |
| `/setup-pstack` | configure pstack per-role model choices, reasoning budget, and per-family requested effort |
| `/unslop` | clean up writing by removing AI tells |
| `/no-comments` | strip comments before review via the `comment-sicko` subagent, then fix what it finds |
| `/create-verification-skill` | generate a project-local verification skill and feature map |
| `/maintain-verification-skill` | re-sync a drifted verification skill and its feature map (user-invoked only on Claude Code and Pi) |
| `/create-formal-verification-skill` | formally verify one property that tests rarely reach and generate a project-local skill that rechecks it |
| `/maintain-formal-verification-skill` | bring a formal verification back in line after the code it covers changed, and tell drift from bugs (user-invoked only on Claude Code and Pi) |
| `/statechart` | draw how a product flow, protocol, or service moves between states as a Mermaid statechart checked against a TLA+ model, with the shortest path to each state that breaks a rule |
| `/deslop` | deslop a diff before commit |
| `/babysit` | monitor an open PR, fix CI/comments, keep it merge-ready |

## Subagents

The chat that receives `/poteto-mode` runs the playbook and owns its todo list and every subagent spawn. `poteto-agent` is the wrapper for every delegate that chat spawns during a run, such as code-writing tasks, helpers, and read-only investigations. A configured role sets the delegate's model and effort on the same call. Only routed workflow skills' own spawns use other agents. Claude Code's built-in `Explore`, `general-purpose`, and `Plan` types do not preload poteto-mode, so a run never uses them. Do not spawn `poteto-agent` to run the playbook itself. Upstream made this split in `2bd5dd4` because a subagent spawned to run the playbook is nested, so it cannot fan out the playbook's lanes and its todo list does not reach the chat. `poteto-agent` keeps the upstream prompt with three changes. It names `Agent` spawns instead of `Task` spawns. With no path from its parent, it uses its preloaded copy of poteto-mode instead of searching Cursor's plugin directory. Its description also names read-only investigation helpers, warns against `Explore`, and tells the parent to set a configured role's `model` and `effort` on the call. The agent adds Claude Code `skills` frontmatter, which preloads `pstack:poteto-mode` because Claude subagents do not inherit the parent's loaded skills. Spawn a delegate with `subagent_type: "poteto-agent"`.

`comment-sicko` is the read-only comment reviewer the `no-comments` skill spawns. The port first renamed upstream's `Comment Sicko` to `comment-sicko` so the name is a valid `subagent_type`, and upstream adopted the same id in `de2dba6`. Invoke it through `/no-comments`, not directly.

Fable, Opus, Sonnet, and Haiku each ship at `low`, `medium`, `high`, `xhigh`, and `max`. Names are `pstack-<stem>-<effort>`. `pstack-fable-max` and `pstack-opus-xhigh` remain. Each file selects the rolling family alias and requested effort, runs in the background, and denies nested Agent/Task dispatch. Routed workflow skills such as `arena`, `swarm`, and `how` dispatch them from provider-qualified descriptors. They tell the child not to start a pstack workflow, so a poteto-mode delegate runs as `poteto-agent` with the `Agent` tool's `model` and `effort` instead. They are not user-facing workflows.

## Differences from upstream

The port is editorial, not mechanical. Anywhere upstream pstack assumed Cursor-specific primitives, this port substitutes the Claude Code equivalent so refs actually resolve. Two prior ports ([v1truv1us/ai-eng-system](https://github.com/v1truv1us/ai-eng-system), [Evan-Kim2028/agent-fleet](https://github.com/Evan-Kim2028/agent-fleet)) stop at namespacing — they vendor pstack under `pstack/` and leave the Cursor refs intact. This port does the content surgery.

### What's added

- **`skills/babysit/`** — Claude Code analog of Cursor's closed-source `/babysit` built-in. Wraps `gh pr view` / `gh pr checks` / `gh run view --log-failed` plus the `loop` skill for pacing. Independently authored; workflow informed by Cursor's public `/babysit` behavior — not a copy of Cursor's implementation. Since the v0.14.2 sync, poteto-mode routes PR-status requests to the ported `playbooks/babysit.md` instead, and this skill is the standalone `/babysit` entry point.
- **`skills/deslop/`** — imported verbatim from `cursor-team-kit`. Cleans AI tells out of diffs before commit.
- **Sonnet and Haiku lanes** — `pstack-sonnet-<effort>` and `pstack-haiku-<effort>` agents for the additional Claude families in `provider-dispatch.md`. They give cheaper Claude lanes to roles the operator assigns and stay outside the upstream model matrix.

### What's substituted in skill bodies

| Upstream (Cursor) | This port (Claude Code) |
| --- | --- |
| `Task` tool, `subagent_type: generalPurpose`, `readonly: false/true` | `Agent` tool with model selection, requested effort, and `disallowedTools`; access mode is assigned by the parent, with writers isolated in worktrees |
| `AskQuestion` tool | `AskUserQuestion` tool |
| Cursor's built-in `/loop` | Claude Code's built-in `loop` skill |
| Cursor's built-in `/babysit` | `babysit` skill bundled in this plugin. From v0.14.0 upstream routes PR-status requests inside poteto-mode to `playbooks/babysit.md` instead; the port does the same, and `/babysit` stays the standalone entry point |
| Cursor's built-in `/create-skill` | `plugin-dev:skill-development` skill |
| A chart or diagram from Cursor's `/visualize` (in `ketchup`) | A Mermaid diagram or chart |
| `cursor-team-kit` `control-cli` (CLI/TUI driver) | Claude Code's `run` skill |
| `cursor-team-kit` `control-ui` (browser/Electron driver) | Claude Code's `verify` skill |
| Transcripts at `~/.cursor/projects/*/` or `agent-transcripts/` | `~/.claude/projects/<encoded-cwd>/*.jsonl` (where `<encoded-cwd>` is the absolute workspace cwd with every character except ASCII letters, digits, and `-` turned into `-`, so `/Users/you/my.proj` becomes `-Users-you-my-proj`) |
| Skill paths `.cursor/skills/`, `~/.cursor/plugins/` | `.claude/skills/`, `~/.claude/plugins/` |
| MCP discovery via Cursor's `mcps/` directory | Tool list at top of system prompt (`mcp__<server>__<name>` entries), or `.mcp.json`, or `claude mcp list` |
| Cursor cloud agents (`environment: "cloud"`, `cloud_base_branch`) | Local background subagents (`run_in_background: true`), isolated by git worktree |
| The Cursor Project tracker (`notes.md`) and Project store | `~/.claude/orchestrate/<project-slug>/`, which survives the session restarts a multi-day program expects |
| Model rule `~/.cursor/rules/pstack-models.mdc` | The repository sheet `plugins/pstack/pstack-models.md`, injected by the SessionStart hook. Without it, `~/.claude/pstack-models.md` included from `CLAUDE.md` |
| Arena's cross-judge: "a different model family from the parent's" | A judge whose provider differs from the parent and from the likely base candidate, so the judge did not write the candidate it most likely picks |
| Multi-model panels (arena, architect, interrogate) | Provider dispatch restores the upstream frontier quad: `claude:fable@xhigh`, `codex:gpt-6.1-sol@xhigh`, `grok:grok-4.6@xhigh`, `claude:opus@xhigh`. Same-provider lanes stay native; external lanes use the bundled runner. |

### Cross-vendor dispatch

The earlier port collapsed panels to Claude-only models. The bundled runner restores upstream's cross-provider judgment signal without adding a daemon or model-router service. Claude Code shells out to Codex and Grok, and reaches `magpie` relay models through Codex; Codex shells out to Claude and Grok, and to the relay through a second Codex process. The top-level parent chooses every route and each external process receives a complete task directly, so there is no supervising model invocation and no child-side harness detection.

### What's deliberately kept

- The `poteto-agent` subagent ID and all references to it.
- `run_in_background: true` on Agent calls (Claude Code supports it).
- `/loop`, `/deslop`, `/babysit` slash references in skill bodies — they all resolve in Claude Code now.
- The principle/playbook structure and upstream principle prose.

### What's deliberately not ported

- **`automations/benny/`** (upstream `0452e08`, the only pstack change between `e46364b` and v0.10.0) — a dormant Slack issue-triage and reproduce-and-fix automation pack built on Cursor's event-triggered automations. It registers no slash skills even upstream, so excluding it changes nothing about the ported plugin's behavior. Porting it would require Cursor's event-trigger runtime, Slack, and tracker plumbing that Open Pstack does not provide.
- **`docs/guide/`** (upstream `02c03a9`, `0b7ef5b`, `424829e`) — the ten-chapter usage tutorial and its six screenshots (2.3 MB). It teaches pstack through Cursor's UI, sticky mode, and cloud agents, so a faithful port would be a rewrite rather than a sync, and none of it ships as skill content. Read it upstream at [cursor/plugins/pstack/docs/guide](https://github.com/cursor/plugins/tree/main/pstack/docs/guide); the concepts map through the substitution table above.
- **`make-bot-ui`** (upstream `799151d`, relocated by `6fecddb`) uses Cursor routines, webhook events, hosted bot state, and Cursor UI primitives that have no shared Claude Code and Codex mapping. A provider-specific rewrite would be a separate feature, not an upstream sync.
- **Grok 4.7** (upstream `70b2dc8`). The Grok route stays on `grok:grok-4.6` until the `grok-4.7` slug passes a live runner probe.
- **Three-lane default panels** (upstream `70b2dc8`). Upstream drops Fable from the arena, architect, and interrogate defaults. Open Pstack keeps the four-lane matrix quad, which runs at `xhigh` since `df58112`.
- **Sol removal and two-lane default panels** (upstream `df58112`). Upstream drops Sol from every default, so its panels run Opus 5.5 and Grok, interrogate loses Reviewer C, and `reflect tooling` moves from Sol to Grok. Upstream's reason is a choice of two default families, not a retired model. Open Pstack keeps Sol and the four-lane quad, because Sol is the Codex parent's native family and the only matrix family a Pi parent reaches. Reflect roles stay on `inherit-parent`, so the tooling move has no target.
- **Built-in PR tool rule** (upstream `23e4138`). Upstream routes PR create, edit, retarget, and ready through a run's built-in PR tool when one exists. Claude Code, Codex, and Pi have no such tool, so Opening a PR and the plan skeleton keep the resolved forge CLI for every PR operation.
- **Model-rejection fallbacks** (upstream `70b2dc8`, `12d587d`). Upstream reruns a rejected slug on its family default or the closest valid slug. Open Pstack reports a named dropout instead, per its no-fallback contract.
- **Per-spawn speed** (upstream `ce649c0`). Upstream's model-to-job rule also picks fast or standard speed for each subagent. No Open Pstack route has a per-spawn speed setting, so only the reasoning-level half is ported.
- **Stuck-after runtime** (upstream `ce649c0`). Upstream's Autopilot-full calls an agent stuck when it shows nothing new past a recorded runtime. Open Pstack has no implicit runtime timeout, so only failure evidence marks an agent stuck.
- **Sticky mode** (upstream `#144`) — Cursor-only `mode`/`icon`/`color`/`reminder` frontmatter with no Claude Code equivalent. The port's 0.9.5 SessionStart hook is the analog and already carries the non-trivial / trivial / opt-out logic.
- **Agent Plugins v1 root manifest** (upstream `e5a02f8`). Upstream adds `pstack/plugin.json` in the Agent Plugins 1.0.0 format. Codex 0.162.1 also reads that format, next to `.codex-plugin/plugin.json`, and which one wins is unverified. If the root file won, Codex would lose the SessionStart hook and the interface block that only the Codex manifest declares. The file stays out until a live Codex test with both manifests present shows which one Codex uses.
- **`poteto-agent` path search** (upstream `b93e811`). With no path from its parent, upstream's agent searches `~/.cursor/plugins/` for poteto-mode and picks the copy with the highest `.cursor-plugin` version. The Claude agent preloads `pstack:poteto-mode` through its `skills` frontmatter, so it uses that copy instead of searching.
- **`is_background: true` on `poteto-agent`** (upstream `99559f2`) — Cursor names this key differently. Claude-native frontier definitions use `background: true`; `poteto-agent` calls remain background dispatches at the call site.
- **`pstack/.gitignore`** ignores `node_modules/`, `.DS_Store`, and `*.log` in upstream's plugin folder. It ships nothing, so the port has no plugin-level copy. The repository's root `.gitignore` covers the scripts' `node_modules/` and `.DS_Store`.
- **`cursor-team-kit` beyond `deslop`** — pstack routes only to `deslop`. The rest are not pstack skills: they duplicate Claude Code built-ins (`verify-this` → the `verify` skill and built-in verification discipline; `check-compiler-errors` → LSP diagnostics; `control-cli`/`control-ui` → `run`/`verify`, already the substitution targets) or stand outside pstack's workflows (`loop-on-ci`, `review-and-ship`, `weekly-review`, `fix-ci`, `make-pr-easy-to-review`, `what-did-i-get-done`, `thermo-nuclear-code-quality-review`). `pr-review-canvas` is Cursor-UI-specific.

### Forking note

Editing skill bodies forks this from upstream. Re-syncing to a future pstack release means re-applying the substitution table. The full re-port recipe is in [CHANGES.md](../CHANGES.md).

## License

MIT. Three upstream LICENSE files are preserved:

- [LICENSE](../LICENSE) — pstack (Lauren Tan)
- [LICENSE-cursor-team-kit](../LICENSE-cursor-team-kit) — Cursor (covers the `deslop` skill)
- [LICENSE-superpowers](../LICENSE-superpowers) — superpowers, Jesse Vincent (covers the vendored `hooks/run-hook.cmd`)
