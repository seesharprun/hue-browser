"use client";

import { useCallback, useMemo, useState } from "react";
import { editDevice } from "../bridges/browser";
import type { PairedBridge } from "../bridges/types";
import type { DeviceRow } from "../devices/types";
import { useToasts } from "../ui/toasts";
import { buildProposals } from "./apply";
import type { GroupLookup, Plan } from "./types";

/**
 * Holds the plan the user asked to review and writes it through the same
 * device edit endpoint the table uses, so the agent has no privileged path.
 */
export function useProposals(
  bridges: PairedBridge[],
  rows: DeviceRow[],
  groups: GroupLookup,
  refresh: () => void,
) {
  const [plan, setPlan] = useState<Plan | null>(null);
  const [saving, setSaving] = useState(false);
  const { notify } = useToasts();

  const proposals = useMemo(
    () => (plan ? buildProposals(plan, rows, groups) : []),
    [plan, rows, groups],
  );

  const apply = useCallback(async () => {
    if (proposals.length === 0) return;
    setSaving(true);
    let saved = 0;
    const failed: string[] = [];

    for (const item of proposals) {
      const bridge = bridges.find((entry) => entry.id === item.row.bridgeId);
      if (!bridge) {
        failed.push(item.row.name);
        continue;
      }
      try {
        await editDevice(bridge, {
          deviceId: item.row.id,
          name: item.name ?? item.row.name,
          roomId: item.roomId === undefined ? item.row.roomId : item.roomId,
          // Zones hold light services, so a switch is never given one.
          ...(item.row.light
            ? { zoneIds: item.zoneIds ?? item.row.zoneIds }
            : {}),
        });
        saved += 1;
      } catch (cause) {
        failed.push(
          cause instanceof Error
            ? `${item.row.name} (${cause.message})`
            : item.row.name,
        );
      }
    }

    setSaving(false);
    setPlan(null);
    if (saved > 0) {
      notify({
        tone: "success",
        key: "agent",
        message: `Applied ${saved} ${saved === 1 ? "change" : "changes"}.`,
      });
    }
    if (failed.length > 0) {
      notify({
        tone: "error",
        key: "agent-failed",
        message: `Could not change ${failed.join(", ")}.`,
      });
    }
    refresh();
  }, [proposals, bridges, notify, refresh]);

  return {
    plan,
    proposals,
    saving,
    review: setPlan,
    cancel: () => setPlan(null),
    apply,
  };
}
