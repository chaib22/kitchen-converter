"use client";

import { create } from "zustand";
import { useEffect } from "react";
import { volumeToGrams, gramsToCups, parseAmount } from "@/lib/conversions";
import { getIngredient } from "@/lib/ingredients";
import type { Lang } from "@/lib/i18n";

export type TabId = "ingredients" | "oven" | "volume" | "recipe" | "favorites";
export type IngUnit = "cup" | "tbsp" | "tsp" | "g" | "oz";
export type OvenUnit = "F" | "C";
export type VolumeSystem = "us" | "uk";

export interface FavoriteItem {
  id: string;
  type: "ingredient" | "oven" | "volume";
  /** primary line, e.g. "1 cup All-Purpose Flour" */
  label: string;
  /** secondary line, e.g. "= 125 g (4.4 oz)" */
  detail: string;
  /** state needed to restore the converter */
  payload: Record<string, string | number>;
  createdAt: number;
}

const FAV_KEY = "kitchen-converter-favorites";
const LANG_KEY = "kitchen-converter-lang";
const RECIPE_KEY = "kitchen-converter-recipe";

export interface RecipeLine {
  id: string;
  ingId: string;
  /** raw amount text (supports fractions) */
  text: string;
  unit: IngUnit;
}

const DEFAULT_RECIPE_LINES: RecipeLine[] = [
  { id: "seed-flour", ingId: "all-purpose-flour", text: "2", unit: "cup" },
  { id: "seed-sugar", ingId: "granulated-sugar", text: "1/2", unit: "cup" },
];

interface AppState {
  activeTab: TabId;
  setActiveTab: (t: TabId) => void;

  // Language
  lang: Lang;
  setLang: (l: Lang) => void;
  loadLang: () => void;

  // Ingredient converter
  ingId: string;
  ingVolumeText: string;
  ingVolumeUnit: IngUnit;
  ingWeightText: string;
  ingWeightUnit: "g" | "oz";
  ingDirection: "v2w" | "w2v";
  setIng: (patch: Partial<Pick<AppState, "ingId" | "ingVolumeText" | "ingVolumeUnit" | "ingWeightText" | "ingWeightUnit" | "ingDirection">>) => void;
  swapIng: () => void;

  // Oven converter
  ovenText: string;
  ovenUnit: OvenUnit;
  setOven: (patch: Partial<Pick<AppState, "ovenText" | "ovenUnit">>) => void;

  // Volume converter
  volSystem: VolumeSystem;
  volText: string;
  volUnit: string;
  setVol: (patch: Partial<Pick<AppState, "volSystem" | "volText" | "volUnit">>) => void;

  // Recipe scaler
  recipeLines: RecipeLine[];
  recipeMult: number;
  recipeMultText: string;
  recipeLoaded: boolean;
  loadRecipe: () => void;
  addRecipeLine: () => void;
  updateRecipeLine: (id: string, patch: Partial<Omit<RecipeLine, "id">>) => void;
  removeRecipeLine: (id: string) => void;
  clearRecipe: () => void;
  setRecipeMult: (n: number) => void;
  setRecipeMultText: (t: string) => void;
  resetRecipe: () => void;

  // Favorites
  favorites: FavoriteItem[];
  favsLoaded: boolean;
  loadFavorites: () => void;
  addFavorite: (fav: Omit<FavoriteItem, "id" | "createdAt">) => boolean;
  removeFavorite: (id: string) => void;
  clearFavorites: () => void;
  restoreFavorite: (fav: FavoriteItem) => void;
}

function persistFavorites(favs: FavoriteItem[]) {
  try {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(FAV_KEY, JSON.stringify(favs));
    }
  } catch {
    /* storage unavailable — ignore */
  }
}

function persistRecipe(lines: RecipeLine[], mult: number, multText: string) {
  try {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(RECIPE_KEY, JSON.stringify({ lines, mult, multText }));
    }
  } catch {
    /* storage unavailable — ignore */
  }
}

export const useAppStore = create<AppState>((set, get) => ({
  activeTab: "ingredients",
  setActiveTab: (t) => set({ activeTab: t }),

  lang: "en",
  setLang: (l) => {
    set({ lang: l });
    try {
      if (typeof window !== "undefined") window.localStorage.setItem(LANG_KEY, l);
    } catch {
      /* ignore */
    }
  },
  loadLang: () => {
    try {
      if (typeof window !== "undefined") {
        const raw = window.localStorage.getItem(LANG_KEY);
        if (raw === "en" || raw === "fr" || raw === "es") set({ lang: raw });
      }
    } catch {
      /* ignore */
    }
  },

  ingId: "all-purpose-flour",
  ingVolumeText: "1",
  ingVolumeUnit: "cup",
  ingWeightText: "250",
  ingWeightUnit: "g",
  ingDirection: "v2w",
  setIng: (patch) => set(patch),
  swapIng: () => {
    const s = get();
    if (s.ingDirection === "v2w") {
      // carry the current volume amount across to the weight side (in grams)
      const amt = parseAmount(s.ingVolumeText);
      if (!isNaN(amt) && amt > 0) {
        const g = volumeToGrams(amt, s.ingVolumeUnit, getIngredient(s.ingId).gramsPerCup);
        set({ ingDirection: "w2v", ingWeightText: String(Math.round(g)), ingWeightUnit: "g" });
      } else {
        set({ ingDirection: "w2v" });
      }
    } else {
      const g = parseFloat(s.ingWeightText);
      if (!isNaN(g) && g > 0) {
        const cups = gramsToCups(g, getIngredient(s.ingId).gramsPerCup);
        set({ ingDirection: "v2w", ingVolumeText: String(Math.round(cups * 100) / 100), ingVolumeUnit: "cup" });
      } else {
        set({ ingDirection: "v2w" });
      }
    }
  },

  ovenText: "350",
  ovenUnit: "F",
  setOven: (patch) => set(patch),

  volSystem: "us",
  volText: "1",
  volUnit: "cup",
  setVol: (patch) => set(patch),

  recipeLines: DEFAULT_RECIPE_LINES,
  recipeMult: 1,
  recipeMultText: "",
  recipeLoaded: false,
  loadRecipe: () => {
    if (get().recipeLoaded) return;
    try {
      if (typeof window !== "undefined") {
        const raw = window.localStorage.getItem(RECIPE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw) as { lines?: RecipeLine[]; mult?: number; multText?: string };
          set({
            recipeLines: Array.isArray(parsed.lines) ? parsed.lines.slice(0, 12) : DEFAULT_RECIPE_LINES,
            recipeMult: typeof parsed.mult === "number" && parsed.mult > 0 ? parsed.mult : 1,
            recipeMultText: typeof parsed.multText === "string" ? parsed.multText : "",
            recipeLoaded: true,
          });
          return;
        }
      }
      set({ recipeLoaded: true });
    } catch {
      set({ recipeLoaded: true });
    }
  },
  addRecipeLine: () => {
    const cur = get().recipeLines;
    if (cur.length >= 12) return;
    const next = [...cur, { id: crypto.randomUUID(), ingId: "all-purpose-flour", text: "1", unit: "cup" as IngUnit }];
    set({ recipeLines: next });
    persistRecipe(next, get().recipeMult, get().recipeMultText);
  },
  updateRecipeLine: (id, patch) => {
    const next = get().recipeLines.map((l) => (l.id === id ? { ...l, ...patch } : l));
    set({ recipeLines: next });
    persistRecipe(next, get().recipeMult, get().recipeMultText);
  },
  removeRecipeLine: (id) => {
    const next = get().recipeLines.filter((l) => l.id !== id);
    set({ recipeLines: next });
    persistRecipe(next, get().recipeMult, get().recipeMultText);
  },
  clearRecipe: () => {
    set({ recipeLines: [] });
    persistRecipe([], get().recipeMult, get().recipeMultText);
  },
  setRecipeMult: (n) => {
    set({ recipeMult: n > 0 ? n : 1, recipeMultText: "" });
    persistRecipe(get().recipeLines, n > 0 ? n : 1, "");
  },
  setRecipeMultText: (t) => {
    set({ recipeMultText: t });
    persistRecipe(get().recipeLines, get().recipeMult, t);
  },
  resetRecipe: () => {
    set({ recipeLines: DEFAULT_RECIPE_LINES, recipeMult: 1, recipeMultText: "" });
    persistRecipe(DEFAULT_RECIPE_LINES, 1, "");
  },

  favorites: [],
  favsLoaded: false,
  loadFavorites: () => {
    if (get().favsLoaded) return;
    try {
      if (typeof window !== "undefined") {
        const raw = window.localStorage.getItem(FAV_KEY);
        const favs: FavoriteItem[] = raw ? (JSON.parse(raw) as FavoriteItem[]) : [];
        set({ favorites: favs, favsLoaded: true });
      }
    } catch {
      set({ favorites: [], favsLoaded: true });
    }
  },
  addFavorite: (fav) => {
    const exists = get().favorites.some((f) => f.type === fav.type && f.label === fav.label);
    if (exists) return false;
    const item: FavoriteItem = { ...fav, id: crypto.randomUUID(), createdAt: Date.now() };
    const next = [item, ...get().favorites].slice(0, 50);
    set({ favorites: next });
    persistFavorites(next);
    return true;
  },
  removeFavorite: (id) => {
    const next = get().favorites.filter((f) => f.id !== id);
    set({ favorites: next });
    persistFavorites(next);
  },
  clearFavorites: () => {
    set({ favorites: [] });
    persistFavorites([]);
  },
  restoreFavorite: (fav) => {
    const p = fav.payload;
    if (fav.type === "ingredient") {
      set({
        ingId: String(p.ingId ?? "all-purpose-flour"),
        ingDirection: (p.ingDirection as "v2w" | "w2v") ?? "v2w",
        ingVolumeText: String(p.ingVolumeText ?? "1"),
        ingVolumeUnit: (p.ingVolumeUnit as IngUnit) ?? "cup",
        ingWeightText: String(p.ingWeightText ?? "250"),
        ingWeightUnit: (p.ingWeightUnit as "g" | "oz") ?? "g",
        activeTab: "ingredients",
      });
    } else if (fav.type === "oven") {
      set({
        ovenText: String(p.ovenText ?? "350"),
        ovenUnit: (p.ovenUnit as OvenUnit) ?? "F",
        activeTab: "oven",
      });
    } else {
      set({
        volSystem: (p.volSystem as VolumeSystem) ?? "us",
        volText: String(p.volText ?? "1"),
        volUnit: String(p.volUnit ?? "cup"),
        activeTab: "volume",
      });
    }
  },
}));

/** Loads favorites + language + recipe from localStorage once, after first client render. */
export function useFavoritesLoader() {
  const load = useAppStore((s) => s.loadFavorites);
  const loadLang = useAppStore((s) => s.loadLang);
  const loadRecipe = useAppStore((s) => s.loadRecipe);
  useEffect(() => {
    load();
    loadLang();
    loadRecipe();
  }, [load, loadLang, loadRecipe]);
}
