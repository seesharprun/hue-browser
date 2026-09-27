import Image from "next/image";
import { bridgeArt } from "../lib/bridges/art";
import type { PairedBridge } from "../lib/bridges/types";
import type { DeviceRow } from "../lib/devices/types";

// The tilt effect reads hover position from eight regions around the card.
const tilts = ["tl", "t", "tr", "l", "r", "bl", "b", "br"];

function BridgeEntry({
  bridge,
  rows,
}: {
  bridge: PairedBridge;
  rows: DeviceRow[];
}) {
  const art = bridgeArt(bridge.model);
  const held = rows.filter((row) => row.bridgeId === bridge.id);
  const lights = held.filter((row) => row.light).length;

  return (
    <li className="list-row items-center px-0">
      <div className="hover-3d">
        <div className="rounded-box bg-base-100 p-1">
          <Image
            src={art.src}
            alt={art.name}
            width={48}
            height={48}
            className="size-12 object-contain"
          />
        </div>
        {tilts.map((tilt) => (
          <div key={tilt} />
        ))}
      </div>
      <div className="list-col-grow">
        <p className="truncate font-medium">
          {bridge.name ?? "Philips Hue bridge"}
        </p>
        <p className="text-xs text-base-content/60">
          {art.name} &middot; {bridge.address}
        </p>
      </div>
      <p className="text-right text-xs text-base-content/70">
        {held.length} {held.length === 1 ? "device" : "devices"}
        <br />
        {lights} {lights === 1 ? "light" : "lights"}
      </p>
    </li>
  );
}

export function BridgeFooter({
  bridges,
  rows,
}: {
  bridges: PairedBridge[];
  rows: DeviceRow[];
}) {
  return (
    <footer className="footer footer-vertical mt-10 rounded-box bg-base-200/70 p-6 md:p-8">
      <nav className="w-full">
        <h2 className="footer-title">Bridges</h2>
        <ul className="list w-full">
          {bridges.map((bridge) => (
            <BridgeEntry key={bridge.id} bridge={bridge} rows={rows} />
          ))}
        </ul>
        <div className="divider my-2" />
        <p className="text-sm text-base-content/70">
          {bridges.length} {bridges.length === 1 ? "bridge" : "bridges"} holding{" "}
          {rows.length} {rows.length === 1 ? "device" : "devices"}
        </p>
      </nav>
    </footer>
  );
}
