import type { DeviceRow } from "./types";

export type ColumnKey =
  | "name"
  | "bridgeName"
  | "room"
  | "zones"
  | "type"
  | "product"
  | "model";

export type Column = {
  key: ColumnKey;
  label: string;
  /** Every value a row can be matched on, so multi-valued columns filter correctly. */
  values: (row: DeviceRow) => string[];
  display: (row: DeviceRow) => string;
  /** Grouping columns render each value as a tag that jumps to that group. */
  chips?: (row: DeviceRow) => string[];
};

export const readable = (value: string) => value.replaceAll("_", " ");

export const UNASSIGNED = "Unassigned";

const list = (values: string[], empty: string) =>
  values.length ? values : [empty];

export const zoneNames = (row: DeviceRow) => list(row.zones, UNASSIGNED);

export const capabilities = (row: DeviceRow) =>
  list(row.services.map(readable), "None reported");

export const columns: Column[] = [
  {
    key: "name",
    label: "Name",
    values: (row) => [row.name],
    display: (row) => row.name,
  },
  {
    key: "bridgeName",
    label: "Bridge",
    values: (row) => [row.bridgeName],
    display: (row) => row.bridgeName,
  },
  {
    key: "room",
    label: "Room",
    values: (row) => [row.room],
    display: (row) => row.room,
    // Grouping and filtering still offer "Unassigned"; the cell stays empty.
    chips: (row) => (row.room === UNASSIGNED ? [] : [row.room]),
  },
  {
    key: "zones",
    label: "Zones",
    values: zoneNames,
    display: (row) => zoneNames(row).join(", "),
    chips: (row) => row.zones,
  },
  {
    key: "type",
    label: "Type",
    values: (row) => [readable(row.type)],
    display: (row) => readable(row.type),
  },
  {
    key: "product",
    label: "Product",
    values: (row) => [row.product],
    display: (row) => row.product,
  },
  {
    key: "model",
    label: "Model",
    values: (row) => [row.model],
    display: (row) => row.model,
  },
];

export const column = (key: ColumnKey) =>
  columns.find((item) => item.key === key) as Column;

/** Details stay searchable even though they are not columns. */
export const details = (row: DeviceRow) => [
  { label: "Capabilities", value: capabilities(row).join(", ") },
  { label: "MAC address", value: row.mac },
  { label: "Hardware version", value: row.hardware },
  { label: "Software version", value: row.software },
  { label: "Manufacturer", value: row.manufacturer },
  { label: "Device identifier", value: row.id },
];

export function searchText(row: DeviceRow) {
  return [
    ...columns.map((item) => item.display(row)),
    ...details(row).map((item) => item.value),
  ]
    .join(" ")
    .toLowerCase();
}
