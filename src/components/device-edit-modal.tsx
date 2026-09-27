"use client";

import { useId, useState } from "react";
import type { EditRequest } from "../lib/devices/edits";
import { NAME_LIMIT } from "../lib/devices/edits";
import type { DeviceRow, GroupOption } from "../lib/devices/types";
import { CloseIcon } from "./icons";
import { ZoneChecklist } from "./zone-checklist";

const UNASSIGNED = "";

export function DeviceEditModal({
  row,
  rooms,
  zones,
  saving,
  onCancel,
  onSave,
}: {
  row: DeviceRow;
  rooms: GroupOption[];
  zones: GroupOption[];
  saving: boolean;
  onCancel: () => void;
  onSave: (row: DeviceRow, edit: Omit<EditRequest, "deviceId">) => void;
}) {
  const [name, setName] = useState(row.name);
  const [roomId, setRoomId] = useState(row.roomId ?? UNASSIGNED);
  const [zoneIds, setZoneIds] = useState<string[]>(row.zoneIds);
  const titleId = useId();
  // Zones hold light services, so a switch or sensor cannot belong to one.
  const zonesAllowed = row.light !== null;

  const toggleZone = (id: string) =>
    setZoneIds((current) =>
      current.includes(id)
        ? current.filter((zone) => zone !== id)
        : [...current, id],
    );

  return (
    <dialog className="modal modal-open" aria-labelledby={titleId}>
      <div className="modal-box">
        <h3 id={titleId} className="truncate text-lg font-semibold">
          Edit {row.name}
        </h3>
        <p className="mb-4 text-sm text-base-content/60">
          {row.product} on {row.bridgeName}
        </p>
        <form
          className="flex flex-col gap-4"
          onSubmit={(event) => {
            event.preventDefault();
            onSave(row, {
              name,
              roomId: roomId === UNASSIGNED ? null : roomId,
              ...(zonesAllowed ? { zoneIds } : {}),
            });
          }}
        >
          <fieldset className="fieldset" disabled={saving}>
            <legend className="fieldset-legend">Name</legend>
            <input
              className="input validator w-full"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
              maxLength={NAME_LIMIT}
              placeholder="Kitchen pendant"
            />
            <p className="validator-hint hidden">
              Enter a name of {NAME_LIMIT} characters or fewer.
            </p>
          </fieldset>

          <fieldset className="fieldset" disabled={saving}>
            <legend className="fieldset-legend">Room</legend>
            <select
              className="select w-full"
              value={roomId}
              onChange={(event) => setRoomId(event.target.value)}
            >
              <option value={UNASSIGNED}>Unassigned</option>
              {rooms.map((room) => (
                <option key={room.id} value={room.id}>
                  {room.name}
                </option>
              ))}
            </select>
            <p className="label">A device belongs to at most one room.</p>
          </fieldset>

          <ZoneChecklist
            zones={zones}
            selected={zoneIds}
            allowed={zonesAllowed}
            disabled={saving}
            onToggle={toggleZone}
          />

          <div className="modal-action">
            <button
              type="button"
              className="btn btn-ghost"
              onClick={onCancel}
              disabled={saving}
            >
              <CloseIcon />
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving && (
                <span className="loading loading-spinner loading-xs" />
              )}
              Save changes
            </button>
          </div>
        </form>
      </div>
      <button
        type="button"
        className="modal-backdrop"
        onClick={onCancel}
        disabled={saving}
      >
        <span className="sr-only">Close</span>
      </button>
    </dialog>
  );
}
