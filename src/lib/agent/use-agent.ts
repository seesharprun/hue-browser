"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { DeviceRow } from "../devices/types";
import { buildProposals } from "./apply";
import { buildContext, examples, systemPrompt } from "./context";
import { parsePlan, planIssue } from "./plan";
import type { AgentPhase, ChatMessage, GroupLookup } from "./types";

const id = () => Math.random().toString(36).slice(2);

const OPENER =
  "Tell me how you would like your devices organised. I can rename them in bulk, move them between rooms, or add and remove them from zones.";

/**
 * The model is only fetched once the drawer is opened, so a visitor who never
 * asks for help never pays for the download.
 */
export function useAgent(rows: DeviceRow[], groups: GroupLookup) {
  const [phase, setPhase] = useState<AgentPhase>("idle");
  const [error, setError] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: id(), role: "assistant", text: OPENER },
  ]);
  const worker = useRef<Worker | null>(null);
  const history = useRef<{ role: string; content: string }[]>([]);
  // Read inside the worker callback, which would otherwise close over the
  // fleet as it looked when the drawer was first opened.
  const fleet = useRef({ rows, groups });
  fleet.current = { rows, groups };

  useEffect(() => {
    return () => {
      worker.current?.terminate();
      worker.current = null;
    };
  }, []);

  const start = useCallback(() => {
    if (worker.current || phase === "unsupported") return;
    if (typeof navigator === "undefined" || !("gpu" in navigator)) {
      setPhase("unsupported");
      return;
    }

    const created = new Worker(new URL("./worker.ts", import.meta.url), {
      type: "module",
    });
    worker.current = created;
    setPhase("loading");

    created.addEventListener("message", (event: MessageEvent) => {
      const data = event.data as {
        type: string;
        text?: string;
        message?: string;
      };
      if (data.type === "ready") {
        setPhase("ready");
        return;
      }
      if (data.type === "token") {
        // Replace the trailing reply so tokens stream into one bubble.
        setMessages((current) => {
          const rest = current.slice(0, -1);
          const last = current[current.length - 1];
          if (last?.role !== "assistant" || last.id !== "streaming")
            return current;
          return [...rest, { ...last, text: data.text ?? "" }];
        });
        return;
      }
      if (data.type === "reply") {
        const text = data.text ?? "";
        history.current.push({ role: "assistant", content: text });
        const parsed = parsePlan(text);
        // A plan that changes nothing is not worth reviewing, so the chat
        // carries on and asks for something more specific instead.
        const proposals = parsed
          ? buildProposals(parsed, fleet.current.rows, fleet.current.groups)
          : [];
        const plan = proposals.length > 0 ? parsed : null;
        const issue = plan
          ? null
          : parsed
            ? "That would not change anything. Which devices did you mean?"
            : planIssue(text);
        setMessages((current) => [
          ...current.slice(0, -1),
          {
            id: id(),
            role: "assistant",
            text,
            plan: plan ?? undefined,
            issue: issue ?? undefined,
          },
        ]);
        setPhase("ready");
        return;
      }
      if (data.type === "failed") {
        setError(data.message ?? "The agent stopped.");
        setPhase("error");
      }
    });

    created.postMessage({ type: "load" });
  }, [phase]);

  const send = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || !worker.current || phase !== "ready") return;

      if (history.current.length === 0) {
        history.current.push(
          {
            role: "system",
            content: systemPrompt(buildContext(rows, groups)),
          },
          ...examples,
        );
      }
      history.current.push({ role: "user", content: trimmed });

      setMessages((current) => [
        ...current,
        { id: id(), role: "user", text: trimmed },
        { id: "streaming", role: "assistant", text: "" },
      ]);
      setPhase("thinking");
      worker.current.postMessage({
        type: "ask",
        messages: [...history.current],
      });
    },
    [phase, rows, groups],
  );

  return { phase, error, messages, start, send };
}

export type Agent = ReturnType<typeof useAgent>;
