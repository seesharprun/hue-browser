"use client";

import type { PairedBridge } from "../bridges/types";
import type { RoomCreate, ZoneCreate } from "./group-create";
import { NAME_LIMIT } from "./group-create";

function cleanName(value: string | null) {
  const name = value?.trim() ?? "";
  return name && name.length <= NAME_LIMIT ? name : null;
}

export function promptRoomCreate(): RoomCreate | null {
  const name = cleanName(window.prompt("Room name"));
  if (!name) {
    window.alert(`Enter a room name of ${NAME_LIMIT} characters or fewer.`);
    return null;
  }
  const archetype = window
    .prompt("Room archetype for Philips Hue, such as living_room", "other")
    ?.trim();
  if (!archetype || !/^[a-z][a-z0-9_]{1,31}$/.test(archetype)) {
    window.alert("Enter a Philips Hue room archetype such as living_room.");
    return null;
  }
  return { name, archetype };
}

export function promptZoneCreate(): ZoneCreate | null {
  const name = cleanName(window.prompt("Zone name"));
  if (!name) {
    window.alert(`Enter a zone name of ${NAME_LIMIT} characters or fewer.`);
    return null;
  }
  return { name };
}

export function promptBridge(bridges: PairedBridge[]) {
  if (bridges.length <= 1) return bridges[0] ?? null;
  const names = bridges.map((bridge) => bridge.name ?? bridge.address);
  const choice = window.prompt(
    `Create on which bridge?\n${names
      .map((name, index) => `${index + 1}. ${name}`)
      .join("\n")}`,
    "1",
  );
  const index = Number(choice) - 1;
  return Number.isInteger(index) ? bridges[index] ?? null : null;
}
