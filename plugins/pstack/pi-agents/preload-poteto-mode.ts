import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";

const SKILL_BLOCK = '<skill name="poteto-mode"';

// pi-subagents lists a skill's location but never inlines its body, and it
// prefixes every task with "Task: ", so Pi's own `/skill:` expansion never
// fires in a child. Prefix the first prompt with `/skill:poteto-mode` so Pi
// expands the catalog's SKILL.md into it. A branch that already holds the
// block, such as a resumed child, keeps its first copy.
export default function (pi: ExtensionAPI) {
  pi.on("input", (event, ctx) => {
    if (event.streamingBehavior) return { action: "continue" };
    const preloaded = ctx.sessionManager.getBranch().some((entry) => {
      if (entry.type !== "message" || entry.message.role !== "user") return false;
      const { content } = entry.message;
      return typeof content === "string"
        ? content.includes(SKILL_BLOCK)
        : content.some((part) => part.type === "text" && part.text.includes(SKILL_BLOCK));
    });
    if (preloaded) return { action: "continue" };
    return { action: "transform", text: `/skill:poteto-mode ${event.text}` };
  });
}
