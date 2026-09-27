import proIcon from "../../media/bridge-pro-icon.png";
import standardIcon from "../../media/bridge-standard-icon.png";
import { bridgeArtName, isBridgePro } from "./art-model.ts";

export function bridgeArt(model: string | null | undefined) {
  return {
    src: isBridgePro(model) ? proIcon : standardIcon,
    name: bridgeArtName(model),
  };
}
