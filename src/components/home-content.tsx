"use client";

import { useEffect, useRef, useState } from "react";
import { useConnection } from "../lib/bridges/use-connection";
import { ConnectCard } from "./connect-card";
import { DeviceDashboard } from "./device-dashboard";
import { NightWindow } from "./night-window";
import { RoomGlow } from "./room-glow";
import { WizardSteps } from "./wizard-steps";

const CONNECT = 0;
const DEVICES = 1;

export function HomeContent() {
  const connection = useConnection();
  const { saved } = connection;
  const [stage, setStage] = useState(CONNECT);
  const paired = saved.length;
  const previous = useRef(paired);

  // Pairing a new bridge finishes the wizard by moving on to the devices step.
  useEffect(() => {
    if (paired > previous.current) setStage(DEVICES);
    previous.current = paired;
  }, [paired]);

  const steps = [
    { label: "Connect", enabled: true },
    { label: "Devices", enabled: paired > 0 },
  ];
  // Forgetting every bridge strands the wizard on a step that no longer
  // applies, so an unreachable step falls back to the start.
  const current = steps[stage].enabled ? stage : CONNECT;

  // The spreadsheet is wide, so the device view fills the window rather than
  // sitting in a centred column that pushes the action menu off screen.
  const frame =
    current === DEVICES
      ? "w-full px-4 md:px-6"
      : "mx-auto w-full max-w-7xl px-4 md:px-6";

  return (
    <main className="grow">
      {current === CONNECT && <RoomGlow />}
      <div className={`${frame} pt-8`}>
        <WizardSteps steps={steps} current={current} onGo={setStage} />
      </div>
      {current === DEVICES ? (
        <div className={`${frame} py-8`}>
          <div className="mb-6">
            <h1 className="font-display text-3xl">Devices</h1>
            <p className="text-sm text-base-content/70">
              Browse devices across your Philips Hue bridges.
            </p>
          </div>
          <DeviceDashboard bridges={saved} />
        </div>
      ) : (
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 py-12 lg:grid-cols-3 lg:gap-16">
          <ConnectCard connection={connection} />
          <div className="lg:col-span-2">
            <NightWindow />
          </div>
        </div>
      )}
    </main>
  );
}
