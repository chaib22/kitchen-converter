"use client";

import { ReactNode } from "react";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/lib/store";
import { useToast } from "@/hooks/use-toast";
import { useT } from "@/lib/i18n";
import { cn } from "@/lib/utils";

/** Round one-tap chip button */
export function Chip({
  active,
  onClick,
  children,
  className,
  ariaLabel,
}: {
  active?: boolean;
  onClick: () => void;
  children: ReactNode;
  className?: string;
  ariaLabel?: string;
}) {
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "min-h-11 min-w-11 shrink-0 rounded-full border px-3.5 text-sm font-medium",
        "transition-all duration-150 active:scale-95 cursor-pointer",
        active
          ? "border-primary bg-primary text-primary-foreground shadow-sm"
          : "border-border bg-card text-foreground hover:border-primary/50 hover:bg-accent",
        className
      )}
    >
      {children}
    </button>
  );
}

export function SectionLabel({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p className={cn("text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground", className)}>
      {children}
    </p>
  );
}

/** Segmented two-option switch (°F/°C, US/UK, g/oz …) */
export function Segment<T extends string>({
  value,
  options,
  onChange,
  ariaLabel,
}: {
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
  ariaLabel: string;
}) {
  return (
    <div role="radiogroup" aria-label={ariaLabel} className="inline-flex rounded-full border border-border bg-secondary p-1">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="radio"
          aria-checked={value === o.value}
          onClick={() => onChange(o.value)}
          className={cn(
            "min-h-9 cursor-pointer rounded-full px-4 text-sm font-semibold transition-all duration-150",
            value === o.value
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

/** One-tap save-to-favorites button */
export function SaveButton({
  type,
  label,
  detail,
  payload,
}: {
  type: "ingredient" | "oven" | "volume";
  label: string;
  detail: string;
  payload: Record<string, string | number>;
}) {
  const addFavorite = useAppStore((s) => s.addFavorite);
  const { toast } = useToast();
  const t = useT();

  const onSave = () => {
    const ok = addFavorite({ type, label, detail, payload });
    if (ok) {
      toast({ title: t("toast.saved"), description: label });
    } else {
      toast({ title: t("toast.already"), description: label });
    }
  };

  return (
    <Button
      variant="outline"
      onClick={onSave}
      className="min-h-11 rounded-full border-primary/40 text-primary hover:bg-primary hover:text-primary-foreground"
    >
      <Star className="mr-1.5 size-4" aria-hidden />
      {t("common.save")}
    </Button>
  );
}

/** Warm gradient hero card that shows the main conversion result */
export function ResultHero({
  main,
  unit,
  sub,
  children,
}: {
  main: string;
  unit: string;
  sub?: string;
  children?: ReactNode;
}) {
  return (
    <div className="result-hero rounded-2xl border border-primary/15 p-5 text-center shadow-sm">
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-primary/70">{sub ?? "Result"}</p>
      <p className="mt-1 font-display text-5xl font-bold leading-tight text-primary tabular-nums sm:text-6xl">
        {main}
        <span className="ml-2 text-xl font-semibold text-primary/70 sm:text-2xl">{unit}</span>
      </p>
      {children}
    </div>
  );
}
