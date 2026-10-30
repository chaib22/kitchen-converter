"use client";

import { useState } from "react";
import { Check, ChevronsUpDown, ClipboardList, Plus, RotateCcw, Trash2 } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Chip, SectionLabel } from "./shared";
import { CATEGORY_ORDER, INGREDIENTS, getIngredient, ingName, type CategoryId } from "@/lib/ingredients";
import { useAppStore, type IngUnit, type RecipeLine } from "@/lib/store";
import { useT, type StringKey } from "@/lib/i18n";
import { G_PER_OZ, formatNum, fractionLabel, parseAmount, toFraction, volumeToGrams } from "@/lib/conversions";
import { cn } from "@/lib/utils";

const CAT_KEY: Record<CategoryId, StringKey> = {
  flours: "cat.flours",
  sugars: "cat.sugars",
  fats: "cat.fats",
  dairy: "cat.dairy",
  liquids: "cat.liquids",
  baking: "cat.baking",
  nuts: "cat.nuts",
  fruits: "cat.fruits",
};

const MULT_CHIPS = [
  { label: "½×", value: 0.5 },
  { label: "1×", value: 1 },
  { label: "2×", value: 2 },
  { label: "3×", value: 3 },
];

const UNIT_OPTIONS: { value: IngUnit; labelKey: StringKey; shortKey: StringKey }[] = [
  { value: "cup", labelKey: "unit.cup", shortKey: "vol.short.cup" },
  { value: "tbsp", labelKey: "unit.tbsp", shortKey: "unit.tbspShort" },
  { value: "tsp", labelKey: "unit.tsp", shortKey: "unit.tspShort" },
  { value: "g", labelKey: "unit.g", shortKey: "unit.gShort" },
  { value: "oz", labelKey: "unit.oz", shortKey: "unit.ozShort" },
];

function LineIngredientPicker({ line }: { line: RecipeLine }) {
  const lang = useAppStore((s) => s.lang);
  const updateRecipeLine = useAppStore((s) => s.updateRecipeLine);
  const t = useT();
  const [open, setOpen] = useState(false);
  const ingredient = getIngredient(line.ingId);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          role="combobox"
          aria-expanded={open}
          className="h-9 w-full justify-between gap-1.5 rounded-lg px-2.5 text-sm font-medium hover:bg-accent"
        >
          <span className="truncate">{ingName(ingredient, lang)}</span>
          <ChevronsUpDown className="size-3.5 shrink-0 opacity-50" aria-hidden />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[min(20rem,calc(100vw-2.5rem))] p-0" align="start">
        <Command>
          <CommandInput placeholder={t("ing.search")} />
          <CommandList className="nice-scroll max-h-64">
            <CommandEmpty>{t("ing.notFound")}</CommandEmpty>
            {CATEGORY_ORDER.map((cat) => (
              <CommandGroup key={cat} heading={t(CAT_KEY[cat])}>
                {INGREDIENTS.filter((i) => i.category === cat).map((i) => (
                  <CommandItem
                    key={i.id}
                    value={`${i.name.en} ${i.name.fr} ${i.name.es} ${cat}`}
                    onSelect={() => {
                      updateRecipeLine(line.id, { ingId: i.id });
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn("mr-2 size-4 shrink-0", i.id === line.ingId ? "opacity-100" : "opacity-0")}
                      aria-hidden
                    />
                    <span className="truncate">{ingName(i, lang)}</span>
                    <span className="ml-auto shrink-0 text-xs text-muted-foreground">
                      {t("ing.perCup", { g: i.gramsPerCup })}
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

function RecipeLineRow({ line, mult }: { line: RecipeLine; mult: number }) {
  const updateRecipeLine = useAppStore((s) => s.updateRecipeLine);
  const removeRecipeLine = useAppStore((s) => s.removeRecipeLine);
  const t = useT();
  const ingredient = getIngredient(line.ingId);

  const amt = parseAmount(line.text);
  const valid = !isNaN(amt) && amt >= 0;
  const isVol = line.unit === "cup" || line.unit === "tbsp" || line.unit === "tsp";
  const isOz = line.unit === "oz";

  // scaled amount (same unit as input)
  const scaledAmt = valid ? amt * mult : NaN;
  // weight equivalent of the scaled amount
  const scaledGrams = valid
    ? isVol
      ? volumeToGrams(amt, line.unit, ingredient.gramsPerCup) * mult
      : isOz
        ? amt * mult * G_PER_OZ
        : amt * mult
    : NaN;
  const cupsEq = !isNaN(scaledGrams) && ingredient.gramsPerCup > 0 ? scaledGrams / ingredient.gramsPerCup : NaN;
  const cupsFrac = isNaN(cupsEq) ? null : toFraction(cupsEq, 0.035);

  const unitShortKey = UNIT_OPTIONS.find((u) => u.value === line.unit)?.shortKey ?? "vol.short.cup";

  return (
    <div className="rounded-xl border border-border bg-card p-3 shadow-sm">
      <div className="flex items-center gap-1.5">
        <div className="min-w-0 flex-1 rounded-lg border border-transparent hover:border-border">
          <LineIngredientPicker line={line} />
        </div>
        <Button
          variant="ghost"
          size="icon"
          aria-label={t("aria.deleteLine")}
          onClick={() => removeRecipeLine(line.id)}
          className="size-9 shrink-0 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
        >
          <Trash2 className="size-4" aria-hidden />
        </Button>
      </div>
      <div className="mt-2 flex items-center gap-2">
        <Input
          aria-label={t("aria.amount")}
          inputMode="decimal"
          value={line.text}
          onChange={(e) => updateRecipeLine(line.id, { text: e.target.value })}
          placeholder="1 1/2"
          className="h-10 w-20 shrink-0 rounded-lg border-border bg-secondary/60 text-base font-semibold tabular-nums"
        />
        <select
          aria-label={t("aria.volUnit")}
          value={line.unit}
          onChange={(e) => updateRecipeLine(line.id, { unit: e.target.value as IngUnit })}
          className="h-10 shrink-0 cursor-pointer rounded-lg border border-border bg-secondary/60 px-2 text-sm font-semibold outline-none focus:ring-2 focus:ring-ring"
        >
          {UNIT_OPTIONS.map((u) => (
            <option key={u.value} value={u.value}>
              {t(u.shortKey)}
            </option>
          ))}
        </select>
        <div className="min-w-0 flex-1 text-right">
          {!valid ? (
            <span className="text-xs text-muted-foreground">—</span>
          ) : (
            <>
              <p className="truncate text-sm font-bold text-primary tabular-nums">
                → {isVol ? fractionLabel(scaledAmt) : formatNum(scaledAmt, scaledAmt < 10 ? 1 : 0)}{" "}
                {t(unitShortKey)}
              </p>
              <p className="truncate text-xs text-muted-foreground tabular-nums">
                {isVol
                  ? t("recipe.approxG", { g: formatNum(scaledGrams, scaledGrams < 100 ? 1 : 0) })
                  : cupsFrac
                    ? t("recipe.cupsEq", {
                        cups: fractionLabel(cupsEq),
                        unit: cupsEq === 1 || Math.round(cupsEq * 100) === 100 ? t("ing.cup") : t("ing.cups"),
                      })
                    : t("recipe.approxG", { g: formatNum(scaledGrams, 0) })}
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export function RecipeConverter() {
  const recipeLines = useAppStore((s) => s.recipeLines);
  const recipeMult = useAppStore((s) => s.recipeMult);
  const recipeMultText = useAppStore((s) => s.recipeMultText);
  const setRecipeMult = useAppStore((s) => s.setRecipeMult);
  const setRecipeMultText = useAppStore((s) => s.setRecipeMultText);
  const addRecipeLine = useAppStore((s) => s.addRecipeLine);
  const resetRecipe = useAppStore((s) => s.resetRecipe);
  const t = useT();

  const customVal = parseFloat(recipeMultText);
  const mult = !isNaN(customVal) && customVal > 0 ? customVal : recipeMult;

  // total scaled weight across all valid lines
  let totalGrams = 0;
  let hasValid = false;
  for (const line of recipeLines) {
    const amt = parseAmount(line.text);
    if (isNaN(amt) || amt < 0) continue;
    const ing = getIngredient(line.ingId);
    if (line.unit === "g") totalGrams += amt * mult;
    else if (line.unit === "oz") totalGrams += amt * mult * G_PER_OZ;
    else totalGrams += volumeToGrams(amt, line.unit, ing.gramsPerCup) * mult;
    hasValid = true;
  }

  return (
    <div className="space-y-5" role="tabpanel" aria-label="Recipe scaler">
      {/* multiplier */}
      <section className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <SectionLabel>{t("recipe.multiplier")}</SectionLabel>
          <Button
            variant="ghost"
            size="sm"
            onClick={resetRecipe}
            className="min-h-9 rounded-full px-3 text-xs font-semibold text-muted-foreground hover:text-foreground"
          >
            <RotateCcw className="mr-1 size-3.5" aria-hidden />
            {t("recipe.reset")}
          </Button>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {MULT_CHIPS.map((c) => (
            <Chip
              key={c.value}
              active={recipeMultText === "" && recipeMult === c.value}
              onClick={() => setRecipeMult(c.value)}
              ariaLabel={`×${c.value}`}
            >
              {c.label}
            </Chip>
          ))}
          <div className="relative">
            <Input
              aria-label={t("recipe.multiplier")}
              inputMode="decimal"
              value={recipeMultText}
              onChange={(e) => setRecipeMultText(e.target.value)}
              placeholder={String(mult)}
              className="h-11 w-24 rounded-full border-border bg-card pr-7 text-center text-sm font-semibold tabular-nums shadow-sm"
            />
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-muted-foreground">
              ×
            </span>
          </div>
        </div>
      </section>

      {/* lines */}
      {recipeLines.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card/60 p-8 text-center">
          <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-accent">
            <ClipboardList className="size-7 text-primary" aria-hidden />
          </div>
          <p className="mx-auto mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">{t("recipe.first")}</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {recipeLines.map((line) => (
            <RecipeLineRow key={line.id} line={line} mult={mult} />
          ))}
          {recipeLines.length >= 12 && (
            <p className="text-center text-xs text-muted-foreground">{t("recipe.max")}</p>
          )}
        </div>
      )}

      {/* add + summary */}
      <div className="flex flex-col items-center gap-3">
        <Button
          variant="outline"
          onClick={addRecipeLine}
          disabled={recipeLines.length >= 12}
          className="min-h-11 rounded-full border-primary/40 text-primary hover:bg-primary hover:text-primary-foreground"
        >
          <Plus className="mr-1.5 size-4" aria-hidden />
          {t("recipe.add")}
        </Button>

        {hasValid && totalGrams > 0 && (
          <div className="result-hero w-full rounded-2xl border border-primary/15 px-5 py-3 text-center shadow-sm">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-primary/70">
              {t("recipe.scaled")} · ×{mult % 1 === 0 ? mult : fractionLabel(mult)}
            </p>
            <p className="font-display text-3xl font-bold text-primary tabular-nums">
              {formatNum(totalGrams, 0)}
              <span className="ml-1.5 text-base font-semibold text-primary/70">g</span>
              {totalGrams >= 1000 ? (
                <span className="ml-2 text-sm font-semibold text-primary/60">
                  ({formatNum(totalGrams / 1000, 2)} kg)
                </span>
              ) : (
                <span className="ml-2 text-sm font-semibold text-primary/60">
                  ({formatNum(totalGrams / G_PER_OZ, 1)} oz)
                </span>
              )}
            </p>
          </div>
        )}

        <p className="text-center text-xs leading-relaxed text-muted-foreground">{t("recipe.note")}</p>
      </div>
    </div>
  );
}
