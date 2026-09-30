---
name: setup-pstack
description: Configure pstack's provider-qualified models, reasoning budget, per-family requested effort, and parent-owned routes per role. Verifies each native or external Claude, Codex, and Grok lane the sheet uses before writing it. Use for /setup-pstack, "configure pstack models", "pstack budget", or changing pstack's model choices.
---

# Setup pstack

Configure one portable model sheet for the current parent harness. Read [`provider-dispatch.md`](../poteto-mode/references/provider-dispatch.md) before probing or writing anything. Its model matrix, descriptor grammar, and route table are the contract. Choose one requested effort per matrix family the sheet uses. Do not add a second configuration file, a runtime resolver, or a weaker-model fallback.

Claude Code writes `~/.claude/pstack-models.md` and loads it from `~/.claude/CLAUDE.md` with:

```text
@~/.claude/pstack-models.md
```

Codex writes `~/.codex/pstack-models.md`. Codex has no `@` include, so mirror the sheet's exact bytes inside one bounded block in `~/.codex/AGENTS.md` and retain the sheet as the editable source of truth:

```text
<!-- pstack:models:begin -->
<exact contents of ~/.codex/pstack-models.md>
<!-- pstack:models:end -->
```

## Steps

### 1. Establish the parent

Use the harness and tool surface running this skill: Claude Code or Codex. Environment markers may corroborate that top-level answer, but do not launch a child and ask it to detect where it came from. Record the parent because the same descriptor takes a different route in each harness.

### 2. Load current state

Read the current parent-specific sheet when it exists. Before matrix validation, normalize only the rolling-alias predecessors that earlier pstack releases generated. A provider-qualified Claude model is migratable when its model component starts with `claude-fable-` or `claude-opus-` and the remaining revision contains only digits and hyphens. Replace that component in memory with `fable` or `opus`, preserving the provider, effort, role, and lane order. Record each original and normalized descriptor for the confirmation in step 9. This migration is valid loaded state and does not require a separate operator choice.

Treat the normalized values as current role-to-family assignments. Overlay those rows on the complete first-run role map in step 9. Materialize any missing documented role row from that map on the next successful write. A row for a retired role, such as `how critics`, has no consumer. Drop it and list it in the confirmation in step 9. A duplicate row or a row for any other unknown role is inconsistent state; report it and resolve it before probing. A bare host-native slug from an older sheet is also invalid because it does not say which provider owns it. A versioned Claude model outside the two migration families remains inconsistent state. If the sheet is missing, use the complete first-run role map and the model matrix's Default effort cells. A `<!-- budget: ... -->` comment in the sheet records the budget chosen on the last run. Use it only to name the current budget in step 4. The role descriptors remain the only source of effort.

### 3. Parse per-family efforts

Read the model matrix. Every non-alias value must match `<provider>:<model>@<effort>`. Map it to exactly one matrix family by `(provider, model)`, require its effort to appear in that row's Selectable efforts cell, and collect the effort. `inherit-parent` and `auto` rows carry no family effort.

An unmatched provider/model, out-of-domain effort, duplicate role, or unknown non-retired role is inconsistent state. Stop, show the conflicting rows verbatim, and ask for an explicit matrix family or alias replacement. If one or more families have mixed efforts, show every conflicting family and role row, then ask for one normalized effort per family from its Selectable efforts cell. Do not invent a precedence rule. Do not probe or write while any inconsistency is unresolved.

One distinct effort per family is the current value. A family with no non-alias occurrence in the role map is unused. Setup does not ask, probe, or write an effort for it.

### 4. Ask for a budget

Ask one budget question with these four labels. Prefer `AskUserQuestion` over free text, and name the current budget when the sheet records one.

- `unlimited — keep max`
- `large — xhigh reasoning`
- `medium — high reasoning`
- `small — medium reasoning`

`unlimited` proposes each family's matrix Default effort. `large`, `medium`, and `small` propose `xhigh`, `high`, or `medium` for every family. The budget only sets the proposals in step 6. It never changes a role's family or an alias.

### 5. Choose role families

Show every role with its current family or alias, and every retired row step 2 dropped. Ask whether to keep those role-to-family assignments or change named roles. Keeping them is the default. Apply only role changes the operator names; never offer a reset of a customized sheet to the first-run assignments. A changed role may use any matrix family, `inherit-parent`, or `auto`.

Assign a role only to a family whose provider this parent can reach. If the operator lacks a provider, for example the Grok CLI, move each of its roles to another family or an alias here. Setup never substitutes a family on its own. A family with no remaining non-alias occurrence is unused. It needs no effort, probe, or sheet entry.

### 6. Collect one requested effort per used family

Ask one effort question for each matrix family the role map from step 5 uses, in matrix row order. Name each model, its current value when it has one, the budget's proposal, and the Selectable efforts from its matrix row. Empty input accepts the budget's proposal. Do not ask about an unused family.

### 7. Probe the requested pairs

Probe only the selected `provider:model@effort` pair of each used family. Run one probe per family, even when two families share a provider. Do not enumerate or offer older models as substitutes. A failed probe writes nothing: report the failing pair and provider, stop, and keep the active sheet plus parent integration bytes unchanged. A failed first run creates neither artifact. To drop an unavailable provider, rerun and reassign its roles in step 5.

| Family | Pair source | Claude parent route | Codex parent route | Availability proof |
|---|---|---|---|---|
| Fable | Fable matrix row + selected effort | native Agent `pstack-fable-<effort>` | Claude CLI | native one-turn probe or `claude auth status --json` plus one-turn probe |
| Sol | Sol matrix row + selected effort | `codex exec` | native `spawn_agent` | `codex login status` plus one-turn probe or native one-turn probe |
| Grok | Grok matrix row + selected effort | Grok CLI | Grok CLI | `grok models` must list the requested model; one-turn probe |
| Opus | Opus matrix row + selected effort | native Agent `pstack-opus-<effort>` | Claude CLI | native one-turn probe or `claude auth status --json` plus one-turn probe |

Use a tiny read-only probe that returns a unique marker. A login-status command alone proves credentials, not that the requested model and effort flags run. Record native and external results separately. Never call the external launcher for the parent's own provider. On a Claude parent, the Fable and Opus probes are one-turn runs of the mapped `pstack-<stem>-<effort>` agent. On a Codex parent, the Sol probe is native `spawn_agent` with the selected `reasoning_effort`. Every other pair uses the external runner with the selected effort flag.

Receipts and native transcripts prove the requested effort and the route. They do not prove a provider's hidden applied reasoning depth. There is no implicit timeout, weaker-model fallback, same-provider external fallback, or second mutable configuration source.

### 8. Render, preserving role families

Build the new sheet in memory. Do not write it yet.

- First run: start from the complete role assignments in step 9.
- Rerun: start from the normalized complete role map from step 2, preserving each loaded row's lane order and family (or alias) per lane.

Apply the role changes from step 5. Rewrite every matrix-family descriptor to `provider:model@<requested effort for that family>`. Leave `inherit-parent` and `auto` unchanged. An effort-only rerun cannot change a role's family. Changing Grok's effort updates every Grok occurrence and does not move a Sol role onto Grok. Refuse an unqualified slug, an unavailable route, a model other than the four matrix families, a provider/model mismatch, or a family that step 7 did not probe.

Add one `<!-- budget: <label> (<target effort>) -->` comment line with the step 4 answer, using `max` as the target for `unlimited`. It is an HTML comment so that it is neither a heading nor a role row. It records the answer and is not a setting. The descriptors keep the only effort values, so a later hand edit of a descriptor wins.

### 9. Confirm and commit

Show any rolling-alias migrations as original and normalized descriptors, and any retired role rows step 2 dropped. Then show the route table for this parent and every rendered role and descriptor. Ask for confirmation before writing.

Why and Reflect require the parent's live MCP surface. Keep their investigator, reviewer, and synthesizer roles on `inherit-parent` or `auto`; the bounded external runner deliberately omits ambient MCPs. `inherit-parent` and `auto` always validate, but say when they reduce a panel's provider diversity. For panel roles, one lane runs per entry. The list length is the fan-out count. `arena cross-judge pool` is a list from which Arena chooses a provider different from the parent and base candidate when possible. `swarm workers` is the default for every worker unless a race explicitly assigns another descriptor.

Every non-alias value must match `<provider>:<model>@<effort>` and must have passed step 7.

After the operator confirms, write the in-memory render from step 8. Never paste the example below as the result. It is only the complete first-run role map used to seed step 2; the budget line, selected efforts, and explicit role changes always replace its example values before writing.

```markdown
# pstack model configuration

Provider-qualified per-role choices. Read the installed pstack provider-dispatch reference before dispatching a configured role. Every documented role remains present. `inherit-parent` and `auto` use the parent model natively and still count as one panel lane.

<!-- budget: unlimited (max) -->
feature, refactoring: grok:grok-4.6@xhigh
bug-fix: grok:grok-4.6@xhigh
perf-issue: grok:grok-4.6@xhigh
hillclimb: grok:grok-4.6@xhigh
judgment and prose: claude:opus@max
hardest tasks: claude:opus@max
how explorer: grok:grok-4.6@xhigh
how explainer: claude:opus@max
why investigators, synthesizer: inherit-parent
reflect tooling, judgment, divergent, synthesizer: inherit-parent
arena runners: claude:fable@max, codex:gpt-5.6-sol@max, grok:grok-4.6@xhigh, claude:opus@max
arena cross-judge pool: claude:fable@max, codex:gpt-5.6-sol@max, grok:grok-4.6@xhigh, claude:opus@max
swarm workers: grok:grok-4.6@xhigh
architect runners: claude:fable@max, codex:gpt-5.6-sol@max, grok:grok-4.6@xhigh, claude:opus@max
interrogate reviewers: claude:fable@max, codex:gpt-5.6-sol@max, grok:grok-4.6@xhigh, claude:opus@max
```

### 10. Wire it in

Render the parent integration in memory before either write. On Claude, the integration is the single `@~/.claude/pstack-models.md` include in `~/.claude/CLAUDE.md`. On Codex, it is the exact sheet bytes between one `<!-- pstack:models:begin -->` and `<!-- pstack:models:end -->` pair in `~/.codex/AGENTS.md`. Replace that whole bounded block on a rerun. Insert one block at the end on first run. If either marker is missing, duplicated, or reversed, stop and report inconsistent state instead of guessing a boundary.

Snapshot every target's current bytes. Write the sheet and parent integration only after every step 7 probe passes and the operator confirms. Read both targets back and compare them with the in-memory render. If either write or readback fails, restore every snapshot and report the failure. An unchanged rerun must produce byte-identical sheet and integration content after normalization.

Do not copy the model sheet between harnesses without rerunning the parent-specific probes; route availability can differ even on the same host.

### 11. Behavioral smoke

Before declaring setup complete, run one small read-only mixed panel from this parent: every distinct descriptor in the written sheet, distinct output/receipt paths, and an independent cross-judge. Launch Claude-native agents and every external process in the background with retained handles, then drain them. Verify the native transcript entries and every external receipt. A structural config check or unit test is not a substitute.

Report the sheet path, parent route table, requested-effort probe results, smoke results, and external elapsed/token/cost receipts. Re-running this skill re-probes and updates the same sheet. Do not claim the provider exposed hidden applied-effort observability.
