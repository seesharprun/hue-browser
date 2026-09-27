import { ConnectCard } from "../components/connect-card";
import { NightWindow } from "../components/night-window";
import { RoomGlow } from "../components/room-glow";

export default function HomePage() {
  return (
    <main className="grow">
      <RoomGlow />
      <div className="mx-auto grid min-h-[calc(100dvh-4rem)] max-w-7xl items-center gap-12 px-6 py-12 lg:grid-cols-3 lg:gap-16">
        <ConnectCard />
        <div className="lg:col-span-2">
          <NightWindow />
        </div>
      </div>
    </main>
  );
}
