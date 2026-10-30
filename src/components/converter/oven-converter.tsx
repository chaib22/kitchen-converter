"use client";

import { useMemo } from "react";
import { Flame } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Chip, ResultHero, SaveButton, SectionLabel, Segment } from "./shared";
import { useAppStore } from "@/lib/store";
import { useT } from "@/lib/i18n";
import { GAS_MARKS, cToF, fToC, formatNum, nearestGasMark, ovenTierIndex, parseAmount } from "@/lib/conversions";

const F_PRESETS = [275, 300, 325, 350, 375, 400, 425, 450];
const C_PRESETS = [120, 140, 150, 160, 170, 180, 190, 200, 220];

export function OvenConverter() {
  const ovenText = useAppStore((s) => s.ovenText);
  const ovenUnit = useAppStore((s) => s.ovenUnit);
  const setOven = useAppStore((s) => s.setOven);
  const t = useT();

  const value = parseAmount(ovenText);
  const isF = ovenUnit === "F";
  const valid = !isNaN(value);

  const f = isF ? value : cToF(value);
  const gas = useMemo(() => (valid ? nearestGasMark(f) : null), [valid, f]);
  const tierIndex = valid ? ovenTierIndex(f) : 3;

  const displayF = valid ? Math.round(f) : NaN;
  const displayC = valid ? Math.round(fToC(f) * 10) / 10 : NaN;
  const displayCRecipe = valid ? Math.round(fToC(f)) : NaN;

  const saveLabel = valid
    ? isF
      ? `${formatNum(displayF, 0)}°F`
      : `${formatNum(value, 0)}°C`
    : "Oven";

  const saveDetail = valid
    ? `= ${formatNum(displayF, 0)}°F · ${formatNum(displayCRecipe, 0)}°C · ${t("oven.gasMark", { mark: gas?.label ?? "—" })}`
    : "";

  const sliderMin = isF ? 150 : 65;
  const sliderMax = isF ? 550 : 290;
  const sliderValue = valid ? [Math.min(Math.max(f, sliderMin), sliderMax)] : [isF ? 350 : 175];

  return (
    <div className="space-y-5" role="tabpanel" aria-label={t("oven.setting")}>
      {/* input */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <SectionLabel>{t("oven.setting")}</SectionLabel>
          <Segment
            ariaLabel={t("aria.tempUnit")}
            value={ovenUnit}
            options={[
              { value: "F", label: "°F" },
              { value: "C", label: "°C" },
            ]}
            onChange={(u) => {
              if (u === ovenUnit) return;
              // keep the same physical temperature when switching units
              const cur = parseAmount(ovenText);
              if (!isNaN(cur)) {
                const converted = u === "C" ? fToC(cur) : cToF(cur);
                setOven({ ovenUnit: u, ovenText: String(Math.round(converted)) });
              } else {
                setOven({ ovenUnit: u });
              }
            }}
          />
        </div>
        <Input
          aria-label={isF ? t("aria.fAmount") : t("aria.cAmount")}
          inputMode="decimal"
          value={ovenText}
          onChange={(e) => setOven({ ovenText: e.target.value })}
          placeholder={isF ? "e.g. 350" : "e.g. 180"}
          className="h-16 rounded-xl border-border bg-card text-center text-3xl font-bold tabular-nums shadow-sm"
        />

        {/* presets — one tap */}
        <div className="nice-scroll -mx-1 flex gap-2 overflow-x-auto px-1" role="list" aria-label={t("aria.quickAmounts")}>
          {(isF ? F_PRESETS : C_PRESETS).map((temp) => (
            <Chip
              key={temp}
              active={valid && Math.round(value) === temp}
              onClick={() => setOven({ ovenText: String(temp) })}
              ariaLabel={`${temp}°${isF ? "F" : "C"}`}
            >
              {temp}°
            </Chip>
          ))}
        </div>
      </section>

      {/* result */}
      {valid && gas ? (
        <ResultHero
          main={`${formatNum(displayF, 0)}°F`}
          unit={`= ${formatNum(displayC, 1)}°C`}
          sub={t("oven.sub", { tier: t(`oven.tier${tierIndex}`) })}
        >
          <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-1.5 text-sm font-bold text-primary-foreground">
              <Flame className="size-4" aria-hidden />
              {t("oven.gasMark", { mark: gas.label })}
            </span>
            <span className="text-xs font-medium text-muted-foreground">{t(`oven.hint${tierIndex}`)}</span>
          </div>
        </ResultHero>
      ) : (
        <div className="rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
          {t("oven.convertHint")}
        </div>
      )}

      {/* slider for quick dialing */}
      <section className="space-y-3">
        <SectionLabel>{t("oven.fineTune")}</SectionLabel>
        <Slider
          aria-label={t("aria.slider")}
          min={sliderMin}
          max={sliderMax}
          step={5}
          value={sliderValue}
          onValueChange={(vals) => setOven({ ovenText: String(Math.round(vals[0] / 5) * 5) })}
        />
        <div className="flex justify-between text-[11px] font-medium text-muted-foreground tabular-nums">
          <span>{sliderMin}{isF ? "°F" : "°C"}</span>
          <span>{sliderMax}{isF ? "°F" : "°C"}</span>
        </div>
      </section>

      {/* gas mark reference */}
      <section className="space-y-2.5">
        <SectionLabel>{t("oven.gasTable")}</SectionLabel>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {GAS_MARKS.map((gm) => {
            const active = valid && gas?.label === gm.label;
            return (
              <button
                key={gm.label}
                type="button"
                aria-pressed={active}
                onClick={() => setOven({ ovenText: String(gm.f), ovenUnit: "F" })}
                className={`cursor-pointer rounded-xl border px-2 py-2.5 text-center transition-all duration-150 active:scale-95 ${
                  active
                    ? "border-primary bg-primary text-primary-foreground shadow-sm"
                    : "border-border bg-card hover:border-primary/50 hover:bg-accent"
                }`}
              >
                <p className="text-sm font-bold">{t("oven.gasMark", { mark: gm.label })}</p>
                <p className={`text-xs tabular-nums ${active ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                  {gm.f}°F · {formatNum(fToC(gm.f), 0)}°C
                </p>
              </button>
            );
          })}
        </div>
      </section>

      <div className="flex justify-center">
        {valid && (
          <SaveButton type="oven" label={saveLabel} detail={saveDetail} payload={{ ovenText, ovenUnit }} />
        )}
      </div>
    </div>
  );
}
