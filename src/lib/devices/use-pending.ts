"use client";

import { useCallback, useMemo, useState } from "react";
import { editDevice } from "../bridges/browser";
import type { PairedBridge } from "../bridges/types";
import { useToasts } from "../ui/toasts";
import type { Draft } from "./pending";
import { original, rowKey, same, valid } from "./pending";
import type { DeviceRow } from "./types";

export type { Draft };
export { rowKey };

/**
 * The flat grouping is a spreadsheet, so edits collect here until the toolbar
 * saves them rather than reaching the bridge one keystroke at a time.
 */
export function usePendingEdits(
  bridges: PairedBridge[],
  rows: DeviceRow[],
  refresh: () => void,
) {
  const [drafts, setDrafts] = useState<Record<string, Draft>>({});
  const [saving, setSaving] = useState(false);
  const { notify } = useToasts();

  const draftFor = useCallback(
    (row: DeviceRow) => drafts[rowKey(row)] ?? original(row),
    [drafts],
  );

  const change = useCallback((row: DeviceRow, patch: Partial<Draft>) => {
    setDrafts((current) => {
      const key = rowKey(row);
      const next = { ...(current[key] ?? original(row)), ...patch };
      // Editing back to the bridge's own values clears the pending mark.
      if (same(next, original(row))) {
        const { [key]: _dropped, ...rest } = current;
        return rest;
      }
      return { ...current, [key]: next };
    });
  }, []);

  const discard = useCallback(() => setDrafts({}), []);

  const keys = Object.keys(drafts);
  const invalid = useMemo(
    () => keys.filter((key) => !valid(drafts[key])).length,
    [keys, drafts],
  );

  const save = useCallback(async () => {
    const entries = Object.entries(drafts).filter(([, draft]) => valid(draft));
    if (entries.length === 0) return;
    setSaving(true);
    const failed: string[] = [];
    let saved = 0;

    for (const [key, draft] of entries) {
      const row = rows.find((item) => rowKey(item) === key);
      const bridge = bridges.find((item) => item.id === row?.bridgeId);
      if (!row || !bridge) {
        failed.push(draft.name);
        continue;
      }
      try {
        await editDevice(bridge, {
          deviceId: row.id,
          name: draft.name,
          roomId: draft.roomId,
          // Zones hold light services, so a switch cannot belong to one.
          ...(row.light ? { zoneIds: draft.zoneIds } : {}),
        });
        saved += 1;
        setDrafts((current) => {
          const { [key]: _done, ...rest } = current;
          return rest;
        });
      } catch (cause) {
        failed.push(
          cause instanceof Error
            ? `${draft.name} (${cause.message})`
            : draft.name,
        );
      }
    }

    setSaving(false);
    if (saved > 0) {
      notify({
        tone: "success",
        key: "pending",
        message: `Saved ${saved} ${saved === 1 ? "device" : "devices"}.`,
      });
    }
    if (failed.length > 0) {
      notify({
        tone: "error",
        key: "pending-failed",
        message: `Could not save ${failed.join(", ")}.`,
      });
    }
    refresh();
  }, [drafts, rows, bridges, notify, refresh]);

  return {
    draftFor,
    change,
    discard,
    save,
    saving,
    pending: keys.length,
    invalid,
    isDirty: (row: DeviceRow) => rowKey(row) in drafts,
  };
}

export type PendingEdits = ReturnType<typeof usePendingEdits>;
