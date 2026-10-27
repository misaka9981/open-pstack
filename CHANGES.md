# CHANGES — applied substitutions

This port applies the Cursor → Claude Code substitutions in skill bodies. Earlier drafts left them flagged; this revision resolves them. A later pass added a Codex build that shares the same skills; see [Codex port](#codex-port) below.

## 1.24.0 syncs to Cursor pstack 0.15.35 and replaces the statechart scripts with a compiler

Open Pstack 1.24.0 tracks Cursor pstack 0.15.35 at `ab1f702ce8e8b6557edb56b09f52cde8bfb83f17` (#83). It reviews six upstream commits after `e73df47`. Two of them, `7c7bde7` and `164ced1`, only bump Cursor's manifests, which are not shipped. The catalog stays at 59 skills.

**Statechart compiler.** `34b1b7c` replaces the statechart scripts with a TypeScript compiler. One command, `statechart SPEC.tla`, checks the model with TLC, draws the Mermaid chart, and reports the shortest path to each rule that breaks. A POSIX launcher runs it on Node 22.18 or later, Bun 1.1.5 or later, or Deno 2.0 or later, with no build step. The chart-to-TLA+ skeleton, the code audit against a spec, and the fixed marks are gone. Charts render with the `pele` npm package, as `references/render.md` describes. `740d2c0` keeps qualified INSTANCE action names in property traces, and `519d36a` makes a macOS test wait for the killed worker to be reaped. The scripts name no Cursor path, tool, or model, so the port takes the tree byte for byte. The skill keeps no typed-only flag under the `UPSTREAM.md` rule. The README, technical reference, and `poteto-help` rows now describe the compiler, and the technical reference names the runtimes it needs. Upstream's new `poteto-help` row speaks of what the user sees. The port's row keeps any system, as the skill description does.

**CI.** `34b1b7c` runs the skill script tests as TypeScript on Node 22 and installs fast-check for the differential test. The port does the same in `.github/workflows/ci.yml`. CI has no mise, so the TLC tests skip there.

**Interrogate.** `ab1f702` turns interrogate into adversaries who must prove each finding with a run. The lead reruns each command and keeps only the findings the rerun confirms. The reviewer prompt, rubric, lead-judgment, and code-quality references are gone. Interrogate now reads arena's runner defaults, so it has no reviewer table, and the static invariant checks the default quad in arena and architect only. Each adversary runs through `provider-dispatch.md` in `isolated-write` mode in place of Cursor's `generalPurpose` agent. Interrogate states the intent with `in-your-own-words`, a call by name from the model side. So `in-your-own-words` drops upstream's `disable-model-invocation: true`, and the flag list grows to 20 skills. Claude Code and Pi now have 12 typed-only skills. The static invariant, the Codex and Pi tool maps, the `poteto-help` setup paragraph and troubleshooting row, and the README and reference rows follow.

**Arena judge.** `ab1f702` never picks the cross-judge from the parent's family, and an `auto` or `inherit-parent` entry never judges. The port applies this by provider. When no entry from another provider exists, or the chosen judge drops out, arena skips the judge and picks the base alone. Upstream's retries on other slugs and pool entries are left out under the no-fallback contract. Phase D and the synthesis note handle a skipped judge.

**Poteto-mode.** `ab1f702` has the agent restate the user's goal in its first message, its briefs, each PR's `## Why`, and its final report. Every lane runs in the background, a steer or resume included. Explain the Number applies before you measure, and its leaf asks for the deciding result before a run. Upstream's chain of slug fallbacks after a rejected adjusted slug is left out, as `UPSTREAM.md` records.

**Autopilot playbooks.** `ab1f702` blocks a PR only for a problem a failing run or a wrong doc line shows. Owners push each finished unit before the next. A wording-only change gets no verifier. A known concurrent change to the same files is a reason to rebase. Autopilot-stack becomes Autopilot-full without the merge, and a PR stacks only on a PR it builds on. Each owner rebases its own PR onto its parent. The port keeps its fork-head PR base, disarm-and-confirm rule, and captured-SHA push in that flow. The multi-phase plan and Babysit follow. Opening a PR no longer runs interrogate in a subagent that opens a PR.

**Ketchup video.** `ab1f702` burns a subtitle into each slide and measures each hold from the rendered file. The port keeps its embed-or-link substitution.

**Docs.** `README-UPSTREAM.md` takes the ab1f702 README text verbatim. The guide edits in `34b1b7c` and `ab1f702` and the regenerated `harness/pstack/` copy have no local target, as `UPSTREAM.md` records.

## 1.23.0 syncs to Cursor pstack 0.15.32 and adds the ketchup-video skill

Open Pstack 1.23.0 tracks Cursor pstack 0.15.32 at `e73df471cd4bd918367e99f3dd9c51bd53ddf5f0` (#81). It reviews thirteen upstream commits after `4ec7ffa`. Two of them, `642289e` and `b1a1298`, only bump Cursor's manifests, which are not shipped. The catalog grows from 58 to 59 skills.

**Statechart.** `076f4b2` widens `statechart` from what an app's user sees to how any system moves between states, such as a product flow, a protocol, or a service. The reader can be a PM, an engineer, or a reviewer. Each bug is a numbered path to a state that breaks a rule. Charts render with the Pele and resvg renderer, which the first PNG render installs with npm into the user cache folder. The first TLC run installs TLC and Java with mise, about 305 MB. The bundled OutputFolder example model is gone. The scripts still name no Cursor path, tool, or model, so the port takes the skill tree byte for byte. The README, technical reference, and `poteto-help` statechart rows now describe any system, because the old rows said it draws only what the user sees. Upstream did not change its `poteto-help` row, so that row now differs from the upstream text. The technical reference lists mise, npm, and the network as statechart dependencies.

**Formal verification.** `00d5dec` has a generated formal verification skill tell the next agent to read each TLA+ result with `/statechart`. The port takes this paragraph verbatim.

**Invocation flags.** That paragraph calls `statechart` by name from the model side. Under the `UPSTREAM.md` rule, `statechart` now drops upstream's `disable-model-invocation: true`, and the flag list grows to 19 skills. Nothing calls `ketchup-video` by name from the model side, so it keeps upstream's flag. Claude Code and Pi still have 13 typed-only skills. The static invariant moves `statechart` to the routed list and adds `ketchup-video` to the user-only list. The Codex and Pi tool maps, the `poteto-help` setup paragraph and troubleshooting row, and the README and reference rows follow.

**Ketchup video.** `3c0fdb4` adds `ketchup-video`. It catches the user up like `/ketchup`, but it shows what happened as a short silent video of slides. The waiting calls stay as text under the video. Upstream's reply always embeds the video. Claude Code, Codex, and Pi chats cannot always show a video, so the port embeds it where the chat can and otherwise links the rendered file. The rest of the skill is the upstream text. `poteto-help` takes upstream's routing row.

**Reflect.** `7054003` keeps `/reflect` from editing a skill in the plugin cache. Before approval, it shows where the edited copy will go. After approval, it copies the skill folder there and edits the copy. It never opens a PR or pushes. The port takes the Claude Code paths from the path table: `~/.claude/plugins/cache/`, `.claude/skills/<skill>/`, and `~/.claude/skills/<skill>/`.

**Swarm.** `e73df47` numbers Phase A from 1 to 4 and has Phase D ask for a result table. The port's Phase B names no step number, so only the list and Phase D change.

**Scripts.** `86c2448` makes `check-plan.mjs` strip an inline code span only at a closing delimiter of the same length. Prose after a multi-backtick span is still checked. The port's test file has diverged from upstream, so the two new cases follow the local test style. `f83fbe6` picks GNU or BSD `stat` and `date` flags once in `worktree-audit.sh`. `3c596e7` prefers an active PR over branch history in `orch`. `fe096ef` caps `watch-pr` polling sleeps at the deadline. `96dec8e` tells fork heads apart during `watch-pr` stack discovery. The `orch` and `watch-pr` files matched upstream, so the port takes them as written.

**Docs.** `a0b0ad9` notes that Claude Code leaves auto-update off for third-party marketplaces. `README-UPSTREAM.md` takes the e73df47 README text verbatim. The Open Pstack README adds the same note for the `open-pstack` marketplace, with `claude plugin update pstack@open-pstack` for a one-time update. The guide edit in `3c0fdb4` and the regenerated `harness/pstack/` copy in every commit of the range have no local target, as `UPSTREAM.md` records.

## 1.22.0 syncs to Cursor pstack 0.15.30 and adds the statechart skill

Open Pstack 1.22.0 tracks Cursor pstack 0.15.30 at `4ec7ffa173eaa70d3d9467a627baf0954645a353` (#79). It reviews four upstream commits after `d457567`. The manifest halves of `88d4751` and `eb4db2b` only bump Cursor's manifests, which are not shipped. The catalog grows from 57 to 58 skills.

**Sharpen.** `88d4751` restores the prompt that `/sharpen` started with. It asks what a top professional would do that the user did not ask for, the rawest material they would start from, their methods and tools, and what outside check would show the result is right. Then it rewrites the user's prompt to ask for that, and it no longer does the task. The port takes this text. The README, technical reference, and `poteto-help` sharpen rows now describe the new behavior, because the old rows said sharpen approaches the task itself. The recipe line now takes the prompt the user is about to send.

**Statechart.** `eb4db2b` adds `statechart`. It draws what an app's user sees as a Mermaid statechart generated from a TLA+ model, so a PM can judge the behavior without reading the spec. Each state shows whether it works, is still wrong, or is fixed by an open change, and each bug TLC finds is a numbered path. It also turns an agreed chart into a TLA+ skeleton and audits code against an existing spec. `7698375` brings in six fixes, and `4ec7ffa` deletes comments that repeat the code and renames helpers. The scripts use only Node built-ins and name no Cursor path, tool, or model, so the port takes the skill tree byte for byte and adds no Platform note.

**Invocation flags.** Nothing calls `statechart` from the model side. `poteto-help` only points the user at it, so it keeps upstream's `disable-model-invocation: true`. The `UPSTREAM.md` flag list stays at 18 skills, and Claude Code and Pi now have 13 typed-only skills. The static invariant, the Codex and Pi tool maps, the `poteto-help` setup paragraph and troubleshooting row, and the README and reference rows name it in its group.

**CI.** `eb4db2b` runs the skill script tests with `node --test` in Cursor's `validate-plugins.yml`. The port runs the same glob from `.github/workflows/ci.yml` against `plugins/pstack/skills/`. Neither workflow installs TLC, so the TLC tests skip and the rest run.

**Help.** `88d4751` rewrites the `poteto-help` sharpen row and recipe, and `eb4db2b` adds a statechart row. The port takes these.

**Docs.** `README-UPSTREAM.md` takes the 4ec7ffa README text verbatim. The guide edits in `88d4751` and `eb4db2b` and the regenerated `harness/pstack/` copy in every commit of the range have no local target, as `UPSTREAM.md` records.

## 1.21.0 syncs to Cursor pstack 0.15.28 and adds formal verification skills

Open Pstack 1.21.0 tracks Cursor pstack 0.15.28 at `d457567332aa6989e753ea289f30ea2bfbc80bc0` (#75). It reviews ten upstream commits after `019a6a2`. Three of them, `0b8e952`, `0148b78`, and the manifest half of `d457567`, only bump Cursor's manifests, which are not shipped. The catalog grows from 55 to 57 skills.

**Ketchup lists every waiting item.** `16541c6` and `bc14437` make each `/ketchup` call decidable from the reply alone. Each item that waits on the user gets its own bullet with its link, what it changes for users, the evidence behind the pick, its risk, and the pick. Items that share a call share one call line. The reply grows with the item count, and ketchup never cuts or shrinks items to stay under a word count. The rule against drawing status lists and action items moves into the Visuals section. The port takes this text and keeps its substitution of a Mermaid diagram or chart for Cursor's `/visualize`. The README, technical reference, and `poteto-help` ketchup rows now describe the new behavior, because the old "few plain sentences" wording is no longer true. `f9be7aa` adds a ketchup recipe line, and the port takes it.

**Sharpen.** `75fabac` drops the sentence "Don't hand back a rewritten prompt." The port takes this text.

**Formal verification skills.** `4382e68` and `6b78e9f` add `create-formal-verification-skill`. It finds the code where a bug costs the most and tests reach the least, verifies one property there with the tool the question needs, and leaves a project-local skill that rechecks it. TLA+ is the default for event-order questions in any language. When no verifier runs on the language, the agent says so and tests the real code with generated inputs. `7b353f7` has that skill record the covered code and a sync commit, and adds `maintain-formal-verification-skill`, which brings the verification back in line after the covered code changes and reports each check as in sync, updated, bug, or blocked. Both skill bodies name no Claude tool, Cursor path, or model, so the port takes them as written and adds no Platform note.

**Invocation flags.** `f9be7aa` ends `/setup-pstack` with a one-time offer to run `create-formal-verification-skill`. It returns as setup step 13, after the verification-skill offer, and names the bundled skill the way step 12 does. Cursor's note on where the command resolves is left out, as it was for step 12. That call by name means `create-formal-verification-skill` drops upstream's `disable-model-invocation: true`, under the `UPSTREAM.md` rule. Nothing calls `maintain-formal-verification-skill` from the model side. `create-formal-verification-skill` and `poteto-help` only point the user at it, so it keeps upstream's flag, like `maintain-verification-skill`. The `UPSTREAM.md` flag list grows to 18 skills, and Claude Code and Pi now have 12 typed-only skills. The static invariant, the Codex and Pi tool maps, the `poteto-help` setup paragraph and troubleshooting row, the README and reference rows, and the `UPSTREAM.md` flag list name each new skill in its group.

**Help.** `f9be7aa` and `7b353f7` add `poteto-help` rows for both skills, a state check that mentions them, and a recipe. The port takes these. The setup step says the two verification offers run on Codex and Pi, because `/setup-pstack` stops before them on Claude Code when the plugin ships its sheet. `f9be7aa` also rewrites the paragraph on other harnesses to install upstream pstack in Claude Code through the `cursor-plugins` marketplace and its adapter. Open Pstack has neither, so `poteto-help` keeps its paragraph on the three harnesses, and `UPSTREAM.md` records the exclusion.

**Docs.** `README-UPSTREAM.md` takes the d457567 README text verbatim. The guide edits in `f9be7aa`, `7b353f7`, and `d457567` and the regenerated `harness/pstack/` copy in every commit of the range have no local target, as `UPSTREAM.md` records.

**Compaction reinvoke.** The SessionStart hook already ran on compaction, but it only repeated the mandate to invoke poteto-mode before a non-trivial task. Claude Code 2.1.303 keeps the list of invoked skills in process memory. At compaction it attaches each listed skill again, cut to 20,000 characters, so the tail of the 22,149-byte poteto-mode skill is always lost. A resumed session rebuilds that list only from earlier compaction attachments, not from the original Skill call, so its next compaction drops poteto-mode entirely. In 67 local compactions after poteto-mode use, the model invoked it again only 9 times. On Claude Code, `hooks/session-start` now reads the hook input from stdin when stdin is not a terminal. When the source is `compact` and the transcript records a poteto-mode Skill call or `/pstack:poteto-mode` slash command, it appends a `<pstack-compaction>` block. That block tells the model to invoke poteto-mode again before its next action and to continue the playbook and todo list from the summary. Startup, `/clear`, Codex, empty stdin, and a missing transcript print the same context as before. `runner/session-start.test.ts` covers each case.

**Subagent clause.** The context told a session "dispatched as a subagent" to ignore it. A session that the desktop app starts from another session's card begins with a brief from that session. Of ten such local sessions, two never invoked poteto-mode and one invoked it only at its twentieth tool call. Their transcripts do not say why, so the ambiguous clause is a likely cause, not a confirmed one. The clause now names a subagent as one that a subagent tool spawned, Claude Code `Agent` or Codex `spawn_agent`. A session that a person, the app, or another session started with a brief is not a subagent, so the mandate applies to it and to non-trivial tasks that arrive later. Real subagents still see the block when they compact, so the clause stays.

## 1.20.0 syncs to Cursor pstack 019a6a2 and checks that every skill name is its folder

Open Pstack 1.20.0 tracks Cursor pstack at `019a6a20592c10bf92869e5740368f578a9997fd` (#73). It reviews four upstream commits after `182f2ce`. Cursor's manifests still say 0.15.25. The catalog stays at 55 skills.

**Type-guard brand.** `0317eb8` stops the branded-type example from building its brand with `as`, which the skill's own "No `as` casts" row forbids. `parseAgentId` now narrows through an `isAgentId` type guard and returns the input with no cast. The Branded types row in `typescript-best-practices` says a brand comes from a verifying type guard. The port takes this text.

**Skill names match folders.** `a968159` makes upstream's harness generator fail when a skill's frontmatter `name` differs from its folder, and renames `make-bot-ui` and `poteto-mode`. Claude Code lists a skill by its `name`, so a display name such as `Poteto Mode` cannot run as a slash command. Open Pstack has no generator, so `tests/skill-collision-repro.sh` gains a static check with the same rule. The name must equal the folder and use lowercase words joined by single hyphens, at most 64 characters. Every Open Pstack skill already passes. `poteto-mode` already had the right name, and `make-bot-ui` is excluded.

**Claude Code adapter gaps.** `1b80080` extends upstream's Claude Code adapter. It writes model choices to `~/.claude/rules/pstack-models.md`, adds a one-line skip rule for Cursor-only steps, and ships the guide and README in the generated tree. Open Pstack does not take the adapter, so none of this applies. `UPSTREAM.md` records why for each part.

**Docs refresh.** `019a6a2` edits the upstream guide and README and adds `scripts/check-pstack-docs.mjs`, which checks them against the skill tree. `README-UPSTREAM.md` takes the new README text verbatim. The guide edits and the check have no local target, because Open Pstack does not ship the guide or the upstream README as skill content.

## 1.19.0 syncs to Cursor pstack 182f2ce and cuts marginal sections from four skills

Open Pstack 1.19.0 tracks Cursor pstack at `182f2ce414e83224915c190d2f63239c1608d0a5` (#71). It reviews two upstream commits after `e5136d8`. Cursor's manifests still say 0.15.25. The catalog stays at 55 skills.

**Section cuts.** `99743e9` removes text that agents follow as well without it. Interrogate's lead-judgment reference drops its preamble, the section on why the step matters, and Verdict Calibration, and keeps the filtering principles. Swarm drops its opening summary, Phase A item 3, which set N, and the Phase C sentence about a compact result table. `principle-type-system-discipline` keeps the bullets on branded primitives, parsing at boundaries, and authoritative schemas, and its description drops "refuse to lie to the compiler". `principle-migrate-callers-then-delete-legacy-apis` keeps the test bullet and the conditions. The port takes this text. Swarm keeps its dispatch contract and its descriptor step, and the two principle leaves keep `user-invocable: false`.

**Claude Code harness tree.** `182f2ce` installs upstream pstack in Claude Code from a generated copy under `harness/pstack/`. That copy adds an adapter, `docs/harness/claude-code.md`, which the model reads to map Cursor names at run time. Open Pstack already writes those names into the shared tree, so the port does not take the generated tree or the adapter. `UPSTREAM.md` records this exclusion. `README-UPSTREAM.md` takes the new README lines verbatim: the Claude Code install commands, the generator note, and the note that benny is Cursor-only.

## 1.18.0 removes undocumented drift from Cursor pstack 0.15.25

Open Pstack 1.18.0 keeps the Cursor pstack 0.15.25 sync that 1.17.0 imported (#69). A three-way audit compared every port file with upstream `e5136d8`. Differences caused by a Cursor-only or Grok-specific primitive stay. Every other difference now matches upstream or is documented here, in `UPSTREAM.md`, or in the technical reference. The catalog stays at 55 skills.

**Delegation and reply text.** Feature step 4 said the delegate owns the diff and never launches a nested agent. That rewrite came from `053ed78` and bound the wrong agent. Upstream lets a subagent that cannot spawn meet the mandatory delegation by owning the diff with the same review separation, and the port takes those two sentences back. The same commit dropped upstream's tiering clause from poteto-mode's Defaults. The hardest changes again read `hardest tasks` whether they need judgment on vague intent or are a precisely specified sequence of steps. The "Terse is not an excuse" bullet and the Bug fix Reply line came from an undocumented pstack-claude change that banned section headers and trimmed repro output. Both take the upstream text, and no other Writing-the-reply bullet bans sections.

**Verification-skill offer.** Upstream `e42d29f` ends `/setup-pstack` with a one-time offer to generate a verification skill when the project cannot drive its real app. The 0.9.10 sync imported `create-verification-skill` from the same change but missed this step. It returns as setup step 12 and names the bundled skill the way other port skills do. Cursor's note on where the command resolves is left out. On Claude Code with a shipped sheet, setup stops before step 1, so the offer reaches Codex and Pi parents and Claude Code without a shipped sheet.

**Transcript directory.** The skills said Claude Code names a project's transcript directory by turning each `/` in the cwd into `-`. Recall also said the leading slash is dropped, though its own example kept the leading `-`. On Claude Code 2.1.300 every character other than ASCII letters, digits, and `-` becomes `-`, and the leading `/` becomes a leading `-`. A checkout under `github.com` maps to `github-com`, so the old rule named a directory that does not exist. Recall, Automate-me, Reflect, Show-me-your-work, Session pickup, Eval, the `worktree-audit.sh` comment, and both substitution tables state the observed rule.

**Typed-only skills.** Releases 0.9.8 through 0.9.11 removed upstream's `disable-model-invocation: true` from many skills because each had a command trampoline, and 1.0.1 deleted every trampoline. The rule since 1.9.0 keeps a skill model-invocable only when something must call it by name from the model side. `blast-radius`, `bro`, `maintain-verification-skill`, `recall`, `reflect`, and `teach` have no such caller, so they take upstream's flag back. That makes eleven typed-only skills on Claude Code and Pi. The Codex and Pi tool maps, the `poteto-help` setup paragraph and troubleshooting row, the README and reference rows, and the static invariant name all eleven. The worktree cleanup playbook named "the **recall** skill" only to say who reads transcripts, so it now names `recall` without that routing form. The `UPSTREAM.md` flag bullet now lists the 17 skills that stay unflagged and what calls each one. Its old reason for `typescript-best-practices` was wrong. Nothing routes it, but its `paths` frontmatter loads it on Claude Code and the Codex and Pi maps start it by name. The routed-skill invariant now checks all 17.

**Missed upstream lines.** The Databricks source in `why` drops the `databricks-use-dbt-models` pointer that upstream `3fe2823` removed, because no such skill ships. `no-comments` says Comment Sicko in prose again. Only the `subagent_type` id needed the `comment-sicko` form, and it keeps that form. Babysit step 1 takes upstream's heading, which dropped "in your first line". Opening a PR drops a port-only ", per `babysit.md`", and Autopilot-full takes upstream's "repo's checks". Automate-me's Platform note no longer names `claude-*` slugs the skill does not use, and the file takes upstream's trailing blank line.

**Cross-judge rule.** Arena and the setup cross-judge pool prefer a judge whose provider differs from the parent and from the likely base candidate. Upstream prefers a model family different from the parent's. The port routes by provider, and the judge should not have written the candidate it most likely picks. Both substitution tables now record this.

**Documentation.** `UPSTREAM.md` drops the `23a56e2` Fable-defaults bullet, because Grok replaced those defaults upstream too and no divergence remains. The `gpt-6.1-sol` and `70b2dc8` panel bullets merge into the `df58112` bullet with every fact kept. `NOTICE.md` lists the remaining port-authored files: `pi-tools.md`, `provider-dispatch.md`, `pstack-models.md`, the runner, `check-plan.tsconfig.json`, and the Sonnet and Haiku lanes. It gains a provenance row for the restored upstream text. The technical reference adds `pi-tools.md` to the layout, says how `poteto-agent` differs from the upstream prompt, and notes that upstream's `pstack/.gitignore` ships nothing. The Codex port maintenance note counts 24 `principle-*` leaves.

## 1.17.0 syncs to Cursor pstack 0.15.25, restates four principles as reasoning, and has ketchup explain changes with pictures

Open Pstack 1.17.0 tracks Cursor pstack 0.15.25 at `e5136d82418d2db3165ea1050d17577cd618cc05` (#67). It reviews three upstream commits from `afd51cf` through `e5136d8`. Two change content here. `6ce45c5` only bumps Cursor's manifests, which are not shipped. The catalog stays at 55 skills.

**Principles.** `e5136d8` restates four principles as the idea an agent needs, instead of rules about specific mechanisms. `principle-test-behavior-not-implementation` judges each test against two imagined edits. A test must fail when the behavior breaks and keep passing when only the internals change. `principle-fix-root-causes` traces a symptom to the first place the system went wrong. A guard counts as a fix only when the state it handles is legitimate. `principle-attack-the-premise` writes the failed fixes' shared premise down and tests it directly, looking at how the failures are distributed. `principle-make-operations-idempotent` derives each step from the state that exists and requires anything a crashed run leaves behind to be recognizable as stale. Upstream also syncs the poteto-mode index lines, the `correct` test step, and the README rows. The port takes all of this text and keeps `user-invocable: false` on each leaf in place of upstream's `disable-model-invocation: true`.

**Test-behavior exclusion retired.** Since 1.4.0 the port kept its own text for `principle-test-behavior-not-implementation` and `principle-attack-the-premise`. Upstream required every test to fail when each import returns `undefined`, which condemned valid absence and relation tests. It also required an actor census for every premise. The new upstream text drops both rules. It keeps an absence assertion when absence is the contract, paired with a case where the effect happens. It keeps invariant tests across tables and compile-time type checks. It tests a premise by whatever observation would differ if the premise were false. So the port takes the upstream text, and `UPSTREAM.md` no longer lists the `00b14f1` test-behavior exclusion.

**Ketchup.** `afd51cf` has `/ketchup` help the user understand each change, not only where it stands. The reply embeds the screenshots and videos the work produced, then any diagram that explains a change, then one short bullet per thing the user asked for. It draws a picture only where one explains better than sentences, and never draws a status list or unconnected boxes. Action items are plain bullets. A choice shows each option's gain and cost under its screenshot, or side by side when no screenshot shows it. Visuals no longer count toward the 150-word limit. The port keeps its existing substitution for Cursor's `/visualize`. A visual is "a Mermaid diagram or chart", and numbers use "a Mermaid chart". The one-line ketchup descriptions in the README, the technical reference, and `poteto-help` stay true and do not change.

## 1.16.0 syncs to Cursor pstack 0.15.24 and matches each subagent's reasoning level to the job

Open Pstack 1.16.0 tracks Cursor pstack 0.15.24 at `1e5c90a4b6f249917bd21fe361b3a2a7deb741b8` (#65). It reviews four upstream commits from `ce649c0` through `1e5c90a`. Three change content here. `1e5c90a` only bumps Cursor's manifests, which are not shipped. The catalog grows from 54 to 55 skills.

**Model to the job.** `ce649c0` adds a rule to poteto-mode's Subagents section. Before each spawn, the parent starts from the role's descriptor effort and moves it for the job: one step up, to at most `max`, for the hardest or subtlest work, one step down for judgment, and two or more steps down for routine work. The descriptor holds the starting effort, because `/setup-pstack`'s budget only proposes efforts. The result stays within the family's Selectable efforts in `provider-dispatch.md`, which replaces upstream's "nearest slug". The family, model, and provider never change, so a diverse panel stays diverse. Verification stays on the `swarm workers` descriptor, and `auto` and `inherit-parent` stay on the parent model. If a route rejects the adjusted effort, the parent reruns once on the configured descriptor and says so, and a rejected external lane keeps its receipt as a dropout. It never moves to another family, provider, or the parent model. `provider-dispatch.md` names where each route takes the adjusted effort: the `Agent` call's `effort` or the `pstack-<stem>-<effort>` agent on Claude Code, `reasoning_effort` on Codex, the Lody item's `reasoningEffort` on Pi, and the runner's `--effort`.

**Speed is not ported.** Upstream also picks fast or standard speed per spawn and keeps fast mode for urgent work. No Open Pstack route has a per-spawn speed setting, because `fast` is only part of Cursor's Grok selector. The pointer sentence that upstream adds to Arena, Automate-me, Figure-it-out, How, Interrogate, No-comments, Recall, Reflect, Show-me-your-work, Swarm, Why, and thirteen playbooks drops the words "and fast or standard speed". The Arena and Interrogate fallback prefixes for `cursor-grok-*` and `composer-*` are not applied either, because the port already leaves out those fallback lines. `UPSTREAM.md` records both exclusions.

**Delegate wording.** Upstream removes poteto-mode's sentence that `/poteto-mode` and `poteto-agent` route through the same wrapper, because it contradicts the rule that the receiving chat runs the playbook. The port removes it too and keeps the rest of its Subagents section.

**Shipping.** `ce649c0` cuts Shipping from nine steps to six and says why each rule holds. After a merge, the next PR is retargeted to trunk, its patch moves onto the merge result, and the patch ID rule decides whether its verdict survives. The port takes that shape and keeps its landing safety contracts inside the new steps. These are the base and head remotes resolved by role, the disarm and merge-queue check before verification and before every mutation, and the captured-SHA lease on every rewrite. They also include the server-enforced expected-head merge, the SHA-scoped check that gates auto-merge, and the head and base guard while watching. Verifiers are background subagents in worktrees that use the `run` or `verify` skill. The watcher runs at its installed-plugin path with the base repository pinned, and every GitHub PR command names `--repo "$base_repo"`. Opening a PR points stacked children at Shipping step 4.

**Autopilot.** Autopilot-full keeps upstream's rules and their reasons. A full swarm runs once at the code-ready head, and a rebase, conflict resolution, or minor fix gets one verifier. The lease is pinned to the SHA the owner last pushed. When trunk changed a caller of the patch or a dependency, the owner runs the patch's checks on the merge result. A third rebase past merge prep holds and goes to the root. Upstream removes the private-stack exception, so the fork rules the port attached to it go too. Owners are background subagents, and their trails stay uncommitted in their worktrees with a `children.tsv` of retained handles. The tick still re-reads the installed playbook and arms the hourly cadence on Codex and Pi. Upstream's stuck-after runtime is not ported: only failure evidence marks an agent stuck, and an owner with no push or trail row by the first tick is drift to record. Autopilot-stack now states only where it differs from Autopilot-full and keeps the same-repository and fork base rules. The landing invariants in `tests/skill-collision-repro.sh` read each numbered step with its indented paragraphs and follow the new step numbers.

**Multi-phase plan and Orchestrate.** The plan skeleton runs one full swarm per PR at the code-ready head and a single verifier for small follow-ups. Orchestrate resolves its frontier from the PR base chain with `gh`, or with `origin` through `--forge origin`, and one stacker owns chain rebases, retargets, and merges. No playbook requires Graphite now, so the technical reference and the Codex tool map drop it.

**Scripts.** The `orch` and `watch-pr` changes are upstream verbatim. `orch frontier set` walks the PR base chain, and `watch-pr` maps a Code Review Gate that waits on an owner approval to the approval gate. `worktree-audit.sh` takes upstream's Origin PR column on top of the port's transcript scan and missing-tool warnings.

**Ketchup.** `8043881` has the Autopilot-full tick and both autopilot replies catch the operator up with `/ketchup`. `ketchup` is typed-only, so on Claude Code and Pi the model cannot load it by name. The playbooks point at `skills/ketchup/SKILL.md` under the installed plugin instead. This also keeps the static invariant that bans routing to a user-only skill by name.

**Sharpen.** `79afd75` adds `sharpen`. It has the agent ask how a top expert would approach the task, what the user is really after, and whether the task is over- or underspecified, then do the work. The skill file is the upstream text. It is typed-only like `correct`, `in-your-own-words`, `ketchup`, and `poteto-help`. The Codex and Pi tool maps, the `poteto-help` setup and troubleshooting text, and the user-only static invariant name it. `poteto-help` gains a routing row and a recipe, and the README and the technical reference gain a row.

## 1.15.0 runs configured poteto-mode delegates as poteto-agent

Open Pstack 1.15.0 keeps the Cursor pstack 0.15.23 sync that 1.14.0 imported. A code delegate with a configured role now loads poteto-mode and still runs on the role's model and effort (#62).

**The failure.** On Claude Code, a role such as `feature, refactoring: claude:opus@medium` dispatched through the `pstack-opus-medium` agent. That agent has no `skills` preload, and its body tells the child not to start a pstack workflow. A live 1.13.0 session spawned its implementation delegate this way, and the child never read poteto-mode. The delegate got the configured model but lost the playbook's rules.

**Delegates.** Upstream spawns poteto-mode's own delegates as `poteto-agent` and sets the role's model on the same call. The port now does the same. The Native lanes section of `provider-dispatch.md` names two kinds of child. A poteto-mode delegate is one that poteto-mode or a playbook spawns for a configured role: a code role, `hardest tasks`, `judgment and prose`, or a multi-phase plan explorer. On Claude Code it is `subagent_type: "poteto-agent"` with the `Agent` tool's `model` set to the family alias and `effort` set to the descriptor's effort. That holds for Fable, Opus, Sonnet, and Haiku. On Codex it is a `spawn_agent` with the model, `reasoning_effort`, and an instruction to read poteto-mode first. On Pi it is a Lody item with the `poteto-agent` prompt row and the mapped model and effort. The poteto-mode Subagents section no longer exempts provider-qualified roles from `poteto-agent`, so the 1.14.0 divergence from upstream's wording is gone.

**Effort probe.** The `Agent` tool applies `model` and `effort` to a `poteto-agent` child. From an Opus `high` parent, a call with `model: sonnet` and `effort: low` produced a child transcript whose turns record `claude-sonnet-5-5` and effort `low`. An earlier `pstack-opus-medium` child recorded effort `medium`, so both routes carry the requested effort.
**Routed-skill boundary.** Lanes that a routed workflow skill spawns keep the `pstack-<family>-<effort>` agents. These are arena runners and cross-judges, architect runners, interrogate reviewers, swarm workers, the how explorer and explainer, and the why and reflect roles. Those agents still tell the child not to start a pstack workflow. This matches upstream, where routed skills pick their own subagent type and poteto-mode does not override it. The lane descriptions now say that they serve routed workflow skill roles and that a poteto-mode delegate uses `poteto-agent`. The old wording, "pstack roles configured as claude:opus@medium", matched a code role's descriptor word for word. The `poteto-agent` description now says to set a configured role's `model` and `effort` on the call. `/setup-pstack` still probes each Claude family through its `pstack-<stem>-<effort>` agent, because the delegate uses the same model and effort pair.

**External delegates.** An external runner child cannot preload a skill. For a poteto-mode delegate on an external lane, the parent now starts the prompt file with the `poteto-agent` body and poteto-mode's absolute `SKILL.md` path, where the child can read it. Runner probes from a scratch `--cwd` read the installed `SKILL.md` and a principle leaf on Codex in `read-only` and `isolated-write`, on magpie in `isolated-write`, and on Claude in `read-only`. The runner code did not change.

**Gap.** A `claude` external lane in `isolated-write` cannot read poteto-mode. Claude print mode with `acceptEdits` refused both `Read` and a `Bash` `head` of the file, because it reads only inside the session's working directory. The Grok route is unprobed, because the probe machine has no Grok CLI. Those two lanes still run a poteto-mode delegate without poteto-mode. This affects a Codex parent with a `claude:*` code role, and any parent with a `grok:*` code role, which is the first-run default. Closing the Claude gap needs a runner change, such as an extra readable directory for the child, and that route is unverified.

## 1.14.0 syncs to Cursor pstack 0.15.23 and requires poteto-agent for every helper

Open Pstack 1.14.0 tracks Cursor pstack 0.15.23 at `c86f349b102feb91f1966f8a6a60882a4e601b50` (#60). It reviews nine upstream commits from `364a77e` through `c86f349`. Seven change content here. `997ffc7` and `3177dab` only bump Cursor's manifests, and the manifest bump inside `dbf4981` is not ported either. The catalog grows from 53 to 54 skills. The same release makes `poteto-agent` required for every helper that a playbook step spawns (#61).

**Bundled skill path.** `364a77e` says that bundled skills live at `../<name>/SKILL.md` from poteto-mode's file. It tells the parent to put that file's absolute path in every `poteto-agent` prompt, and `poteto-agent` reads poteto-mode from that path. The line holds on all three harnesses as written. Claude Code, Codex, and Pi install the same `skills/` tree. Each also has a `poteto-agent` prompt: the Claude agent prompt, the Codex `spawn_agent` instructions, and the Pi item prompt.

**Path fallback.** `b93e811` lets upstream's `poteto-agent` search `~/.cursor/plugins/` when its parent passes no path. That search reads a Cursor directory and a Cursor manifest, so it is not ported. The Claude agent preloads `pstack:poteto-mode`, and with no path it now uses that copy. `UPSTREAM.md` records the exclusion. The same commit drops the `mode` and `reminder` keys from poteto-mode. Open Pstack never ported sticky mode, so neither key was there. Upstream's README line about picking `/poteto-mode` from Cursor's `/` menu goes into `README-UPSTREAM.md`. The Open Pstack README already shows the Claude Code form, `/pstack:poteto-mode` followed by the task, so it does not change.

**In your own words.** `7d8d909` adds `in-your-own-words`, and `dbf4981` rewords it. The skill restates what the agent thinks the user's goals are and what problem they are trying to solve. The skill file is the upstream text. It is typed-only like `correct`, `ketchup`, and `poteto-help`. The Codex and Pi tool maps, the `poteto-help` setup and troubleshooting text, and the user-only static invariant name it. `poteto-help` gains a routing row and a recipe. The README and the technical reference gain a row.

**Ketchup.** `d00ba6e` and `c86f349` rewrite `/ketchup` as a short reply in `/bro`'s voice. The whole reply stays well under 150 words, counting the words inside visuals and tables. It shows what happened in one visual of at most four boxes. Each action item gets two lines and a before and after visual. A Markdown table no longer counts as a visual. The skill file is the upstream text with one substitution. Upstream names a chart or diagram from `/visualize`, and Claude Code, Codex, and Pi ship no such skill. The port names a Mermaid diagram or chart instead. `poteto-help`, the README, and the technical reference take the new description.

**Always-on signal.** `36cecbf` adds one rule to `principle-fix-root-causes`. When the deciding fact took a deep dig to find, the agent proposes the cheap, always-on signal that would have shown it at first look. The leaf keeps `user-invocable: false`.

**poteto-agent for every helper.** Upstream's Subagents section says to use `subagent_type: "poteto-agent"` for any subagent spawned inside a playbook step. Commit `053ed78` softened that to "prefer `poteto-agent`" when it added provider dispatch. It also replaced the default that forbade a subagent type that strips tools. A live 1.13.0 session on Claude Code then spawned the built-in `Explore` type for three read-only investigations, and none of the children loaded poteto-mode. The Subagents section is a command again. Every subagent in a playbook step uses `poteto-agent`, read-only investigation and search helpers included. A role set to `inherit-parent` or `auto` uses it too.

**Divergence from upstream wording.** Upstream exempts only the spawns of routed workflow skills. Open Pstack also exempts provider-qualified roles, which follow provider dispatch. It names Claude Code's built-in `Explore`, `general-purpose`, and `Plan` types as never used, because the harness describes `Explore` in words that match an investigation brief. Codex and Pi have no such types, so that sentence names Claude Code. The delegation defaults now say to put the access mode and the needed tools in the brief instead of choosing an agent type that strips tools. The `poteto-agent` description names read-only investigation and search tasks and warns against `Explore`. On Pi, a read-only helper's `poteto-agent` prompt takes the read-only contract, which is the only read-only guard Pi has.

## 1.13.0 adds Sonnet and Haiku lanes and routes Claude Code to the magpie relay

Open Pstack 1.13.0 keeps the Cursor pstack 0.15.20 sync (#58). The operator wants cheaper Claude lanes and relay models in Claude Code panels. This release adds both. Claude Code still never calls the relay itself.

**Sonnet and Haiku.** `claude:sonnet@<effort>` and `claude:haiku@<effort>` are valid descriptors at all five efforts. `provider-dispatch.md` lists them in a new Additional Claude families table beside the model matrix. The four-row matrix stays as is, because it mirrors upstream's families and drives first-run defaults and default panels. The new families never join those defaults; a role uses one only when the operator assigns it. Claude Code dispatches them natively through ten new agents, `pstack-sonnet-<effort>` and `pstack-haiku-<effort>`, shaped like the Opus agents. A Codex parent reaches them through the Claude CLI. Haiku works there only in `isolated-write`: the runner runs read-only lanes in Claude plan mode, which serves `--model haiku` with `claude-sonnet-5-5`, so verification drops the lane. A Pi parent does not route them. `claude -p --model sonnet|haiku --effort low|medium|high|xhigh|max` exited 0 and returned the marker for every pair. Its JSON reported `claude-sonnet-5-5` and `claude-haiku-5-5`.

**Rolling aliases.** `model-aliases.ts` now derives every rolling-alias check from one table of `fable`, `opus`, `sonnet`, and `haiku`. Before, only `fable` and `opus` were rolling aliases. A runner lane with `--parent codex --provider claude --model sonnet` exited 65 with a `malformed-output` receipt, because the reported `claude-sonnet-5-5` did not match `sonnet`. The runner now verifies that report and rejects a `claude-sonnet-*` or `claude-haiku-*` version pin like a Fable or Opus pin. Read-time normalization in `provider-dispatch.md` and `setup-pstack` covers all four families.

**Relay from Claude Code.** A Claude Code parent now routes `magpie:*` descriptors through the external runner. The runner's `codex exec` child sends the request to the relay with `model_provider="magpie"`. The runner already accepted `--parent claude --provider magpie`: a live run of `wevnal/glm-5.3-flash@high` ended with a `complete` receipt and `pinned-argv` model evidence. Only the route table and setup policy forbade the route. Setup now offers relay families to a Claude Code parent and probes them with the same one-turn runner probe a Codex parent uses.

**Shipped sheet.** `plugins/pstack/pstack-models.md` moves code roles to Opus at `medium` and keeps judgment roles on Opus at `high`. Haiku takes the how explorer and Sonnet takes swarm workers. The arena panel runs Sonnet, Sol, and both relay families. The cross-judge pool, architect, and interrogate panels pair Opus with Sol.

**Codex child tool surface.** Runner `codex` and `magpie` children now start without ChatGPT apps and with every MCP server from the user's Codex config disabled. Before, they loaded all of them. Relay models have no Codex model metadata, so Codex inlined every tool definition: one `Reply with exactly: X` prompt to `wevnal/glm-5.3-flash` sent an 805 KB request and cost 176,541 input tokens. With apps and servers off, the same prompt sent 56 KB and cost 11,676 tokens. The runner reads `codex mcp list --json` during preflight with the child's `--disable` feature flags, so plugin-provided servers the child never loads are left out. It then passes `--disable apps` and one `mcp_servers.<name>.enabled=false` override per enabled server. A failed or malformed listing is a preflight dropout. So is an enabled server whose name contains a character outside letters, digits, `_`, and `-`, because Codex's `--config` parser cannot address it.

## 1.12.0 syncs to Cursor pstack 0.15.20 and dispatches Pi through Lody sessions

Open Pstack 1.12.0 tracks Cursor pstack 0.15.20 at `1b6d44ff26d4e242f4e8f68c391e6d2f7ca16def` (#56). It reviews eleven upstream commits from `ea32d95` through `1b6d44f`. Eight change content here. `de2dba6` was already in place, `1b6d44f` only bumps Cursor's manifest, and `e5a02f8` is excluded. The catalog stays at 53 skills. The same release moves every Pi lane to a Lody session (#54).

**Ketchup visuals.** `ea32d95` gives each `/ketchup` action item a side-by-side before and after. The agent makes the visual from what it already has and says so when none exists. The skill file is the upstream text.

**Section cuts.** `08bd59b` removes sections that the agent follows without the text. The how explorer prompt, four why source references, and four principle leaves take the upstream text. The leaves keep `user-invocable: false`. The babysit playbook loses the paragraph on watcher re-arms and its Reply line, and step 9 still says that babysitting never authorizes merging. The worktree cleanup playbook loses its opening ownership line.

**Comment Sicko id.** `de2dba6` renames upstream's agent from `Comment Sicko` to `comment-sicko` so Grok can spawn it. The port has used that id since it first imported the agent. Only `NOTICE.md` and the technical reference change, because the id is no longer a port change.

**Fenced plan checks.** `87c8103` makes the plan checker follow CommonMark fences. A fence opens with up to three spaces of indent and three or more backticks or tildes, and a backtick info string may not contain a backtick. Only the same character at the same or greater length closes it. `check-plan.mjs` takes the rule in the port's typed style. `check-plan.test.ts` gains upstream's fence cases and asserts the port checker's own messages. Four of the five new cases failed against the old checker. Upstream's `package.json` hunk adds the test to its script, and the port's script already runs it.

**Review-thread pagination.** `ff8f83d` makes `watch-pr` read every page of review threads. Before, an unresolved thread past the first 100 never blocked readiness. The six `watch-pr` files are the upstream text.

**Unslop description.** `bc697d0` drops "Must always apply." from the unslop description. Upstream drops it because unslop is not model-invocable there. Unslop stays model-invocable here, so the port's reason differs. The description sits in the skill list that every session loads, and the phrase reads as an unconditional order. Poteto-mode still routes every prose surface to unslop by name.

**Worktree audit base.** `cf9a111` checks `MERGED` against the remote's default branch instead of a literal `origin/main`. Without `-b`, the base is `origin/HEAD`, then `origin/main`, then `origin/master`. The fetch runs before the existence check, `-h` prints the usage, and the table opens with a `# base:` line. The script keeps the `~/.claude/projects` transcript scan and the `jq` and `rg` warnings. A scratch repository whose default branch is `master` exercised the no-flag, `-b`, and `-h` paths. The cleanup playbook shows the new usage and keeps the installed-plugin path.

**Runner and delegate.** `2bd5dd4` makes the chat that receives `/poteto-mode` the runner and `poteto-agent` a delegate. Upstream's reason is that a subagent spawned to run the playbook is nested, so it cannot fan out the playbook's lanes. `poteto-agent` takes the new description with `general-purpose`, keeps its `skills` preload, and omits `is_background`. Its body names `Agent` spawns instead of `Task` spawns. Poteto-mode's Subagents section and the technical reference say that the receiving chat runs the playbook. The SessionStart context, `poteto-help`, and the Codex, Pi, and provider-dispatch references already treat `poteto-agent` as a helper, so they do not change.

**Verification readiness.** `c49b37a` makes readiness in create-verification-skill mean a usable app, not a port that answers. A journey that the seed data cannot satisfy reports a failure in its feature's Gotchas. Setup that a stand-in did stays unverified until a run on the real target covers it. Step 3 keeps the `.claude/skills/verify-<app>/` path.

**Agent Plugins manifest excluded.** `e5a02f8` adds a root `pstack/plugin.json` in the Agent Plugins 1.0.0 format. Codex 0.162.1 also reads that format, next to `.codex-plugin/plugin.json`, and which one it prefers is unverified. If the root file won, Codex would lose the SessionStart hook and the interface block. `UPSTREAM.md` records the exclusion.

**Upstream README.** `README-UPSTREAM.md` takes the upstream README verbatim. It gains the runner and delegate wording and the `comment-sicko` subagent type.

**Pi through Lody.** Every Pi lane is now one Lody session (#54). Lody is an agent IDE that runs each agent in its own session and worktree, and the maintainer runs Pi only inside it.

**Why.** pi-subagents is gone, so the old route had no runtime. Lody injects its own `subagent` tool, but it takes only a task and a description, always runs the parent's model, and starts no worktree. It cannot carry a pstack descriptor, so pstack does not use it.

**The route.** Once per parent run, the parent calls `lody_session_create_options` and takes the machine id, the Pi agent config id, the project id, and that config's model ids and effort values. Each fan-out phase is one `lody_session_create_many` call of up to 20 items, with more calls in the same phase when lanes exceed 20. `codex:<model>@<effort>` maps to `modelId` `magpie/codex/<model>`, `magpie:<model>@<effort>` maps to `magpie/<model>`, and both pass `reasoningEffort` `<effort>`. A descriptor whose model id or effort the config does not list is a named dropout. `inherit-parent` and `auto` omit the model, so the lane runs Pi's configured default, and the synthesis says so. A lane that touches the repository gets a Lody worktree, and a lane that needs no checkout gets a chat work context. Lody delivers the batch result as one continuation. The parent proves each lane's model from the Pi transcript whose directory name contains the Lody session id, and archives the session only after it has taken what it needs. Setup probes on a Pi parent use the same call with a chat work context.

**Lane prompts replace the agents.** The four pi-subagents agents (`pstack.lane`, `pstack.lane-readonly`, `pstack.poteto-agent`, and `pstack.comment-sicko`), the `preload-poteto-mode.ts` extension, and their tests are deleted. The contract each agent carried now travels in the item prompt. The poteto-agent prompt starts with `/skill:poteto-mode `, which a Lody Pi session expands into the skill body. `package.json` lists only the skill tree, and `pi-package.test.ts` fails when a `pi.subagents` entry returns.

**Read-only gap.** Pi under Lody has no permission or read-only mode. The read-only contract in the prompt is the only guard.

**Deadline.** Every call passes `deadlineSeconds: 604800`, Lody's maximum. Lody enforces that bound on every Operation. It is not a pstack timeout, and pstack adds no other limit. At the deadline Lody marks an unfinished item `failed` with `TARGET_TIMEOUT` and does not cancel its session. The parent checks the session with `lody_session_status_many`, cancels a still-running child with `lody_session_cancel`, and records the dropout.

**Claude Code and Codex.** Unchanged. The Claude agents, Codex `spawn_agent` dispatch, and the external runner keep their routes. Only Pi rows, bullets, and sentences in the shared files changed.

## 1.11.1 finds the reflect transcript in Claude Code's layout

Reflect step 1 lists `~/.claude/projects/<encoded-cwd>/*.jsonl` and picks the file that holds the conversation's opening prompt (#51). Two lines in that step described Cursor's transcripts, not Claude Code's.

**Layouts.** The step claimed the listing covered flat, nested, and subagent layouts. Claude Code writes each main session as a flat `<id>.jsonl` and puts subagent runs under `<id>/subagents/`. It writes no nested `<id>/<id>.jsonl`. In the 1.11.1 live gate, the old sentence led the model to add a `*/*.jsonl` glob, which zsh rejected with "no matches found". The listing already finds every main session, so only the sentence changes. It names the flat layout and says to skip subagent runs.

**Match.** The step compared the opening prompt with the first JSONL line's `message.content[0].text`. In Claude Code transcripts the first lines are metadata records, such as `last-prompt` and `mode` in interactive sessions or `queue-operation` and `attachment` under `claude -p`. That rule cannot match. In the gate's two runs on the old text, the model ignored it and grepped the whole file for the prompt, so it still found the right transcript. The step now names the record that holds the prompt: the first one whose `type` is `user`, with content that is a string or a list of blocks. The run on the new text selected that record with `jq` and passed the matching file to all three reviewers.

## 1.11.0 syncs to Cursor pstack 0.15.17

Open Pstack 1.11.0 tracks Cursor pstack 0.15.17 at `978ca6e9c0e012047cd5058b8e829240336e704e`. It imports two upstream commits, `00b14f1` and `978ca6e` (#50). The catalog grows from 52 to 53 skills.

**Prompt distillation.** `00b14f1` shortens 35 skill prompts to cut tokens. Twenty files take the upstream text or a clean three-way merge. The other fifteen keep their Open Pstack adaptations on top of the shorter prose. Each adaptation below is one the port already documents.

**Dispatch adaptations.** Arena, How, Interrogate, Reflect, and Why keep the dispatch contract and their model sheet lines. Upstream's Task tool, `generalPurpose`, `readonly`, `pstack-models.mdc`, and Cursor slug lines are not applied. Arena and Interrogate keep the four-lane panel and the no-fallback rule, so the closest-slug fallback stays out. Arena takes upstream's one-line todolist. Its dropout note no longer names a synthesis record, because the Outputs section already lists dropouts. How takes upstream's numbered steps and names both role lines in one paragraph.

**Why keeps MCP access.** A clean-merged upstream line told every Why lane to run as `generalPurpose` with `readonly: false` and banned Ask mode. Those are Cursor modes. The line now says that every lane keeps the parent's MCP access, that a mode without it disables the MCP-backed investigators and the synthesizer's citation spot-checks, and that investigators and the synthesizer do not write files.

**Reflect.** Reflect takes upstream's flatter layout and its one-paragraph rule for which skills a reviewer may route to. The transcript step keeps Claude Code's per-project directory. The three reviewer references keep the `.claude/` skill paths and the `Agent` prompt. Skill authoring routes to `plugin-dev:skill-development` instead of Cursor's `create-skill`.

**Poteto-mode.** The principle index and the playbook list take upstream's form. Entries drop their skill names and file paths, and one rule derives each leaf name and playbook path from the title. Every derived name maps to an existing file. The port keeps `AskUserQuestion`, `plugin-dev:skill-development`, the bundled `babysit` skill, the review-bot wording, the autopilot-stack fork text, and "a session restart". The Attack the Premise and Test Behavior lines keep their 1.4.0 corrections.

**Opening a PR.** The playbook takes upstream's shorter Commits, PRs, Titles, and Descriptions text. The `cursor-team-kit` source and the 40-line commit cutoff stay out. Upstream's reworded built-in PR tool paragraph stays out too. The port's forge, fork-stack, readiness, and babysit text does not change.

**Descriptions kept.** `00b14f1` shortens the descriptions of `figure-it-out`, `principle-model-the-domain`, `principle-never-block-on-the-human`, and `principle-redesign-from-first-principles`. Upstream ships these four with `disable-model-invocation: true`, so their descriptions do not trigger them there. Here `figure-it-out` stays model-invocable, and the three leaves carry `user-invocable: false`, so the model can still load all four. The description is what triggers them, so the port keeps its descriptions and frontmatter and takes only the body cuts.

**Test behavior kept.** Upstream distills the original `principle-test-behavior-not-implementation` rule, which rejects any test that would still pass when every import returns `undefined`. The port corrected that rule in 1.4.0, and upstream has no matching correction. The leaf and its poteto-mode index line keep the 1.4.0 text.

**New skill.** `978ca6e` adds `ketchup`. It catches the user up on everything in this chat since their last message, in plain words, and gives each decision that waits on the user a short executive summary. The skill file is the upstream text. `poteto-help` gains its routing row and a close call that separates it from `recall`.

**Typed-only ketchup.** Ketchup ships with `disable-model-invocation: true`, and nothing routes it by name, so it joins `correct` and `poteto-help` as a typed-only skill. The Codex and Pi tool maps, the `poteto-help` setup paragraph and troubleshooting row, and the user-only static invariant now name it. The README and the technical reference gain a row. Codex ignores the flag, so ketchup stays in the model's skill list there. The Codex map says to start it only when the user asks for it by name.

**Upstream README.** `README-UPSTREAM.md` takes the upstream README verbatim. The only change is the `/ketchup` row.

## 1.10.1 classifies the sheet file and the mirror block by one table

On Codex and Pi, setup writes the model sheet to a file and mirrors its bytes into a `pstack:models` block in the global `AGENTS.md`. Sessions load only the block, so the block is the configuration in effect. Setup step 2 had no rule for a block without a file, and `poteto-help` checked only the file (#48). In the 1.10.0 live gate on Codex 0.160.1, with only the file renamed away, setup chose on its own to treat the block as the current configuration and named its `medium (high)` budget. No rule said whether the block or the file was stale, or how setup would repair the state. In the same state, `poteto-help` would have told the user that every role uses its default model while every session ran the block.

**One state table.** `provider-dispatch.md` now has a mirror state table under "Where the sheet lives". It has one row per state: file and block equal, file and block different, file without block, block without file, neither, and malformed markers. Each row names what is in effect, what setup loads, and what `poteto-help` says. Setup step 2 and `poteto-help` classify by that table and report the row they found. The block wins when it exists, because sessions use it. A file without a block seeds setup, but no session uses it or its budget, so `poteto-help` treats that state as not configured.

**Repair on write.** Setup repairs an inconsistent row only through its confirmed write, which puts one render into both the file and the block. The confirmation names the row and the repair. Step 10 now inserts a block when no marker exists and stops only on one unpaired, duplicated, or reversed marker. Before, its "either marker is missing" rule could stop the write that repairs a file without a block.

**Why the block, not the file.** The issue suggested that the file is the source and a block without a file is stale. Runtime dispatch never reads the file, so that rule would tell the user defaults are in effect while sessions run the block's models. The setup text that called the file the editable source of truth now calls it setup's copy. An edit to the file alone takes effect only after a setup run, and the help skill's "new model choice had no effect" row says so.

**Claude Code.** Claude Code has no mirror block. It loads the shipped sheet, or the `@` include of `~/.claude/pstack-models.md` without one, so the table does not apply there, and setup still stops when the plugin ships a sheet.

**Test.** A `model-matrix.test.ts` case requires each table row and requires setup steps 2 and 10 and `poteto-help` to link the table. It failed before the doc change.

## 1.10.0 syncs to Cursor pstack 0.15.15

Open Pstack 1.10.0 tracks Cursor pstack 0.15.15 at `df581122cde17e6e27686b5a448bde23e4ad4318`. It imports two upstream commits, `1e56b29` and `df58112` (#46). The catalog stays at 52 skills.

**Effort defaults.** Every model-matrix family now defaults to `xhigh`. Fable, Sol, and Opus drop from `max`, and Grok was already at `xhigh`. The default panel quad is `claude:fable@xhigh`, `codex:gpt-6.1-sol@xhigh`, `grok:grok-4.6@xhigh`, `claude:opus@xhigh`. The judgment, hardest-task, and `how explainer` roles use `claude:opus@xhigh`. Arena, Architect, Interrogate, How, poteto-mode, setup's first-run sheet, the `codex-tools.md` example, and the technical reference follow. Upstream lowers only Opus, because its defaults no longer include Fable or Sol. The port lowers all four, so `large` matches every first-run default, as upstream's setup now says.

**Shipped Claude Code sheet.** `plugins/pstack/pstack-models.md` does not change. Its `medium (high)` budget is a maintainer choice, not a default, so the new defaults do not apply to it.

**Setup budget.** The `unlimited` label becomes `unlimited — max reasoning`. `unlimited`, `large`, `medium`, and `small` now propose `max`, `xhigh`, `high`, and `medium` for every family. Before, `unlimited` proposed each family's Default effort. With no sheet, setup says that `large` matches the first-run defaults, and the example sheet's budget comment becomes `large (xhigh)`. The operator still answers one effort question per used family.

**Grok under unlimited.** Upstream keeps Grok at `xhigh` under `unlimited`, because Cursor's Grok slugs have no `max` variant. That cap is a fact about Cursor's slugs. Here the matrix lists `max` as a Selectable effort for `grok:grok-4.6`, so `unlimited` now proposes `grok:grok-4.6@max`. No recorded probe shows that the Grok CLI accepts `max`, so that is unverified. Setup step 7 probes the selected pair before it writes, so a rejected effort stops setup and writes nothing. A new test requires every matrix and relay family's Selectable cell to hold all four budget targets. A later cell that drops one fails that test until setup gains a rule for it.

**Relay families.** The relay table loses its Default effort column. Its only reader was the old `unlimited` rule, so nothing reads it now. The test assertion that tied it to the Selectable cell is removed with it.

**Existing sheets.** A Codex or Pi sheet written by 1.9.0 keeps the efforts it wrote, including `@max` where the operator accepted the old `unlimited` proposal, because the descriptors are the only source of effort. To move to the new defaults, rerun `/setup-pstack` and accept the `large` proposals, or edit the descriptors. This is the port's form of upstream's README note that a rule written before a default change still pins the old default.

**Sol stays.** `df58112` drops Sol from every default. Its panels shrink to Opus and Grok, Interrogate loses Reviewer C, `reflect tooling` moves from Sol to Grok, and Arena and Interrogate drop the `gpt-*` fallback prefix. Upstream PR cursor/plugins#511 gives a judgment reason, two default model families, and does not retire the Sol model. Open Pstack keeps Sol and the four-lane panel. Sol is the Codex parent's native family and the only matrix family a Pi parent reaches. Reflect roles stay on `inherit-parent`, because Reflect needs the parent's MCP surface, so the tooling move has no target. The port has no family-prefix or rejected-slug fallback lines, so the fallback edits have no target either. `UPSTREAM.md` and the technical reference list this exclusion. The `orch.test.ts` fixture changes its free-form `verifier` string from `sol` to `opus`. That string is not a routing default.

**Setup prompt in help.** When the model sheet is missing and it matters, `poteto-help` now asks once per chat whether the user wants to run `/setup-pstack` now or later (`1e56b29`). The paragraph names Codex and Pi only. Claude Code always ships its sheet, and setup stops there, so the question never applies.

**Wording.** The help skill's interrogate row says "different models", and Blast-radius says "Ask more than one model". `README-UPSTREAM.md`, the architect runner prompt, and `orch.test.ts` take the upstream text verbatim.

**Guide edits.** `df58112` also edits guide pages 1 and 4. The guide and the Cursor manifest stay outside the port. Page 1's new budget paragraph is carried into the setup skill and the technical reference.

## 1.9.0 syncs to Cursor pstack 0.15.13

Open Pstack 1.9.0 tracks Cursor pstack 0.15.13 at `2cbf58508f40de470d7490b55c51d71241928fa2`. It imports three upstream commits, `00b52d9`, `807c031`, and `2cbf585` (#43). The catalog stays at 52 skills.

**Typed-only help.** `poteto-help` now carries upstream's `disable-model-invocation: true` and its new description, which tells the user to type `/poteto-help` with a question (`00b52d9`). Upstream made the change because the description sat in the skill list of every session. The port keeps a skill model-invocable only when poteto-mode invokes it by name. Nothing outside `skills/poteto-help/` names this skill, so the flag blocks no route. On Claude Code, the flag makes the Skill tool refuse a model call, as it does for `correct`. Live runs on 1.9.0 show that Pi honors the flag and Codex does not. Pi 1.0.4 drops flagged skills from the model's skill list, and its source filters them out. Codex 0.160.1 lists `poteto-help` in the model's skill list, and the model read it unprompted on 2 of 2 help questions. `correct` carries the same flag, so the same split applies to it by inference. `codex-tools.md` and `pi-tools.md` now record this split, and the Codex map tells an agent to start either skill only when the user asks for it by name. `tests/skill-collision-repro.sh` now lists `poteto-help` with `correct` as a user-only skill. The README and technical reference rows say it runs only when typed.

**Typed-only list.** Upstream now says only `/setup-pstack` loads from the user's words. The port does not copy that sentence, because here every skill except `correct` and `poteto-help` stays model-invocable. The 1.8.0 skill text and its entry below also named `automate-me` as typed-only. That was wrong. The port removed the flag from `automate-me` in 0.9.8 (`1d791c8`), and the static invariant never listed it. The skill text now names only `correct` and `poteto-help`.

**Prompting references.** `poteto-help` gains `references/prompting.md` and `references/recipes.md` (`807c031`). The first says what a prompt should state and leave out, how to load context, and how to steer a run in one line. The second lists prompts to adapt. The skill links them where it words a first prompt, steers a run that drifts, and picks the example prompt for its reply. Both files keep upstream's text and add one Platform note. The note says to write skill names in the user's harness form, and it resolves the Claude Code `/loop` built-in through `codex-tools.md` and `pi-tools.md`. Neither file names Custom Mode, cloud subagents, Projects, automations, Cursor Auto, `control-cli`, `control-ui`, `make-bot-ui`, or a guide page, so nothing else changed. The `/verify-<app>` recipe names the project skill that `create-verification-skill` writes, which ships here.

**Guide edits.** `2cbf585` edits only `docs/guide/` and the Cursor manifest. The guide stays outside the port, so those edits have no local target. Its new material on Cursor Projects, cloud subagents, automations, and `make-bot-ui` has no counterpart here. `README-UPSTREAM.md` takes the upstream README verbatim. The README's "Claude Code and Codex" table still says Codex does not load the startup instruction. That gap from 1.8.0 remains.

## 1.8.0 syncs to Cursor pstack 0.15.10

Open Pstack 1.8.0 tracks Cursor pstack 0.15.10 at `4e5b1cf2ccb0ea3716f08c8ee0a5856b5ab93536`. It imports one upstream commit, `4e5b1cf` (#33). The catalog grows from 51 to 52 skills.

**New skill.** `poteto-help` answers questions about installing, setting up, and using pstack. It finds out what the user needs, routes them to the skill, playbook, or principle that fits, and hands them a prompt to send instead of starting the work. Upstream 0.15.10 gives it no `disable-model-invocation` flag, so in 1.8.0 it also loads when a user asks how to use pstack. The SessionStart mandate does not name it. 1.9.0 applies upstream's later flag, so the skill now starts only when typed.

**Help skill adaptations.** A help skill tells users what to type, so its Cursor instructions are rewritten to the port's documented substitutions instead of left for a tool map:

- Install steps name the Claude Code, Codex, and Pi commands from the README instead of `/add-plugin pstack`.
- The model state check reads the sheet locations in `provider-dispatch.md` instead of `~/.cursor/rules/pstack-models.mdc`. On Claude Code, the shipped `pstack-models.md` sets the models and `/setup-pstack` stops without writing, so the cost and model-change advice points at that file there.
- Custom Mode and Option+Enter become the SessionStart hook, the port's documented analog of sticky mode. Pi has no hook, so a Pi user starts each task with `/skill:poteto-mode`.
- Upstream's statement that only `/setup-pstack` and `/poteto-help` load from the user's words is replaced. In 1.8.0, every skill except `correct` stays model-invocable, and the hook routes non-trivial work into poteto-mode. This line first named `automate-me` too, which was wrong. 1.9.0 adds `poteto-help` to the typed-only skills.
- The paragraph that says pstack is built for Cursor now describes the three-harness port and its tool maps. A Platform note gives each harness's skill invocation form.
- The public-copy URL names `misaka9981/open-pstack`. Guide links go to Cursor's published guide, which stays outside the port, and the README link goes to this repository's README.
- The skill table drops `make-bot-ui`, which stays excluded, and adds `deslop` and `babysit`, which ship here. The "Not in pstack" list maps `control-cli` and `control-ui` to `run` and `verify`, `/loop` to Claude Code's built-in, and `/create-skill` to `plugin-dev:skill-development`. "Babysit this pr" outside poteto-mode starts the bundled `babysit` skill, cloud agents become worktree-isolated subagents, and Cursor's Plan Mode becomes a harness plan mode.
- Principle leaves carry `user-invocable: false`, so the skill says to ask for one by name instead of typing `/principle-<name>`.

**Guide edits.** Upstream also edits `docs/guide/{README,01-setup,02-poteto-mode,05-build-and-clean}.md`. The guide stays outside the port, so those edits have no local target. Guide page 5 now says `typescript-best-practices` does not load on its own. That does not hold here: the port's copy keeps `paths` frontmatter, which loads it for `.ts` and `.tsx` files on Claude Code. `README-UPSTREAM.md` takes the upstream README verbatim. `docs/reference.md` named 1.6.3 and 0.15.6 as the current sync after 1.7.0; it now names this sync.

**Claude poteto-agent preload.** The Claude Code `poteto-agent` definition now preloads `pstack:poteto-mode` through its `skills` frontmatter (#34). A Claude subagent starts with isolated context, so the prompt alone named the skill but did not put its body in context. The description line is unchanged. A static invariant in `tests/skill-collision-repro.sh` fails when the binding is missing. Codex has no `poteto-agent` type, so `codex-tools.md` keeps dispatching a `spawn_agent` told to read poteto-mode first.

**Pi poteto-agent preload.** Pi's `pstack.poteto-agent` now starts with the poteto-mode body too. The pi-subagents `skills` field lists only a skill's name and location, and pi-subagents prefixes every task with `Task: `, so Pi's `/skill:<name>` expansion never fired in a child. The agent now loads `pi-agents/preload-poteto-mode.ts` through `subagentOnlyExtensions`, so only its children load the extension. On the first prompt, the extension's `input` handler adds the `/skill:poteto-mode` prefix, and Pi expands it into the full `SKILL.md`. It skips input sent while the agent streams and a session branch that already holds the skill block, so a resumed child does not load the skill again. A Bun test covers those three cases, and `tests/skill-collision-repro.sh` fails when the agent stops loading the extension or the file is missing. The extension imports its types from `@earendil-works/pi-coding-agent`. The workspace has no Pi dependency, so `bun run typecheck` does not cover it.

## 1.7.0 syncs to Cursor pstack 0.15.9

Open Pstack 1.7.0 tracks Cursor pstack 0.15.9 at `e43c7ee26e0038c6c1fa8380dd34ce86ff94cb2a`. It imports three upstream commits, `9511e60`, `a586282`, and `e43c7ee` (#31). The catalog grows from 50 to 51 skills.

**New skill.** `correct` finds the mistakes agents keep repeating in a repo and fixes each class at the highest level that works. Architecture comes first, then types and lint, then tests, and docs come last. It keeps a table that pairs each rule with what enforces it. The skill keeps upstream's `disable-model-invocation: true`, so only the user starts it. Poteto-mode does not route to it by name, and the command trampolines that made the flag unsafe in 0.9.8 no longer exist. On Claude Code 2.1.289, a typed `/pstack:correct` loads the skill, and the Skill tool refuses a model call. In Codex and Pi, asking for the skill by name loads it. Whether Codex and Pi hide it from model-initiated use was unverified in 1.7.0. The 1.9.0 runs show that Pi hides flagged skills and Codex does not.

**Architect and perf.** Architect assumes the next contributor is an agent that sees only the files it opened. Its design red flags add split ownership, two ways to do one task, importable internals, and hand-synced lists. Perf issue replaces the eight strategy families with seven performance mantras, tried cheapest first. Hillclimb orders perf hypotheses by those mantras, and Benchmark-checklist names them. Perf issue keeps the port's provider-dispatch delegation line instead of upstream's `grok-4.7-xhigh-fast` default.

**Grok Bot.** None of the three commits touches Grok Bot content. The only Grok Bot feature upstream is `make-bot-ui`, which stays excluded because it is built from Cursor routine, webhook, and secret-request primitives. The port ships no Grok Bot feature. Bugbot triage covers any automated PR-review bot, and the `grok` model route is a provider, not Grok Bot.

## 1.6.3 points links at misaka9981/open-pstack

The install commands, badges, contributing link, `UPSTREAM.md` step 1, and the plugin manifests' homepage, repository, and website fields now name `misaka9981/open-pstack`, the repository every harness installs from. They named `ericlitman/open-pstack`, which is a separate repository (#29). Historical records keep their original links: earlier entries in this file, `docs/plans/`, and the links to issue #8 in `ericlitman/open-pstack`, which `docs/reference.md` now labels with that repository's name. The README and `docs/reference.md` name GPT-6.1 Sol as the default Sol model, matching 1.5.8.

## 1.6.2 keeps the Claude Code model sheet out of Codex

Codex CLI now runs plugin SessionStart hooks. It ran `hooks/hooks.json`, so every Codex session received the Claude Code model sheet next to the Codex sheet from `~/.codex/AGENTS.md`, and the two disagreed (#24). The Codex manifest now declares its own SessionStart hook, which overrides `hooks/hooks.json` on Codex. It runs the same `hooks/session-start` script with a `codex` argument, and the script appends the plugin sheet only for Claude Code. Codex sessions keep the poteto-mode mandate. The hook source is new, so Codex asks the operator to trust it again before it runs. The 1.5.1 entry below says that Codex does not run the hook; that is no longer true.

## 1.6.1 corrects Pi lane model evidence

The 1.5.7 entry below says that each Pi child transcript carries a provider-reported `responseModel`. That is not always true. Pi's `openai-responses` client never writes `responseModel`. Its `openai-completions` client writes it only when the served id differs from the requested id. The magpie relay configures its `codex/` models with `openai-responses`, so Sol lanes usually have no `responseModel`. `pi-tools.md` now requires the transcript `provider` and `model` to match the descriptor. It checks `responseModel` only when it is present, and it records pinned evidence when it is absent (#23).

## 1.6.0 syncs to Cursor pstack 0.15.6

Open Pstack 1.6.0 tracks Cursor pstack 0.15.6 at `23e4138daa01c42d4969f7a5465f82704e64f798`. It imports that one upstream commit (#26). The catalog grows from 48 to 50 skills, including 24 principles.

**New skills.** `principle-explain-the-number` asks what limits a measured number and rules out that it measured something else. `benchmark-checklist` runs that check as seven questions before anyone reports a performance number. Poteto-mode, Perf issue, and Hillclimb route to the checklist by name. It ships without upstream's `disable-model-invocation: true`, because that flag blocks the named route on Claude Code. The principle leaf takes `user-invocable: false` like the other 23.

**Fresh subagents.** Poteto-mode gives new work to a fresh subagent with consolidated scope. It resumes an existing agent only when the work needs that agent's checkout, uncommitted changes, or running process. Both `poteto-agent` definitions, for Claude Code and Pi, now say the same. Swarm respawns a worker whose result misses its brief. An autonomy default now tells the operator in plain words what they could ask for instead, not a one-word reply token.

**Autopilot.** Upstream removed `/goal`, so the port drops its standing-orders substitute from both autopilot playbooks and the plan skeleton. The audit tick runs every hour. On Claude Code it is `/loop 1h` with the tick prompt, and Codex and Pi arm the same cadence per their tool maps. The tick remains an observation cadence, so a lane is still stood down only on affirmative failure evidence. An owner whose agent cannot start a turn counts as such evidence. Owners push after every verifiable unit. After a merge, a fresh owner takes the next queue item. A green head with a matching patch ID does not need another rebase when trunk moves. Right before the merge, the owner checks that `git merge-tree` against the trunk tip is clean and that trunk changed no path the PR touches or its CI depends on. The port reads trunk through `<base-remote>`, not `origin/main`. The plan skeleton stays harness-neutral, so `check-plan.mjs` requires "hourly audit tick" instead of upstream's `/loop 1h` marker.

**Other upstream changes.** Opening a PR puts each body section under a `##` heading, adds `## What changed`, always fills `## Scope`, and drops the ban on `## Summary` and `## Test plan`. The port still omits the 40-line squash-body cutoff. Upstream's rule to use a run's built-in PR tool is not applied, because Claude Code, Codex, and Pi have no such tool. Technical-writing drops its `Source:` lines. The TypeScript patterns replace the hand-validated cast with a schema-first Zod example. `README-UPSTREAM.md` takes the upstream README verbatim. The Cursor manifest and `docs/guide/` stay outside the port.

## 1.5.8 moves Sol to gpt-6.1-sol

The Sol matrix family now pins `codex:gpt-6.1-sol` instead of upstream's `gpt-5.6-sol`. The upstream-choice column still records `gpt-5.6-sol-max`, and `UPSTREAM.md` lists the deviation. The magpie relay exposes `codex/gpt-6.1-sol` to Pi, so Pi Sol lanes map to `magpie/codex/gpt-6.1-sol`. Setup's first-run panels, the interrogate, arena, and architect defaults, and the docs follow. An existing sheet that still names `codex:gpt-5.6-sol` is inconsistent state for setup and needs one setup rerun.

## 1.5.7 routes Codex models on Pi through magpie

On a Pi parent, `codex:<model>@<effort>` now maps to `magpie/codex/<model>:<effort>`, the Codex models the magpie relay serves, instead of Pi's `openai-codex` provider. Every Pi lane now goes through the relay, and each child transcript carries a provider-reported `responseModel`. `pi-tools.md`, the provider-dispatch Pi route row, and setup's Pi column change together. The relay accepted `codex/gpt-5.6-sol` at every effort from `low` to `max`. Claude Code and Codex routes are unchanged.

## 1.5.6 drops six cursor-team-kit skills

`thermo-nuclear-code-quality-review`, `make-pr-easy-to-review`, `fix-ci`, `fix-merge-conflicts`, `get-pr-comments`, and `what-did-i-get-done` came from Cursor's separate `cursor-team-kit` plugin. They are not pstack skills, and no pstack skill or playbook referenced them. They are removed. `thermo-nuclear-code-quality-review` also collided with same-named user skills, and Pi skipped the bundled copy. `deslop` stays because poteto-mode and its playbooks route to it, and `babysit` stays as pstack's `/babysit` entry point. The catalog drops from 54 to 48 skills.

## 1.5.5 runs setup on a Pi parent

`setup-pstack` accepts Pi as a parent. The probe table gains a Pi column. Sol maps to `openai-codex/gpt-5.6-sol` (the matrix keeps upstream's Sol choice), and the two relay families map to `magpie/<model>`. Fable, Opus, and Grok are not routed, so a Pi operator moves those roles to Sol, a relay family, or an alias. Each Pi probe is one child of an async pi-subagents workflow on `pstack.lane-readonly`. It passes when the child returns the marker and its transcript reports the mapped provider and model. Setup writes `~/.pi/agent/pstack-models.md` and mirrors it into one bounded block in `~/.pi/agent/AGENTS.md`.

## 1.5.4 adds Pi as a third harness

A root `package.json` makes the repository a Pi package. It loads the shared `plugins/pstack/skills/` tree unchanged and ships four pi-subagents agents under the `pstack` namespace: `pstack.lane`, `pstack.lane-readonly`, `pstack.poteto-agent`, and `pstack.comment-sicko`. The namespace keeps same-named user agents from shadowing them. `poteto-mode/references/pi-tools.md` maps Claude tool names to Pi and defines dispatch. Every lane is a child of one async pi-subagents workflow, because foreground and single-agent launches carry an implicit 30-minute deadline. Descriptors map to `openai-codex/<model>:<effort>` and `magpie/<model>:<effort>`. Claude and Grok are not routed from Pi. A failed child is a dropout while its siblings finish, and the child transcript reports the served provider and model. `provider-dispatch.md` adds the Pi route row, native-lane rule, sheet location (`~/.pi/agent/pstack-models.md` mirrored into `~/.pi/agent/AGENTS.md`), and completion rule. Every shared reference to `codex-tools.md` now also names `pi-tools.md`, and `runner/pi-package.test.ts` enforces that pairing. Setup on a Pi parent and the pi-pstack `/poteto-mode` toggle are not included.

## 1.5.3 lets setup offer two relay families

`provider-dispatch.md` adds a relay family table with `deepseek-flash` (`magpie:wevnal/deepseek-v4.1-flash`) and `glm-flash` (`magpie:wevnal/glm-5.3-flash`). Both accept every effort from `low` to `max`; each passed a one-turn runner probe. `setup-pstack` maps, asks efforts for, probes, and preserves these families like matrix families. They stay outside the model matrix, so first-run defaults and the default panel do not change, and a Claude Code parent does not route them. `model-matrix.test.ts` keeps the relay table separate from the matrix.

## 1.5.2 routes magpie relay lanes

`pstack-runner` accepts `--provider magpie` for the local relay that Codex and Pi use. A magpie lane runs `codex exec` with `model_provider="magpie"` and the same sandbox, feature, and JSONL flags as a `codex` lane. A Codex parent reaches `magpie:*` only through the runner, because `spawn_agent` has no provider parameter and a spawned child ignores an agent profile's `model_provider`. Claude Code does not route magpie. The preflight only proves that the Codex CLI exists, so the one invocation proves the relay and model. A rejected id is an `unavailable-model` dropout, and a sandboxed Codex parent that cannot start the nested CLI is a `child-failed` dropout. Setup does not offer relay models yet.

## 1.5.1 ships the model sheet with the plugin

The repository now owns the Claude Code model sheet at `plugins/pstack/pstack-models.md`. The SessionStart hook appends it to the poteto-mode mandate inside a `<pstack-model-sheet>` block. That sheet replaces `~/.claude/pstack-models.md`, and `/setup-pstack` on Claude Code reports it and stops without writing. Model changes are edits to that file followed by a plugin update. The shipped sheet assigns code roles, `how explorer`, and `swarm workers` to `claude:opus@high`; judgment, hardest tasks, and `how explainer` to `claude:fable@high`; and every panel to Fable and Opus at `high`. Why and Reflect stay on `inherit-parent`. Codex does not run the hook and keeps `~/.codex/pstack-models.md`. `runner/shipped-sheet.test.ts` requires every documented role once, only matrix families at selectable efforts, and a verbatim injection by the hook.

## 1.5.0 syncs to Cursor pstack 0.15.5

Open Pstack 1.5.0 tracks Cursor pstack 0.15.5 at `12d587dfb20741cafc376c42c696c5f6e2a64487`. It imports upstream commits `f5bdd68`, `889ec4b`, `5bf2b15`, `70b2dc8`, `b42effe`, `b0b9c7a`, and `12d587d`.

**Role defaults.** Every code delegate (`feature, refactoring`, `bug-fix`, `perf-issue`, `hillclimb`), `how explorer`, and `swarm workers` default to `grok:grok-4.6@xhigh`. `judgment and prose`, `hardest tasks`, and `how explainer` default to `claude:opus@max`. The Opus matrix row's default effort moves from `xhigh` to `max`, so the panel quad is now `claude:fable@max`, `codex:gpt-5.6-sol@max`, `grok:grok-4.6@xhigh`, `claude:opus@max`. Why and Reflect stay on `inherit-parent` because they need the parent's MCP surface. The earlier exclusion that kept bug-fix, perf-issue, and hillclimb on Sol is retired because upstream now puts them on Grok. Three upstream model changes are not applied. Grok stays on 4.6 until `grok-4.7` passes a live runner probe. Panels keep Fable as a fourth lane instead of upstream's three-lane Opus 5.5, Sol, and Grok panel. Lines that rerun a rejected model on a family default or the closest valid slug conflict with the no-fallback contract.

**Setup budget.** `setup-pstack` ports upstream's budget question (`unlimited`, `large`, `medium`, `small`) on top of the existing per-family effort step. The budget sets each family's proposed effort: the matrix default for `unlimited`, or `xhigh`, `high`, or `medium`. The per-family question still decides. The sheet records the answer in an `<!-- budget: <label> (<effort>) -->` comment. The role descriptors remain the only source of effort. Setup now collects role-family changes before it probes, then asks, probes, and smoke-tests only the families that the role map uses. That is the port's form of upstream's rule that a missing model becomes a choice and not a failure. An operator without the Grok or Codex CLI can reassign those roles and finish setup. A failed probe still writes nothing, and setup never substitutes a family by itself. A sheet row for the retired `how critics` role is now dropped and listed in the confirmation, per `12d587d`, instead of stopping setup as unknown state. Any other unknown role still stops setup.

**Routed skills.** Arena, Architect, How, Why, Reflect, Swarm, and Interrogate name the exact sheet line they read, per `12d587d`. Swarm briefs name exact SHAs and the measurement method, and a result without them is rerun once and then recorded as a gap.

**Autopilot rounds.** Autopilot-full verifies every round from the code-ready head through each patch-changing push, with two or more focused audit lanes, red tests for behavior findings, and a merge-prep rebase with CI on the final head. Owners track subagents in an uncommitted `children.tsv`. The port records each child's retained handle there. It keeps its no-implicit-timeout rule, so a lane is stood down only on affirmative failure evidence, never for passing an expected runtime. An owner babysitting its own PR may rebase and publish with the captured-SHA lease flow. Autopilot-stack and the multi-phase plan follow the same rounds. The audit tick posts status only when something tracked changed. Shipping keeps a lane result when a changed patch differs only by build noise that the lane can prove. Operator pronouns are neutral.

**Instruction cuts.** Upstream's `b0b9c7a` and `70b2dc8` removals in Interrogate, Reflect, TDD, Figure-it-out, Blast-radius, Technical-writing, Unslop, four principle leaves, and the feature, bug-fix, and refactoring playbooks are applied. `check-plan.mjs` keeps the port's fixed `swarm workers` lane sentence, which already names the role instead of a slug. The Cursor manifest and `docs/guide/` stay outside the port.

## 1.4.1 syncs to Cursor pstack 0.15.1

Open Pstack 1.4.1 tracks Cursor pstack 0.15.1 at `f8abeddd1862dc73704e3d719dd73df0d51b8c71`. Poteto-mode now requires each claim to include its evidence or a measured, inferred, or guess label in the same sentence. Agents also run any check they can run themselves instead of handing that check to the user. No playbook, model, runtime, or dependency changed.

## 1.4.0 syncs to Cursor pstack 0.15.0

Open Pstack tracks Cursor pstack 0.15.0 at `71ed0d1076fec562c1b74ee353121a8d00f75382`. The shared catalog contains 54 skills, including 23 principles. This sync imports the skill density and punctuation passes, the 361,140-byte logo, and the verbatim upstream README. How, Why, and Teach take the shorter explanation guidance. Reflect runs only on explicit invocation. Poteto-mode no longer requires reading the whole principle index as the first todo, but still requires reading any applied leaf and citing it truthfully. Unslop adds the mannered-prose and over-compression rules, preserving stable rule numbers. Technical-writing proposes new abstract-metaphor offenders and replacements without editing Unslop automatically.

How's critique mode and `how critics` role are retired, and its two review references are deleted. Architect and Investigation use explain-only How. Setup now renders 15 role rows. An old 16-row sheet's `how critics` row has no consumer in ordinary dispatch. Setup reports it as an unknown role before any probe or write. Remove that row before rerunning the normal validated setup flow. On Codex, the editable sheet and bounded AGENTS block must agree. Invalid state or a failed probe leaves both unchanged.

Two new leaves carry narrow local correctness corrections, also reflected in their descriptions and Poteto-mode's index. `principle-test-behavior-not-implementation` warns conditionally about assertions that miss relevant behavior. `toBeDefined`, `toBeTruthy`, `toBeInstanceOf`, and `toBeGreaterThan(0)` do fail on `undefined`, and useful negative-path, prompt/configuration, and relational contract checks remain valid. `principle-attack-the-premise` limits the actor census and reassignment prescription to imbalance problems. An even census is evidence against an asymmetry hypothesis, not proof that a shared premise is correct. Later syncs take upstream's equivalent corrections if they land.

Opening a PR adopts the "briefing, not the lab notebook" guidance and links detailed evidence. The "about 40 lines" squash-body cutoff is omitted. The port's required installed-version, user-action, and observed-result evidence sections remain unchanged. The PR 44 shipping rules, parent-owned provider dispatch, Sol defaults for bug-fix, perf-issue, and hillclimb, and no-fallback/no-implicit-timeout contracts remain in place. The Autopilot chooser and Multi-phase plan reference remain intact.

Existing exclusions remain: `make-bot-ui`, Benny automations, Cursor-only guide and sticky-mode content, Cursor-only solo-model defaults, invocation-blocking flags on How, Why, Unslop, and TypeScript best practices, and the unsupported Claude manifest logo field. Those four skills stay user-invocable and model-invocable. The principle leaves keep `user-invocable: false`, which hides them from the slash menu but leaves model invocation open. The Cursor manifest is not imported. Watcher and orchestrator directories, package metadata, and lockfile have no upstream changes in this range. The unrelated Grok Voice plugin remains outside this sync.

## 1.3.0 syncs to Cursor pstack 0.14.7

Open Pstack now tracks Cursor pstack 0.14.7 at `efa2a531985e0a8084d36ff3cf87233be8a9f34b`.

**Forge-neutral pull request playbooks.** Shipping, Babysit, Autopilot-full, Autopilot-stack, Opening a PR, and Multi-phase plan use GitHub CLI by default and Origin when its CLI can resolve the repository. Same-repository base chains and fork stacks land from the bottom one pull request at a time. Stable patch IDs decide when a rewritten head needs a new code verdict. Owners open pull requests early, follow repository draft rules until required evidence exists, keep an uncommitted decision trail, and compare load-bearing behavior and performance at trunk and head. Graphite remains only in the unchanged Orchestrate frontier tooling.

Factory panel review hardened the upstream landing flow. Shipping freezes the stack and clears every pre-existing auto-merge request and native merge-queue entry before verification. On GitHub, it confirms that both `autoMergeRequest` and the separate `mergeQueueEntry` are null. It repeats the check for the current bottom pull request and every descendant before any branch or base mutation. Both autopilots apply the same rule before rewriting an existing pull request, and Opening a PR applies it before an existing child is rebased, force-pushed, or retargeted. Autopilot-stack delivers each bottom pull request through Shipping instead of offering merge-when-ready for descendants. Same-repository heads use a base-branch chain. Fork heads keep local parent ancestry, target trunk in the base repository, and use a frozen bottom-to-top list because a fork-only parent branch cannot be a pull request base. Autopilot-full preserves the same parent ancestry in its short private-stack exception. Owners open pull requests early but leave them draft when repository instructions require live evidence before readiness.

Fork-safe rebases resolve the base fetch remote separately from the head push remote. The playbooks resolve the head push URL before fetching stack parents, worktree refreshes, and live-lane heads. Rebase and publish steps use that exact URL, binding an explicit force-with-lease to the SHA captured before the rewrite. Each verdict records its head, patch base, and stable patch ID separately from the current landing head and base. A patch-equivalent rewrite keeps the verdict, but every merge guard uses the current landing head. After a parent is squash-merged, an explicit `git rebase --onto` moves only the child's commits from its recorded old parent to current trunk. The rebase command terminates option parsing before passing the short branch name. Git then updates the branch instead of leaving a detached HEAD. Fork pull requests use GitHub's pull-request API with the validated head repository name, which also supports organization-owned forks. Every GitHub pull request command names the canonical base repository. The installed-plugin watcher receives its owner, repository, and pull request number explicitly.

Values returned by the forge or repository stay shell data. The imported pull request playbooks pass them as quoted arguments instead of pasting contributor-controlled branch names or other forge values into shell source.

Immediate merges require a server-enforced expected-head guard. The playbook verifies `baseRefName` immediately before the GitHub merge and monitors it until merge. GitHub has no expected-base guard, so Shipping uses the supported head guard and reports a safety failure if the pull request lands in another base. Server-side auto-merge also requires a SHA-scoped independent-verdict check. Without that check, the agent watches until it can issue the guarded immediate merge. Every observed head or base change disarms every pending request and returns to verification. An unarmed frontier returns to the merge step when it becomes ready. Every terminal non-passing required check ends the watch while auto-merge or a merge-queue entry is pending. `UNSTABLE` remains nonterminal by itself. A stale or conflicted frontier returns to the guarded rebase flow.

Origin merge commands omit GitHub's unsupported `--squash` flag and stop when Origin cannot provide atomic expected-head and expected-base guards. Both autopilot playbooks use the same captured-SHA lease rule. Autopilot-full routes owner merges through Shipping's current-head flow.

**TypeScript boundary guidance.** The TypeScript skill scopes Claude Code automatic loading to `.ts` and `.tsx` files, prefers repository-owned runtime schemas over hand-written property guards, and derives types from those schemas with helpers such as `z.infer`. Codex continues to invoke the same shared skill by name.

**Codex presentation.** The exact upstream `assets/logo.png` now ships in the shared plugin. The Codex manifest exposes it through `interface.logo`. The Claude manifest does not add a logo field because Claude Code has no schema for it.

**No-op upstream revisions.** Upstream moved several Fable references to a newer revision slug. Open Pstack already stores rolling `claude:fable` and `claude:opus` aliases, so those edits require no port change.

**Upstream-only exclusions.** `make-bot-ui` from `799151d` and `6fecddb` is not ported because it is built entirely from Cursor routine, webhook, and UI primitives. The `disable-model-invocation` additions from `73f8be4` are not applied to `how`, `why`, `unslop`, or `typescript-best-practices`; the flag would break poteto-mode's named invocation path on Claude Code. The `23a56e2` defaults that move `bug-fix`, `perf-issue`, and `hillclimb` from Sol to Fable are not applied because Fable costs much more for these frequent delegated code roles; all three stay on `codex:gpt-5.6-sol@max`. The Claude manifest logo field from `efa2a53` is also omitted because Claude Code has no schema for it.

## 1.2.1 keeps Fable and Opus on their latest Claude revisions

Open Pstack now stores `claude:fable@<effort>` and `claude:opus@<effort>` in its model matrix, role defaults, and generated setup sheets. Claude Code resolves those aliases to the latest family revision. Native Claude agents and external runner calls pass the same aliases.

Runtime dispatch normalizes the provider-qualified versioned Fable and Opus descriptors written by earlier releases before it chooses a route, so an installed sheet stops pinning as soon as the plugin updates. It does not write user files and reports that setup should persist the migration. `setup-pstack` applies the same rule before validation, preserves roles, lane order, and effort selections, and writes only after the existing probes and confirmation. The runner rejects any version pin that reaches its boundary, records both the requested alias and Claude's concrete reported revision, and verifies that the report belongs to the requested family. Static checks reject new active version pins.

## 1.2.0 adds verified multi-PR plans, earlier runtime diagnostics, and shared review-bot triage

Plans with several stages now use one checklist instead of an overview and separate files for each stage. It has one ordered section for every pull request and keeps all ten ways of testing the real product, unit tests, live and performance proof, checks for how changes work together, merge rules, and supporting details in one place. A Node-based checker with no extra dependencies rejects missing or out-of-order sections, fake screenshots, empty definitions of success, incomplete performance proof, incorrectly written review checks, unsupported punctuation, and incorrect command use. Claude Code and Codex use the same installed skill and checker through their existing parent-controlled setup. If a provider fails, it is identified by name and treated as a dropout. No backup provider or hidden time limit was added.

The shared startup script now checks for Node before using features that only Bun provides. If the startup script or watcher is run with Node, it prints one clear message and exits cleanly instead of failing later because `Bun` does not exist. The normal Bun behavior and every existing test for runners, watchers, and orchestrators are unchanged. CI uses Node 22.23.2 so this behavior is always checked against the same known version.

The separate Babysit skill now follows the same three-choice rule as poteto-mode Babysit: fix the problem, dismiss it, or ask what to do. Both versions point to one official Bugbot policy. A check of the packaged files confirms that both links work, only one copy of the policy exists, all three choices are present, and the listed situations default to asking, so the two versions cannot quietly become different.

## 1.1.0 adds selectable requested effort to setup-pstack

`setup-pstack` asks one requested effort per frontier family (`low`, `medium`, `high`, `xhigh`, `max`) instead of probing a fixed default quartet. `provider-dispatch.md` owns the model matrix: family, upstream choice, provider, model, first-run default effort, selectable efforts, and Claude-native agent stem. Setup loads the current sheet first, folds mixed per-family efforts with an explicit operator choice, probes only the four requested pairs, and writes nothing on a failed probe. A rerun rewrites that family's `@effort` suffix on every assigned role and leaves customized role-to-family lanes in place. First-run defaults remain Fable `max`, Sol `max`, Grok `xhigh`, and Opus `xhigh`.

Claude-native dispatch ships Fable and Opus agents at all five efforts. Names are `pstack-<stem>-<effort>`. `pstack-fable-max` and `pstack-opus-xhigh` stay. The runner already mapped all five efforts; tests now cover `low`, `medium`, and `high` for each provider. Evidence remains requested effort and route. There is no runtime resolver, same-provider external fallback, implicit timeout, or second configuration source.

## 1.0.2 retries transient Grok authentication preflights

`pstack-runner` now waits five seconds and retries `grok models` once when Grok's first preflight would be classified as unauthenticated. This handles the CLI's brief contradictory output during self-update, when it can print an unauthenticated banner while exiting 0 and listing the requested model. A second failure remains terminal with exit 77. The retry shares the existing absolute deadline and cancellation latch, the receipt keeps evidence from both attempts, and model execution still runs at most once.

## 1.0.1 removes duplicate workflow entries

Claude Code and Codex both load the native `plugins/pstack/skills/` tree. Codex 0.149.0 also converts each `plugins/pstack/commands/*.md` file into a generated `.codex-plugin/migrated-command-skills/source-command-*/SKILL.md`. The 31 same-named command trampolines therefore doubled Codex's workflow inventory. Claude's component inventory also registered both layers, although Claude Desktop visually merged the duplicate names.

This release deletes all 31 command trampolines. The native skill tree is now the only workflow source. Claude Code still supports both model-initiated `Skill` tool calls and user `/pstack:<name>` invocations through each native `SKILL.md`. Codex loads that same tree without generated source-command copies. The 21 `principle-*` leaves declare `user-invocable: false`; Claude hides them, while Codex 0.149.0 currently ignores that picker metadata ([#8](https://github.com/ericlitman/open-pstack/issues/8)).

`tests/skill-collision-repro.sh` rejects any legacy command layer, checks the requested principle visibility metadata, compares the version across `UPSTREAM.md` and the three manifests, and preserves the default model-quad check. Its behavioral mode builds a one-skill Claude fixture and proves that both a model-initiated `Skill` tool call and a user `/testplug:foo` invocation reach `SKILL-RAN`.

## 1.0.0 — establish open-pstack

`ericlitman/open-pstack` becomes the canonical cross-harness distribution. Its imported baseline is `053ed78732e3b71826933170eafe7f7782dda844`, synchronized to Cursor pstack v0.14.2 at `46125561306434d8a1d7745d540d8932ab0cd2a2`. The repository preserves the existing history and attribution while moving marketplace identity, links, and the private tooling package to open-pstack.

Claude Code and Codex continue to share one skill tree. The parent-owned Claude/Codex/Grok provider dispatch, explicit failure receipts, no-fallback rule, and lack of an implicit runtime timeout are unchanged. `UPSTREAM.md` records the review-first sync procedure, and ordinary pull requests run the Bun tests, typecheck, manifest parse, and static maintenance invariants in GitHub Actions. Live provider behavior remains a release gate because CI cannot substitute for subscribed CLI execution.

## 0.9.12 — restore the upstream frontier panel across Claude Code and Codex

The v0.14.2 sync kept pstack's workflow structure but replaced upstream's Fable 5 / GPT-5.6 Sol / Grok 4.6 / Opus 5 panel with Claude-only choices. This release restores the upstream frontier panel from either supported parent harness without adding another orchestrator.

**Parent-owned dispatch.** Model configuration now uses explicit `<provider>:<model>@<effort>` descriptors. Claude Code keeps Fable and Opus native and launches Sol and Grok externally. Codex keeps Sol native and launches Fable, Opus, and Grok externally. The top-level parent resolves that table once; children do not inspect inherited environment markers, select providers, or reroute themselves. Same-provider external calls are rejected.

**Deterministic external runner.** `skills/poteto-mode/scripts/runner/pstack-runner` accepts an already-resolved parent, provider, model, effort, access mode, prompt file, cwd, output file, receipt file, and optional timeout. It preflights the assigned subscribed CLI, invokes it once with provider-native read-only or isolated-write controls, disables nested agent orchestration, restricts provider tools, reserves concurrent outputs exclusively, and writes a structured receipt with model proof, elapsed time, usage, cost when exposed, and bounded failure evidence. Claude uses project-only settings and an explicit tool list. Grok uses its kernel sandbox and an explicit tool list, and its terminal Messages result is persisted without progress narration. Codex receipts distinguish a provider report from an exact pinned argv instead of fabricating a reported model. Missing CLIs, authentication failures, unavailable models, explicit timeouts, cancellations, catchable post-reservation failures, non-zero exits, malformed output, and model mismatches are loud dropouts. There is no fallback. Parent harnesses launch it as resumable background work because Claude's foreground Bash path has a ten-minute ceiling. The runner and preflight impose no arbitrary default deadline; `--timeout` is opt-in only when the user or task provides a real external bound, and that bound starts at wrapper entry, remains one end-to-end deadline rather than a fresh allowance per child, and is armed in runtime-safe chunks without shortening long bounds. The runner is self-contained and does not enter the shared script bootstrap/re-exec path. A run-scoped cancellation latch owns SIGINT and SIGTERM from reservation through the terminal receipt, wakes the active direct child wait to send the first signal once, tolerates repeated delivery while reaping it, cancels inherited-pipe reads after child exit, keeps child exit codes distinct from launcher exit status, records only signals it actually sent to the child, clears losing timers, removes the empty output reservation, and preserves a durable terminal receipt; retries use fresh attempt paths.

**Native Claude effort.** `pstack-fable-max` and `pstack-opus-xhigh` agent definitions pin model plus effort for Claude-native lanes and mechanically deny nested Agent/Task dispatch. Codex passes model and `reasoning_effort` directly to `spawn_agent`.

**Workflow integration.** One `provider-dispatch.md` reference owns the route contract. `setup-pstack`, poteto-mode, every code-writing playbook, and the How, Why, Reflect, Arena, Swarm, Architect, and Interrogate skills resolve configured roles through it. The default code roles and four-provider panel match upstream v0.14.2. MCP-dependent Why and Reflect roles stay native through `inherit-parent`, because an external provider process does not inherit the parent's live MCP tool surface. The Codex mapping treats an unavailable native lane as a named dropout instead of collapsing the panel, and the README documents the external CLI requirements.

**Tests.** The vendored Bun suite covers exact command construction, terminal provider output parsing, multi-model usage envelopes, auth/model preflight, honest provider-report versus pinned-argv proof, missing CLI, unavailable model, authentication/model classification, wrapper-entry and shared explicit deadlines, no-timeout delayed work, runtime-safe very-long deadlines, no-spawn after preflight exhaustion, inherited-pipe deadline/cancellation, truthful receipts for post-exit and externally signalled children, bootstrap-free isolated launch, terminal post-reservation failures, prompt retained-handle exit after a losing long timer, preflight and model cancellation, repeated-signal child reaping with a race-free fixture handshake, fresh-path retry, same-provider rejection, identity cleanup, exclusive paths, and simultaneous same-provider lanes. `tests/skill-collision-repro.sh` compares the provider-qualified panel descriptors across the setup sheet, four panel skills, and canonical dispatch reference. Live Claude-parent and Codex-parent behavioral probes are a release gate; unit tests alone are insufficient.

## 0.9.11 — sync to upstream v0.14.2

Catches the port up with upstream `cursor/plugins/pstack` from `3fe2823` (v0.11.3) to `4612556` (v0.14.2). Skills 48 → 52, commands 27 → 31, subagents 1 → 2, plus a vendored `scripts/` tree under `poteto-mode/`.

**New skills.**

- `swarm` (upstream `b79f8ca`, `91dd7b7`): fan out N parallel workers over slices or races, drain them, return one report. Upstream spawns Cursor cloud agents; Claude Code has no remote worker environment, so the port spawns local background subagents and takes isolation from a worktree or a per-worker output directory. The worker default follows the port's single-role default (`claude-opus-4-8`) and reads `swarm workers` from `~/.claude/pstack-models.md`.
- `no-comments` plus the `comment-sicko` subagent (#185): a comment-stripping review pass. `Task` → `Agent`, and upstream's agent name `Comment Sicko` becomes `comment-sicko` because a `subagent_type` with a space is not addressable.
- `technical-writing` (#185): the layered Diátaxis / Google developer style / STE / Global English standard. No Cursor primitives, copied as-is.
- `bro` (#187): restate the last message in plain language. Copied as-is.

Per the 0.9.8 invariant, all four drop upstream's skill-side `disable-model-invocation: true` and get command trampolines that carry it instead.

**New playbooks** (#185, #187), under `poteto-mode/playbooks/`: `babysit` (drive a PR or stack to merge-ready), `shipping` (verify each PR independently, then land the contiguous verified run), `orchestrate` (a standing multi-day program under one coordinator), `autopilot-full` and `autopilot-stack` (one owner per PR, swarm-verified), and `worktree-cleanup` (safety-gated disk reclamation). They share the new `references/bugbot-triage.md` rubric, which the poteto-mode review-bot trigger now points at.

Substitutions in the six: Cursor cloud agents become local background subagents isolated by worktree; `control-cli` / `control-ui` become the `run` / `verify` built-ins; `Task` becomes `Agent`; `AskQuestion` becomes `AskUserQuestion`; the Cursor agent store becomes `~/.claude/orchestrate/<slug>/`, which outlives the session the way a multi-day program's store has to; a Cursor restart becomes a session restart; the Cursor dashboard becomes the background task list. Cursor's `/goal` has no Claude Code equivalent, so the autopilots keep the program objective in the standing orders and the todolist, and their audit tick re-reads the playbook from the installed plugin instead of `git show origin/main:pstack/...`. Graphite (`gt`) is not Cursor-specific and stays.

**Babysit, skill versus playbook.** Upstream v0.14.0 stopped routing PR-status requests to Cursor's built-in babysit and gave poteto-mode its own playbook. The port's bundled `babysit` skill (the 0.9.2 analog of that built-in) stays as the standalone `/babysit` entry point; inside poteto-mode the playbook supersedes it, and both files say so.

**Vendored scripts.** `poteto-mode/scripts/` carries upstream's `watch-pr` (the PR watcher the Babysit and Shipping playbooks poll), `orch` (the orchestrate store CLI), `worktree-audit.sh`, and the bun bootstrap. Three edits: `worktree-audit.sh` reads `~/.claude/projects/` — scanning the whole projects tree, since a session run inside a worktree gets its own encoded directory — instead of `~/.cursor/projects/<slug>/agent-transcripts`; it warns when `jq` or `rg` is missing, because their absence silently blanks the PR and LAST_CHAT columns and downgrades an in-use worktree to `safe` in the one playbook that deletes user state; and the private workspace package is renamed `@pstack-claude/poteto-mode-tools` in `package.json` and `bun.lock`. `bun` joins `gh` as a documented system dependency, `gt` only for the stack playbooks and `jq`/`rg` only for the worktree audit. `node_modules/` under the scripts dir is gitignored.

**Content refinements over the port's existing translation.** `architect` gains design-it-twice, the `design-red-flags.md` screen, and the interface-depth comparison (#175), with the matching rationale-template and runner-prompt edits. Nine `principle-*` leaves, `unslop`, `typescript-best-practices` (plus 69 new lines of `references/patterns.md`), and `lead-judgment.md` take upstream's HEAD bodies verbatim; their bodies were byte-identical to upstream `3fe2823` beforehand, so the port keeps only its own frontmatter. `interrogate` moves its reviewer defaults into a labelled A/B/C/D table (#167). `create-verification-skill` points at the new `feature-map-example/` and names the four required H2s (#178). `automate-me` learns that mode skills can live in a personal category directory (#187). `opening-a-pr` takes upstream's title, description, readiness, and babysit rewrite (#185, #238), and `autonomous-run` takes mid-run-discovery ownership (#170).

**Model configuration.** Upstream's slug bumps (#165, #166, #169, #210: fable / sol / grok / Opus 5) are not ported — the port keeps its own Claude quad (`claude-opus-5`, `claude-fable-5`, `claude-opus-4-6`, `claude-sonnet-5`) and its `claude-opus-4-8` single-role default. What is ported is the structure: the `inherit-parent` / `auto` aliases (#163), which on Claude Code mean omitting `model` on the `Agent` call so the role runs on the parent session's model, and the config-source-first phrasing (#167) in `arena`, `interrogate`, and `swarm`. `setup-pstack` gains the aliases, the `swarm workers` row, and the alias-aware validation rules.

**Deliberately not ported.** `docs/guide/` (the ten-chapter tutorial and its six screenshots, 2.3 MB) teaches pstack through Cursor's UI, sticky mode, and cloud agents, and ships no skill content; README links it upstream. `is_background: true` on `poteto-agent` is Cursor agent frontmatter with no Claude Code key. Sticky mode and Benny remain out, unchanged from the earlier reviews.

**Test fix.** The quad invariant in `tests/skill-collision-repro.sh` had been searching the panel skills for `claude-sonnet-4-6`, a slug the 0.9.10 panel swap removed, so the check failed on `main` for every skill. It now derives the anchor slug from the canonical `arena runners` row and reads `interrogate`'s quad from its new reviewer table.

**Verified.** 52 skills / 31 commands / 2 subagents; three manifests parse at 0.9.11. Static invariants pass, including the repaired quad check. The vendored scripts pass `bun install --frozen-lockfile`, `bun test orch watch-pr` (52 tests), and `bun run typecheck` from their ported location. Not yet live-verified in a Claude Code or Codex session.

## 0.9.10 — sync to upstream v0.11.3

Catches the port up with upstream `cursor/plugins/pstack` from `0452e08` (v0.10.0) to `3fe2823` (v0.11.3). Skill count 44 → 48, commands 24 → 27.

**New skills.**

- `teach` (#153): composes the `how` and `why` skills into one plain explanation. Command-paired public skill; platform note for the parallel dispatch and image-gen tool.
- `principle-model-the-domain` (#147): encode the domain in a structure instead of scattered conditionals. Verbatim upstream prose, `user-invocable: false` per the 0.9.9 principle convention, woven into `poteto-mode`'s data-shape trigger and Architecture index, and into the `feature` and `refactoring` playbooks.
- `create-verification-skill` and `maintain-verification-skill` (#150, #151): generate and maintain a persistent, repo-tailored project verification skill plus feature map. A different layer from Claude's built-in `run`/`verify` per-session drivers, which they complement. Translation: `.cursor/skills/` → `.claude/skills/`, drop `disable-model-invocation` (command-paired), add command trampolines and platform notes.

**Content refinements (#155, #156), applied over the port's existing Cursor→Claude translation.** The perf playbook's eight strategy families; `interrogate` "four-model" → "multi-model"; the `hillclimb` ground-the-workload-first rewrite; rationale one-liners across five playbooks; `typescript-best-practices` real-tests and structured-telemetry rows; the `why` databricks source `SHOW TABLES` note.

**Model strategy (#143, #156).** `poteto-mode` now tiers code delegates by difficulty — hardest changes to the strongest judgment model (`claude-fable-5`) or the strongest instruction follower, trivial edits to a fast code model, everything else `claude-opus-4-8`. `setup-pstack` gains the configurable `arena cross-judge pool` row. The upstream `grok`/`gpt` slugs stay substituted with `claude-*`.

**Deliberately not ported.** Sticky mode (#144) is Cursor-only frontmatter (`mode`/`icon`/`color`/`reminder`) with no Claude Code equivalent; the port's 0.9.5 SessionStart hook already auto-fires `poteto-mode` with the same non-trivial/trivial/opt-out logic. Benny (#137) remains out, per the earlier review.

## 0.9.9 — principle leaves hide from the slash menu

0.9.8 kept `disable-model-invocation: true` on the 20 `principle-*` leaves, on the reasoning that they have no command and are read by path from `poteto-mode`. But that flag only blocks *model* invocation. It does not hide a skill from the user `/` menu, so all 20 surfaced as bare `/principle-*` slash commands in every session (confirmed across projects on the desktop app). They are internal references; users should never invoke them.

Fix: swap the flag for `user-invocable: false` on all 20 leaves. Per the [Claude Code skills docs](https://code.claude.com/docs/en/skills.md), `user-invocable: false` hides a skill from the `/` menu and controls menu visibility only, not Skill-tool or file access — so `poteto-mode` reading each leaf by path (`../principle-<name>/SKILL.md`, the mechanism the leaves have always used) is untouched. The two flags are mutually exclusive: setting both leaves a skill neither user- nor model-invocable, so this is a swap, not an addition. The visible consequence is that the leaves become model-auto-invocable on description match — the same standing the 12 command-paired skills took in 0.9.8, and immaterial to the by-path reference the leaves actually rely on. The invariant is now: every command carries `disable-model-invocation: true`, no command-paired skill carries it, and every `principle-*` leaf carries `user-invocable: false`.

## 0.9.8 — command-paired skills drop `disable-model-invocation`

The 0.9.7 fix put `disable-model-invocation: true` on all 24 command trampolines so the Skill tool resolves a colliding name to the skill. But 12 of those skills carried the same flag in their own frontmatter (present since the initial port), and the flag on a **skill** makes the Skill tool refuse the invocation outright. Net effect: the 0.9.5 SessionStart mandate ("invoke `pstack:poteto-mode` with the Skill tool") was refused every session, five of the six direct-entry skills it lists (`poteto-mode`, `tdd`, `architect`, `arena`, `interrogate`; only `how` and `why` were unflagged) were model-unreachable, and every user-typed `/pstack:<name>` for a flagged skill expanded to a trampoline body the model then couldn't follow. 0.9.7 didn't cause the skill-side flags, but it surfaced them: before it, the same calls died in the trampoline loop instead.

Fix: remove the flag from the 12 command-paired skills that carried it (`architect`, `arena`, `automate-me`, `blast-radius`, `figure-it-out`, `interrogate`, `poteto-mode`, `recall`, `reflect`, `show-me-your-work`, `tdd`, `thermo-nuclear-code-quality-review`). The resulting invariant is symmetric: every command carries the flag, no command-paired skill does. The `principle-*` leaves keep it — they have no commands and are deliberately read by path from `poteto-mode`. Model auto-invocation on description match is now possible for the 12; that is the 0.9.5 design intent, and the same standing the other 12 always-unflagged skills (`how`, `why`, `babysit`, `deslop`, …) already had.

`tests/skill-collision-repro.sh` gains the mirrored static invariant (no skill with a same-named command may carry the flag) and a fourth behavioral leg preserving the repro: with the flag on the skill, the Skill tool refuses the invocation even though the command no longer shadows it.

## 0.9.7 — command trampolines no longer shadow their skills

Every user-facing skill ships with a same-named `commands/<name>.md` trampoline whose body is "Invoke the `<name>` skill and follow it." On Claude Code, the Skill tool resolves a colliding name to the **command**, not the skill — so a model-initiated invoke of `pstack:<name>` got the trampoline back, which told it to invoke the skill, which resolved to the trampoline again. Mutual recursion; the real `SKILL.md` never loaded. This hit every model-side entry path, including the 0.9.5 SessionStart mandate (whose whole job is telling the model to invoke `pstack:poteto-mode`), and it made each name appear twice in the model's skill list. Observed in desktop-app sessions (inline `--plugin-dir` loading, same path as the 0.9.3 entry); reproduced on CLI 2.1.195 with a minimal two-artifact plugin.

Fix: all 24 command files now carry `disable-model-invocation: true` — the flag the `principle-*` leaf skills already use. Verified on 2.1.195 with the same minimal plugin: the Skill tool then resolves the colliding name to the skill (its `SKILL.md` is what gets injected), while a user-typed `/plugin:<name>` still runs the command trampoline, whose "invoke the skill" body now lands on the skill instead of looping. Command bodies are unchanged, so the Codex prompts path (which reads `description` frontmatter and the filename, and ignores keys it doesn't know — the established `name`-key precedent) is untouched. Whether a full Codex plugin install still surfaces the stubs in its picker with the flag present is unverified; if it hides them, the skills themselves remain the primary Codex surface and are invocable by name. Incidental finding from the same repro, recorded for future use: `${CLAUDE_PLUGIN_ROOT}` **is** substituted inside command markdown bodies on 2.1.195, not just in hooks and MCP configs.

The repro is preserved as `tests/skill-collision-repro.sh` (manual; needs the `claude` CLI, makes three haiku calls). It checks the static invariant (every command carries the flag) and the three behavioral legs: command wins the collision without the flag, skill wins with it, user-typed `/command` still runs. The first leg is a precedence detector — if it ever fails, upstream changed the undocumented resolution order and the flag should be re-evaluated, not the fix declared broken.

## 0.9.6 — hook hardening and duplication trims (thermo-nuclear review)

A strict maintainability review of the 0.9.3–0.9.5 range drove these:

- `hooks/session-start` collapsed from 43 lines to 3: SessionStart hook stdout reaches context directly (per the hooks docs; verified end-to-end on 2.1.197), so the JSON envelope, the `escape_for_json` pass, and the Cursor/Copilot platform branches — dead code here, since `hooks.json` is the only registration — are gone. This also removes a verified failure-path bug: the old `cat ... 2>&1 || echo` fallback was additive, silently injecting raw `cat` stderr plus the fallback string into session context when the context file was unreadable; now a missing file fails the hook cleanly and injects nothing. The script is no longer adapted from superpowers (NOTICE updated; `run-hook.cmd` remains near-verbatim and attributed).
- Panel-quad enumeration trimmed from the `poteto-mode` meta-files (`SKILL.md`, `references/plan.md`, `references/codex-tools.md`) — the slugs now live only in the four panel skills and the `setup-pstack` sheet, with a grep-identical rule added to Maintenance. This drift class already bit once (0.9.4 fixed a three-reviewers-vs-"four different models" mismatch).
- README's desktop-app `dependency-unsatisfied` narrative deduplicated to a two-sentence summary linking the CHANGES 0.9.3 entry.

## Upstream review through `0452e08` (v0.10.0), 2026-07-01

One upstream pstack commit landed after the `e46364b` sync: `0452e08` adds the dormant `automations/benny/` pack (Slack issue triage plus reproduce-and-fix, built on Cursor's event-triggered automations) and bumps upstream to 0.10.0. Deliberately not ported — rationale and revisit criteria in README → What's deliberately not ported. `cursor-team-kit` has no commits since the sync point (its latest, `679fdaf`, 2026-05-28, predates `e46364b`). The port's skill tree was current with upstream HEAD as of this note; the later 0.9.10 sync carries it forward to v0.11.3 (see above).

## 0.9.5 — poteto-mode auto-fires via SessionStart hook

`plugins/pstack/hooks/` is new. `hooks.json` registers a `SessionStart` hook (matcher `startup|clear|compact`) that injects `hooks/session-start-context.md` (~0.3k tokens) as additional context — the same mechanism superpowers uses to auto-load its skill-use mandate. The injected block routes any non-trivial engineering task into `pstack:poteto-mode` before the first response, lists the direct-entry skills, tells dispatched subagents to ignore it, and defers to explicit user instructions. The full poteto-mode skill still loads only on invoke. `run-hook.cmd` (cross-platform polyglot) and the JSON-emission pattern in `session-start` are adapted from superpowers (MIT; see NOTICE.md and LICENSE-superpowers). Codex is unaffected — it has no plugin hook runtime; invoke poteto-mode by name there.

## 0.9.4 — Sonnet 5 joins the default panels

The multi-model panels (`arena` runners, `architect` runners, `interrogate` reviewers, `how` critics) grow from a triple to a quad: `claude-opus-4-8`, `claude-sonnet-5`, `claude-opus-4-6`, `claude-sonnet-4-6` — both generations in each of two tiers. This also restores upstream's four-way `interrogate` split; the port had been running three reviewers under a "four different models" description. `setup-pstack` adds Sonnet 5 (`claude-sonnet-5`) to the available-family enumeration and to the four panel rows of its default sheet. Single-model delegation defaults stay `claude-opus-4-8`. Touched: `arena`, `architect`, `interrogate`, `how`, `setup-pstack`, `poteto-mode` (`SKILL.md`, `references/plan.md`, `references/codex-tools.md`), and the README substitution-table panel row. The historical Cursor→Claude mapping rows (`composer-2.5-fast`, `gpt-5.x`) are unchanged — they record what the 0.9.2 sync substituted, not current defaults.

## 0.9.3 — dependency declaration removed

`plugin.json` no longer declares `dependencies: [{ "name": "plugin-dev", "marketplace": "claude-plugins-official" }]`, and `marketplace.json` drops the matching `allowCrossMarketplaceDependenciesOn`. The Claude Code desktop app passes every enabled plugin to the CLI as a session-only `--plugin-dir`, which strips marketplace identity (`pstack@inline`); a cross-marketplace dependency can never resolve in that mode, and the loader disables the entire plugin with `dependency-unsatisfied`. Result: pstack loaded in the CLI and the VS Code extension but silently vanished from desktop-app sessions. `optional: true` on a dependency entry passes `claude plugin validate` but is not honored by the loader (tested on 2.1.197). `plugin-dev` is now a documented manual install (README → Dependencies); skill bodies still route skill-authoring to `plugin-dev:skill-development` when it is present.

## Codex port

pstack also ships as a Codex plugin. The skill bodies are not forked or regenerated. The same `skills/` tree serves both runtimes. One mapping file does the Claude-to-Codex translation. That single-mapping-file spine is the same one the official `superpowers` plugin ships for Codex.

pstack diverges from superpowers in one respect, and it is deliberate. superpowers writes its skill prose in tool-neutral language ("dispatch a subagent"), so no skill names a runtime tool and no per-skill note is needed. pstack instead keeps the upstream Claude-native prose intact, to stay in lockstep with upstream sync, and adds a one-line Platform note to each skill that names a Claude primitive. The note points at the mapping. Rewriting 44 upstream skills into neutral language would fork them from upstream and was rejected for that reason.

**Added.**

- `plugins/pstack/.codex-plugin/plugin.json` is the Codex plugin manifest (`skills: ./skills/`), with key-parity to the `superpowers` Codex manifest.
- `.agents/plugins/marketplace.json` is the Codex marketplace manifest at the repo root, sourcing `./plugins/pstack` the way the Claude `.claude-plugin/marketplace.json` does.
- `plugins/pstack/skills/poteto-mode/references/codex-tools.md` is the single Claude to Codex map. It covers tool actions (`Agent` becomes `spawn_agent` / `wait_agent` / `close_agent`, `AskUserQuestion` becomes plain text, the todolist becomes `update_plan`), the `multi_agent` config flag, subagent policy (Codex has no `poteto-agent` type, so dispatch a `spawn_agent` told to read `poteto-mode` first), model slugs (`claude-*` becomes your configured Codex models), the Claude built-ins pstack names (`run`, `verify`, `loop`, `plugin-dev:skill-development`), and the instructions file (`AGENTS.md`).

**Platform notes (pointer-only edits).**

- `skills/poteto-mode/SKILL.md` gained a "Platform Adaptation" section pointing at the mapping.
- `skills/{architect,arena,automate-me,babysit,how,interrogate,reflect,why}/SKILL.md` each gained a one-line Platform note, since each names a Claude tool, a `claude-*` slug, or a Claude built-in. The pure-prose skills (the `principle-*` set, `tdd`, `figure-it-out`, and the cursor-team-kit imports) needed nothing.
- `skills/setup-pstack/SKILL.md` gained a Codex branch. It writes `~/.codex/pstack-models.md` referenced from `~/.codex/AGENTS.md`, using Codex slugs instead of `claude-*`.

**Commands.** The 24 `commands/*.md` files are Codex-compatible as written, no rewrite needed. Codex command discovery reads the `description` frontmatter and the filename and ignores the extra `name` key, and each body (`Invoke the <skill> skill and follow it`) is a valid Codex prompt. They surface as slash commands once the full plugin is installed in Codex. For the symlink-based install, drop the same files into `~/.codex/prompts/` for loose `/name` shortcuts alongside the symlinked skills.

**Deliberately not ported.**

- `agents/poteto-agent.md`. Codex has no `subagent_type`, so ad-hoc subagents are dispatched via `spawn_agent` told to read `poteto-mode` first. The mapping covers this.

**Verified.** Codex discovers the skills and namespaces them under `pstack` (`pstack:poteto-mode` and so on) in a live session. Mapping resolution mid-task and `spawn_agent` fan-out follow the `superpowers` pattern and are worth confirming per session.

**Maintenance.** The open-pstack version string lives in `plugins/pstack/.claude-plugin/plugin.json`, `.claude-plugin/marketplace.json`, `plugins/pstack/.codex-plugin/plugin.json`, and the current-version row in `UPSTREAM.md`. A version bump must update all four. `tests/skill-collision-repro.sh` checks that they match. `.agents/plugins/marketplace.json` carries no version field. The canonical default panel quad is the model matrix in `provider-dispatch.md` (`provider:model@default` in family-row order). It is copied into the three panel skills (`arena`, `architect`, `interrogate`) and the `setup-pstack` first-run sheet. Keep those copies grep-identical when models change. The static test derives the quad from the matrix. After a sync that touches `skills/poteto-mode/scripts/`, run `bun install --frozen-lockfile`, `bun run test`, and `bun run typecheck` from that directory. `hooks/session-start-context.md` restates skill one-liners. Re-verify it whenever skill names or descriptions change. The package must not contain a `commands/` layer. Claude Code and Codex load the native `skills/` tree directly, and a command layer duplicates that inventory. The 24 `principle-*` leaves carry `user-invocable: false` to request exclusion from the user picker while `poteto-mode` reads them by path. Claude honors the metadata; Codex 0.149.0 currently does not ([#8](https://github.com/ericlitman/open-pstack/issues/8)). They must not carry `disable-model-invocation`, which would make them unreachable to the model. Re-run the behavioral mode of `tests/skill-collision-repro.sh` after Claude Code upgrades to check both model-initiated and user-initiated native skill invocation.

## 0.9.2 sync (against upstream `e46364b`)

Upstream pstack jumped from `0.1.0` → `0.9.2` between syncs. 30+ commits, including 11 new files.

**New pstack-native skills/playbooks pulled in (Cursor refs in them re-substituted on the way in):**

- `skills/blast-radius/` — find what a change could break beyond the diff.
- `skills/recall/` — reconstruct recent working context. Cursor transcript path (`~/.cursor/projects/<slug>/agent-transcripts/<uuid>/<uuid>.jsonl`) rewritten to Claude Code path (`~/.claude/projects/<encoded-cwd>/<uuid>.jsonl`).
- `skills/setup-pstack/` — model-per-role configuration. Substantially rewritten: original wrote `~/.cursor/rules/pstack-models.mdc` (Cursor's `.mdc` always-applied-rule feature, no Claude Code analog). Replacement writes `~/.claude/pstack-models.md` and instructs the user to add an `@~/.claude/pstack-models.md` include to `~/.claude/CLAUDE.md` so the override sheet loads each session.
- `skills/principle-build-the-lever/`, `skills/principle-sequence-verifiable-units/` — new principles.
- `skills/poteto-mode/playbooks/{hillclimb,pause-safely,refactoring,session-pickup,trace-forensics}.md` — new playbooks.
- `skills/interrogate/references/code-quality-review.md` — new interrogate reference.

**Re-applied substitutions across changed + new content:**

- Bulk pass through 28 files via Python regex covering all entries in the substitution table above.
- Targeted fixes for variants the bulk pass missed:
  - `recall/SKILL.md` line 15 — Cursor transcript path rewrite.
  - `why/SKILL.md` line 100 — MCP discovery wording variant.
  - `poteto-mode/SKILL.md` lines 22–25 — `cursor-team-kit` qualifiers removed; Bugbot triage refs to `babysit`.
  - `reflect/SKILL.md` lines 37, 45, 49 — readonly/agent-mode language; `Task` → `Agent`.
  - `poteto-mode/playbooks/session-pickup.md` line 7 — `agent-transcripts/` path.
  - `poteto-agent.md` description — `generalPurpose` → `general-purpose`.
- Bumped Opus references from `claude-opus-4-7` to `claude-opus-4-8` (current Claude family head).
- Multi-model panels (`arena`, `architect`, `interrogate`, `how` critics, and the `setup-pstack` defaults) had a duplicate `claude-sonnet-4-6` in the third slot. Replaced one with `claude-opus-4-6` so the panel runs three distinct models (`claude-opus-4-8`, `claude-opus-4-6`, `claude-sonnet-4-6`) instead of two — cross-generation diversity inside the opus tier where cross-vendor diversity isn't available.
- All single-subagent delegation defaults bumped from `claude-sonnet-4-6` to `claude-opus-4-8`: `bug-fix`, `feature`, `perf-issue`, `refactoring`, `hillclimb` (the five poteto-mode code-writing playbooks); `how-explorer`, `why-investigators`, `reflect-tooling` (the three multi-subagent dispatches that run the same model in parallel rather than a diverse panel). Setup-pstack override sheet updated to match. Meta-defaults in `poteto-mode/SKILL.md` and `plan.md` rephrased: "default `claude-opus-4-8` for code-writing delegations" replaces the old "claude-sonnet-4-6 for code" wording. Sonnet now appears only in the diverse 3-model panels.

**Command stubs added:** `commands/blast-radius.md`, `commands/recall.md`, `commands/setup-pstack.md`.

**Manifest changes:**

- `plugins/pstack/.claude-plugin/plugin.json` — version `0.1.0` → `0.9.2`; added `displayName: "pstack (Claude Code port)"`.
- `.claude-plugin/marketplace.json` — plugin entry version bumped to `0.9.2`.

**Team-kit imports:** unchanged. The upstream diff showed only `verify-this` (which we didn't import) changed in `cursor-team-kit/skills/`.

**`babysit` skill:** unchanged. Locally authored; not affected by upstream sync.

---

## Substitution table

| Cursor primitive | Replaced with | Notes |
| --- | --- | --- |
| `Task` tool | `Agent` tool | Claude Code's `Agent` tool is the equivalent. |
| `subagent_type: generalPurpose` | `subagent_type: "general-purpose"` | Kebab-case in Claude Code. |
| `subagent_type: "poteto-agent"` | `subagent_type: "poteto-agent"` | Unchanged — this plugin ships that agent. |
| `readonly: true` / `readonly: false` | (dropped; rewritten as "pick a subagent_type that retains MCP access") | Claude Code controls tool/MCP access via subagent_type, not a per-call readonly flag. |
| `AskQuestion` | `AskUserQuestion` | Tool rename; semantics match. |
| Cursor `/loop` (built-in) | Claude Code `loop` skill | 1:1 replacement; available as a built-in skill. |
| Cursor `/babysit` (built-in) | This plugin's `babysit` skill | New Claude Code analog at `skills/babysit/` wrapping `gh` + `loop`. |
| Cursor `/create-skill` (built-in) | `plugin-dev:skill-development` skill | Claude Code's authoring guidance for SKILL.md. |
| `cursor-team-kit` `/deslop` | This plugin's `deslop` skill | Ported in (only team-kit skill imported). |
| `cursor-team-kit` `control-cli` | `run` skill (Claude Code built-in) | Drives CLIs/TUIs. |
| `cursor-team-kit` `control-ui` | `verify` skill (Claude Code built-in, VS Code extension) | Drives UIs (browser/Electron). |
| `~/.cursor/projects/*/` transcripts | `~/.claude/projects/<encoded-cwd>/*.jsonl` | `<encoded-cwd>` is the absolute working directory with every character except ASCII letters, digits, and `-` turned into `-`, so `/Users/you/my.proj` becomes `-Users-you-my-proj`. |
| Cursor `agent-transcripts/` dir | `~/.claude/projects/<encoded-cwd>/` | Same as above. |
| Arena cross-judge from "a different model family from the parent's" | A cross-judge whose provider differs from the parent and from the likely base candidate | Provider dispatch routes by provider, not by Cursor model family. The judge should not have written the candidate it is most likely to pick. `setup-pstack` states the same rule for the cross-judge pool. |
| `.cursor/skills/`, `~/.cursor/skills/`, `~/.cursor/plugins/` | `.claude/skills/`, `~/.claude/skills/`, `~/.claude/plugins/` | Path-only translation. |
| Cursor `mcps/` directory | Tool list at top of system prompt (`mcp__<server>__<name>` prefixed entries), or `.mcp.json`, or `claude mcp list` | Discovery surface differs. |
| Model: `composer-2.5-fast` | `claude-sonnet-4-6` | Fast workhorse Claude. |
| Model: `claude-opus-4-X-thinking-xhigh` | `claude-opus-4-8` (with note "extended thinking" where it appeared in a table) | Claude Code uses model IDs without the Cursor UI suffix; extended thinking is a separate knob. Originally substituted to `4-7`, then bumped to `4-8` to match the current Claude family. |
| Model: `gpt-5.3-codex-high-fast`, `gpt-5.5-high-fast` | `claude-sonnet-4-6`, `claude-haiku-4-5` | Within Claude Code, cross-vendor diversity isn't native. Skills that need a harsher pass now route to the bundled `thermo-nuclear-code-quality-review` skill (imported from cursor-team-kit) as the escape hatch. Different style of pressure (strict maintainability rubric), not vendor diversity. |

## New / imported files

- `skills/babysit/SKILL.md` — Claude Code analog of Cursor's `/babysit`. Wraps `gh pr view` / `gh pr checks` / `gh run view --log-failed` plus the `loop` skill for pacing. Provenance: independently authored; workflow informed by Cursor's public `/babysit` behavior. Not a copy of Cursor's closed-source implementation.
- `commands/babysit.md` — slash command routing to the babysit skill.
- `skills/thermo-nuclear-code-quality-review/SKILL.md` — imported verbatim from `cursor-team-kit`. Used as the harsher-critique escape hatch in `arena`, `interrogate`, `architect`, and `how` (replaces the Cursor-original cross-vendor bridge).
- `commands/thermo-nuclear-code-quality-review.md` — slash command stub.
- `skills/make-pr-easy-to-review/`, `skills/fix-ci/`, `skills/fix-merge-conflicts/`, `skills/get-pr-comments/`, `skills/what-did-i-get-done/` — five more skills imported verbatim from `cursor-team-kit`. Audited for Cursor-specific refs; none found, so no rewiring needed. They use only `gh` and `git` primitives.
- `commands/make-pr-easy-to-review.md`, `commands/fix-ci.md`, `commands/fix-merge-conflicts.md`, `commands/get-pr-comments.md`, `commands/what-did-i-get-done.md` — slash command stubs.
- `.claude-plugin/marketplace.json` — marketplace manifest so the repo is installable via `/plugin marketplace add michael-denyer/pstack-claude`. Declares `allowCrossMarketplaceDependenciesOn: ["claude-plugins-official"]` so the cross-marketplace dependency on `plugin-dev` resolves at install time.
- `plugin.json` `dependencies` — declares `plugin-dev` (from `claude-plugins-official` marketplace) as a required dependency, since the rewiring routes skill-authoring tasks to `plugin-dev:skill-development`.

## Per-skill changes applied

### `skills/poteto-mode/SKILL.md`

- Triggers section: `create-skill` → `plugin-dev:skill-development`; `deslop` "from `cursor-team-kit`" qualifier dropped; `control-cli`/`control-ui` line replaced with `run`/`verify` driver guidance; `Cursor's built-in **babysit**` → this plugin's `babysit`.
- Subagents section: `Task` → `Agent`; `composer-2.5-fast` → `claude-sonnet-4-6`; `claude-opus-4-8-thinking-xhigh` → `claude-opus-4-8`; "agent mode (readonly strips MCP)" → "full tool access (do not pick a subagent_type that strips MCP)".

### `skills/poteto-mode/references/plan.md`

- `AskQuestion` → `AskUserQuestion`.
- `generalPurpose` → `"general-purpose"`; built-in `plan` subagent_type → Claude Code's built-in `Plan` agent; both model slugs updated.
- `create-skill` → `plugin-dev:skill-development`.
- `control-ui` / `control-cli` lines replaced with `verify` / `run` driver skills.
- "Cursor's built-in **babysit** skill" → "the **babysit** skill".

### `skills/poteto-mode/playbooks/`

- `authoring-a-skill.md`: `create-skill` → `plugin-dev:skill-development`.
- `autonomous-run.md`: "Cursor's `/loop` command (a built-in, not a pstack skill)" → "Claude Code's `loop` skill (built-in)".
- `bug-fix.md`, `feature.md`, `perf-issue.md`: `composer-2.5-fast` → `claude-sonnet-4-6`; "control skill" → "driver skill (`run` for CLIs/TUIs, `verify` for UIs)".
- `eval.md`: `agent-transcripts/` + `~/.cursor/projects/*/` → `~/.claude/projects/<encoded-cwd>/*.jsonl`.
- `opening-a-pr.md`: `Task` → `Agent`; "Cursor's built-in **babysit** skill" → "the **babysit** skill".
- `prototype.md`, `runtime-forensics.md`, `visual-parity.md`: "control skill" → "driver skill" with `run`/`verify` explicit.

### `skills/automate-me/SKILL.md`

- Description and body: `create-skill` (6 places) → `plugin-dev:skill-development`.
- `AskQuestion` (2 places) → `AskUserQuestion`.
- `.cursor/skills/` / `~/.cursor/skills/` → `.claude/skills/` / `~/.claude/skills/`.
- `agent-transcripts/` + `~/.cursor/projects/*/` → `~/.claude/projects/<encoded-cwd>/*.jsonl`.

### `skills/reflect/SKILL.md` + `references/*.md`

- Transcript paths → `~/.claude/projects/<encoded-cwd>/*.jsonl`.
- `Task` → `Agent` (in SKILL.md and all three reviewer references).
- `generalPurpose` → `"general-purpose"`; `readonly: false` + "agent mode" → "pick a subagent_type that retains MCP access".
- Model slugs updated (`composer-2.5-fast` → `claude-sonnet-4-6`; `claude-opus-4-8-thinking-xhigh` → `claude-opus-4-8`).
- `create-skill` (3 routing rules) → `plugin-dev:skill-development`.
- Reference files: `.cursor/skills/`, `~/.cursor/skills/`, `~/.cursor/plugins/` → `.claude/...`, `~/.claude/...`.

### `skills/why/SKILL.md`

- MCP discovery: Cursor environment / `mcps/` directory → Claude Code tool list / `.mcp.json` / `claude mcp list`.
- `generalPurpose` → `"general-purpose"`; readonly/agent-mode language → "pick a subagent_type that retains MCP access".
- Model slugs updated.

### `skills/how/SKILL.md`

- `generalPurpose` → `"general-purpose"` (all 4 occurrences).
- `composer-2.5-fast` → `claude-sonnet-4-6` (replace_all).
- `claude-opus-4-8-thinking-xhigh` → `claude-opus-4-8` (replace_all for inline; table cell updated separately).
- Critic model table: GPT slugs → Claude family; added note about bridging to `/gsd-review` for cross-vendor critique.
- `readonly: true` lines dropped from subagent config blocks.

### `skills/interrogate/SKILL.md`

- `Task tool` → `Agent` tool.
- Reviewer model table: `claude-opus-4-8-thinking-xhigh` / `gpt-5.3-codex-high-fast` / `gpt-5.5-high-fast` / `composer-2.5-fast` → Claude family variants.
- `generalPurpose` → `"general-purpose"`; `readonly: true` dropped.
- Added cross-vendor-bridge note (`/gsd-review`).

### `skills/arena/SKILL.md`

- Default 3 runners: GPT/composer slugs → Claude family. Added cross-vendor-bridge note.

### `skills/architect/SKILL.md`

- Phase B runner slugs: GPT/composer → Claude family. Added cross-vendor-bridge note.

### `skills/show-me-your-work/SKILL.md`

- Transcript audit path: `agent-transcripts/` + `~/.cursor/projects/*/` → `~/.claude/projects/<encoded-cwd>/*.jsonl`.

## Deliberately not changed

- **`claude-opus-4-8` model ID.** Already a valid Claude model; no edit needed beyond stripping the Cursor `-thinking-xhigh` UI suffix. Extended thinking is configured separately, not as a model variant.
- **`/loop`, `/deslop`, `/babysit` slash references.** These all resolve in Claude Code now (`loop` is a built-in skill; `deslop` and `babysit` ship in this plugin).
- **`run_in_background: true`.** Claude Code's `Agent` tool supports this — kept as-is.
- **"currently open files, recent edits, the cursor location"** in `why/SKILL.md` (line 59). "Cursor location" here means editor cursor (caret position), not the IDE; generic phrasing, no edit.
- **`poteto-agent` subagent ID.** Plugin ships this agent; references stay.
- **Cursor's `/create-skill` writing style guidance referenced indirectly.** Pointed at `plugin-dev:skill-development` which covers the same ground in Claude Code. If you want stricter parity, also install Anthropic's `superpowers:writing-skills` skill.

## Forking note

This port now diverges from upstream pstack content. To track upstream:

```bash
# diff against the pinned commit
diff -ru /tmp/pstack-src/pstack/skills/ skills/  # caveats: ignores the babysit/ and deslop/ dirs
```

If you want a clean re-port (e.g. when upstream releases v0.2.0), the rebuild recipe is:

1. Copy upstream skills verbatim.
2. Re-apply the substitution table above (most of it is mechanical find/replace).
3. Re-add `skills/babysit/`, `commands/babysit.md`, and the cursor-team-kit `deslop` import.

## Provenance

- Upstream pstack: [cursor/plugins/pstack @ e46364b](https://github.com/cursor/plugins/tree/e46364b8be46000b7df0f260550cd712afbb8d36/pstack) — MIT, (c) 2026 Lauren Tan.
- Upstream deslop: [cursor/plugins/cursor-team-kit/skills/deslop @ e46364b](https://github.com/cursor/plugins/tree/e46364b8be46000b7df0f260550cd712afbb8d36/cursor-team-kit/skills/deslop) — MIT, (c) 2026 Cursor.
- babysit: independently authored; workflow informed by Cursor's public `/babysit` behavior — no code or prose copied.
- Inspected for prior-art decisions: [v1truv1us/ai-eng-system](https://github.com/v1truv1us/ai-eng-system) (namespaces pstack under `pstack/` but keeps Cursor refs intact); [Evan-Kim2028/agent-fleet](https://github.com/Evan-Kim2028/agent-fleet) (vendors pstack under `base-kit/pstack/`, same posture).
