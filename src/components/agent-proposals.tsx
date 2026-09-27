"use client";

import { useId } from "react";
import { describePlan } from "../lib/agent/plan";
import type { Plan, Proposal } from "../lib/agent/types";
import { CloseIcon, SaveIcon } from "./icons";

export function AgentProposals({
  plan,
  proposals,
  saving,
  onCancel,
  onApply,
}: {
  plan: Plan;
  proposals: Proposal[];
  saving: boolean;
  onCancel: () => void;
  onApply: () => void;
}) {
  const titleId = useId();
  const label =
    plan.field === "name" ? "Name" : plan.field === "room" ? "Room" : "Zones";

  return (
    <dialog className="modal modal-open" aria-labelledby={titleId}>
      <div className="modal-box max-w-3xl">
        <h3 id={titleId} className="text-lg font-semibold">
          Review {proposals.length}{" "}
          {proposals.length === 1 ? "change" : "changes"}
        </h3>
        <p className="mb-4 text-sm text-base-content/60">
          {describePlan(plan)}. Nothing is sent to your bridges until you apply.
        </p>

        {proposals.length === 0 ? (
          <p className="py-6 text-center">
            Every device already matches this, so there is nothing to change.
          </p>
        ) : (
          <div className="max-h-96 overflow-y-auto">
            <table className="table table-pin-rows table-sm">
              <thead>
                <tr>
                  <th>Device</th>
                  <th>{label} now</th>
                  <th>{label} after</th>
                </tr>
              </thead>
              <tbody>
                {proposals.map((item) => (
                  <tr key={item.key}>
                    <td className="truncate">
                      {item.row.name}
                      <span className="block text-xs text-base-content/60">
                        {item.row.bridgeName}
                      </span>
                    </td>
                    <td className="text-base-content/60 line-through">
                      {item.before}
                    </td>
                    <td className="font-medium text-success">{item.after}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="modal-action">
          <button
            type="button"
            className="btn btn-ghost"
            onClick={onCancel}
            disabled={saving}
          >
            <CloseIcon />
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={onApply}
            disabled={saving || proposals.length === 0}
          >
            {saving ? (
              <span className="loading loading-spinner loading-xs" />
            ) : (
              <SaveIcon />
            )}
            Apply {proposals.length}
          </button>
        </div>
      </div>
      <button
        type="button"
        className="modal-backdrop"
        onClick={onCancel}
        disabled={saving}
      >
        <span className="sr-only">Close</span>
      </button>
    </dialog>
  );
}
