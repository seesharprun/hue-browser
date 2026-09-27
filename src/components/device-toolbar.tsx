"use client";

import type { DeviceView } from "../lib/devices/use-device-view";
import type { PendingEdits } from "../lib/devices/use-pending";
import { GroupIcon, RefreshIcon, SaveIcon } from "./icons";

export function DeviceToolbar({
  view,
  loading,
  pending,
  onRefresh,
  onMigrate,
  canMigrate,
}: {
  view: DeviceView;
  loading: boolean;
  /** Only the flat grouping collects pending edits. */
  pending: PendingEdits | null;
  onRefresh: () => void;
  onMigrate: () => void;
  canMigrate: boolean;
}) {
  return (
    <div className="mb-5 flex flex-wrap items-center gap-3">
      <label className="min-w-48 flex-1">
        <span className="sr-only">Search devices</span>
        {/* The aura keeps turning while the bridges answer, so a slow network
            reads as work in progress rather than a dead control. */}
        <span className={`block ${loading ? "aura text-primary" : ""}`}>
          <input
            className="input w-full"
            type="search"
            placeholder="Search devices"
            value={view.query}
            onChange={(event) => view.setQuery(event.target.value)}
          />
        </span>
      </label>
      <div className="join">
        <button
          type="button"
          className="btn btn-outline btn-sm join-item"
          onClick={onRefresh}
          disabled={loading}
        >
          {loading ? (
            <span
              aria-hidden="true"
              className="loading loading-spinner loading-xs"
            />
          ) : (
            <RefreshIcon />
          )}
          Refresh
        </button>
        <button
          type="button"
          className="btn btn-outline btn-sm join-item"
          onClick={view.clearAll}
          disabled={!view.active}
        >
          Clear filters
        </button>
        <button
          type="button"
          className="btn btn-outline btn-sm join-item"
          onClick={onMigrate}
          disabled={!canMigrate}
        >
          <GroupIcon name="room" label="Migrate" size="size-[14px]" />
          Migrate devices
        </button>
      </div>
      {pending && <PendingControls pending={pending} />}
    </div>
  );
}

/** The badge counts rows waiting to reach the bridge. */
function PendingControls({ pending }: { pending: PendingEdits }) {
  const { pending: count, invalid, saving } = pending;
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        className="btn btn-ghost btn-sm"
        onClick={pending.discard}
        disabled={count === 0 || saving}
      >
        Discard
      </button>
      <div className="indicator">
        {count > 0 && (
          <span className="indicator-item badge badge-sm badge-warning">
            {count}
          </span>
        )}
        <button
          type="button"
          className="btn btn-primary btn-sm"
          onClick={pending.save}
          disabled={count === 0 || saving || invalid > 0}
        >
          {saving ? (
            <span
              aria-hidden="true"
              className="loading loading-spinner loading-xs"
            />
          ) : (
            <SaveIcon />
          )}
          Save changes
          {count > 0 && (
            <span className="sr-only">
              , {count} {count === 1 ? "device" : "devices"} pending
            </span>
          )}
        </button>
      </div>
    </div>
  );
}
