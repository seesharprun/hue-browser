const PRO = "BSB004";

export const isBridgePro = (model: string | null | undefined) =>
  model?.trim().toUpperCase() === PRO;

export const bridgeArtName = (model: string | null | undefined) =>
  isBridgePro(model) ? "Philips Hue Bridge Pro" : "Philips Hue Bridge";
