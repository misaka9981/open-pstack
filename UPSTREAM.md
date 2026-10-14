# Upstream synchronization

open-pstack tracks [Cursor's pstack](https://github.com/cursor/plugins/tree/main/pstack) while adapting Cursor-specific primitives for Claude Code, Codex, and Pi.

## Current sync point

| Source | Value |
| --- | --- |
| Repository | `https://github.com/cursor/plugins.git` |
| Path | `pstack/` |
| Commit | `c86f349b102feb91f1966f8a6a60882a4e601b50` |
| Upstream version | `0.15.23` |
| open-pstack version | `1.15.0` |

The table above is the current Cursor sync point. Open Pstack 1.15.0 keeps the 0.15.23 sync that 1.14.0 imported. `README-UPSTREAM.md` preserves the upstream pstack README verbatim. `CHANGES.md` and `NOTICE.md` describe the adaptations and provenance.

## Upstream-only exclusions

- Commits `799151d` and `6fecddb` add and relocate `make-bot-ui`. It builds a page whose buttons wake a Cursor-hosted Grok Bot. It depends on Cursor routines, webhook events, a secret-request card, and UI primitives that Claude Code, Codex, and Pi do not share.
- Four `disable-model-invocation: true` lines from `73f8be4` are not applied to `how`, `why`, `unslop`, or `typescript-best-practices`. Poteto-mode invokes those skills by name, and the flag blocks that route on Claude Code. For the same reason, `benchmark-checklist` from `23e4138` ships without the flag. The new `principle-explain-the-number` leaf takes `user-invocable: false` like the other principle leaves.
- The `23a56e2` Fable defaults for `bug-fix`, `perf-issue`, and `hillclimb` were never applied. `889ec4b` and `70b2dc8` superseded them with Grok, and Open Pstack now follows that default.
- The Sol family runs `gpt-6.1-sol` instead of upstream's `gpt-5.6-sol` (`gpt-5.6-sol-max`). The maintainer chose the newer model, and it is the Codex model the magpie relay exposes to Pi (#21).
- The Grok 4.7 slug from `70b2dc8` is not applied. The Grok route keeps `grok:grok-4.6` until a maintainer with the Grok CLI probes `grok-4.7` through the runner.
- `70b2dc8` shrinks the default panels to Opus 5.5, Sol, and Grok. Open Pstack moves judgment roles to Opus but keeps Fable as the fourth panel lane, so the panel default stays the model-matrix quad.
- `df58112` drops the Sol family from every default. Its panels shrink to Opus 5.5 and Grok, the interrogate table loses Reviewer C, `reflect tooling` moves from Sol to Grok, and arena and interrogate drop the `gpt-*` fallback prefix. Open Pstack keeps Sol and the four-lane model-matrix quad, now at `xhigh`. Upstream PR cursor/plugins#511 gives a judgment reason, two model families by default, and does not retire the Sol model. Here Sol is the Codex parent's native family and the only matrix family a Pi parent reaches. `reflect tooling` keeps its Open Pstack value, `inherit-parent`, because Reflect needs the parent's MCP surface. The fallback edits that drop the `gpt-*` prefix and prefer the same reasoning tier change lines that the no-fallback exclusion below already leaves out.
- The `70b2dc8` and `12d587d` lines that rerun a rejected model on its family default or the closest valid slug are not applied. They conflict with the no-fallback contract in `provider-dispatch.md`.
- The `23e4138` built-in PR tool rule is not applied. Claude Code, Codex, and Pi have no built-in PR tool, so Opening a PR and the plan skeleton keep the resolved forge CLI. The `00b14f1` rewording of that paragraph is not applied either.
- The `00b14f1` description cuts are not applied to `figure-it-out`, `principle-model-the-domain`, `principle-never-block-on-the-human`, or `principle-redesign-from-first-principles`. Upstream ships these four with `disable-model-invocation: true`, so the description does not trigger them there. Open Pstack keeps them model-invocable, so the description is their trigger and keeps its longer form. Their body cuts are applied.
- The `00b14f1` distillation of `principle-test-behavior-not-implementation` and its poteto-mode index line is not applied. It distills the original rule that every test must fail when each import returns `undefined`. Open Pstack corrected that rule in 1.4.0 and keeps the correction.
- The Agent Plugins v1 root manifest from `e5a02f8` (`pstack/plugin.json`) is not added. Codex 0.162.1 recognizes that format alongside `.codex-plugin/plugin.json`, and its precedence between the two is unverified. If the root file won, Codex would lose the SessionStart hook and the `interface` block that only `.codex-plugin/plugin.json` declares. Reopen this after a live Codex test with both manifests present.
- The `b93e811` fallback in `poteto-agent.md` is not applied. With no path from its parent, upstream's agent searches `~/.cursor/plugins/` for `skills/poteto-mode/SKILL.md` and picks the copy whose `.cursor-plugin/plugin.json` has the highest version. That directory and manifest exist only in Cursor. The Claude agent preloads `pstack:poteto-mode` through its `skills` frontmatter, so it has the skill without a search. Upstream's note that the catalog hides poteto-mode is left out too, because Open Pstack's poteto-mode is model-invocable.
- The Claude manifest does not take the logo field from `efa2a53` because Claude Code has no schema for it. The shared asset is exposed through the Codex manifest instead.

## Check for changes

The repository already names Cursor's repository as the `cursor` remote in the maintainer checkout. A fresh clone can add it once:

```shell
git remote add cursor https://github.com/cursor/plugins.git
```

Fetch and inspect only commits that touched pstack after the recorded sync point:

```shell
git fetch cursor main
git log --oneline c86f349b102feb91f1966f8a6a60882a4e601b50..cursor/main -- pstack
git diff --stat c86f349b102feb91f1966f8a6a60882a4e601b50..cursor/main -- pstack
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
