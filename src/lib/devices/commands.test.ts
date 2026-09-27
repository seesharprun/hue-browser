const { test: testCommands }: typeof import("node:test") = require("node:test");
const commandsAssert: typeof import("node:assert/strict") = require("node:assert/strict");
const {
  commandRequest,
  isCommand,
  toChromaticity,
}: typeof import("./commands") = require("./commands.ts");

const commandsNear = (
  actual: ReturnType<typeof toChromaticity>,
  expected: ReturnType<typeof toChromaticity>,
) => {
  commandsAssert.ok(Math.abs(actual.x - expected.x) <= 0.0001);
  commandsAssert.ok(Math.abs(actual.y - expected.y) <= 0.0001);
};

testCommands("only supported commands are accepted", () => {
  for (const value of [
    { action: "identify" },
    { action: "on" },
    { action: "off" },
    { action: "color", hex: "#ff3b30" },
  ]) {
    commandsAssert.equal(isCommand(value), true);
  }
  for (const value of [
    null,
    "on",
    { action: "delete" },
    { action: "color" },
    { action: "color", hex: "red" },
    // A hex value must be complete so it cannot smuggle other characters.
    { action: "color", hex: "#fff" },
  ]) {
    commandsAssert.equal(isCommand(value), false);
  }
});

testCommands("colors convert to chromaticity within the visible gamut", () => {
  const red = toChromaticity("#ff0000");
  commandsNear(red, { x: 0.7006, y: 0.2993 });
  const blue = toChromaticity("#0000ff");
  commandsNear(blue, { x: 0.1355, y: 0.0399 });
  // Black has no chromaticity to report, so it must not divide by zero.
  commandsAssert.deepEqual(toChromaticity("#000000"), { x: 0, y: 0 });
  commandsNear(toChromaticity("#ffffff"), { x: 0.3227, y: 0.329 });
  for (const hex of ["#808080", "#404040", "#0a0a0a", "#0b0b0b"]) {
    commandsNear(toChromaticity(hex), { x: 0.3227, y: 0.329 });
  }
  commandsNear(toChromaticity("#f00"), red);
  commandsAssert.throws(() => toChromaticity("red"), /valid hex color/i);
  commandsAssert.throws(() => toChromaticity("#fffffff"), /valid hex color/i);
});

testCommands("identify targets the device and power targets its light", () => {
  commandsAssert.deepEqual(commandRequest({ action: "identify" }, "device-1"), {
    path: "/clip/v2/resource/device/device-1",
    body: { identify: { action: "identify" } },
  });
  commandsAssert.deepEqual(commandRequest({ action: "off" }, "light-1"), {
    path: "/clip/v2/resource/light/light-1",
    body: { on: { on: false } },
  });
  // Setting a color on a light that is off or dimmed would otherwise show
  // nothing.
  const color = commandRequest({ action: "color", hex: "#ff3b30" }, "light-1");
  commandsAssert.deepEqual(color.body.on, { on: true });
  commandsAssert.deepEqual(color.body.dimming, { brightness: 100 });
});
