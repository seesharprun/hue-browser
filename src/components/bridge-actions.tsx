import type { FormEvent } from "react";
import type { DiscoveredBridge } from "../lib/bridges/types";

type Props = {
  busy: boolean;
  searching: boolean;
  found: DiscoveredBridge[] | null;
  onSearch: () => void;
  onSelect: (address: string) => void;
};

export function BridgeActions({
  busy,
  searching,
  found,
  onSearch,
  onSelect,
}: Props) {
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const address = new FormData(form).get("bridge");
    if (typeof address === "string") onSelect(address.trim());
  }

  return (
    <>
      <button
        type="button"
        className="btn btn-primary btn-lg mt-7 w-full"
        disabled={busy || searching}
        onClick={onSearch}
      >
        {searching && (
          <span
            aria-hidden="true"
            className="loading loading-spinner loading-sm"
          />
        )}
        {searching ? "Finding bridges..." : "Search my network"}
      </button>
      <p className="mt-3 text-sm text-base-content/60">
        Uses Philips Hue online discovery. The server needs internet access.
      </p>
      {found && (
        <div className="mt-4" aria-live="polite">
          {found.length === 0 ? (
            <p className="text-sm">No bridges found. Enter an address below.</p>
          ) : (
            <ul className="space-y-2">
              {found.map((bridge) => (
                <li
                  key={bridge.id}
                  className="rounded-box border border-base-300 bg-base-100 p-3"
                >
                  <button
                    type="button"
                    className="w-full cursor-pointer text-left disabled:cursor-not-allowed"
                    disabled={busy || bridge.status !== "ready"}
                    onClick={() => onSelect(bridge.address)}
                  >
                    <strong
                      className={`block truncate text-base ${
                        bridge.name ? "text-primary" : "text-base-content/60"
                      }`}
                    >
                      {bridge.name ??
                        (bridge.status === "loading"
                          ? "Looking up name..."
                          : "Name unavailable")}
                    </strong>
                    <span className="block text-xs text-base-content/70">
                      Bridge ID: {bridge.id}
                    </span>
                    <span className="flex items-center gap-2 text-xs text-base-content/70">
                      IP address: {bridge.address}
                      {bridge.status === "loading" && (
                        <span
                          className="loading loading-spinner loading-xs"
                          role="status"
                          aria-label={`Looking up name for ${bridge.address}`}
                        />
                      )}
                    </span>
                  </button>
                  {bridge.error && (
                    <p className="mt-2 text-xs text-error">{bridge.error}</p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
      <div className="divider my-6 text-base-content/40">or</div>
      <form className="flex flex-col gap-4" onSubmit={submit}>
        <label className="floating-label">
          <span>Bridge address</span>
          <input
            type="text"
            name="bridge"
            placeholder="192.168.1.2"
            inputMode="decimal"
            autoComplete="off"
            className="input input-lg w-full"
            required
          />
        </label>
        <button
          type="submit"
          className="btn btn-secondary btn-lg"
          disabled={busy}
        >
          Connect to this address
        </button>
      </form>
      <p className="mt-3 text-sm text-base-content/60">
        Use this when you already know your bridge's local IP address.
      </p>
    </>
  );
}
