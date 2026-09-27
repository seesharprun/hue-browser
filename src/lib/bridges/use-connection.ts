"use client";

import { useEffect, useState } from "react";
import { identifyBridge, pairBridge } from "./browser";
import {
  clearBridges,
  forgetBridge,
  loadBridges,
  replaceBridges,
  saveBridge,
} from "./storage";
import type { Bridge, PairedBridge } from "./types";
import { useDiscovery } from "./use-discovery";

function message(error: unknown): string {
  return error instanceof Error
    ? error.message
    : "Something went wrong. Try again.";
}

export function useConnection() {
  const [saved, setSaved] = useState<PairedBridge[]>([]);
  const discovery = useDiscovery();
  const [pending, setPending] = useState<Bridge | null>(null);
  const [busy, setBusy] = useState(false);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    try {
      setSaved(loadBridges());
      setReady(true);
    } catch (cause) {
      setError(message(cause));
    }
  }, []);

  // Bridges paired before the model was recorded fall back to the classic
  // icon, so ask each of them what it is and keep the answer.
  useEffect(() => {
    const missing = saved.filter((bridge) => !bridge.model);
    if (missing.length === 0) return;
    let active = true;
    (async () => {
      const models = new Map<string, string>();
      for (const bridge of missing) {
        try {
          const found = await identifyBridge(bridge.address);
          if (found.id === bridge.id && found.model)
            models.set(bridge.id, found.model);
        } catch {
          // An unreachable bridge simply keeps the classic icon.
        }
      }
      if (!active || models.size === 0) return;
      setSaved((current) =>
        replaceBridges(
          current.map((bridge) => {
            const model = models.get(bridge.id);
            return model ? { ...bridge, model } : bridge;
          }),
        ),
      );
    })();
    return () => {
      active = false;
    };
  }, [saved]);

  async function search() {
    setError("");
    setNotice("");
    await discovery.search();
  }

  async function select(address: string) {
    setBusy(true);
    setError("");
    setNotice("");
    setPending(null);
    discovery.clearError();
    try {
      setPending(await identifyBridge(address));
    } catch (cause) {
      setError(message(cause));
    } finally {
      setBusy(false);
    }
  }

  async function pair() {
    if (!pending) return;
    setBusy(true);
    setError("");
    let paired: PairedBridge;
    try {
      paired = await pairBridge(pending);
    } catch (cause) {
      setError(message(cause));
      setBusy(false);
      return;
    }
    try {
      setSaved(saveBridge(saved, paired));
      setPending(null);
      discovery.clear();
      setNotice(
        `${paired.name ?? "Philips Hue bridge"} is paired in this browser.`,
      );
    } catch (cause) {
      setError(
        `The bridge accepted pairing, but this browser could not save its key: ${message(cause)}`,
      );
    } finally {
      setBusy(false);
    }
  }

  function forget(id: string) {
    if (
      !window.confirm(
        "Forget this bridge in this browser? This does not revoke its key on the bridge.",
      )
    )
      return;
    try {
      setSaved(forgetBridge(saved, id));
      setNotice("Bridge forgotten in this browser.");
      setError("");
    } catch (cause) {
      setError(message(cause));
    }
  }

  function reset() {
    if (!window.confirm("Clear all saved bridges in this browser?")) return;
    try {
      clearBridges();
      setSaved([]);
      setError("");
      setReady(true);
    } catch (cause) {
      setError(message(cause));
    }
  }

  return {
    saved,
    found: discovery.found,
    searching: discovery.searching,
    pending,
    busy,
    ready,
    error: error || discovery.error,
    notice,
    search,
    select,
    pair,
    forget,
    reset,
    cancel: () => setPending(null),
  };
}

export type ReturnTypeConnection = ReturnType<typeof useConnection>;
