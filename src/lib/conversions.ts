/**
 * Conversion engine — temperatures, gas marks, volumes, fractions.
 * All volume math routes through milliliters.
 */

// ---------- Numbers & fractions ----------

export const G_PER_OZ = 28.349523125;

const VULGAR: Record<string, string> = {
  "1/8": "⅛", "1/4": "¼", "3/8": "⅜", "1/2": "½",
  "5/8": "⅝", "3/4": "¾", "7/8": "⅞", "1/3": "⅓", "2/3": "⅔",
};

const VULGAR_PARSE: Record<string, number> = {
  "⅛": 0.125, "¼": 0.25, "⅜": 0.375, "½": 0.5,
  "⅝": 0.625, "¾": 0.75, "⅞": 0.875, "⅓": 1 / 3, "⅔": 2 / 3,
};

/**
 * Parse human amounts: "1.5", "1/2", "1 1/2", "½" → number.
 * Returns NaN when it cannot be parsed.
 */
export function parseAmount(raw: string): number {
  if (!raw) return NaN;
  let s = raw.trim().replace(/,/g, ".");
  for (const [k, v] of Object.entries(VULGAR_PARSE)) s = s.replace(new RegExp(k, "g"), ` ${v} `);
  // mixed vulgar like "1 ½"
  s = s.trim();
  const vulgarKey = Object.keys(VULGAR_PARSE).find((k) => s === k);
  if (vulgarKey) return VULGAR_PARSE[vulgarKey];

  const mixed = s.match(/^(\d+)\s+(\d+)\s*\/\s*(\d+)$/);
  if (mixed) return parseInt(mixed[1], 10) + parseInt(mixed[2], 10) / parseInt(mixed[3], 10);

  const frac = s.match(/^(\d+)\s*\/\s*(\d+)$/);
  if (frac) return parseInt(frac[1], 10) / parseInt(frac[2], 10);

  const num = s.match(/^(\d*\.?\d+)$/);
  if (num) return parseFloat(num[1]);

  return NaN;
}

/** Best simple fraction (denominator ≤ 8) or null when none is close. */
export function toFraction(value: number, tolerance = 0.02): { n: number; d: number } | null {
  const whole = Math.floor(value);
  const rem = value - whole;
  let best: { n: number; d: number } | null = null;
  let bestErr = tolerance;
  for (const d of [2, 3, 4, 6, 8]) {
    const n = Math.round(rem * d);
    if (n === 0 || n === d) {
      if (n === d && whole === 0) continue;
      if (n === 0) continue;
    }
    const err = Math.abs(rem - n / d);
    if (err < bestErr) {
      bestErr = err;
      best = { n: whole * d + n, d };
    }
  }
  if (best) {
    // reduce
    const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
    const g = gcd(best.n, best.d);
    best = { n: best.n / g, d: best.d / g };
  }
  return best;
}

/** "1 ½ cups" style label, falls back to decimals. */
export function fractionLabel(value: number): string {
  const f = toFraction(value);
  if (!f) return String(Math.round(value * 100) / 100);
  if (f.d === 1) return String(f.n);
  const whole = Math.floor(f.n / f.d);
  const remN = f.n % f.d;
  if (remN === 0) return String(whole);
  const rem = `${remN}/${f.d}`;
  if (whole === 0) return VULGAR[rem] ?? rem;
  return `${whole} ${VULGAR[rem] ?? rem}`;
}

/** Smart decimal formatting: trims noise, keeps 3 significant decimals max. */
export function formatNum(value: number, maxDecimals = 3): string {
  if (!isFinite(value)) return "—";
  const abs = Math.abs(value);
  let decimals = maxDecimals;
  if (abs >= 1000) decimals = 0;
  else if (abs >= 100) decimals = Math.min(maxDecimals, 1);
  else if (abs >= 10) decimals = Math.min(maxDecimals, 2);
  return value.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  });
}

// ---------- Oven temperature ----------

export function fToC(f: number): number {
  return ((f - 32) * 5) / 9;
}

export function cToF(c: number): number {
  return (c * 9) / 5 + 32;
}

export interface GasMark {
  label: string;
  f: number;
}

/** Standard gas marks with their °F setpoints (GM 1 = 275 °F, step 25 °F). */
export const GAS_MARKS: GasMark[] = [
  { label: "¼", f: 225 },
  { label: "½", f: 250 },
  { label: "1", f: 275 },
  { label: "2", f: 300 },
  { label: "3", f: 325 },
  { label: "4", f: 350 },
  { label: "5", f: 375 },
  { label: "6", f: 400 },
  { label: "7", f: 425 },
  { label: "8", f: 450 },
  { label: "9", f: 475 },
  { label: "10", f: 500 },
];

export function nearestGasMark(f: number): GasMark {
  let best = GAS_MARKS[0];
  let bestErr = Math.abs(f - best.f);
  for (const gm of GAS_MARKS) {
    const err = Math.abs(f - gm.f);
    if (err < bestErr) {
      bestErr = err;
      best = gm;
    }
  }
  return best;
}

export function gasMarkToF(label: string): number {
  return GAS_MARKS.find((g) => g.label === label)?.f ?? 350;
}

/** Tier index 0-6 (Very Slow → Very Hot); names come from i18n dicts. */
export function ovenTierIndex(f: number): number {
  if (f < 250) return 0;
  if (f < 300) return 1;
  if (f < 340) return 2;
  if (f < 375) return 3;
  if (f < 425) return 4;
  if (f < 475) return 5;
  return 6;
}

// ---------- Volume ----------

export interface VolumeUnit {
  id: string;
  name: string;
  short: string;
  ml: number;
  /** nice-fraction candidates shown in results */
  frac?: boolean;
}

export const US_VOLUME: VolumeUnit[] = [
  { id: "ml", name: "Milliliter", short: "mL", ml: 1 },
  { id: "liter", name: "Liter", short: "L", ml: 1000 },
  { id: "cup", name: "Cup", short: "cup", ml: 236.588, frac: true },
  { id: "floz", name: "Fluid Ounce", short: "fl oz", ml: 29.5735 },
  { id: "tbsp", name: "Tablespoon", short: "tbsp", ml: 14.7868, frac: true },
  { id: "tsp", name: "Teaspoon", short: "tsp", ml: 4.92892, frac: true },
  { id: "pint", name: "Pint", short: "pt", ml: 473.176 },
  { id: "quart", name: "Quart", short: "qt", ml: 946.353 },
  { id: "gallon", name: "Gallon", short: "gal", ml: 3785.41 },
];

export const UK_VOLUME: VolumeUnit[] = [
  { id: "ml", name: "Milliliter", short: "mL", ml: 1 },
  { id: "liter", name: "Liter", short: "L", ml: 1000 },
  { id: "cup", name: "Cup (Imperial)", short: "cup", ml: 284.131, frac: true },
  { id: "floz", name: "Fluid Ounce (Imp.)", short: "fl oz", ml: 28.4131 },
  { id: "tbsp", name: "Tablespoon (Imp.)", short: "tbsp", ml: 17.7582, frac: true },
  { id: "tsp", name: "Teaspoon (Imp.)", short: "tsp", ml: 5.91939, frac: true },
  { id: "pint", name: "Pint (Imp.)", short: "pt", ml: 568.261 },
  { id: "quart", name: "Quart (Imp.)", short: "qt", ml: 1136.52 },
  { id: "gallon", name: "Gallon (Imp.)", short: "gal", ml: 4546.09 },
];

export function volumeUnits(system: "us" | "uk"): VolumeUnit[] {
  return system === "uk" ? UK_VOLUME : US_VOLUME;
}

export function convertVolume(amount: number, from: VolumeUnit, to: VolumeUnit): number {
  return (amount * from.ml) / to.ml;
}

// ---------- Ingredient weights ----------

export const SPOON_FACTOR: Record<string, number> = {
  cup: 1,
  tbsp: 1 / 16,
  tsp: 1 / 48,
};

/** amount in the given volume unit → grams for an ingredient */
export function volumeToGrams(amount: number, unit: string, gramsPerCup: number): number {
  return amount * SPOON_FACTOR[unit] * gramsPerCup;
}

/** grams → cups for an ingredient */
export function gramsToCups(grams: number, gramsPerCup: number): number {
  return grams / gramsPerCup;
}
