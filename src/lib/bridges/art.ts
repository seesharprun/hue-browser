import proIcon from "../../media/bridge-pro-icon.png";
import standardIcon from "../../media/bridge-standard-icon.png";

// Philips ships the Pro as BSB004; earlier square and round bridges are BSB002
// and BSB001, and anything unrecognised falls back to the familiar white one.
const PRO = "BSB004";

export function bridgeArt(model: string | null | undefined) {
  return model?.trim().toUpperCase() === PRO
    ? { src: proIcon, name: "Philips Hue Bridge Pro" }
    : { src: standardIcon, name: "Philips Hue Bridge" };
}
