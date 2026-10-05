import { describe, expect, it } from "bun:test";
import { join } from "node:path";

// The extension imports Pi's types, which this workspace cannot resolve without
// a Pi dependency. A computed path keeps tsc from following the import.
const EXTENSION = join(import.meta.dir, "../../../../pi-agents/preload-poteto-mode.ts");

type Entry = { type: string; message?: { role: string; content: unknown } };
type InputHandler = (
  event: { type: "input"; text: string; source: string; streamingBehavior?: string },
  ctx: { sessionManager: { getBranch(): Entry[] } }
) => unknown;

async function inputHandler(): Promise<InputHandler> {
  const { default: register } = await import(EXTENSION);
  let handler: InputHandler | undefined;
  register({
    on(name: string, fn: InputHandler) {
      if (name === "input") handler = fn;
    },
  });
  if (!handler) throw new Error("extension registered no input handler");
  return handler;
}

function send(handler: InputHandler, branch: Entry[], streamingBehavior?: string) {
  return handler(
    { type: "input", text: "Task: do it", source: "rpc", streamingBehavior },
    { sessionManager: { getBranch: () => branch } }
  );
}

describe("Pi poteto-mode preload", () => {
  it("prefixes the first prompt with the poteto-mode skill command", async () => {
    expect(send(await inputHandler(), [])).toEqual({
      action: "transform",
      text: "/skill:poteto-mode Task: do it",
    });
  });

  it("leaves a branch that already holds the skill block alone", async () => {
    const branch = [
      {
        type: "message",
        message: {
          role: "user",
          content: [{ type: "text", text: '<skill name="poteto-mode" location="/x/SKILL.md">\nbody\n</skill>\n\nTask: a' }],
        },
      },
      { type: "message", message: { role: "assistant", content: [{ type: "text", text: "done" }] } },
    ];
    expect(send(await inputHandler(), branch)).toEqual({ action: "continue" });
  });

  it("leaves input sent while the agent streams alone", async () => {
    expect(send(await inputHandler(), [], "steer")).toEqual({ action: "continue" });
  });
});
