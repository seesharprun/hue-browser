"use client";

import type { GroupLookup } from "../lib/agent/types";
import { useAgent } from "../lib/agent/use-agent";
import { useProposals } from "../lib/agent/use-proposals";
import type { PairedBridge } from "../lib/bridges/types";
import type { DeviceRow } from "../lib/devices/types";
import { AgentChat } from "./agent-chat";
import { AgentProposals } from "./agent-proposals";
import { AgentIcon, CloseIcon } from "./icons";

const DRAWER = "agent-drawer";

/** Reassures the user while a one-time model download is in flight. */
function Loading() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
      <span className="lofi-warm text-primary">
        <AgentIcon size="size-12" />
      </span>
      <div>
        <p className="font-semibold">Warming up the assistant</p>
        <p className="text-sm text-base-content/60">
          Downloading the model once, about 800 MB. It then stays in your
          browser and runs entirely on this device.
        </p>
      </div>
      {/* Omitting `value` leaves the element :indeterminate, which daisyUI
          animates on its own. The download arrives as many separate files with
          no combined total, so a percentage would only ever mislead. */}
      <progress className="progress progress-primary w-56" />
      <p className="text-xs text-base-content/60">
        This takes a few minutes on a first visit.
      </p>
    </div>
  );
}

export function AgentDrawer({
  bridges,
  rows,
  groups,
  refresh,
}: {
  bridges: PairedBridge[];
  rows: DeviceRow[];
  groups: GroupLookup;
  refresh: () => void;
}) {
  const agent = useAgent(rows, groups);
  const review = useProposals(bridges, rows, groups, refresh);

  return (
    // The drawer opens from the left so it never sits under the view dial.
    // w-auto stops daisyUI's full-width drawer from breaking the toolbar row.
    <div className="drawer w-auto">
      <input
        id={DRAWER}
        type="checkbox"
        className="drawer-toggle"
        // Loading on open rather than on click also covers keyboard toggling.
        onChange={(event) => {
          if (event.target.checked) agent.start();
        }}
      />
      <div className="drawer-content">
        <label htmlFor={DRAWER} className="btn btn-accent btn-sm">
          <span className="lofi-warm">
            <AgentIcon />
          </span>
          Ask the assistant
          <span className="badge badge-xs badge-neutral">Preview</span>
        </label>
      </div>

      <div className="drawer-side z-40">
        <label
          htmlFor={DRAWER}
          aria-label="Close the assistant"
          className="drawer-overlay"
        />
        <aside className="flex h-full w-full max-w-md flex-col bg-base-200">
          <header className="flex items-center justify-between border-b border-base-300 p-4">
            <h2 className="flex items-center gap-2 font-semibold">
              <AgentIcon />
              Device assistant
              <span className="badge badge-sm badge-neutral">Preview</span>
            </h2>
            <label htmlFor={DRAWER} className="btn btn-ghost btn-sm btn-square">
              <CloseIcon />
              <span className="sr-only">Close</span>
            </label>
          </header>

          {agent.phase === "unsupported" && (
            <div className="p-4">
              <div role="alert" className="alert alert-warning">
                <span>
                  This browser cannot run the assistant. It needs WebGPU, which
                  recent versions of Chrome and Edge provide.
                </span>
              </div>
            </div>
          )}
          {agent.phase === "error" && (
            <div className="p-4">
              <div role="alert" className="alert alert-error">
                <span>{agent.error}</span>
              </div>
            </div>
          )}
          {agent.phase === "loading" && <Loading />}
          {(agent.phase === "ready" || agent.phase === "thinking") && (
            <AgentChat agent={agent} onReview={review.review} />
          )}
        </aside>
      </div>

      {review.plan && (
        <AgentProposals
          plan={review.plan}
          proposals={review.proposals}
          saving={review.saving}
          onCancel={review.cancel}
          onApply={review.apply}
        />
      )}
    </div>
  );
}
