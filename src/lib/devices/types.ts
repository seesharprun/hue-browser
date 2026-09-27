export type DeviceRow = {
  id: string;
  bridgeId: string;
  bridgeName: string;
  name: string;
  product: string;
  model: string;
  type: string;
  room: string;
  roomId: string | null;
  zones: string[];
  zoneIds: string[];
  services: string[];
  manufacturer: string;
  software: string;
  hardware: string;
  mac: string;
  light: LightService | null;
};

/** A room or zone the edit form can move a device into. */
export type GroupOption = { id: string; name: string };

export type BridgeDevices = {
  devices: DeviceRow[];
  rooms: GroupOption[];
  zones: GroupOption[];
};

export type LightService = {
  id: string;
  on: boolean;
  color: boolean;
};
