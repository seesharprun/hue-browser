const { test: testCommands }: typeof import("node:test") = require("node:test");
const commandsAssert: typeof import("node:assert/strict") = require("node:assert/strict");
const {
  commandRequest,
  isCommand,
  toChromaticity,
}: typeof import("./commands") = require("./commands.ts");

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
  commandsAssert.ok(red.x > 0.6 && red.y < 0.35);
  const blue = toChromaticity("#0000ff");
  commandsAssert.ok(blue.x < 0.2 && blue.y < 0.1);
  // Black has no chromaticity to report, so it must not divide by zero.
  commandsAssert.deepEqual(toChromaticity("#000000"), { x: 0, y: 0 });
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
