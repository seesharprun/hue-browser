"use client";

import type { ZoneCreate } from "../lib/devices/group-create";
import type { GroupOption } from "../lib/devices/types";
import { PlusIcon } from "./icons";

/**
 * The checkbox list of zones shared by the modal editor. A grid keeps each zone
 * on its own line so the checkbox and its name stay together as the list grows.
 */
export function ZoneChecklist({
  zones,
  selected,
  created = [],
  allowed,
  disabled,
  onToggle,
  onCreate,
  onRemoveCreated,
}: {
  zones: GroupOption[];
  selected: string[];
  created?: ZoneCreate[];
  /** Zones hold light services, so a switch or sensor cannot belong to one. */
  allowed: boolean;
  disabled: boolean;
  onToggle: (id: string) => void;
  onCreate?: () => void;
  onRemoveCreated?: (index: number) => void;
}) {
  return (
    <fieldset className="fieldset" disabled={disabled || !allowed}>
      <legend className="fieldset-legend">Zones</legend>
      {zones.length === 0 && created.length === 0 && (
        <p className="label">This bridge has no zones yet.</p>
      )}
      <div className="grid max-h-48 grid-cols-1 gap-x-4 overflow-y-auto sm:grid-cols-2">
        {zones.map((zone) => (
          <label
            key={zone.id}
            className="label flex w-full cursor-pointer justify-start gap-3 py-1"
          >
            <input
              type="checkbox"
              className="checkbox checkbox-sm"
              checked={selected.includes(zone.id)}
              onChange={() => onToggle(zone.id)}
            />
            <span className="truncate">{zone.name}</span>
          </label>
        ))}
        {created.map((zone, index) => (
          <label
            key={zone.name}
            className="label flex w-full cursor-pointer justify-start gap-3 py-1"
          >
            <input
              type="checkbox"
              className="checkbox checkbox-sm"
              checked
              onChange={() => onRemoveCreated?.(index)}
            />
            <span className="truncate">{zone.name}</span>
          </label>
        ))}
      </div>
      {onCreate && (
        <button
          type="button"
          className="btn btn-outline btn-sm w-fit"
          onClick={onCreate}
        >
          <PlusIcon />
          Create zone
        </button>
      )}
      {!allowed && (
        <p className="label">
          This device has no light, so it cannot join a zone.
        </p>
      )}
    </fieldset>
  );
}
