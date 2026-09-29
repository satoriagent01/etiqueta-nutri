/**
 * Nutrient normalization utilities.
 * - convertKjToKcal: kJ → kcal (÷ 4.184, Math.round)
 * - convertMlToG: ml → g using density (default 1 g/ml)
 * - normalizeNutrientName: canonical name mapping
 * - normalizeNutrientValue: parse string/number → number or null
 */

const ENERGY_CONVERSION = 4.184;

/**
 * Convert kilojoules to kilocalories.
 * @param {number} kj - Energy in kJ
 * @returns {number} Energy in kcal (rounded)
 */
export function convertKjToKcal(kj) {
  return Math.round(kj / ENERGY_CONVERSION);
}

/**
 * Convert milliliters to grams using density.
 * @param {number} ml - Volume in ml
 * @param {number} [density=1] - Density in g/ml
 * @returns {number} Mass in grams
 */
export function convertMlToG(ml, density = 1) {
  return ml * density;
}

/**
 * Map common nutrient name variants to canonical names.
 * @param {string} name - Nutrient name (case-insensitive)
 * @returns {string} Canonical name
 */
export function normalizeNutrientName(name) {
  if (!name || typeof name !== 'string') return '';
  const n = name.trim().toLowerCase();
  const map = {
    'energy': 'energy',
    'calories': 'energy',
    'kcal': 'energy',
    'kj': 'energy_kj',
    'energy_kj': 'energy_kj',
    'energy_kj': 'energy_kj',
    'proteins': 'protein',
    'protein': 'protein',
    'carbohydrates': 'carbohydrate',
    'carbohydrate': 'carbohydrate',
    'carbs': 'carbohydrate',
    'total carbohydrates': 'carbohydrate',
    'total carbohydrate': 'carbohydrate',
    'fats': 'fat',
    'fat': 'fat',
    'total fat': 'fat',
    'saturated fat': 'saturated_fat',
    'saturated_fat': 'saturated_fat',
    'saturated fats': 'saturated_fat',
    'sugars': 'sugar',
    'sugar': 'sugar',
    'total sugars': 'sugar',
    'fiber': 'fiber',
    'fibers': 'fiber',
    'dietary fiber': 'fiber',
    'dietary fibre': 'fiber',
    'sodium': 'sodium',
    'salt': 'salt',
    'cholesterol': 'cholesterol',
    'vitamin c': 'vitamin_c',
    'vitamina c': 'vitamin_c',
    'vitamin a': 'vitamin_a',
    'vitamina a': 'vitamin_a',
    'calcium': 'calcium',
    'iron': 'iron',
  };
  return map[n] || n;
}

/**
 * Parse a nutrient value from a string or number.
 * Returns null if the value is missing, 'dudoso', 'ausente', or unparseable.
 * @param {string|number|null} value - Raw value
 * @returns {number|null} Parsed value or null
 */
export function normalizeNutrientValue(value) {
  if (value === null || value === undefined) return null;
  if (typeof value === 'number') {
    if (isNaN(value) || !isFinite(value)) return null;
    return value;
  }
  if (typeof value !== 'string') return null;
  const trimmed = value.trim().toLowerCase();
  if (trimmed === '' || trimmed === 'dudoso' || trimmed === 'ausente' || trimmed === 'n/a' || trimmed === 'na' || trimmed === '-') return null;
  const cleaned = trimmed.replace(/[^0-9.,]/g, '').replace(',', '.');
  if (cleaned === '') return null;
  const num = parseFloat(cleaned);
  if (isNaN(num) || !isFinite(num)) return null;
  return num;
}