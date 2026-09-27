"use client";

import type { DeviceView } from "../lib/devices/use-device-view";
import { RefreshIcon } from "./icons";

export function DeviceToolbar({
  view,
  loading,
  onRefresh,
}: {
  view: DeviceView;
  loading: boolean;
  onRefresh: () => void;
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
      </div>
    </div>
  );
}
