const {
  test: testFiltering,
}: typeof import("node:test") = require("node:test");
const filteringAssert: typeof import("node:assert/strict") = require("node:assert/strict");
const {
  compare,
  facets,
  groupId,
  groupOrder,
  matches,
}: typeof import("./filtering") = require("./filtering.ts");
const {
  UNASSIGNED: FILTERING_UNASSIGNED,
}: typeof import("./columns") = require("./columns.ts");

const filteringBaseRow = {
  id: "device-1",
  bridgeId: "bridge-1",
  bridgeName: "Home bridge",
  name: "Desk 2",
  product: "Hue lamp",
  model: "LCT001",
  type: "pendant_round",
  room: "Office",
  roomId: "room-1",
  zones: ["Work"],
  zoneIds: ["zone-1"],
  services: ["light"],
  manufacturer: "Signify",
  software: "1.0.0",
  hardware: "100b",
  mac: "00:17:88:01:0b:12:34:56",
  light: { id: "light-1", on: true, color: true },
};
const filteringRows = [
  filteringBaseRow,
  {
    ...filteringBaseRow,
    id: "device-2",
    name: "desk 10",
    room: FILTERING_UNASSIGNED,
    roomId: null,
    zones: [],
    zoneIds: [],
    type: "contact_sensor",
    product: "Contact",
    light: null,
  },
  {
    ...filteringBaseRow,
    id: "device-3",
    name: "Atrium",
    bridgeName: "Studio bridge",
    room: "Kitchen",
    zones: ["Evening"],
    zoneIds: ["zone-2"],
  },
];

testFiltering("sorts names naturally and unassigned groups last", () => {
  filteringAssert.deepEqual(["desk 10", "Atrium", "Desk 2"].sort(compare), [
    "Atrium",
    "Desk 2",
    "desk 10",
  ]);
  filteringAssert.deepEqual(
    [FILTERING_UNASSIGNED, "Kitchen", "Office"].sort(groupOrder),
    ["Kitchen", "Office", FILTERING_UNASSIGNED],
  );
  filteringAssert.equal(groupId("Kitchen & Office!"), "group-kitchen-office");
  filteringAssert.equal(groupId("!!!"), "group-all");
});

testFiltering(
  "matches case-insensitive search and simultaneous filters",
  () => {
    filteringAssert.equal(
      matches(filteringBaseRow, "desk", {}, undefined),
      true,
    );
    filteringAssert.equal(
      matches(filteringBaseRow, "DESK", {}, undefined),
      true,
    );
    filteringAssert.equal(matches(filteringBaseRow, "", {}, undefined), true);
    filteringAssert.equal(
      matches(filteringBaseRow, "desk", {
        bridgeName: ["Home bridge"],
        room: ["Office"],
        zones: ["Work"],
        type: ["pendant round"],
      }),
      true,
    );
    filteringAssert.equal(
      matches(filteringBaseRow, "desk", { room: ["Kitchen"] }),
      false,
    );
  },
);

testFiltering("counts facet values after applying other filters", () => {
  const found = facets(filteringRows, "", { bridgeName: ["Home bridge"] });
  filteringAssert.deepEqual(found.get("name"), ["Desk 2", "desk 10"]);
  filteringAssert.deepEqual(found.get("room"), [
    "Office",
    FILTERING_UNASSIGNED,
  ]);
  filteringAssert.deepEqual(found.get("zones"), [FILTERING_UNASSIGNED, "Work"]);
  filteringAssert.deepEqual(found.get("bridgeName"), [
    "Home bridge",
    "Studio bridge",
  ]);
});
