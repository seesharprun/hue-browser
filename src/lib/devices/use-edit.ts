"use client";

import { useCallback, useState } from "react";
import { editDevice } from "../bridges/browser";
import type { PairedBridge } from "../bridges/types";
import { useToasts } from "../ui/toasts";
import type { EditRequest } from "./edits";
import type { DeviceRow } from "./types";

export function useDeviceEdit(bridges: PairedBridge[], refresh: () => void) {
  const [editing, setEditing] = useState<DeviceRow | null>(null);
  const [saving, setSaving] = useState(false);
  const { notify } = useToasts();

  const close = useCallback(() => setEditing(null), []);

  const save = useCallback(
    async (row: DeviceRow, edit: Omit<EditRequest, "deviceId">) => {
      const bridge = bridges.find((item) => item.id === row.bridgeId);
      const key = `edit:${row.bridgeId}:${row.id}`;
      if (!bridge) {
        notify({
          tone: "error",
          key,
          message: `${row.name} is on a bridge that is no longer paired.`,
        });
        return;
      }
      setSaving(true);
      try {
        await editDevice(bridge, { ...edit, deviceId: row.id });
        setEditing(null);
        notify({
          tone: "success",
          key,
          message: `Saved changes to ${edit.name?.trim() || row.name}.`,
        });
        // The bridge owns the result, so the table reloads rather than
        // guessing what the edit produced.
        refresh();
      } catch (cause) {
        notify({
          tone: "error",
          key,
          message:
            cause instanceof Error
              ? `${row.name}: ${cause.message}`
              : `${row.name}: the changes could not be saved.`,
        });
      } finally {
        setSaving(false);
      }
    },
    [bridges, notify, refresh],
  );

  return { editing, edit: setEditing, close, save, saving };
}
