"use client";

import type { DeviceView, GroupBy } from "../lib/devices/use-device-view";

const views: { value: GroupBy; label: string }[] = [
  { value: "room", label: "Rooms" },
  { value: "zones", label: "Zones" },
  { value: "none", label: "Flat" },
];

export function DeviceToolbar({ view }: { view: DeviceView }) {
  return (
    <div className="mb-5 flex flex-wrap items-center gap-3">
      <label className="min-w-48 flex-1">
        <span className="sr-only">Search devices</span>
        <input
          className="input w-full"
          type="search"
          placeholder="Search devices"
          value={view.query}
          onChange={(event) => view.setQuery(event.target.value)}
        />
      </label>
      <fieldset className="join">
        <legend className="sr-only">Group devices by</legend>
        {views.map((item) => (
          <input
            key={item.value}
            type="radio"
            name="device-group"
            className="btn btn-sm join-item"
            aria-label={item.label}
            checked={view.group === item.value}
            onChange={() => view.setGroup(item.value)}
          />
        ))}
      </fieldset>
      <button
        type="button"
        className="btn btn-ghost btn-sm"
        onClick={view.clearAll}
        disabled={!view.active}
      >
        Clear filters
      </button>
    </div>
  );
}
