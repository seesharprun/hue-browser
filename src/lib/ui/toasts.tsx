"use client";

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { ToastStack } from "../../components/toast-stack";

export type ToastTone = "info" | "success" | "warning" | "error";

export type Toast = {
  id: string;
  tone: ToastTone;
  message: string;
  /** Problems stay until dismissed so retry guidance is not lost. */
  sticky: boolean;
};

/** A repeated `key` replaces its earlier toast instead of stacking a copy. */
type Notice = { tone: ToastTone; message: string; key?: string };

type ToastApi = {
  notify: (notice: Notice) => void;
  dismiss: (id: string) => void;
};

const Context = createContext<ToastApi | null>(null);

const LIFETIME = 6000;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timers = useRef(new Map<string, ReturnType<typeof setTimeout>>());

  const dismiss = useCallback((id: string) => {
    const timer = timers.current.get(id);
    if (timer) clearTimeout(timer);
    timers.current.delete(id);
    setToasts((current) => current.filter((item) => item.id !== id));
  }, []);

  const notify = useCallback(
    ({ tone, message, key }: Notice) => {
      const id = key ?? crypto.randomUUID();
      const sticky = tone === "error" || tone === "warning";
      setToasts((current) =>
        current.some((item) => item.id === id)
          ? current.map((item) =>
              item.id === id ? { id, tone, message, sticky } : item,
            )
          : [...current, { id, tone, message, sticky }],
      );
      const running = timers.current.get(id);
      if (running) clearTimeout(running);
      timers.current.delete(id);
      if (!sticky) {
        timers.current.set(
          id,
          setTimeout(() => dismiss(id), LIFETIME),
        );
      }
    },
    [dismiss],
  );

  useEffect(() => {
    const held = timers.current;
    return () => {
      for (const timer of held.values()) clearTimeout(timer);
    };
  }, []);

  const value = useMemo(() => ({ notify, dismiss }), [notify, dismiss]);

  return (
    <Context.Provider value={value}>
      {children}
      <ToastStack toasts={toasts} onDismiss={dismiss} />
    </Context.Provider>
  );
}

export function useToasts() {
  const found = useContext(Context);
  if (!found) throw new Error("useToasts requires a ToastProvider ancestor.");
  return found;
}
