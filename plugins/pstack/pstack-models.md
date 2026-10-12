# pstack model configuration

Provider-qualified per-role choices. Read the installed pstack provider-dispatch reference before dispatching a configured role. Every documented role remains present. `inherit-parent` and `auto` use the parent model natively and still count as one panel lane.

This sheet ships with the plugin. The Claude Code SessionStart hook injects it, and it replaces `~/.claude/pstack-models.md`. Change it in the repository and update the plugin. `/setup-pstack` does not write it.

<!-- budget: medium (high) -->
feature, refactoring: claude:opus@medium
bug-fix: claude:opus@medium
perf-issue: claude:opus@medium
hillclimb: claude:opus@medium
judgment and prose: claude:opus@high
hardest tasks: claude:opus@high
how explorer: claude:haiku@medium
how explainer: claude:opus@high
why investigators, synthesizer: inherit-parent
reflect tooling, judgment, divergent, synthesizer: inherit-parent
arena runners: claude:sonnet@medium, codex:gpt-6.1-sol@medium, magpie:wevnal/deepseek-v4.1-flash@high, magpie:wevnal/glm-5.3-flash@high
arena cross-judge pool: claude:opus@high, codex:gpt-6.1-sol@high
swarm workers: claude:sonnet@medium
architect runners: claude:opus@medium, codex:gpt-6.1-sol@medium
interrogate reviewers: claude:opus@high, codex:gpt-6.1-sol@high
