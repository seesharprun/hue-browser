/// <reference lib="webworker" />
import {
  InterruptableStoppingCriteria,
  pipeline,
  type TextGenerationPipeline,
  TextStreamer,
} from "@huggingface/transformers";

// Measured against a suite of ten phrasings, this build answered correctly
// eight times. The smaller Qwen2.5-0.5B managed one, and the Qwen2.5-1.5B
// exports are unusable in the browser, so this is the smallest model that
// holds the plan format reliably.
const MODEL = "onnx-community/Llama-3.2-1B-Instruct";

type Turn = { role: string; content: string };

type Incoming = { type: "load" } | { type: "ask"; messages: Turn[] };

let generator: TextGenerationPipeline | null = null;

async function load() {
  if (generator) return generator;
  generator = await pipeline("text-generation", MODEL, {
    // Roughly 800 MB. The int8 build is twice the size for no measured gain.
    dtype: "q4f16",
    device: "webgpu",
  });
  return generator;
}

/**
 * True once the text holds one complete JSON object. Left alone, the model
 * happily writes the same plan over and over until it runs out of tokens.
 */
function planIsComplete(text: string) {
  const start = text.indexOf("{");
  if (start === -1) return false;
  let depth = 0;
  for (let at = start; at < text.length; at++) {
    if (text[at] === "{") depth++;
    if (text[at] === "}" && --depth === 0) return true;
  }
  return false;
}

async function ask(messages: Turn[]) {
  const run = await load();
  let reply = "";
  const stop = new InterruptableStoppingCriteria();

  const streamer = new TextStreamer(run.tokenizer, {
    skip_prompt: true,
    skip_special_tokens: true,
    callback_function: (text: string) => {
      reply += text;
      self.postMessage({ type: "token", text: reply });
      if (planIsComplete(reply)) stop.interrupt();
    },
  });

  await run(messages, {
    // Long enough that a plan is never cut off mid-object.
    max_new_tokens: 320,
    // Sampling drifted off the plan format often enough to matter, and greedy
    // decoding also means the same request always gets the same answer.
    do_sample: false,
    stopping_criteria: stop,
    streamer,
  });

  self.postMessage({ type: "reply", text: reply });
}

self.addEventListener("message", (event: MessageEvent<Incoming>) => {
  const run = event.data.type === "load" ? load() : ask(event.data.messages);
  run
    .then(() => {
      if (event.data.type === "load") self.postMessage({ type: "ready" });
    })
    .catch((cause: unknown) => {
      self.postMessage({
        type: "failed",
        message: cause instanceof Error ? cause.message : "The agent stopped.",
      });
    });
});
