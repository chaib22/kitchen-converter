"use client";

import { useMemo } from "react";
import { Beaker } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Chip, SaveButton, SectionLabel, Segment } from "./shared";
import { useAppStore } from "@/lib/store";
import { useT } from "@/lib/i18n";
import { convertVolume, formatNum, fractionLabel, parseAmount, toFraction, volumeUnits } from "@/lib/conversions";
import { cn } from "@/lib/utils";

const AMOUNT_CHIPS = [
  { label: "¼", value: "1/4" },
  { label: "½", value: "1/2" },
  { label: "1", value: "1" },
  { label: "2", value: "2" },
  { label: "4", value: "4" },
  { label: "8", value: "8" },
];

export function VolumeConverter() {
  const volSystem = useAppStore((s) => s.volSystem);
  const volText = useAppStore((s) => s.volText);
  const volUnit = useAppStore((s) => s.volUnit);
  const setVol = useAppStore((s) => s.setVol);
  const t = useT();

  const units = useMemo(() => volumeUnits(volSystem), [volSystem]);
  const fromUnit = units.find((u) => u.id === volUnit) ?? units[2];
  const amount = parseAmount(volText);
  const valid = !isNaN(amount) && amount >= 0;

  const unitName = (id: string, uk: boolean) => {
    const base = t(`vol.unit.${id}`);
    return uk && !["ml", "liter"].includes(id) ? `${base} ${t("vol.imp")}` : base;
  };
  const unitShort = (id: string) => t(`vol.short.${id}`);

  const fromLabel = `${fractionLabel(amount)} ${unitShort(fromUnit.id)}`;

  const saveLabel = valid ? `${fromLabel} ${volSystem === "uk" ? t("vol.imp") : ""}`.trim() : "Volume";
  const mlAmount = valid ? convertVolume(amount, fromUnit, units[0]) : NaN;
  const saveDetail = valid ? `= ${formatNum(mlAmount, 1)} mL` : "";

  return (
    <div className="space-y-5" role="tabpanel" aria-label={t("vol.system")}>
      {/* system toggle */}
      <section className="flex flex-wrap items-center justify-between gap-2">
        <SectionLabel>{t("vol.system")}</SectionLabel>
        <Segment
          ariaLabel={t("aria.system")}
          value={volSystem}
          options={[
            { value: "us", label: "US" },
            { value: "uk", label: "UK" },
          ]}
          onChange={(sys) => setVol({ volSystem: sys })}
        />
      </section>

      {/* input */}
      <section className="space-y-3">
        <div className="flex gap-2">
          <Input
            aria-label={t("aria.amount")}
            inputMode="decimal"
            value={volText}
            onChange={(e) => setVol({ volText: e.target.value })}
            placeholder="e.g. 2 1/2"
            className="h-14 flex-1 rounded-xl border-border bg-card text-2xl font-semibold tabular-nums shadow-sm"
          />
          <select
            aria-label={t("aria.volUnit")}
            value={volUnit}
            onChange={(e) => setVol({ volUnit: e.target.value })}
            className="h-14 cursor-pointer rounded-xl border border-border bg-card px-3 text-base font-semibold shadow-sm outline-none focus:ring-2 focus:ring-ring"
          >
            {units.map((u) => (
              <option key={u.id} value={u.id}>
                {unitShort(u.id)}
              </option>
            ))}
          </select>
        </div>
        <div className="nice-scroll -mx-1 flex gap-2 overflow-x-auto px-1" role="list" aria-label={t("aria.quickAmounts")}>
          {AMOUNT_CHIPS.map((c) => (
            <Chip key={c.value} active={volText === c.value} onClick={() => setVol({ volText: c.value })}>
              {c.label}
            </Chip>
          ))}
        </div>
      </section>

      {/* results — every unit at once */}
      <section className="space-y-2.5">
        <SectionLabel>
          {valid ? t("vol.convertsTo", { label: fromLabel }) : t("vol.results")}
        </SectionLabel>
        {!valid ? (
          <div className="rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
            {t("vol.enterAmount")}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {units.map((u) => {
              const out = convertVolume(amount, fromUnit, u);
              const isFrom = u.id === fromUnit.id;
              const frac = u.frac ? toFraction(out, 0.02) : null;
              return (
                <div
                  key={u.id}
                  className={cn(
                    "rounded-xl border p-3 transition-all duration-150",
                    isFrom ? "border-primary/60 bg-accent" : "border-border bg-card"
                  )}
                >
                  <p className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                    {u.id === "floz" || u.id === "liter" ? <Beaker className="size-3" aria-hidden /> : null}
                    {unitName(u.id, volSystem === "uk")}
                  </p>
                  <p className={cn("mt-0.5 font-display text-xl font-bold tabular-nums", isFrom ? "text-primary" : "text-foreground")}>
                    {frac ? fractionLabel(out) : formatNum(out, out < 1 ? 3 : 2)}
                    <span className="ml-1 text-xs font-semibold text-muted-foreground">{unitShort(u.id)}</span>
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <div className="flex justify-center">
        {valid && (
          <SaveButton type="volume" label={saveLabel} detail={saveDetail} payload={{ volSystem, volText, volUnit }} />
        )}
      </div>
    </div>
  );
}
