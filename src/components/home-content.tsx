"use client";

import { useState } from "react";
import { useConnection } from "../lib/bridges/use-connection";
import { ConnectCard } from "./connect-card";
import { DeviceDashboard } from "./device-dashboard";
import { NightWindow } from "./night-window";
import { RoomGlow } from "./room-glow";

export function HomeContent() {
  const connection = useConnection();
  const [managing, setManaging] = useState(false);
  if (connection.ready && connection.saved.length > 0) {
    return (
      <main className="mx-auto w-full max-w-7xl grow px-4 py-8 md:px-6">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl">Devices</h1>
            <p className="text-sm text-base-content/70">
              Browse devices across your Philips Hue bridges.
            </p>
          </div>
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => setManaging((open) => !open)}
          >
            {managing ? "Close bridge settings" : "Manage bridges"}
          </button>
        </div>
        {managing && (
          <div className="mb-8">
            <ConnectCard connection={connection} />
          </div>
        )}
        <DeviceDashboard bridges={connection.saved} />
      </main>
    );
  }
  return (
    <main className="grow">
      <RoomGlow />
      <div className="mx-auto grid min-h-[calc(100dvh-4rem)] max-w-7xl items-center gap-12 px-6 py-12 lg:grid-cols-3 lg:gap-16">
        <ConnectCard connection={connection} />
        <div className="lg:col-span-2">
          <NightWindow />
        </div>
      </div>
    </main>
  );
}
