"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { Download, X } from "lucide-react";
import { useT } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const DISMISS_KEY = "kbc-install-dismissed";

const emptySubscribe = () => () => {};
/** true after hydration — keeps SSR output stable */
function useMounted() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}

interface BIPEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

function isIosSafari(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  const ios = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  // navigator.standalone === true when already running as a home-screen app
  return ios && !(window.navigator as Navigator & { standalone?: boolean }).standalone;
}

function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

/**
 * One-tap "Install" pill triggered by the browser's beforeinstallprompt
 * (Chrome / Edge / Samsung Internet on Android). Falls back to a Safari
 * Add-to-Home-Screen hint on iPhones. Hidden once installed or dismissed.
 */
export function InstallPrompt() {
  const mounted = useMounted();
  const t = useT();
  const [deferred, setDeferred] = useState<BIPEvent | null>(null);
  const [showIosHint, setShowIosHint] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const alreadyDismissed = (() => {
      try {
        return window.localStorage.getItem(DISMISS_KEY) === "1";
      } catch {
        return false;
      }
    })();

    const onBIP = (e: Event) => {
      e.preventDefault();
      if (!isStandalone()) setDeferred(e as BIPEvent);
    };
    const onInstalled = () => {
      setDeferred(null);
      setShowIosHint(false);
      setDismissed(true);
    };

    window.addEventListener("beforeinstallprompt", onBIP);
    window.addEventListener("appinstalled", onInstalled);

    // async so we never setState synchronously inside the effect
    const hintTimer = setTimeout(() => {
      if (alreadyDismissed) {
        setDismissed(true);
        return;
      }
      if (!isStandalone() && isIosSafari()) setShowIosHint(true);
    }, 0);

    return () => {
      clearTimeout(hintTimer);
      window.removeEventListener("beforeinstallprompt", onBIP);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (!mounted || dismissed) return null;
  if (!deferred && !showIosHint) return null;

  const dismiss = () => {
    setDismissed(true);
    try {
      window.localStorage.setItem(DISMISS_KEY, "1");
    } catch {
      /* ignore */
    }
  };

  const install = async () => {
    if (!deferred) return;
    try {
      await deferred.prompt();
      const { outcome } = await deferred.userChoice;
      if (outcome === "accepted") dismiss();
      else setDeferred(null);
    } catch {
      /* prompt unavailable */
    }
  };

  return (
    <div
      className={cn(
        "fixed inset-x-4 bottom-[5.25rem] z-30 md:inset-x-auto md:bottom-6 md:left-1/2 md:w-[26rem] md:-translate-x-1/2"
      )}
      role="status"
    >
      <div className="flex items-center gap-3 rounded-2xl border border-primary/25 bg-card/95 p-3 pl-4 shadow-lg backdrop-blur">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <Download className="size-4.5" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold">{t("install.title")}</p>
          {deferred ? (
            <button
              type="button"
              onClick={install}
              className="mt-0.5 cursor-pointer text-xs font-semibold text-primary underline-offset-2 hover:underline"
            >
              {t("install.cta")} →
            </button>
          ) : (
            <p className="mt-0.5 line-clamp-2 text-xs leading-snug text-muted-foreground">{t("install.ios")}</p>
          )}
        </div>
        <button
          type="button"
          aria-label={t("install.dismiss")}
          onClick={dismiss}
          className="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-full text-muted-foreground hover:bg-accent hover:text-foreground"
        >
          <X className="size-4" aria-hidden />
        </button>
      </div>
    </div>
  );
}
