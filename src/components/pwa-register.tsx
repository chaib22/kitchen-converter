"use client";

import { useEffect } from "react";

/**
 * Registers the service worker for PWA installability (Play Store TWA /
 * "Add to Home Screen"). Silently no-ops on unsupported browsers.
 */
export function PwaRegister() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;
    const register = () => {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        /* SW unavailable (private mode, http dev) — app still works */
      });
    };
    if (document.readyState === "complete") register();
    else {
      window.addEventListener("load", register, { once: true });
      return () => window.removeEventListener("load", register);
    }
  }, []);

  return null;
}
