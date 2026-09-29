/**
 * Nutrient normalization utilities.
 * Pure functions – no browser/Node APIs.
 */

/* ── multilingual label → canonical name ─────────────────────── */
const LABEL_MAP = {
  /* Energy */
  "energía":"energy","energie":"energy","energia":"energy","energy":"energy",
  "énergie":"energy",
  /* Fat */
  "fett":"fat","matières grasses":"fat","vetten":"fat","grassi":"fat",
  "fat":"fat","gras":"fat","graisse":"fat","grasa":"fat",
  /* Saturated fat */
  "davon gesättigte fettsäuren":"saturatedFat",
  "dont acides gras saturés":"saturatedFat",
  "verzadigde vetzuren":"saturatedFat",
  "acidi grassi saturi":"saturatedFat",
  "saturated fat":"saturatedFat","saturated fats":"saturatedFat",
  "waarvan verzadigd":"saturatedFat","waarvan vetten verzadigd":"saturatedFat",
  /* Carbs */
  "kohlenhydrate":"carbs","glucides":"carbs","koolhydraten":"carbs",
  "carboidrati":"carbs","carbohydrates":"carbs","carbohidratos":"carbs",
  "carbohydrate":"carbs","carbs":"carbs",
  /* Sugars */
  "davon zucker":"sugars","dont sucres":"sugars","suikers":"sugars",
  "zuccheri":"sugars","sugars":"sugars","azúcares":"sugars",
  "waarvan suikers":"sugars",
  /* Fiber */
  "ballaststoffe":"fiber","fibres":"fiber","vezestoffen":"fiber",
  "fibre":"fiber","fiber":"fiber","fibras":"fiber",
  "dietary fiber":"fiber","dietary fibres":"fiber",
  /* Protein */
  "eiweiß":"protein","proteine":"protein","eiwitten":"protein",
  "protéines":"protein","protein":"protein","proteínas":"protein",
  "proteïnen":"protein",
  /* Salt */
  "salz":"salt","sel":"salt","zout":"salt","sale":"salt",
  "salt":"salt","sal":"salt",
  /* Vitamin C */
  "vitamine c":"vitaminC","vitamin c":"vitaminC",
  /* Sodium */
  "sodium":"sodium",
};

/**
 * Normalise a label string to its canonical English name.
 */
export function normalizeLabel(label) {
  if (!label || typeof label !== 'string') return '';
  const trimmed = label.trim().toLowerCase();
  return LABEL_MAP[trimmed] ?? trimmed;
}

/** Alias kept for backward-compatibility with old imports. */
export const normalizeNutrientName = normalizeLabel;

/* ── value parsing ───────────────────────────────────────────── */

/**
 * Parse a numeric value from a string.
 * Handles commas as decimal separators and < prefix.
 */
export function parseValue(str) {
  if (!str || typeof str !== 'string') return null;
  const t = str.trim();
  if (t === '' || t === '—' || t === '-') return null;

  let cleaned = t;
  if (cleaned.startsWith('<')) cleaned = cleaned.slice(1).trim();
  cleaned = cleaned.replace(',', '.');
  const num = parseFloat(cleaned);
  return isNaN(num) ? null : num;
}

/** Alias kept for backward-compatibility. */
export const normalizeNutrientValue = parseValue;

/* ── unit conversions ────────────────────────────────────────── */

/** Convert kJ → kcal (rounded up, as labels do). */
export function convertKjToKcal(kj) {
  return Math.ceil(kj / 4.184);
}

/** Convert kcal → kJ (rounded). */
export function convertKcalToKj(kcal) {
  return Math.round(kcal * 4.184);
}

/** Salt (NaCl) → sodium.  sodium = salt × 0.4 */
export function convertSaltToSodium(salt) {
  return parseFloat((salt * 0.4).toFixed(3));
}

/** Sodium → salt.  salt = sodium ÷ 0.4 */
export function convertSodiumToSalt(sodium) {
  return parseFloat((sodium / 0.4).toFixed(3));
}

/* ── unit helpers ────────────────────────────────────────────── */

/**
 * Normalise a unit string.
 * 'iu' (lowercase only) → 'IU', 'μg'/'µg'/'mcg' → 'µg'.
 * Everything else is returned as-is.
 */
export function normalizeUnit(unit) {
  if (!unit || typeof unit !== 'string') return '';
  const u = unit.trim();
  if (u.toLowerCase() === 'iu') return 'IU';
  if (u === 'μg' || u === 'µg' || u.toLowerCase() === 'mcg') return 'µg';
  return u;
}

/**
 * Check whether a string represents a % Reference Intake.
 */
export function isPercentRI(str) {
  if (!str || typeof str !== 'string') return false;
  return /[\d,]+%/.test(str.trim());
}

/**
 * Get the base value from a row object for the given basis type.
 */
export function getBaseValue(row, basisType) {
  if (!row) return null;
  if (row[basisType] && row[basisType].value !== undefined) return row[basisType].value;
  return null;
}