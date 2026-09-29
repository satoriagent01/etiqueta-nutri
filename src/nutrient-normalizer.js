/**
 * Multilingual label normalization, unit conversion, value parsing.
 *
 * Exports:
 *  - normalizeLabel(label) → canonical key
 *  - parseValue(rawValue) → number | null
 *  - convertKjToKcal(kj) → number
 *  - convertKcalToKj(kcal) → number
 *  - convertSaltToSodium(salt) → number
 *  - convertSodiumToSalt(sodium) → number
 *  - normalizeUnit(unit) → string
 *  - isPercentRI(str) → boolean
 *  - getBaseValue(row, base) → number | null
 */

// ── Multilingual alias map ──────────────────────────────────────────
const LABEL_ALIASES = {
  // Energy
  "energie": "energy",
  "énergie": "energy",
  "energia": "energy",
  "energy": "energy",
  "energía": "energy",
  "energi": "energy",

  // Fat
  "fett": "fat",
  "matières grasses": "fat",
  "vetten": "fat",
  "grassi": "fat",
  "fat": "fat",
  "grasas": "fat",
  "grasa": "fat",

  // Saturated fat
  "davon gesättigte fettsäuren": "saturatedFat",
  "dont acides gras satures": "saturatedFat",
  "waarvan verzadigde vetzuren": "saturatedFat",
  "di cui acidi grassi saturi": "saturatedFat",
  "of saturated fat": "saturatedFat",
  "de grasas saturadas": "saturatedFat",
  "saturatedFat": "saturatedFat",
  "grasas saturadas": "saturatedFat",

  // Carbs
  "kohlenhydrate": "carbs",
  "glucides": "carbs",
  "koolhydraten": "carbs",
  "carboidrati": "carbs",
  "carbohydrates": "carbs",
  "carbohidratos": "carbs",
  "carbs": "carbs",

  // Sugars
  "zucker": "sugars",
  "sucres": "sugars",
  "suikers": "sugars",
  "zucchero": "sugars",
  "sugars": "sugars",
  "azúcares": "sugars",
  "sugars": "sugars",
  "davon zucker": "sugars",
  "dont sucres": "sugars",
  "waarvan suikers": "sugars",
  "di cui zuccheri": "sugars",

  // Fiber
  "ballaststoffe": "fiber",
  "fibres alimentaires": "fiber",
  "vezels": "fiber",
  "fibre": "fiber",
  "fibra": "fiber",
  "fiber": "fiber",

  // Protein
  "eiweiss": "protein",
  "eiweiß": "protein",
  "protéines": "protein",
  "eiwitten": "protein",
  "proteine": "protein",
  "protein": "protein",
  "proteínas": "protein",
  "proteins": "protein",

  // Salt
  "salz": "salt",
  "sel": "salt",
  "zout": "salt",
  "sale": "salt",
  "salt": "salt",
  "sal": "salt",

  // Sodium
  "sodium": "sodium",

  // Vitamin C
  "vitamine c": "vitaminC",
  "vitamin c": "vitaminC",
  "vitamina c": "vitaminC",

  // Generic fallback: lowercase trimmed
};

/**
 * Maps a multilingual label to a canonical internal key.
 * @param {string} label
 * @returns {string}
 */
export function normalizeLabel(label) {
  if (typeof label !== "string" || label.trim() === "") return "";
  const trimmed = label.trim();
  const lower = trimmed.toLowerCase();
  if (LABEL_ALIASES[lower]) return LABEL_ALIASES[lower];
  // Fallback: lowercase trimmed
  return trimmed.toLowerCase();
}

/**
 * Parses a raw string value into a number.
 * Handles comma decimals, "<0.1", etc.
 * @param {string} rawValue
 * @returns {number | null}
 */
export function parseValue(rawValue) {
  if (typeof rawValue !== "string" || rawValue.trim() === "") return null;
  const trimmed = rawValue.trim();

  // Handle "<0.1" or "<0,1"
  if (trimmed.startsWith("<")) {
    const inner = trimmed.slice(1).trim();
    if (inner === "") return null;
    const num = parseFloat(inner.replace(",", "."));
    if (isNaN(num)) return null;
    return num;
  }

  // Replace comma with dot for decimal
  const cleaned = trimmed.replace(",", ".");
  const num = parseFloat(cleaned);
  if (isNaN(num)) return null;
  return num;
}

/**
 * Converts kJ to kcal (÷ 4.184), rounded to integer.
 * @param {number} kj
 * @returns {number}
 */
export function convertKjToKcal(kj) {
  return Math.round(kj / 4.184);
}

/**
 * Converts kcal to kJ (× 4.184), rounded to integer.
 * @param {number} kcal
 * @returns {number}
 */
export function convertKcalToKj(kcal) {
  return Math.round(kcal * 4.184);
}

/**
 * Converts salt to sodium (salt ÷ 2.5).
 * @param {number} salt
 * @returns {number}
 */
export function convertSaltToSodium(salt) {
  return salt / 2.5;
}

/**
 * Converts sodium to salt (sodium × 2.5).
 * @param {number} sodium
 * @returns {number}
 */
export function convertSodiumToSalt(sodium) {
  return sodium * 2.5;
}

/**
 * Normalizes a unit string.
 * @param {string} unit
 * @returns {string}
 */
export function normalizeUnit(unit) {
  if (typeof unit !== "string" || unit.trim() === "") return "";
  const u = unit.trim();
  if (u === "μg" || u === "µg") return "µg";
  if (u === "UI") return "UI";
  return u;
}

/**
 * Checks if a string represents a %RI value.
 * @param {string} str
 * @returns {boolean}
 */
export function isPercentRI(str) {
  if (typeof str !== "string") return false;
  return /[\d,]+%$/.test(str.trim());
}

/**
 * Gets the base value from a row for the given base column.
 * @param {{label: string, per100g?: {value: number, unit: string}, per100ml?: {value: number, unit: string}, perServing?: {value: number, unit: string}}} row
 * @param {"per100g" | "per100ml"} base
 * @returns {number | null}
 */
export function getBaseValue(row, base) {
  if (!row) return null;
  const col = row[base];
  if (col && col.value !== undefined && col.value !== null) {
    return col.value;
  }
  return null;
}