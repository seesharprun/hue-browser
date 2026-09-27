const { test: testColumns }: typeof import("node:test") = require("node:test");
const columnsAssert: typeof import("node:assert/strict") = require("node:assert/strict");
const {
  capabilities,
  column,
  details,
  readable,
  searchText,
  UNASSIGNED: COLUMNS_UNASSIGNED,
  zoneNames,
}: typeof import("./columns") = require("./columns.ts");

const columnsRow = {
  id: "device-1",
  bridgeId: "bridge-1",
  bridgeName: "Loft bridge",
  name: "Desk lamp",
  product: "Hue color lamp",
  model: "LCT001",
  type: "pendant_round",
  room: "Office",
  roomId: "room-1",
  zones: ["Work", "Evening"],
  zoneIds: ["zone-1", "zone-2"],
  services: ["zigbee_connectivity", "light"],
  manufacturer: "Signify Netherlands B.V.",
  software: "1.104.2",
  hardware: "100b-10a",
  mac: "00:17:88:01:0b:12:34:56",
  light: { id: "light-1", on: true, color: true },
};

testColumns("formats readable column values and fallbacks", () => {
  columnsAssert.equal(readable("pendant_round"), "pendant round");
  columnsAssert.deepEqual(zoneNames({ ...columnsRow, zones: [] }), [
    COLUMNS_UNASSIGNED,
  ]);
  columnsAssert.equal(column("zones").display(columnsRow), "Work, Evening");
  columnsAssert.deepEqual(capabilities({ ...columnsRow, services: [] }), [
    "None reported",
  ]);
});

testColumns("search text includes columns and details", () => {
  const found = searchText(columnsRow);
  for (const expected of [
    "desk lamp",
    "loft bridge",
    "office",
    "work, evening",
    "pendant round",
    "hue color lamp",
    "lct001",
    "zigbee connectivity, light",
    "00:17:88:01:0b:12:34:56",
    "100b-10a",
    "1.104.2",
    "signify netherlands b.v.",
    "device-1",
  ]) {
    columnsAssert.match(found, new RegExp(expected.replaceAll(".", "\\.")));
  }
  columnsAssert.deepEqual(
    details(columnsRow).map((item: { label: string }) => item.label),
    [
      "Capabilities",
      "MAC address",
      "Hardware version",
      "Software version",
      "Manufacturer",
      "Device identifier",
    ],
  );
});
