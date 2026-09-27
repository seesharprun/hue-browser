import type { PairedBridge } from "../lib/bridges/types";

export function PairedBridges({
  bridges,
  onForget,
}: {
  bridges: PairedBridge[];
  onForget: (id: string) => void;
}) {
  if (bridges.length === 0) return null;
  return (
    <section className="mt-8">
      <h2 className="font-semibold">Paired bridges</h2>
      <ul className="mt-2 space-y-2">
        {bridges.map((bridge) => (
          <li
            key={bridge.id}
            className="flex items-center justify-between gap-2"
          >
            <div className="min-w-0">
              <p className="truncate">{bridge.name ?? "Philips Hue bridge"}</p>
              <p className="text-sm text-base-content/60">{bridge.address}</p>
            </div>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => onForget(bridge.id)}
              aria-label={`Forget ${bridge.name ?? "Philips Hue bridge"} at ${bridge.address}`}
            >
              Forget
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
