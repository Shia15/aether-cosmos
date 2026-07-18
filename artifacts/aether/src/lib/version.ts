import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

declare const __AETHER_BUILD__: string;

export const BUILD_TS: string = typeof __AETHER_BUILD__ !== "undefined"
  ? __AETHER_BUILD__
  : new Date().toISOString();

const LS_KEY = "aether.version.v1";

export function buildLabel(): string {
  try {
    const d = new Date(BUILD_TS);
    return d.toLocaleString("en-US", {
      timeZone: "America/New_York",
      month: "short", day: "numeric",
      hour: "numeric", minute: "2-digit",
      hour12: true,
    });
  } catch {
    return BUILD_TS;
  }
}

export function useBuildSync() {
  const qc = useQueryClient();

  useEffect(() => {
    const stored = localStorage.getItem(LS_KEY);
    if (stored === BUILD_TS) return;

    localStorage.setItem(LS_KEY, BUILD_TS);

    if (stored !== null) {
      qc.invalidateQueries();
      window.dispatchEvent(new CustomEvent("aether:version-bump", {
        detail: { prev: stored, next: BUILD_TS },
      }));
    }
  }, [qc]);
}
