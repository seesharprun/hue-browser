const { test: testDevices }: typeof import("node:test") = require("node:test");
const deviceAssert: typeof import("node:assert/strict") = require("node:assert/strict");
const { deviceRows }: typeof import("./parse") = require("./parse.ts");

testDevices("maps devices to rooms, zones, and identifying details", () => {
  const response = {
    errors: [],
    data: [
      {
        id: "room-1",
        type: "room",
        metadata: { name: "Kitchen" },
        children: [{ rid: "light-1", rtype: "device" }],
      },
      {
        id: "zone-1",
        type: "zone",
        metadata: { name: "Downstairs" },
        children: [{ rid: "a", rtype: "light" }],
      },
      {
        id: "zone-2",
        type: "zone",
        metadata: { name: "Evening" },
        children: [{ rid: "a", rtype: "light" }],
      },
      {
        id: "light-1",
        type: "device",
        metadata: { name: "Pendant", archetype: "pendant_round" },
        product_data: {
          product_name: "Hue bulb",
          model_id: "LCT001",
          manufacturer_name: "Signify Netherlands B.V.",
          software_version: "1.104.2",
          hardware_platform_type: "100b-10a",
        },
        services: [
          { rid: "a", rtype: "light" },
          { rid: "b", rtype: "zigbee_connectivity" },
        ],
      },
      {
        id: "a",
        type: "light",
        owner: { rid: "light-1", rtype: "device" },
        on: { on: true },
        color: { gamut_type: "C" },
      },
      {
        id: "zigbee-1",
        type: "zigbee_connectivity",
        owner: { rid: "light-1", rtype: "device" },
        mac_address: "00:17:88:01:0b:12:34:56",
      },
      {
        id: "sensor-1",
        type: "device",
        metadata: { name: "Door", archetype: "contact_sensor" },
        product_data: { product_name: "Contact", model_id: "S1" },
        services: [{ rid: "c", rtype: "contact" }],
      },
      { id: "scene-1", type: "scene", metadata: { name: "Dinner" } },
    ],
  };
  deviceAssert.deepEqual(deviceRows(response, "bridge-1", "Home"), {
    devices: [
      {
        id: "light-1",
        bridgeId: "bridge-1",
        bridgeName: "Home",
        name: "Pendant",
        product: "Hue bulb",
        model: "LCT001",
        type: "pendant_round",
        room: "Kitchen",
        roomId: "room-1",
        zones: ["Downstairs", "Evening"],
        zoneIds: ["zone-1", "zone-2"],
        services: ["light", "zigbee_connectivity"],
        manufacturer: "Signify Netherlands B.V.",
        software: "1.104.2",
        hardware: "100b-10a",
        mac: "00:17:88:01:0b:12:34:56",
        light: { id: "a", on: true, color: true },
      },
      {
        id: "sensor-1",
        bridgeId: "bridge-1",
        bridgeName: "Home",
        name: "Door",
        product: "Contact",
        model: "S1",
        type: "contact_sensor",
        room: "Unassigned",
        roomId: null,
        zones: [],
        zoneIds: [],
        services: ["contact"],
        manufacturer: "Not reported",
        software: "Not reported",
        hardware: "Not reported",
        mac: "Not reported",
        light: null,
      },
    ],
    rooms: [{ id: "room-1", name: "Kitchen" }],
    zones: [
      { id: "zone-1", name: "Downstairs" },
      { id: "zone-2", name: "Evening" },
    ],
  });
  deviceAssert.throws(
    () => deviceRows({ errors: [{}], data: [] }, "a", "b"),
    /could not list all resources/i,
  );
  deviceAssert.throws(
    () => deviceRows({ errors: [], data: [{ type: "device" }] }, "a", "b"),
    /invalid device data/i,
  );
  deviceAssert.throws(
    () => deviceRows({ errors: [], data: [{ type: "room" }] }, "a", "b"),
    /invalid room data/i,
  );
  deviceAssert.throws(
    () => deviceRows({ errors: [], data: [{ type: "zone" }] }, "a", "b"),
    /invalid zone data/i,
  );
});

testDevices("leaves the bridge itself out of the device list", () => {
  const response = {
    errors: [],
    data: [
      {
        id: "bridge-device-1",
        type: "device",
        metadata: { name: "Hue Bridge", archetype: "bridge_v2" },
        product_data: { product_name: "Hue Bridge", model_id: "BSB002" },
        services: [
          { rid: "bridge-1", rtype: "bridge" },
          { rid: "zigbee-1", rtype: "zigbee_connectivity" },
        ],
      },
      {
        id: "light-1",
        type: "device",
        metadata: { name: "Pendant", archetype: "pendant_round" },
        product_data: { product_name: "Hue bulb", model_id: "LCT001" },
        services: [{ rid: "a", rtype: "light" }],
      },
    ],
  };
  const result = deviceRows(response, "bridge-1", "Home");
  deviceAssert.deepEqual(
    result.devices.map((row) => row.id),
    ["light-1"],
  );
});
