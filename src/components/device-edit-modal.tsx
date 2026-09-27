"use client";

import { useId, useState } from "react";
import type { EditRequest } from "../lib/devices/edits";
import { NAME_LIMIT } from "../lib/devices/edits";
import type { RoomCreate } from "../lib/devices/group-create";
import {
  promptRoomCreate,
  promptZoneCreate,
} from "../lib/devices/group-prompts";
import type { DeviceRow, GroupOption } from "../lib/devices/types";
import { CloseIcon } from "./icons";
import { NEW_ROOM, RoomPicker, UNASSIGNED } from "./room-picker";
import { type PendingZone, ZoneChecklist } from "./zone-checklist";

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
  const [newRoom, setNewRoom] = useState<RoomCreate | null>(null);
  const [newZones, setNewZones] = useState<PendingZone[]>([]);
  const titleId = useId();
  const zonesAllowed = row.light !== null;

  const toggleZone = (id: string) =>
    setZoneIds((current) =>
      current.includes(id)
        ? current.filter((zone) => zone !== id)
        : [...current, id],
    );
  const createRoom = () => {
    const room = promptRoomCreate();
    if (!room) return;
    setNewRoom(room);
    setRoomId(NEW_ROOM);
  };
  const createZone = () => {
    const zone = promptZoneCreate();
    if (!zone) return;
    setNewZones((current) => [
      ...current,
      { ...zone, tempId: crypto.randomUUID() },
    ]);
  };

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
            const roomEdit =
              roomId === NEW_ROOM && newRoom
                ? { createRoom: newRoom }
                : { roomId: roomId === UNASSIGNED ? null : roomId };
            onSave(row, {
              name,
              ...roomEdit,
              ...(zonesAllowed
                ? {
                    zoneIds,
                    createZones: newZones.map(({ name }) => ({ name })),
                  }
                : {}),
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

          <fieldset disabled={saving} className="contents">
            <RoomPicker
              rooms={rooms}
              roomId={roomId}
              newRoom={newRoom}
              onChange={setRoomId}
              onCreate={createRoom}
            />
          </fieldset>

          <ZoneChecklist
            zones={zones}
            selected={zoneIds}
            created={newZones}
            allowed={zonesAllowed}
            disabled={saving}
            onToggle={toggleZone}
            onCreate={createZone}
            onRemoveCreated={(id) =>
              setNewZones((current) =>
                current.filter((zone) => zone.tempId !== id),
              )
            }
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
