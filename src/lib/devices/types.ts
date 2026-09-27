export type DeviceRow = {
  id: string;
  bridgeId: string;
  bridgeName: string;
  name: string;
  product: string;
  model: string;
  type: string;
  room: string;
  zones: string[];
  services: string[];
  manufacturer: string;
  software: string;
  hardware: string;
  mac: string;
  light: LightService | null;
};

export type LightService = {
  id: string;
  on: boolean;
  color: boolean;
};
