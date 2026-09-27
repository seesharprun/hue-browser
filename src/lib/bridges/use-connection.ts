"use client";

import { useEffect, useState } from "react";
import {
  clearBridges,
  forgetBridge,
  identifyBridge,
  loadBridges,
  pairBridge,
  saveBridge,
} from "./browser";
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
