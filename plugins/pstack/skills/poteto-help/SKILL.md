---
name: poteto-help
description: Guides users through pstack setup, /poteto-mode, and picking the skill, playbook, or principle for a task. Use for /poteto-help, or when the user asks how to install, set up, or use pstack, or which pstack skill fits. Not for requests to do work, even ones that name pstack.
---

# Poteto help

Answer the user's question about pstack, hand them a prompt they can send, and link the file the answer came from. For a help question, don't start the work. The user asked how, and a pstack run spends real tokens, so let them send the prompt.

A message that asks for work, such as "use pstack to fix this bug", is not a help question. Read [`poteto-mode`](../poteto-mode/SKILL.md), do the work under it, and mention once how their harness keeps it on (see Start a task).

This file maps questions to the skills and guide pages that hold the answers. Those files own the details. Read the file you route to before you quote it, and trust it when it disagrees with this map. The links here point into the installed plugin, which the user may not be able to open, so give the user the file's public copy: `https://github.com/misaka9981/open-pstack/blob/main/plugins/pstack/` followed by its path from the plugin root.

**Platform note.** Skill names below are short. Claude Code lists them as `/pstack:<name>`, Codex loads one when the user asks for `pstack:<name>` by name, and Pi runs one with `/skill:<name>`. Write example prompts in the user's harness form. On Codex or another non-Claude runtime, the Claude tool names and Claude built-in skills named below (`subagent_type`, `loop`, `run`, `verify`, `plugin-dev:skill-development`) are Claude defaults. Resolve them via [`codex-tools.md`](../poteto-mode/references/codex-tools.md) or [`pi-tools.md`](../poteto-mode/references/pi-tools.md).

## Find out what they need

Infer the need from the message and the conversation. A named situation, such as "which skill reviews a PR?", goes straight to its section. If the need is still unclear, ask one multiple-choice question with these options, then answer only the section they pick:

- Get set up
- Start a task with `/poteto-mode`
- Pick a skill for a situation
- Fix a run that went wrong
- Make pstack my own

Check the state that changes the answer, and mention it only when it does:

- On Codex, no `~/.codex/pstack-models.md`, and on Pi, no `~/.pi/agent/pstack-models.md`, means `/setup-pstack` hasn't run for this user, so every role uses its default model. On Claude Code, the `pstack-models.md` that ships at the plugin root sets the models.
- No `verify-*` skill or other app harness in the project means agents have no scripted way to drive the app. Mention `/create-verification-skill` when the question is about proving a change works.

## Get set up

1. Install with the commands in the [README](https://github.com/misaka9981/open-pstack/blob/main/README.md#install) for the user's harness. Claude Code runs `/plugin marketplace add misaka9981/open-pstack`, then `/plugin install pstack@open-pstack`. Codex runs `codex plugin marketplace add misaka9981/open-pstack --ref main`, then `codex plugin add pstack@open-pstack`, and needs `multi_agent = true` under `[features]` in `~/.codex/config.toml`. Pi installs `pi-subagents`, then the Open Pstack checkout.
2. Set the models. On Codex and Pi, run [`/setup-pstack`](../setup-pstack/SKILL.md). It asks for a reasoning budget, maps a model to each role, and writes a model sheet. The sheet applies to new sessions. On Claude Code, the plugin ships its own sheet, so `/setup-pstack` reports it and stops. Change models there by editing `plugins/pstack/pstack-models.md` in the repository and updating the plugin.
3. Start a real task with `/poteto-mode`, a goal, and a check that can pass or fail.

On Claude Code and Codex, a SessionStart hook adds a short instruction to each new session that routes non-trivial engineering work into `/poteto-mode`. Codex runs the hook only after the user trusts it. Pi has no hook, so nothing runs there until the user invokes a skill. Any pstack skill can also load when a request matches its description. On Claude Code, `/automate-me` and `/correct` start only when the user types them. The [README](https://github.com/misaka9981/open-pstack/blob/main/README.md) and [guide page 1](https://github.com/cursor/plugins/blob/main/pstack/docs/guide/01-setup.md) have the details. The guide is written for Cursor's interface, but its ideas carry over. Offer to word their first prompt with them.

If cost is the worry, say where the tokens go and how to spend fewer. pstack spends extra tokens on subagents and review panels. Pick a smaller budget or cheaper models: rerun `/setup-pstack` on Codex and Pi, or edit the shipped sheet on Claude Code. A role set to `auto` or `inherit-parent` runs on the parent session's model, which saves tokens when that model is cheaper. A shorter panel list runs fewer subagents, one for each entry. Save `/poteto-mode` for work that needs rigor.

Open Pstack ports Cursor's pstack to Claude Code, Codex, and Pi. All three read one shared skill tree. The skills keep Claude Code tool names, and [`codex-tools.md`](../poteto-mode/references/codex-tools.md) and [`pi-tools.md`](../poteto-mode/references/pi-tools.md) map them for Codex and Pi. Each harness reaches different models. Pi has no route to Claude or Grok. A model the parent can't reach becomes a named dropout, never a silent substitute. Cursor users should use [the original pstack](https://github.com/cursor/plugins/tree/main/pstack).

## Start a task with `/poteto-mode`

`/poteto-mode` matches the task to a playbook, copies the playbook's steps into the todo list, and runs the other skills as the steps need them. A step it skips stays in the list as `skip: <reason>`. A good prompt states the goal and how to tell it's done. It doesn't list skills, because a hand-written sequence tends to drop or reorder steps the playbook would keep. [Guide page 2](https://github.com/cursor/plugins/blob/main/pstack/docs/guide/02-poteto-mode.md) has examples.

Whether `/poteto-mode` stays on depends on the harness:

- On Claude Code, the SessionStart hook adds its routing instruction at startup, after `/clear`, and after compaction. Non-trivial engineering work routes into `/poteto-mode` without a command. Typing `/pstack:poteto-mode` loads the full skill for the task at hand.
- On Codex, the same hook runs once the user trusts it. Ask for `pstack:poteto-mode` by name to load the full skill.
- Pi has no hook. Start each new task with `/skill:poteto-mode`.

Link [the technical reference](https://github.com/misaka9981/open-pstack/blob/main/docs/reference.md) when this comes up. It covers the hook and how to turn it off. Mid-chat, "new task" makes the mode match a fresh playbook. `/poteto-mode` already uses `poteto-agent` for the subagents its playbook steps spawn. To get the same style from a subagent of your own, spawn it with `subagent_type: "poteto-agent"`.

## Pick a skill

The default answer is `/poteto-mode`, which runs most of the others when its steps need them. Name a skill directly when the user wants more or less of something than the playbook gives. Read the skill before you recommend it, and give one example prompt.

| The user wants to | Skill |
|---|---|
| Do any non-trivial task with rigor | [`/poteto-mode`](../poteto-mode/SKILL.md) |
| Know how code works now, or where new code should live | [`/how`](../how/SKILL.md) |
| Know why code is shaped this way, or where a number came from | [`/why`](../why/SKILL.md) |
| Understand a change or subsystem, explained plainly | [`/teach`](../teach/SKILL.md) |
| Catch up on their own recent work on a topic | [`/recall`](../recall/SKILL.md) |
| Know what a small diff could break outside itself | [`/blast-radius`](../blast-radius/SKILL.md) |
| Settle types and module shape before code that crosses a function boundary | [`/architect`](../architect/SKILL.md) |
| Get several attempts at one brief, merged into the best one | [`/arena`](../arena/SKILL.md) |
| Run parallel checks over slices, or race workers, as background subagents in their own worktrees | [`/swarm`](../swarm/SKILL.md) |
| Have several models review a diff and try to break it | [`/interrogate`](../interrogate/SKILL.md) |
| Fix a bug test-first when a cheap local test exists | [`/tdd`](../tdd/SKILL.md) |
| Apply TypeScript rules to `.ts` or `.tsx` work | [`/typescript-best-practices`](../typescript-best-practices/SKILL.md) |
| Strip comments before review, using a reviewer that didn't write them | [`/no-comments`](../no-comments/SKILL.md) |
| Clean AI slop out of a diff before commit | [`/deslop`](../deslop/SKILL.md) |
| Clean AI tells out of prose | [`/unslop`](../unslop/SKILL.md) |
| Write docs, an RFC, a README, a PR description, or a commit message to a standard | [`/technical-writing`](../technical-writing/SKILL.md) |
| Hear the last reply again in plain words | [`/bro`](../bro/SKILL.md) |
| Give agents a scripted way to drive the app and prove behavior | [`/create-verification-skill`](../create-verification-skill/SKILL.md) |
| Bring a verification skill and its feature map back in line with the app | [`/maintain-verification-skill`](../maintain-verification-skill/SKILL.md) |
| Vet a performance number before reporting or acting on it | [`/benchmark-checklist`](../benchmark-checklist/SKILL.md) |
| Run a large or cross-cutting change, or one to review after stepping away | [`/figure-it-out`](../figure-it-out/SKILL.md) |
| Keep a decision log during a run, and review it afterward | [`/show-me-your-work`](../show-me-your-work/SKILL.md) |
| Watch an open PR, fixing CI and straightforward review comments until it's mergeable | [`/babysit`](../babysit/SKILL.md) |
| Pick a model for each role and a reasoning budget | [`/setup-pstack`](../setup-pstack/SKILL.md) |
| Turn their own working habits into a personal mode skill | [`/automate-me`](../automate-me/SKILL.md) |
| Turn what a finished task taught into skill edits | [`/reflect`](../reflect/SKILL.md) |
| Stop agents from repeating the same mistakes in this repo | [`/correct`](../correct/SKILL.md) |
| Find their way around pstack | `/poteto-help` |

If a skill directory next to this one is missing from the table, read its frontmatter and route by its description. The `principle-*` directories are covered under principles below.

Close calls:

- `/how` explains what the code does. `/why` explains the reasons. `/teach` runs one or both and explains the result plainly.
- `/arena` gives every worker the same brief and merges the best parts. `/swarm` splits work into slices or a race and returns one report.
- `/architect` implements right after it settles the design. Add "with checkpoint" to review the design before it writes code.
- `/interrogate` reviews the diff. `/blast-radius` looks for breakage outside the diff and proves the one fact that makes the change safe.
- `/recall` rebuilds context across recent chats. Resuming one specific chat or branch is the Session pickup playbook.
- `/figure-it-out` designs one rigorous run. The Orchestrate playbook runs a program that spans days and many PRs. The Autonomous run playbook drives one task to a finish condition.

Not in pstack:

- `control-cli` and `control-ui` ship in Cursor's `cursor-team-kit` plugin. On Claude Code, the built-in `run` and `verify` skills do that job.
- `/loop` is a Claude Code built-in. Skill-authoring guidance is `plugin-dev:skill-development`, from the `plugin-dev` plugin.
- pstack has no `/orchestrate` skill. Orchestrate is a `/poteto-mode` playbook. If the slash menu shows `/orchestrate`, another plugin provides it.

## Playbooks and principles

Playbooks are step lists inside `/poteto-mode`, not skills, so they have no slash command. Inside `/poteto-mode`, describing the task picks one, and these phrases name one directly:

- "babysit this pr" or "check on pr 123" runs Babysit. It drives the PR to merge-ready and stops there. It doesn't merge unless the user asks to merge, land, or ship.
- "land the stack" runs Shipping.
- "take over this branch" runs Session pickup.
- "pause safely" runs Pause safely.
- "full autopilot on this queue" runs Autopilot-full. "stack them, don't ship" runs Autopilot-stack.
- "run the eval playbook" runs Eval.

Without `/poteto-mode`, a phrase such as "babysit this pr" can start the standalone `/babysit` skill instead. The Playbooks section of [`poteto-mode`](../poteto-mode/SKILL.md) lists every playbook and when it applies. [Guide page 6](https://github.com/cursor/plugins/blob/main/pstack/docs/guide/06-verify-and-ship.md) covers opening, babysitting, and landing a PR.

pstack has no planning skill. A harness plan mode, such as Claude Code's, works alongside it. For work that spans phases or stacked PRs, asking `/poteto-mode` for a plan runs the [Multi-phase plan playbook](../poteto-mode/playbooks/multi-phase-plan.md), which writes the plan and doesn't implement it. For a design question, the Prototype playbook or `/architect` settles it in code first.

Principles are one-rule skills that `/poteto-mode` reads and cites in its replies. The user rarely invokes one. They steer with the names instead, as in "apply prove it works. show me the real output." The principle skills are hidden from the Claude Code slash menu, so ask for one by name to load it on demand. [Guide page 8](https://github.com/cursor/plugins/blob/main/pstack/docs/guide/08-principles.md) lists them.

## Fix a run that went wrong

| Symptom | Fix |
|---|---|
| The mode stopped applying after a few turns | Start each task with `/poteto-mode`. On Claude Code and Codex, check that the plugin's SessionStart hook still runs. Codex runs it only after the user trusts it. |
| A question got treated as the next step of the last task | Say "new task", or say the turn doesn't need the mode. |
| A new model choice had no effect | The model sheet loads when a session starts. Start a new one. On Claude Code, the shipped `pstack-models.md` replaces `~/.claude/pstack-models.md`, so edit the shipped file and update the plugin. |
| Runs cost more than expected | See the cost paragraph under Get set up. |
| A skill didn't load on its own | A skill loads on its own only when the request matches its description, and on Claude Code `/automate-me` and `/correct` never do. Otherwise it loads when the user types it or when `/poteto-mode` runs it, and it doesn't run every skill. |
| Parallel agents overwrote each other | Give each writer its own worktree. |
| An overnight run moved but finished nothing | `/loop` needs a check that can pass or fail, not a duration. See [guide page 7](https://github.com/cursor/plugins/blob/main/pstack/docs/guide/07-overnight.md). |
| The reply claims success from a green build | Ask for the real command, flow, stored value, or profile. That's the prove-it-works principle. |

[Guide page 10](https://github.com/cursor/plugins/blob/main/pstack/docs/guide/10-recipes-and-pitfalls.md) has more pitfalls and the recipes worth copying.

## Make pstack my own

- [`/automate-me`](../automate-me/SKILL.md) drafts a personal mode skill from the user's own history, to use alongside `/poteto-mode`.
- [`/reflect`](../reflect/SKILL.md) after a session turns its lessons into skill edits the user approves.
- `/poteto-mode write a skill for <workflow>` runs the authoring playbook. The eval playbook tests a skill change blind.
- Fix a misbehaving skill in its own PR, not inside the feature work where it went wrong.

[Guide page 9](https://github.com/cursor/plugins/blob/main/pstack/docs/guide/09-make-it-yours.md) covers each of these.

## Reply

Lead with the answer. Give at most one example prompt in a code block, then the link to that file. Keep it short unless the user asked for the whole map.
