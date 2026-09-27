const { test: testArt }: typeof import("node:test") = require("node:test");
const artAssert: typeof import("node:assert/strict") = require("node:assert/strict");
const {
  bridgeArtName,
  isBridgePro,
}: typeof import("./art-model") = require("./art-model.ts");

testArt("selects bridge artwork by model", () => {
  artAssert.equal(isBridgePro("BSB004"), true);
  artAssert.equal(isBridgePro(" bsb004 "), true);
  artAssert.equal(isBridgePro("BSB002"), false);
  artAssert.equal(isBridgePro(undefined), false);
  artAssert.equal(bridgeArtName("BSB004"), "Philips Hue Bridge Pro");
  artAssert.equal(bridgeArtName(" bsb004 "), "Philips Hue Bridge Pro");
  artAssert.equal(bridgeArtName("BSB002"), "Philips Hue Bridge");
  artAssert.equal(bridgeArtName(undefined), "Philips Hue Bridge");
});
