export const COLORS = [
  { name: "Red", hex: "#ff0000" },
  { name: "Green", hex: "#00ff00" },
  { name: "Blue", hex: "#0000ff" },
] as const;

export type DeviceCommand =
  | { action: "identify" }
  | { action: "on" | "off" }
  | { action: "color"; hex: string };

const HEX = /^#[0-9a-f]{6}$/i;

export function isCommand(value: unknown): value is DeviceCommand {
  if (typeof value !== "object" || value === null) return false;
  const { action, hex } = value as { action?: unknown; hex?: unknown };
  if (action === "identify" || action === "on" || action === "off") return true;
  return action === "color" && typeof hex === "string" && HEX.test(hex);
}

// The Philips Hue API expects CIE xy chromaticity rather than sRGB.
function gamma(channel: number) {
  return channel > 0.04045
    ? ((channel + 0.055) / 1.055) ** 2.4
    : channel / 12.92;
}

export function toChromaticity(hex: string) {
  const value = Number.parseInt(hex.slice(1), 16);
  const red = gamma(((value >> 16) & 255) / 255);
  const green = gamma(((value >> 8) & 255) / 255);
  const blue = gamma((value & 255) / 255);
  // Wide-gamut RGB D65 matrix, as published for Philips Hue lights.
  const x = red * 0.664511 + green * 0.154324 + blue * 0.162028;
  const y = red * 0.283881 + green * 0.668433 + blue * 0.047685;
  const z = red * 0.000088 + green * 0.07231 + blue * 0.986039;
  const total = x + y + z;
  if (total === 0) return { x: 0, y: 0 };
  const round = (channel: number) =>
    Math.round((channel / total) * 10000) / 10000;
  return { x: round(x), y: round(y) };
}

// Identify targets the whole device; power and color target its light service.
export function commandRequest(command: DeviceCommand, id: string) {
  if (command.action === "identify") {
    return {
      path: `/clip/v2/resource/device/${id}`,
      body: { identify: { action: "identify" } },
    };
  }
  return {
    path: `/clip/v2/resource/light/${id}`,
    body:
      command.action === "color"
        ? {
            // A light that is off or dimmed low shows nothing, so a colour
            // test turns it on at full brightness to stay visible.
            on: { on: true },
            dimming: { brightness: 100 },
            color: { xy: toChromaticity(command.hex) },
          }
        : { on: { on: command.action === "on" } },
  };
}
