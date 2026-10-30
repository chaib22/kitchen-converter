/**
 * Ingredient database — grams per 1 US cup (level measure, unless noted).
 * Values follow widely used references (King Arthur, USDA, Food52 charts).
 * Names and notes localized: EN / FR / ES.
 */
import type { Lang } from "./i18n";

export type LocalText = { en: string; fr: string; es: string };

export type CategoryId =
  | "flours"
  | "sugars"
  | "fats"
  | "dairy"
  | "liquids"
  | "baking"
  | "nuts"
  | "fruits";

export interface Ingredient {
  id: string;
  name: LocalText;
  category: CategoryId;
  gramsPerCup: number;
  /** short usage note shown in the UI */
  note?: LocalText;
}

export const CATEGORY_ORDER: CategoryId[] = [
  "flours",
  "sugars",
  "fats",
  "dairy",
  "liquids",
  "baking",
  "nuts",
  "fruits",
];

export const INGREDIENTS: Ingredient[] = [
  // Flours & Grains
  { id: "all-purpose-flour", name: { en: "All-Purpose Flour", fr: "Farine tout usage", es: "Harina de trigo (todo uso)" }, category: "flours", gramsPerCup: 125, note: { en: "Spoon into the cup and level off — do not scoop.", fr: "Verse à la cuillère puis arase — ne puise pas directement.", es: "Vierte con cuchara y rasela — no metas la taza en la harina." } },
  { id: "bread-flour", name: { en: "Bread Flour", fr: "Farine à pain", es: "Harina de fuerza" }, category: "flours", gramsPerCup: 127 },
  { id: "whole-wheat-flour", name: { en: "Whole Wheat Flour", fr: "Farine de blé entier", es: "Harina integral" }, category: "flours", gramsPerCup: 120 },
  { id: "cake-flour", name: { en: "Cake Flour", fr: "Farine à gâteau", es: "Harina de repostería" }, category: "flours", gramsPerCup: 114 },
  { id: "almond-flour", name: { en: "Almond Flour", fr: "Farine d'amande", es: "Harina de almendra" }, category: "flours", gramsPerCup: 96 },
  { id: "coconut-flour", name: { en: "Coconut Flour", fr: "Farine de coco", es: "Harina de coco" }, category: "flours", gramsPerCup: 112 },
  { id: "cornstarch", name: { en: "Cornstarch", fr: "Fécule de maïs", es: "Maicena" }, category: "flours", gramsPerCup: 128 },
  { id: "cornmeal", name: { en: "Cornmeal", fr: "Semoule de maïs", es: "Harina de maíz" }, category: "flours", gramsPerCup: 122 },
  { id: "rolled-oats", name: { en: "Rolled Oats", fr: "Flocons d'avoine", es: "Copos de avena" }, category: "flours", gramsPerCup: 90 },
  { id: "quick-oats", name: { en: "Quick Oats", fr: "Flocons d'avoine instantanés", es: "Copos de avena instantáneos" }, category: "flours", gramsPerCup: 80 },
  { id: "white-rice-uncooked", name: { en: "White Rice (uncooked)", fr: "Riz blanc (cru)", es: "Arroz blanco (crudo)" }, category: "flours", gramsPerCup: 185 },
  { id: "cooked-rice", name: { en: "Cooked Rice", fr: "Riz cuit", es: "Arroz cocido" }, category: "flours", gramsPerCup: 195 },
  { id: "breadcrumbs", name: { en: "Breadcrumbs", fr: "Chapelure", es: "Pan rallado" }, category: "flours", gramsPerCup: 108 },
  { id: "graham-crumbs", name: { en: "Graham Cracker Crumbs", fr: "Miettes de biscuits Graham", es: "Migas de galleta Graham" }, category: "flours", gramsPerCup: 120 },

  // Sugars & Sweeteners
  { id: "granulated-sugar", name: { en: "Granulated Sugar", fr: "Sucre granulé", es: "Azúcar granulado" }, category: "sugars", gramsPerCup: 200 },
  { id: "brown-sugar", name: { en: "Brown Sugar (packed)", fr: "Sucre brun (tassé)", es: "Azúcar moreno (apretado)" }, category: "sugars", gramsPerCup: 213, note: { en: "Pack firmly into the cup as the recipe expects.", fr: "Tasse fermement dans la tasse comme l'exige la recette.", es: "Apretújala firmemente en la taza como pide la receta." } },
  { id: "powdered-sugar", name: { en: "Powdered Sugar", fr: "Sucre glace", es: "Azúcar glas" }, category: "sugars", gramsPerCup: 120 },
  { id: "honey", name: { en: "Honey", fr: "Miel", es: "Miel" }, category: "sugars", gramsPerCup: 340, note: { en: "Spray the cup with oil for an easy release.", fr: "Vaporise un peu d'huile dans la tasse pour un démoulage facile.", es: "Rocía la taza con aceite para que salga fácil." } },
  { id: "maple-syrup", name: { en: "Maple Syrup", fr: "Sirop d'érable", es: "Sirope de arce" }, category: "sugars", gramsPerCup: 322 },
  { id: "corn-syrup", name: { en: "Corn Syrup", fr: "Sirop de maïs", es: "Jarabe de maíz" }, category: "sugars", gramsPerCup: 328 },
  { id: "molasses", name: { en: "Molasses", fr: "Mélasse", es: "Melaza" }, category: "sugars", gramsPerCup: 340 },
  { id: "agave", name: { en: "Agave Nectar", fr: "Nectar d'agave", es: "Néctar de agave" }, category: "sugars", gramsPerCup: 340 },

  // Fats & Oils
  { id: "butter", name: { en: "Butter", fr: "Beurre", es: "Mantequilla" }, category: "fats", gramsPerCup: 227, note: { en: "1 cup = 2 US sticks = 16 tbsp.", fr: "1 tasse = 2 plaques US = 16 c. à soupe.", es: "1 taza = 2 barras US = 16 cdas." } },
  { id: "margarine", name: { en: "Margarine", fr: "Margarine", es: "Margarina" }, category: "fats", gramsPerCup: 225 },
  { id: "vegetable-oil", name: { en: "Vegetable Oil", fr: "Huile végétale", es: "Aceite vegetal" }, category: "fats", gramsPerCup: 218 },
  { id: "olive-oil", name: { en: "Olive Oil", fr: "Huile d'olive", es: "Aceite de oliva" }, category: "fats", gramsPerCup: 216 },
  { id: "coconut-oil", name: { en: "Coconut Oil (melted)", fr: "Huile de coco (fondue)", es: "Aceite de coco (derretido)" }, category: "fats", gramsPerCup: 218 },
  { id: "shortening", name: { en: "Vegetable Shortening", fr: "Shortening végétal", es: "Manteca vegetal" }, category: "fats", gramsPerCup: 205 },
  { id: "peanut-butter", name: { en: "Peanut Butter", fr: "Beurre d'arachide", es: "Crema de cacahuete" }, category: "fats", gramsPerCup: 258 },

  // Dairy & Eggs
  { id: "whole-milk", name: { en: "Whole Milk", fr: "Lait entier", es: "Leche entera" }, category: "dairy", gramsPerCup: 240 },
  { id: "heavy-cream", name: { en: "Heavy Cream", fr: "Crème à fouetter (35 %)", es: "Nata líquida (35 %)" }, category: "dairy", gramsPerCup: 240 },
  { id: "buttermilk", name: { en: "Buttermilk", fr: "Babeurre", es: "Suero de mantequilla" }, category: "dairy", gramsPerCup: 240 },
  { id: "sour-cream", name: { en: "Sour Cream", fr: "Crème sure", es: "Crema agria" }, category: "dairy", gramsPerCup: 240 },
  { id: "yogurt", name: { en: "Plain Yogurt", fr: "Yaourt nature", es: "Yogur natural" }, category: "dairy", gramsPerCup: 245 },
  { id: "greek-yogurt", name: { en: "Greek Yogurt", fr: "Yaourt grec", es: "Yogur griego" }, category: "dairy", gramsPerCup: 260 },
  { id: "cream-cheese", name: { en: "Cream Cheese", fr: "Fromage à la crème", es: "Queso crema" }, category: "dairy", gramsPerCup: 226 },
  { id: "ricotta", name: { en: "Ricotta", fr: "Ricotta", es: "Ricota" }, category: "dairy", gramsPerCup: 246 },
  { id: "parmesan", name: { en: "Grated Parmesan", fr: "Parmesan râpé", es: "Parmesano rallado" }, category: "dairy", gramsPerCup: 90 },
  { id: "evaporated-milk", name: { en: "Evaporated Milk", fr: "Lait évaporé", es: "Leche evaporada" }, category: "dairy", gramsPerCup: 252 },
  { id: "condensed-milk", name: { en: "Sweetened Condensed Milk", fr: "Lait concentré sucré", es: "Leche condensada" }, category: "dairy", gramsPerCup: 306 },

  // Liquids
  { id: "water", name: { en: "Water", fr: "Eau", es: "Agua" }, category: "liquids", gramsPerCup: 240, note: { en: "1 cup water ≈ 240 g ≈ 240 mL.", fr: "1 tasse d'eau ≈ 240 g ≈ 240 mL.", es: "1 taza de agua ≈ 240 g ≈ 240 mL." } },
  { id: "orange-juice", name: { en: "Orange Juice", fr: "Jus d'orange", es: "Zumo de naranja" }, category: "liquids", gramsPerCup: 248 },
  { id: "applesauce", name: { en: "Applesauce", fr: "Compote de pommes", es: "Puré de manzana" }, category: "liquids", gramsPerCup: 244 },
  { id: "brewed-coffee", name: { en: "Brewed Coffee", fr: "Café filtré", es: "Café filtrado" }, category: "liquids", gramsPerCup: 240 },

  // Baking Essentials
  { id: "cocoa-powder", name: { en: "Cocoa Powder (unsweetened)", fr: "Cacao en poudre (non sucré)", es: "Cacao en polvo (sin azúcar)" }, category: "baking", gramsPerCup: 100 },
  { id: "baking-powder", name: { en: "Baking Powder", fr: "Levure chimique", es: "Levadura en polvo (polvo de hornear)" }, category: "baking", gramsPerCup: 220 },
  { id: "baking-soda", name: { en: "Baking Soda", fr: "Bicarbonate de soude", es: "Bicarbonato de sodio" }, category: "baking", gramsPerCup: 220 },
  { id: "table-salt", name: { en: "Table Salt (fine)", fr: "Sel de table (fin)", es: "Sal de mesa (fina)" }, category: "baking", gramsPerCup: 273 },
  { id: "kosher-salt", name: { en: "Kosher Salt (Diamond Crystal)", fr: "Sel casher (Diamond Crystal)", es: "Sal kosher (Diamond Crystal)" }, category: "baking", gramsPerCup: 139, note: { en: "Diamond Crystal is much lighter than Morton — check your brand.", fr: "Diamond Crystal est bien plus légère que Morton — vérifie ta marque.", es: "Diamond Crystal es mucho más ligera que Morton — revisa tu marca." } },
  { id: "active-dry-yeast", name: { en: "Active Dry Yeast", fr: "Levure sèche active", es: "Levadura seca activa" }, category: "baking", gramsPerCup: 220 },
  { id: "instant-yeast", name: { en: "Instant Yeast", fr: "Levure instantanée", es: "Levadura instantánea" }, category: "baking", gramsPerCup: 220 },
  { id: "vanilla-extract", name: { en: "Vanilla Extract", fr: "Extrait de vanille", es: "Extracto de vainilla" }, category: "baking", gramsPerCup: 208 },

  // Nuts & Add-ins
  { id: "chocolate-chips", name: { en: "Chocolate Chips", fr: "Pépites de chocolat", es: "Chips de chocolate" }, category: "nuts", gramsPerCup: 170 },
  { id: "chopped-walnuts", name: { en: "Chopped Walnuts", fr: "Noix hachées", es: "Nueces picadas" }, category: "nuts", gramsPerCup: 113 },
  { id: "whole-almonds", name: { en: "Whole Almonds", fr: "Amandes entières", es: "Almendras enteras" }, category: "nuts", gramsPerCup: 143 },
  { id: "sliced-almonds", name: { en: "Sliced Almonds", fr: "Amandes effilées", es: "Almendras laminadas" }, category: "nuts", gramsPerCup: 108 },
  { id: "shredded-coconut", name: { en: "Shredded Coconut", fr: "Noix de coco râpée", es: "Coco rallado" }, category: "nuts", gramsPerCup: 85 },
  { id: "raisins", name: { en: "Raisins", fr: "Raisins secs", es: "Pasas" }, category: "nuts", gramsPerCup: 145 },
  { id: "chia-seeds", name: { en: "Chia Seeds", fr: "Graines de chia", es: "Semillas de chía" }, category: "nuts", gramsPerCup: 170 },
  { id: "flax-meal", name: { en: "Flaxseed Meal", fr: "Graines de lin moulues", es: "Harina de linaza" }, category: "nuts", gramsPerCup: 112 },

  // Fruits & Vegetables
  { id: "mashed-banana", name: { en: "Mashed Banana", fr: "Banane écrasée", es: "Plátano machacado" }, category: "fruits", gramsPerCup: 225 },
  { id: "pumpkin-puree", name: { en: "Pumpkin Purée", fr: "Purée de citrouille", es: "Puré de calabaza" }, category: "fruits", gramsPerCup: 244 },
  { id: "grated-zucchini", name: { en: "Grated Zucchini", fr: "Courgette râpée", es: "Calabacín rallado" }, category: "fruits", gramsPerCup: 200 },
  { id: "diced-onion", name: { en: "Diced Onion", fr: "Oignon en dés", es: "Cebolla en dados" }, category: "fruits", gramsPerCup: 160 },
  { id: "chopped-carrots", name: { en: "Chopped Carrots", fr: "Carottes en dés", es: "Zanahorias en dados" }, category: "fruits", gramsPerCup: 128 },
  { id: "diced-tomato", name: { en: "Diced Tomato", fr: "Tomate en dés", es: "Tomate en dados" }, category: "fruits", gramsPerCup: 256 },
];

/** Ingredients surfaced as one-tap chips */
export const QUICK_INGREDIENT_IDS = [
  "all-purpose-flour",
  "granulated-sugar",
  "brown-sugar",
  "butter",
  "whole-milk",
  "chocolate-chips",
];

export function getIngredient(id: string): Ingredient {
  return INGREDIENTS.find((i) => i.id === id) ?? INGREDIENTS[0];
}

export function ingName(i: Ingredient, lang: Lang): string {
  return i.name[lang] ?? i.name.en;
}

export function ingNote(i: Ingredient, lang: Lang): string | undefined {
  return i.note ? (i.note[lang] ?? i.note.en) : undefined;
}
