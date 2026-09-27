"use client";

import { useState } from "react";
import { describePlan } from "../lib/agent/plan";
import type { Plan } from "../lib/agent/types";
import type { Agent } from "../lib/agent/use-agent";
import { AgentIcon, EditIcon } from "./icons";

/** Strips the machine-readable plan so the bubble reads as plain English. */
function spoken(text: string, hasPlan: boolean) {
  const start = text.indexOf("{");
  const trimmed = (start >= 0 ? text.slice(0, start) : text).trim();
  if (trimmed) return trimmed;
  // Only claim a change exists when one was actually understood.
  return hasPlan
    ? "Here is what I would change."
    : "I could not turn that into a change.";
}

export function AgentChat({
  agent,
  onReview,
}: {
  agent: Agent;
  onReview: (plan: Plan) => void;
}) {
  const [draft, setDraft] = useState("");
  const busy = agent.phase === "thinking";

  return (
    <>
      <div className="flex-1 overflow-y-auto p-4">
        {agent.messages.map((message) => (
          <div
            key={message.id}
            className={`chat ${message.role === "user" ? "chat-end" : "chat-start"}`}
          >
            <div
              className={`chat-bubble ${
                message.role === "user" ? "chat-bubble-primary" : ""
              }`}
            >
              {message.role === "assistant" && message.text === "" ? (
                <span className="loading loading-dots loading-sm" />
              ) : (
                spoken(message.text, Boolean(message.plan))
              )}
            </div>
            {message.issue && (
              <div className="chat-footer mt-2 text-xs text-warning">
                {message.issue}
              </div>
            )}
            {message.plan && (
              <div className="chat-footer mt-2">
                <button
                  type="button"
                  className="btn btn-sm btn-secondary"
                  onClick={() => onReview(message.plan as Plan)}
                >
                  <EditIcon />
                  Review {describePlan(message.plan).toLowerCase()}
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      <form
        className="join w-full border-t border-base-300 p-3"
        onSubmit={(event) => {
          event.preventDefault();
          agent.send(draft);
          setDraft("");
        }}
      >
        <input
          className="input join-item w-full"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Rename, move, or regroup devices"
          disabled={busy}
          aria-label="Message the agent"
        />
        <button
          type="submit"
          className="btn btn-primary join-item"
          disabled={busy || draft.trim().length === 0}
        >
          {busy ? (
            <span className="loading loading-spinner loading-xs" />
          ) : (
            <AgentIcon />
          )}
          Send
        </button>
      </form>
    </>
  );
}
