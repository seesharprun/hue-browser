const { test: testGroups }: typeof import("node:test") = require("node:test");
const groupAssert: typeof import("node:assert/strict") =
  require("node:assert/strict");
const {
  createGroupUpdate,
  isCreateGroupRequest,
}: typeof import("./group-create") = require("./group-create.ts");

const GROUP_DEVICE = "11111111-1111-1111-1111-111111111111";
const GROUP_LIGHT = "22222222-2222-2222-2222-222222222222";

testGroups("validates room and zone create requests", () => {
  groupAssert.equal(
    isCreateGroupRequest({
      type: "room",
      name: "Kitchen",
      archetype: "kitchen",
      deviceId: GROUP_DEVICE,
    }),
    true,
  );
  groupAssert.equal(
    isCreateGroupRequest({
      type: "zone",
      name: "Downstairs",
      lightId: GROUP_LIGHT,
    }),
    true,
  );
  groupAssert.equal(
    isCreateGroupRequest({ type: "room", name: "", archetype: "kitchen" }),
    false,
  );
  groupAssert.equal(
    isCreateGroupRequest({ type: "room", name: "Kitchen", archetype: "Nope" }),
    false,
  );
  groupAssert.equal(
    isCreateGroupRequest({ type: "zone", name: "x".repeat(33) }),
    false,
  );
});

testGroups("plans Philips Hue room and zone creation", () => {
  groupAssert.deepEqual(
    createGroupUpdate({
      type: "room",
      name: " Kitchen ",
      archetype: "kitchen",
      deviceId: GROUP_DEVICE,
    }),
    {
      method: "POST",
      path: "/clip/v2/resource/room",
      body: {
        metadata: { name: "Kitchen", archetype: "kitchen" },
        children: [{ rid: GROUP_DEVICE, rtype: "device" }],
      },
    },
  );
  groupAssert.deepEqual(
    createGroupUpdate({ type: "zone", name: "Desk", lightId: GROUP_LIGHT }),
    {
      method: "POST",
      path: "/clip/v2/resource/zone",
      body: {
        metadata: { name: "Desk" },
        children: [{ rid: GROUP_LIGHT, rtype: "light" }],
      },
    },
  );
});
