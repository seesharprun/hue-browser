"use client";

import { useEffect } from "react";
import type { PairedBridge } from "../lib/bridges/types";
import { groupId } from "../lib/devices/filtering";
import { useDeviceCommand } from "../lib/devices/use-command";
import { useDeviceView } from "../lib/devices/use-device-view";
import { useDevices } from "../lib/devices/use-devices";
import { DeviceSkeleton } from "./device-skeleton";
import { DeviceTable } from "./device-table";
import { DeviceToolbar } from "./device-toolbar";

export function DeviceDashboard({ bridges }: { bridges: PairedBridge[] }) {
  const { rows, errors, loading, refresh } = useDevices(bridges);
  const view = useDeviceView(rows);
  const command = useDeviceCommand(bridges);
  const { focus, clearFocus } = view;

  // Tag links switch grouping first, so the scroll waits for the new groups.
  useEffect(() => {
    if (!focus) return;
    document
      .getElementById(groupId(focus))
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
    clearFocus();
  }, [focus, clearFocus]);

  return (
    <section aria-label="Device dashboard">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p
          role="status"
          className="flex items-center gap-2 text-sm text-base-content/70"
        >
          {loading && (
            <span
              aria-hidden="true"
              className="loading loading-ring loading-sm text-primary"
            />
          )}
          {loading
            ? `Looking for devices on ${bridges.length} ${bridges.length === 1 ? "bridge" : "bridges"}...`
            : `${view.visible.length} of ${rows.length} devices across ${bridges.length} ${bridges.length === 1 ? "bridge" : "bridges"}`}
        </p>
        <button
          type="button"
          className="btn btn-outline btn-sm"
          onClick={refresh}
          disabled={loading}
        >
          {loading && (
            <span
              aria-hidden="true"
              className="loading loading-spinner loading-xs"
            />
          )}
          Refresh
        </button>
      </div>
      {Object.entries(errors).map(([id, error]) => (
        <p key={id} role="alert" className="alert alert-error mb-3">
          {bridges.find((item) => item.id === id)?.name ?? id}: {error}
        </p>
      ))}
      <DeviceToolbar view={view} />
      {/* Placeholder groups keep the page from collapsing to blank while the
          bridges answer, which otherwise reads as a broken table. */}
      {loading && rows.length === 0 && (
        <>
          <DeviceSkeleton columns={view.visibleColumns.length} />
          <DeviceSkeleton columns={view.visibleColumns.length} />
        </>
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
            />
          ),
      )}
    </section>
  );
}
