import { readFileSync } from "node:fs";
import { join } from "node:path";

// Keep the Philips Hue bridge CA scoped to bridge requests, not global TLS.
export const HUE_BRIDGE_CA = readFileSync(
  join(process.cwd(), "src", "lib", "bridges", "hue-ca.pem"),
  "utf8",
);
