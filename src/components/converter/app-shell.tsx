"use client";

import { useSyncExternalStore } from "react";
import { useTheme } from "next-themes";
import { Beaker, Check, ClipboardList, Flame, Globe, Moon, Star, Sun, Wheat } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAppStore, type TabId } from "@/lib/store";
import { LANGS, useT, type Lang } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const emptySubscribe = () => () => {};
/** true on client after hydration, false during SSR — avoids setState-in-effect */
function useHydrated() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}

export const NAV_TABS: { id: TabId; icon: typeof Wheat }[] = [
  { id: "ingredients", icon: Wheat },
  { id: "oven", icon: Flame },
  { id: "volume", icon: Beaker },
  { id: "recipe", icon: ClipboardList },
  { id: "favorites", icon: Star },
];

const NAV_KEY: Record<TabId, "nav.ingredients" | "nav.oven" | "nav.volume" | "nav.recipe" | "nav.saved"> = {
  ingredients: "nav.ingredients",
  oven: "nav.oven",
  volume: "nav.volume",
  recipe: "nav.recipe",
  favorites: "nav.saved",
};

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const t = useT();
  const mounted = useHydrated();
  const dark = mounted && resolvedTheme === "dark";

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label={dark ? t("aria.theme.dark") : t("aria.theme.light")}
      onClick={() => setTheme(dark ? "light" : "dark")}
      className="size-10 rounded-full text-muted-foreground hover:bg-accent hover:text-foreground"
    >
      {dark ? <Sun className="size-5" aria-hidden /> : <Moon className="size-5" aria-hidden />}
    </Button>
  );
}

export function LanguageSwitcher() {
  const lang = useAppStore((s) => s.lang);
  const setLang = useAppStore((s) => s.setLang);
  const t = useT();
  const current = LANGS.find((l) => l.value === lang) ?? LANGS[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          aria-label={t("aria.lang")}
          className="h-10 gap-1.5 rounded-full px-3 text-sm font-semibold text-muted-foreground hover:bg-accent hover:text-foreground"
        >
          <Globe className="size-4" aria-hidden />
          {current.short}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-36 rounded-xl">
        {LANGS.map((l) => (
          <DropdownMenuItem
            key={l.value}
            onClick={() => setLang(l.value as Lang)}
            className="cursor-pointer text-sm font-medium"
          >
            <Check className={cn("mr-1.5 size-4", l.value === lang ? "opacity-100" : "opacity-0")} aria-hidden />
            {l.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function AppHeader() {
  const t = useT();
  return (
    <header className="order-1 border-b border-border/70 bg-background/90 backdrop-blur">
      <div className="mx-auto flex w-full max-w-2xl items-center gap-3 px-4 py-3">
        <img
          src="/icons/icon-192.png"
          alt=""
          className="size-11 shrink-0 shadow-sm"
        />
        <div className="min-w-0 flex-1">
          <h1 className="truncate font-display text-lg font-bold leading-tight sm:text-xl">{t("app.title")}</h1>
          <p className="truncate text-xs text-muted-foreground">{t("app.tagline")}</p>
        </div>
        <LanguageSwitcher />
        <ThemeToggle />
      </div>
    </header>
  );
}

export function DesktopNav() {
  const activeTab = useAppStore((s) => s.activeTab);
  const setActiveTab = useAppStore((s) => s.setActiveTab);
  const favCount = useAppStore((s) => s.favorites.length);
  const t = useT();

  return (
    <nav aria-label="Converter sections" className="order-2 hidden justify-center py-3 md:flex">
      <div className="inline-flex rounded-full border border-border bg-card p-1 shadow-sm">
        {NAV_TABS.map((tab) => {
          const active = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex min-h-10 cursor-pointer items-center gap-2 rounded-full px-4 text-sm font-semibold transition-all duration-150",
                active ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="size-4" aria-hidden />
              {t(NAV_KEY[tab.id])}
              {tab.id === "favorites" && favCount > 0 && (
                <span
                  className={cn(
                    "rounded-full px-1.5 py-0.5 text-[10px] font-bold leading-none",
                    active ? "bg-primary-foreground/20 text-primary-foreground" : "bg-accent text-primary"
                  )}
                >
                  {favCount}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}

export function MobileBottomNav() {
  const activeTab = useAppStore((s) => s.activeTab);
  const setActiveTab = useAppStore((s) => s.setActiveTab);
  const favCount = useAppStore((s) => s.favorites.length);
  const t = useT();

  return (
    <nav
      aria-label="Converter sections"
      className="pb-safe fixed inset-x-0 bottom-0 z-40 border-t border-border/70 bg-card/95 backdrop-blur md:hidden"
    >
      <div className="mx-auto grid max-w-2xl grid-cols-5">
        {NAV_TABS.map((tab) => {
          const active = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "relative flex min-h-14 cursor-pointer flex-col items-center justify-center gap-0.5 px-0.5 text-[10px] font-semibold transition-colors",
                active ? "text-primary" : "text-muted-foreground"
              )}
            >
              <Icon className="size-5" aria-hidden />
              <span className="max-w-full truncate leading-tight">{t(NAV_KEY[tab.id])}</span>
              {tab.id === "favorites" && favCount > 0 && (
                <span className="absolute right-1.5 top-1.5 flex min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[9px] font-bold leading-4 text-primary-foreground">
                  {favCount}
                </span>
              )}
              {active && <span className="absolute inset-x-4 top-0 h-0.5 rounded-full bg-primary" aria-hidden />}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
