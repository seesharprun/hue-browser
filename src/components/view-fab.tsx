"use client";

import type { DeviceView, GroupBy } from "../lib/devices/use-device-view";
import { GroupIcon } from "./icons";

export const groupings: { value: GroupBy; label: string }[] = [
  { value: "room", label: "Rooms" },
  { value: "zones", label: "Zones" },
  { value: "none", label: "Flat" },
];

/** The speed dial opens on focus, so choosing a grouping blurs to close it. */
export function ViewFab({ view }: { view: DeviceView }) {
  const current =
    groupings.find((item) => item.value === view.group) ?? groupings[0];

  return (
    <div className="fab">
      <button
        type="button"
        tabIndex={0}
        className="btn btn-circle btn-lg btn-primary shadow-lg"
        aria-label={`Change grouping, currently ${current.label}`}
      >
        <GroupIcon name={current.value} label={current.label} size="size-6" />
      </button>
      {/* No explicit close control: the dial opens on focus, so clicking away
          or choosing a grouping already dismisses it. */}
      {groupings.map((item) => (
        <div key={item.value}>
          <span className="badge badge-lg">{item.label}</span>
          <button
            type="button"
            className={`btn btn-circle btn-lg ${
              item.value === view.group ? "btn-primary" : ""
            }`}
            aria-pressed={item.value === view.group}
            onClick={(event) => {
              view.setGroup(item.value);
              event.currentTarget.blur();
            }}
          >
            <GroupIcon name={item.value} label={item.label} />
            <span className="sr-only">Group by {item.label}</span>
          </button>
        </div>
      ))}
    </div>
  );
}
