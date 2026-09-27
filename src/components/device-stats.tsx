"use client";

import type { DeviceRow } from "../lib/devices/types";

function Stat({
  title,
  value,
  desc,
  loading,
}: {
  title: string;
  value: number;
  desc: string;
  loading: boolean;
}) {
  return (
    <div className="stat">
      <div className="stat-title">{title}</div>
      <div className="stat-value text-2xl md:text-3xl">
        {loading ? <span className="skeleton block h-8 w-16" /> : value}
      </div>
      <div className="stat-desc">{desc}</div>
    </div>
  );
}

export function DeviceStats({
  rows,
  shown,
  bridges,
  loading,
}: {
  rows: DeviceRow[];
  shown: number;
  bridges: number;
  loading: boolean;
}) {
  const rooms = new Set(
    rows.map((row) => row.room).filter((room) => room !== "Unassigned"),
  );
  const zones = new Set(rows.flatMap((row) => row.zones));
  const lights = rows.filter((row) => row.light).length;

  return (
    <div className="stats stats-vertical mb-4 w-full bg-base-200/70 sm:stats-horizontal">
      <Stat
        title="Devices"
        value={rows.length}
        desc={
          shown === rows.length ? "All shown" : `${shown} match your filters`
        }
        loading={loading}
      />
      <Stat
        title="Lights"
        value={lights}
        desc="Can be identified"
        loading={loading}
      />
      <Stat
        title="Rooms"
        value={rooms.size}
        desc={`${zones.size} ${zones.size === 1 ? "zone" : "zones"}`}
        loading={loading}
      />
      <Stat
        title="Bridges"
        value={bridges}
        desc="Connected"
        loading={loading}
      />
    </div>
  );
}
