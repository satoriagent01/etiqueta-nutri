/**
 * Nutrient normalization utilities.
 * All functions are pure (no browser/Node APIs).
 */

/**
 * Map of multilingual label names → canonical English name.
 */
const LABEL_MAP = {
  // Energy
  "energía": "energy", "energie": "energy", "energia": "energy", "energy": "energy",
  "énergie": "energy",
  // Fat
  "fett": "fat", "matières grasses": "fat", "vetten": "fat", "grassi": "fat", "fat": "fat",
  "gras": "fat", "graisse": "fat", "grasa": "fat",
  // Saturated fat
  "davon gesättigte fettsäuren": "saturatedFat", "dont acides gras saturés": "saturatedFat",
  "verzadigde vetzuren": "saturatedFat", "acidi grassi saturi": "saturatedFat",
  "saturated fat": "saturatedFat", "saturated fats": "saturatedFat",
  "waarvan verzadigd": "saturatedFat", "waarvan vetten verzadigd": "saturatedFat",
  // Carbs
  "kohlenhydrate": "carbs", "glucides": "carbs", "koolhydraten": "carbs",
  "carboidrati": "carbs", "carbohydrates": "carbs", "carbohidratos": "carbs",
  "carbohydrate": "carbs", "carbs": "carbs",
  // Sugars
  "davon zucker": "sugars", "dont sucres": "sugars", "suikers": "sugars",
  "zuccheri": "sugars", "sugars": "sugars", "azúcares": "sugars",
  "waarvan suikers": "sugars",
  // Fiber
  "ballaststoffe": "fiber", "fibres": "fiber", "vezestoffen": "fiber",
  "fibre": "fiber", "fiber": "fiber", "fibras": "fiber",
  "dietary fiber": "fiber", "dietary fibres": "fiber",
  // Protein
  "eiweiß": "protein", "proteine": "protein", "eiwitten": "protein",
  "protéines": "protein", "protein": "protein", "proteínas": "protein",
  "proteïnen": "protein",
  // Salt
  "salz": "salt", "sel": "salt", "zout": "salt", "sale": "salt",
  "salt": "salt", "sal": "salt",
  // Vitamin C
  "vitamine c": "vitaminC", "vitamin c": "vitaminC",
  // Sodium
  "sodium": "sodium",
};

/**
 * Normalize a label string to its canonical name.
 * @param {string} label - The label text from OCR
 * @returns {string}
 */
export function normalizeLabel(label) {
  if (!label || typeof label !== 'string') return '';
  const trimmed = label.trim().toLowerCase();
  if (trimmed in LABEL_MAP) return LABEL_MAP[trimmed];
  return trimmed;
}

/** Alias for normalizeLabel - used by nutrition-parser */
export const normalizeNutrientName = normalizeLabel;

/**
 * Parse a numeric value from a string.
 * Handles commas as decimal separators and < prefix.
 * @param {string} str - The value string
 * @returns {number|null}
 */
export function parseValue(str) {
  if (!str || typeof str !== 'string') return null;
  const trimmed = str.trim();
  if (trimmed === '' || trimmed === '—' || trimmed === '-') return null;

  let cleaned = trimmed;
  let isLessThan = false;

  if (cleaned.startsWith('<')) {
    isLessThan = true;
    cleaned = cleaned.slice(1).trim();
  }

  // Replace comma with dot for decimal
  cleaned = cleaned.replace(',', '.');

  const num = parseFloat(cleaned);
  if (isNaN(num)) return null;

  return isLessThan ? num : num;
}

/** Alias for parseValue - used by nutrition-parser */
export const normalizeNutrientValue = parseValue;

/**
 * Convert kilojoules to kilocalories (rounded).
 * Formula: kcal = kJ / 4.184
 * @param {number} kj - Value in kJ
 * @returns {number}
 */
export function convertKjToKcal(kj) {
  return Math.round(kj / 4.184);
}

/**
 * Convert kilocalories to kilojoules (rounded).
 * Formula: kJ = kcal * 4.184
 * @param {number} kcal - Value in kcal
 * @returns {number}
 */
export function convertKcalToKj(kcal) {
  return Math.round(kcal * 4.184);
}

/**
 * Convert salt (NaCl) to sodium.
 * Formula: sodium = salt * 0.4
 * @param {number} salt - Value in grams
 * @returns {number}
 */
export function convertSaltToSodium(salt) {
  return parseFloat((salt * 0.4).toFixed(3));
}

/**
 * Convert sodium to salt.
 * Formula: salt = sodium / 0.4
 * @param {number} sodium - Value in grams
 * @returns {number}
 */
export function convertSodiumToSalt(sodium) {
  return parseFloat((sodium / 0.4).toFixed(3));
}

/**
 * Normalize a unit string.
 * @param {string} unit - The unit string
 * @returns {string}
 */
export function normalizeUnit(unit) {
  if (!unit || typeof unit !== 'string') return '';
  const u = unit.trim().toLowerCase();
  if (u === 'μg' || u === 'µg' || u === 'mcg') return 'µg';
  if (u === 'ui' || u === 'iu') return 'IU';
  return unit.trim();
}

/**
 * Check if a string represents a percentage of Reference Intake.
 * @param {string} str - The string to check
 * @returns {boolean}
 */
export function isPercentRI(str) {
  if (!str || typeof str !== 'string') return false;
  return /[\d,]+%/.test(str.trim());
}

/**
 * Get the base value from a row object based on the basis type.
 * @param {Object} row - The row object
 * @param {string} basisType - "per100g" or "per100ml"
 * @returns {number|null}
 */
export function getBaseValue(row, basisType) {
  if (!row) return null;
  const key = basisType;
  if (row[key] && row[key].value !== undefined) {
    return row[key].value;
  }
  return null;
}