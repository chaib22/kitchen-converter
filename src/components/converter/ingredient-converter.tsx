"use client";

import { useMemo, useState } from "react";
import { ArrowLeftRight, Check, ChevronsUpDown, Scale } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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
import { Chip, ResultHero, SaveButton, SectionLabel, Segment } from "./shared";
import { CATEGORY_ORDER, INGREDIENTS, QUICK_INGREDIENT_IDS, getIngredient, ingName, ingNote, type CategoryId } from "@/lib/ingredients";
import { useAppStore } from "@/lib/store";
import { useT, type StringKey } from "@/lib/i18n";
import {
  G_PER_OZ,
  formatNum,
  fractionLabel,
  parseAmount,
  toFraction,
  volumeToGrams,
  gramsToCups,
} from "@/lib/conversions";
import { cn } from "@/lib/utils";

const FRACTION_CHIPS: { label: string; value: string }[] = [
  { label: "¼", value: "1/4" },
  { label: "⅓", value: "1/3" },
  { label: "½", value: "1/2" },
  { label: "⅔", value: "2/3" },
  { label: "¾", value: "3/4" },
  { label: "1", value: "1" },
];

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

export function IngredientConverter() {
  const lang = useAppStore((s) => s.lang);
  const ingId = useAppStore((s) => s.ingId);
  const ingVolumeText = useAppStore((s) => s.ingVolumeText);
  const ingVolumeUnit = useAppStore((s) => s.ingVolumeUnit);
  const ingWeightText = useAppStore((s) => s.ingWeightText);
  const ingWeightUnit = useAppStore((s) => s.ingWeightUnit);
  const ingDirection = useAppStore((s) => s.ingDirection);
  const setIng = useAppStore((s) => s.setIng);
  const swapIng = useAppStore((s) => s.swapIng);
  const t = useT();

  const [pickerOpen, setPickerOpen] = useState(false);
  const ingredient = getIngredient(ingId);

  const quickIngredients = useMemo(
    () => QUICK_INGREDIENT_IDS.map((id) => getIngredient(id)),
    []
  );

  // ----- calculations -----
  const v2w = ingDirection === "v2w";
  const volAmount = parseAmount(ingVolumeText);
  const weightAmount = parseFloat(ingWeightText);
  // input weight → grams (oz input is converted first)
  const weightInGrams = !v2w && !isNaN(weightAmount)
    ? ingWeightUnit === "oz"
      ? weightAmount * G_PER_OZ
      : weightAmount
    : NaN;

  const grams = v2w && !isNaN(volAmount) ? volumeToGrams(volAmount, ingVolumeUnit, ingredient.gramsPerCup) : NaN;
  const cups = !v2w && !isNaN(weightInGrams) && ingredient.gramsPerCup > 0
    ? gramsToCups(weightInGrams, ingredient.gramsPerCup)
    : NaN;

  // number type (0 fallback) so eager save-label math can never crash on null
  const cupsDecimal = isNaN(cups) ? 0 : Math.round(cups * 100) / 100;
  const cupsFracClean = isNaN(cups) ? null : toFraction(cups, 0.035);

  // tbsp breakdown for small weight inputs
  const tbspForWeight = !v2w && !isNaN(weightInGrams) ? weightInGrams / (ingredient.gramsPerCup / 16) : NaN;

  const unitShort: Record<string, string> = {
    cup: t("unit.cupLong"),
    tbsp: t("unit.tbspShort"),
    tsp: t("unit.tspShort"),
  };
  const unitWord = ingVolumeUnit === "cup" ? t("ing.cup") : unitShort[ingVolumeUnit];

  const name = ingName(ingredient, lang);

  // save is only offered when the active direction has a valid input
  const canSave = v2w ? !isNaN(grams) : !isNaN(cups);

  const saveLabel = v2w
    ? `${fractionLabel(volAmount)} ${unitWord} ${name}`
    : `${formatNum(weightAmount, 1)} ${ingWeightUnit === "g" ? t("unit.gShort") : t("unit.ozShort")} ${name}`;
  const saveDetail = v2w
    ? `= ${formatNum(grams, 0)} ${t("unit.gShort")} (${formatNum(grams / G_PER_OZ, 1)} ${t("unit.ozShort")})`
    : `= ${cupsFracClean ? fractionLabel(cups) : formatNum(cupsDecimal, 2)} ${cups === 1 || Math.round(cups * 100) === 100 ? t("ing.cup") : t("ing.cups")}`;

  return (
    <div className="space-y-5" role="tabpanel" aria-label={t("ing.label")}>
      {/* Ingredient picker */}
      <section className="space-y-2.5">
        <SectionLabel>{t("ing.label")}</SectionLabel>
        <Popover open={pickerOpen} onOpenChange={setPickerOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={pickerOpen}
              className="h-12 w-full justify-between rounded-xl border-border bg-card px-4 text-base font-medium shadow-sm"
            >
              <span className="truncate">{name}</span>
              <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" aria-hidden />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[min(22rem,calc(100vw-2rem))] p-0" align="start">
            <Command>
              <CommandInput placeholder={t("ing.search")} />
              <CommandList className="nice-scroll max-h-72">
                <CommandEmpty>{t("ing.notFound")}</CommandEmpty>
                {CATEGORY_ORDER.map((cat) => (
                  <CommandGroup key={cat} heading={t(CAT_KEY[cat])}>
                    {INGREDIENTS.filter((i) => i.category === cat).map((i) => (
                      <CommandItem
                        key={i.id}
                        value={`${i.name.en} ${i.name.fr} ${i.name.es} ${cat}`}
                        onSelect={() => {
                          setIng({ ingId: i.id });
                          setPickerOpen(false);
                        }}
                      >
                        <Check
                          className={cn("mr-2 size-4 shrink-0", i.id === ingId ? "opacity-100" : "opacity-0")}
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

        {/* quick one-tap chips */}
        <div className="nice-scroll -mx-1 flex gap-2 overflow-x-auto px-1 pb-1" role="list" aria-label={t("aria.quickIngredients")}>
          {quickIngredients.map((i) => (
            <Chip key={i.id} active={i.id === ingId} onClick={() => setIng({ ingId: i.id })} ariaLabel={ingName(i, lang)}>
              {ingName(i, lang)}
            </Chip>
          ))}
        </div>
      </section>

      {/* direction + amount */}
      <section className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <SectionLabel>{t("ing.convert")}</SectionLabel>
          <Button
            variant="secondary"
            size="sm"
            onClick={swapIng}
            aria-label={t("aria.swap")}
            className="min-h-9 rounded-full px-3 text-xs font-semibold"
          >
            <ArrowLeftRight className="mr-1 size-3.5" aria-hidden />
            {t("common.swap")}
          </Button>
        </div>

        {v2w ? (
          <>
            <div className="flex gap-2">
              <Input
                aria-label={t("aria.amount")}
                inputMode="decimal"
                value={ingVolumeText}
                onChange={(e) => setIng({ ingVolumeText: e.target.value })}
                placeholder="e.g. 1 1/2"
                className="h-14 flex-1 rounded-xl border-border bg-card text-2xl font-semibold tabular-nums shadow-sm"
              />
              <Segment
                ariaLabel={t("aria.volUnit")}
                value={ingVolumeUnit}
                options={[
                  { value: "cup", label: t("unit.cup") },
                  { value: "tbsp", label: t("unit.tbsp") },
                  { value: "tsp", label: t("unit.tsp") },
                ]}
                onChange={(u) => setIng({ ingVolumeUnit: u })}
              />
            </div>
            <div className="nice-scroll -mx-1 flex gap-2 overflow-x-auto px-1" role="list" aria-label={t("aria.quickAmounts")}>
              {FRACTION_CHIPS.map((f) => (
                <Chip key={f.value} active={ingVolumeText === f.value} onClick={() => setIng({ ingVolumeText: f.value })}>
                  {f.label}
                </Chip>
              ))}
            </div>
          </>
        ) : (
          <>
            <div className="flex gap-2">
              <Input
                aria-label={t("aria.weight")}
                inputMode="decimal"
                value={ingWeightText}
                onChange={(e) => setIng({ ingWeightText: e.target.value })}
                placeholder="e.g. 250"
                className="h-14 flex-1 rounded-xl border-border bg-card text-2xl font-semibold tabular-nums shadow-sm"
              />
              <Segment
                ariaLabel={t("aria.weightUnit")}
                value={ingWeightUnit}
                options={[
                  { value: "g", label: t("unit.g") },
                  { value: "oz", label: t("unit.oz") },
                ]}
                onChange={(u) => setIng({ ingWeightUnit: u })}
              />
            </div>
            <p className="text-xs text-muted-foreground">{t("ing.weightHint")}</p>
          </>
        )}
      </section>

      {/* result */}
      {v2w ? (
        isNaN(grams) ? (
          <div className="rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
            {t("ing.enterAmount")}
          </div>
        ) : (
          <ResultHero
            main={formatNum(grams, grams < 100 ? 1 : 0)}
            unit={t("unit.gShort")}
            sub={t("ing.sub.weight", { name })}
          >
            <p className="mt-2 text-sm font-medium text-muted-foreground">
              {t("ing.ozLine", {
                oz: formatNum(grams / G_PER_OZ, 1),
                unit: unitWord,
                name,
                g: formatNum(volumeToGrams(1, ingVolumeUnit, ingredient.gramsPerCup), 1),
              })}
            </p>
          </ResultHero>
        )
      ) : isNaN(cups) ? (
        <div className="rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
          {t("ing.enterWeight")}
        </div>
      ) : (
        <ResultHero
          main={cupsFracClean ? fractionLabel(cups) : formatNum(cupsDecimal, 2)}
          unit={Math.round(cups * 100) === 100 || cups === 1 ? t("ing.cup") : t("ing.cups")}
          sub={t("ing.sub.volume", { name })}
        >
          <p className="mt-2 text-sm font-medium text-muted-foreground">
            {t("ing.cupsLine", { cups: formatNum(cupsDecimal, 2), tbsp: formatNum(tbspForWeight, 1) })}
            {ingWeightUnit === "oz" ? t("ing.inputWas", { g: formatNum(weightInGrams, 0) }) : ""}
          </p>
        </ResultHero>
      )}

      {/* note + save */}
      <div className="flex flex-col items-center gap-3">
        {ingNote(ingredient, lang) && (
          <p className="flex items-start gap-1.5 rounded-xl bg-accent px-3.5 py-2.5 text-center text-xs leading-relaxed text-accent-foreground">
            <Scale className="mt-0.5 size-3.5 shrink-0" aria-hidden />
            {ingNote(ingredient, lang)}
          </p>
        )}
        {canSave && (
          <SaveButton type="ingredient" label={saveLabel} detail={saveDetail} payload={{
            ingId,
            ingDirection,
            ingVolumeText: v2w ? ingVolumeText : String(Math.round((cups || 0) * 100) / 100),
            ingVolumeUnit: v2w ? ingVolumeUnit : "cup",
            ingWeightText: v2w ? String(Math.round((grams || 0) * 10) / 10) : ingWeightText,
            ingWeightUnit: ingWeightUnit,
          }} />
        )}
      </div>
    </div>
  );
}
