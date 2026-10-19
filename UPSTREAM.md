# Upstream synchronization

open-pstack tracks [Cursor's pstack](https://github.com/cursor/plugins/tree/main/pstack) while adapting Cursor-specific primitives for Claude Code, Codex, and Pi.

## Current sync point

| Source | Value |
| --- | --- |
| Repository | `https://github.com/cursor/plugins.git` |
| Path | `pstack/` |
| Commit | `d457567332aa6989e753ea289f30ea2bfbc80bc0` |
| Upstream version | `0.15.28` |
| open-pstack version | `1.21.0` |

The table above is the current Cursor sync point. Open Pstack 1.21.0 imports ten commits after `019a6a2`, through Cursor pstack 0.15.28. `README-UPSTREAM.md` preserves the upstream pstack README verbatim. `CHANGES.md` and `NOTICE.md` describe the adaptations and provenance.

## Upstream-only exclusions

- Commits `799151d` and `6fecddb` add and relocate `make-bot-ui`. It builds a page whose buttons wake a Cursor-hosted Grok Bot. It depends on Cursor routines, webhook events, a secret-request card, and UI primitives that Claude Code, Codex, and Pi do not share.
- Upstream marks every skill except `setup-pstack` with `disable-model-invocation: true`. On Claude Code that flag makes the Skill tool refuse a model call, so Open Pstack leaves it off only where something calls the skill by name from the model side. The `principle-*` leaves take `user-invocable: false` instead. These 18 skills ship without the flag, each for the reason given:
  - `poteto-mode`: the SessionStart context tells the model to invoke it.
  - `how` and `why`: poteto-mode's Investigation, Bug fix, and other playbooks, `architect`, `teach`, and the SessionStart context.
  - `architect`: poteto-mode's trigger list, the Bug fix and Refactoring playbooks, `figure-it-out`, and the SessionStart context.
  - `arena`: poteto-mode's trigger list and Feature step 4, `architect`, `figure-it-out`, `blast-radius`, and the SessionStart context.
  - `interrogate`: poteto-mode's trigger list, Opening a PR, and the SessionStart context.
  - `swarm`: poteto-mode's trigger list, the multi-phase plan, and Autopilot-full.
  - `figure-it-out`: poteto-mode's Playbooks section and the Refactoring playbook.
  - `show-me-your-work`: poteto-mode's trigger list, Autonomous run, Hillclimb, Autopilot-full, and `figure-it-out`.
  - `no-comments`, `technical-writing`, `unslop`, and `benchmark-checklist`: poteto-mode's trigger list and the playbooks that run them.
  - `tdd`: the Bug fix playbook and the SessionStart context.
  - `create-verification-skill`: setup-pstack's verification-skill offer.
  - `create-formal-verification-skill`: setup-pstack's formal verification offer, its last step.
  - `automate-me`: Recall step 1 routes a request to capture habits to it.
  - `typescript-best-practices`: no skill routes it. Its `paths` frontmatter loads it for `.ts` and `.tsx` files on Claude Code, and the Codex and Pi tool maps tell the agent to start it by name. The flag would block both.
- The Grok 4.7 slug from `70b2dc8` is not applied. The Grok route keeps `grok:grok-4.6` until a maintainer with the Grok CLI probes `grok-4.7` through the runner.
- `70b2dc8` shrinks the default panels to Opus 5.5, Sol, and Grok, and `df58112` then drops the Sol family from every default. Its panels shrink to Opus 5.5 and Grok, the interrogate table loses Reviewer C, `reflect tooling` moves from Sol to Grok, and arena and interrogate drop the `gpt-*` fallback prefix. Upstream PR cursor/plugins#511 gives a judgment reason, two model families by default, and does not retire the Sol model. Open Pstack moves judgment roles to Opus but keeps Fable and Sol, so the panel default stays the four-lane model-matrix quad, now at `xhigh`. Here Sol is the Codex parent's native family and the only matrix family a Pi parent reaches. Sol runs `gpt-6.1-sol`, not upstream's former `gpt-5.6-sol`, because the maintainer chose the newer model and it is the Codex model the magpie relay exposes to Pi (#21). `reflect tooling` keeps its Open Pstack value, `inherit-parent`, because Reflect needs the parent's MCP surface. The fallback edits that drop the `gpt-*` prefix and prefer the same reasoning tier change lines that the no-fallback exclusion below already leaves out.
- The `70b2dc8` and `12d587d` lines that rerun a rejected model on its family default or the closest valid slug are not applied. They conflict with the no-fallback contract in `provider-dispatch.md`.
- The `23e4138` built-in PR tool rule is not applied. Claude Code, Codex, and Pi have no built-in PR tool, so Opening a PR and the plan skeleton keep the resolved forge CLI. The `00b14f1` rewording of that paragraph is not applied either.
- The `00b14f1` description cuts are not applied to `figure-it-out`, `principle-model-the-domain`, `principle-never-block-on-the-human`, or `principle-redesign-from-first-principles`. Upstream ships these four with `disable-model-invocation: true`, so the description does not trigger them there. Open Pstack keeps them model-invocable, so the description is their trigger and keeps its longer form. Their body cuts are applied.
- The Agent Plugins v1 root manifest from `e5a02f8` (`pstack/plugin.json`) is not added. Codex 0.162.1 recognizes that format alongside `.codex-plugin/plugin.json`, and its precedence between the two is unverified. If the root file won, Codex would lose the SessionStart hook and the `interface` block that only `.codex-plugin/plugin.json` declares. Reopen this after a live Codex test with both manifests present.
- The `b93e811` fallback in `poteto-agent.md` is not applied. With no path from its parent, upstream's agent searches `~/.cursor/plugins/` for `skills/poteto-mode/SKILL.md` and picks the copy whose `.cursor-plugin/plugin.json` has the highest version. That directory and manifest exist only in Cursor. The Claude agent preloads `pstack:poteto-mode` through its `skills` frontmatter, so it has the skill without a search. Upstream's note that the catalog hides poteto-mode is left out too, because Open Pstack's poteto-mode is model-invocable.
- The Claude Code harness tree from `182f2ce` is not applied. Upstream keeps its skills in Cursor names and adds `pstack/docs/harness/claude-code.md`, an adapter the model reads to map those names at run time. `scripts/generate-pstack-harness-trees.mjs` copies the skills, agents, and adapter into `harness/pstack/` at the repository root, and the `cursor-plugins` marketplace installs that copy. Open Pstack already writes the Claude Code, Codex, and Pi names into the shared skill tree, as `CHANGES.md` records, so the adapter would be a second compatibility layer over the same mapping. Two adapter rules come from upstream choices Open Pstack does not share. The adapter has the model read a skill's `SKILL.md` because the Skill tool refuses upstream's typed-only skills, and Open Pstack keeps the 18 skills listed above model-invocable. The adapter stops `setup-pstack` on Claude Code because Claude Code never loads Cursor's `.mdc` rule, and Open Pstack's `setup-pstack` writes `~/.claude/pstack-models.md` instead. `README-UPSTREAM.md` takes the README lines from this commit verbatim.
- The `1b80080` additions to that adapter are not applied either. Upstream has `setup-pstack` write `~/.claude/rules/pstack-models.md`. Open Pstack's SessionStart hook injects `plugins/pstack/pstack-models.md` into each Claude Code session as a `<pstack-model-sheet>` block. When that sheet ships, `setup-pstack` reports it and writes nothing. The adapter's one-line skip rule for Cursor Automations, Bugbot, and Cursor cloud agents has nothing to skip here, because the shared tree already substitutes or drops those steps. Bugbot comments are triaged as GitHub review threads per `poteto-mode/references/bugbot-triage.md`.
- The `f9be7aa` paragraph in `poteto-help` that installs upstream pstack in Claude Code from the `cursor-plugins` marketplace and points at the adapter is not applied. Open Pstack installs from its own marketplace and has no adapter, so `poteto-help` keeps its paragraph on the three harnesses. Each of the ten commits from `16541c6` through `d457567` also regenerates the `harness/pstack/` copy, which the `182f2ce` exclusion above leaves out.
- The guide and README copies that `1b80080` adds to the generated tree, the guide edits in `019a6a2`, `f9be7aa`, `7b353f7`, and `d457567`, and the `019a6a2` `scripts/check-pstack-docs.mjs` have no local target. The guide stays outside the port, as `docs/reference.md` records. `poteto-help` links the published guide for the user to open and never tells the model to fetch it. The docs check covers the upstream README and guide, which Open Pstack does not ship as skill content.
- The Claude manifest does not take the logo field from `efa2a53` because Claude Code has no schema for it. The shared asset is exposed through the Codex manifest instead.
- The speed half of the `ce649c0` model-to-job rule is not applied. Upstream picks fast or standard speed per spawn and keeps fast mode for urgent work. No Open Pstack route has a per-spawn speed setting, because `fast` is only part of Cursor's Grok selector. The pointer sentence in each routed skill and playbook drops the words "and fast or standard speed". Upstream's "nearest slug" fallback becomes a clamp to the family's Selectable efforts, and a rejected adjusted effort reruns once on the configured descriptor instead of another slug.
- The `ce649c0` fallback prefixes in Arena and Interrogate, which put `cursor-grok-*` and `composer-*` in the Grok family and run a refused `composer-*` entry on the Grok default, are not applied. They change fallback lines that the no-fallback exclusion above already leaves out.
- The `ce649c0` stuck-after runtime in Autopilot-full is not applied. Upstream records a stuck-after runtime for each subagent and calls an agent stuck when it shows nothing new past that runtime or an owner has not pushed by the first tick. Open Pstack has no implicit runtime timeout, so the tick marks an agent stuck only on failure evidence, and an owner with no push or trail row by the first tick is drift to record.

## Check for changes

The repository already names Cursor's repository as the `cursor` remote in the maintainer checkout. A fresh clone can add it once:

```shell
git remote add cursor https://github.com/cursor/plugins.git
```

Fetch and inspect only commits that touched pstack after the recorded sync point:

```shell
git fetch cursor main
git log --oneline d457567332aa6989e753ea289f30ea2bfbc80bc0..cursor/main -- pstack
git diff --stat d457567332aa6989e753ea289f30ea2bfbc80bc0..cursor/main -- pstack
```

No output means the tracked pstack tree has not changed. This comparison does not need a polling service or generated mirror branch.

## Incorporate a change

1. Create or update a GitHub issue in `misaka9981/open-pstack` and branch from current `main`.
2. Read each upstream pstack commit in order. Bring over its intent and content, then apply only the Claude Code, Codex, and Pi substitutions documented in `CHANGES.md`.
3. Keep one shared `plugins/pstack/skills/` tree. Put harness translation in the existing `codex-tools.md` and `pi-tools.md` and provider routing in `provider-dispatch.md`; do not fork a skill per harness.
4. Update the commit and version in this file, the affected provenance rows in `NOTICE.md`, and `README-UPSTREAM.md` when upstream changes it.
5. Run CI-equivalent checks locally, then run the installed Claude Code, Codex, and Pi behavioral lanes required by the changed surface. Unit tests alone are not a release gate.
6. Merge the reviewed PR before tagging the next open-pstack release.

Cursor's version and open-pstack's version are independent. Cursor's version identifies the imported content; open-pstack's version identifies the cross-harness distribution.
