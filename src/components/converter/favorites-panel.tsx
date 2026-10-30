"use client";

import { Beaker, Flame, Star, Trash2, Wheat } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SectionLabel } from "./shared";
import { useAppStore, type FavoriteItem } from "@/lib/store";
import { useT, type StringKey } from "@/lib/i18n";
import { useToast } from "@/hooks/use-toast";

const TYPE_ICON: Record<FavoriteItem["type"], typeof Star> = {
  ingredient: Wheat,
  oven: Flame,
  volume: Beaker,
};

const TYPE_KEY: Record<FavoriteItem["type"], StringKey> = {
  ingredient: "fav.type.ingredient",
  oven: "fav.type.oven",
  volume: "fav.type.volume",
};

export function FavoritesPanel() {
  const favorites = useAppStore((s) => s.favorites);
  const removeFavorite = useAppStore((s) => s.removeFavorite);
  const clearFavorites = useAppStore((s) => s.clearFavorites);
  const restoreFavorite = useAppStore((s) => s.restoreFavorite);
  const { toast } = useToast();
  const t = useT();

  return (
    <div className="space-y-4" role="tabpanel" aria-label={t("fav.label")}>
      <div className="flex items-center justify-between">
        <SectionLabel>
          {favorites.length > 0
            ? t("fav.count", { n: favorites.length, s: favorites.length === 1 ? "" : "s" })
            : t("fav.label")}
        </SectionLabel>
        {favorites.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              clearFavorites();
              toast({ title: t("toast.cleared") });
            }}
            className="min-h-9 rounded-full px-3 text-xs font-semibold text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="mr-1 size-3.5" aria-hidden />
            {t("fav.clearAll")}
          </Button>
        )}
      </div>

      {favorites.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card/60 p-8 text-center">
          <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-accent">
            <Star className="size-7 text-primary" aria-hidden />
          </div>
          <h2 className="mt-4 font-display text-lg font-semibold">{t("fav.emptyTitle")}</h2>
          <p className="mx-auto mt-1.5 max-w-xs text-sm leading-relaxed text-muted-foreground">
            {t("fav.emptyBody", { save: t("common.save") })}
          </p>
        </div>
      ) : (
        <ul className="space-y-2.5" aria-label={t("fav.label")}>
          {favorites.map((fav) => {
            const Icon = TYPE_ICON[fav.type];
            return (
              <li key={fav.id}>
                <div className="flex items-stretch overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all duration-150 hover:border-primary/40">
                  <button
                    type="button"
                    onClick={() => {
                      restoreFavorite(fav);
                      toast({ title: t("toast.restored"), description: fav.label });
                    }}
                    className="flex flex-1 cursor-pointer items-center gap-3 px-4 py-3.5 text-left"
                    aria-label={t("aria.restore", { label: fav.label })}
                  >
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-accent">
                      <Icon className="size-5 text-primary" aria-hidden />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold">{fav.label}</span>
                      <span className="block truncate text-xs text-muted-foreground">{fav.detail}</span>
                    </span>
                    <span className="hidden shrink-0 rounded-full bg-secondary px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-muted-foreground sm:block">
                      {t(TYPE_KEY[fav.type])}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => removeFavorite(fav.id)}
                    aria-label={t("aria.delete", { label: fav.label })}
                    className="flex w-12 cursor-pointer items-center justify-center border-l border-border text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash2 className="size-4" aria-hidden />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <p className="pt-2 text-center text-xs leading-relaxed text-muted-foreground">{t("fav.note")}</p>
    </div>
  );
}
