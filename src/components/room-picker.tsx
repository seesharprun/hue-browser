"use client";

import type { RoomCreate } from "../lib/devices/group-create";
import type { GroupOption } from "../lib/devices/types";
import { PlusIcon } from "./icons";

export const UNASSIGNED = "";
export const NEW_ROOM = "__new_room__";

export function RoomPicker({
  rooms,
  roomId,
  newRoom,
  onChange,
  onCreate,
}: {
  rooms: GroupOption[];
  roomId: string;
  newRoom: RoomCreate | null;
  onChange: (id: string) => void;
  onCreate: () => void;
}) {
  return (
    <fieldset className="fieldset">
      <legend className="fieldset-legend">Room</legend>
      <select
        className="select w-full"
        value={roomId}
        onChange={(event) => onChange(event.target.value)}
      >
        <option value={UNASSIGNED}>Unassigned</option>
        {rooms.map((room) => (
          <option key={room.id} value={room.id}>
            {room.name}
          </option>
        ))}
        {newRoom && <option value={NEW_ROOM}>{newRoom.name}</option>}
      </select>
      <button
        type="button"
        className="btn btn-outline btn-sm w-fit"
        onClick={onCreate}
      >
        <PlusIcon />
        Create room
      </button>
      <p className="label">A device belongs to at most one room.</p>
    </fieldset>
  );
}
