"use client";

import { useCallback, useEffect, useState } from "react";
import type { PairedBridge } from "../lib/bridges/types";
import { groupId } from "../lib/devices/filtering";
import { useBulkEdit } from "../lib/devices/use-bulk-edit";
import { useDeviceCommand } from "../lib/devices/use-command";
import { useDeviceView } from "../lib/devices/use-device-view";
import { useDevices } from "../lib/devices/use-devices";
import { useDeviceEdit } from "../lib/devices/use-edit";
import { usePendingEdits } from "../lib/devices/use-pending";
import { useSelection } from "../lib/devices/use-selection";
import { useToasts } from "../lib/ui/toasts";
import { BridgeFooter } from "./bridge-footer";
import { BulkActionBar } from "./bulk-action-bar";
import { DeviceEditModal } from "./device-edit-modal";
import { DeviceSkeleton } from "./device-skeleton";
import { DeviceStats } from "./device-stats";
import { DeviceTable } from "./device-table";
import { DeviceToolbar } from "./device-toolbar";
import { ViewFab } from "./view-fab";

export function DeviceDashboard({ bridges }: { bridges: PairedBridge[] }) {
  const { rows, groups, errors, loading, refresh } = useDevices(bridges);
  const view = useDeviceView(rows);
  const command = useDeviceCommand(bridges);
  const { editing, edit, close, save, saving } = useDeviceEdit(
    bridges,
    refresh,
  );
  const pendingEdits = usePendingEdits(bridges, rows, refresh);
  const selection = useSelection(view.visible);
  const bulk = useBulkEdit(bridges, groups, refresh);
  const { notify } = useToasts();
  const { focus, clearFocus, group } = view;

  // The flat grouping is the spreadsheet; the grouped views use the modal.
  const spreadsheet =
    group === "none" ? { pending: pendingEdits, groups } : null;

  // One details panel at a time keeps the table readable while comparing rows.
  const [open, setOpen] = useState("");
  const toggle = useCallback(
    (key: string) => setOpen((current) => (current === key ? "" : key)),
    [],
  );

  // Tag links switch grouping first, so the scroll waits for the new groups.
  useEffect(() => {
    if (!focus) return;
    document
      .getElementById(groupId(focus))
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
    clearFocus();
  }, [focus, clearFocus]);

  // Keyed on the bridge so a refresh replaces its toast instead of stacking.
  useEffect(() => {
    for (const [id, error] of Object.entries(errors)) {
      const name = bridges.find((item) => item.id === id)?.name ?? id;
      notify({
        tone: "error",
        key: `bridge:${id}`,
        message: `${name}: ${error}`,
      });
    }
  }, [errors, bridges, notify]);

  return (
    <section aria-label="Device dashboard">
      <DeviceStats
        rows={rows}
        shown={view.visible.length}
        bridges={bridges.length}
        loading={loading && rows.length === 0}
      />
      <DeviceToolbar
        view={view}
        loading={loading}
        pending={spreadsheet ? pendingEdits : null}
        onRefresh={refresh}
      />
      <BulkActionBar
        rows={selection.rowsIn(view.visible)}
        catalog={groups}
        count={selection.count}
        running={bulk.running}
        onClear={selection.clear}
        onRun={(action) => bulk.run(selection.rowsIn(view.visible), action)}
      />
      {/* Placeholder groups keep the page from collapsing to blank while the
          bridges answer, which otherwise reads as a broken table. */}
      {loading && rows.length === 0 && (
        <div className="aura aura-sm block w-full text-primary">
          <div className="rounded-box bg-base-100">
            <DeviceSkeleton columns={view.visibleColumns.length} />
            <DeviceSkeleton columns={view.visibleColumns.length} />
          </div>
        </div>
      )}
      {!loading && rows.length === 0 && Object.keys(errors).length === 0 && (
        <p>No devices found on these bridges.</p>
      )}
      {!loading && rows.length > 0 && view.visible.length === 0 && (
        <p>No devices match these filters.</p>
      )}
      {view.groups.map(
        (found) =>
          found.rows.length > 0 && (
            <DeviceTable
              key={found.key}
              group={found}
              view={view}
              command={command}
              accordion={{ open, toggle }}
              spreadsheet={spreadsheet}
              selection={selection}
              onEdit={edit}
            />
          ),
      )}
      {editing && (
        <DeviceEditModal
          // Remounting per device resets the form to that device's values.
          key={`${editing.bridgeId}:${editing.id}`}
          row={editing}
          rooms={groups[editing.bridgeId]?.rooms ?? []}
          zones={groups[editing.bridgeId]?.zones ?? []}
          saving={saving}
          onCancel={close}
          onSave={save}
        />
      )}
      {rows.length > 0 && <ViewFab view={view} />}
      <BridgeFooter bridges={bridges} rows={rows} />
    </section>
  );
}
