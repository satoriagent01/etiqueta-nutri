/**
 * Daily profiles and objectives calculation.
 */

/**
 * Default daily objectives for a standard adult.
 */
export const DEFAULT_DAILY_OBJECTIVES = {
  energy_kcal: 2000,
  protein_g: 50,
  carbs_g: 275,
  fat_g: 78,
  fiber_g: 28,
  sugar_g: 50,
  sodium_mg: 2300,
  saturated_fat_g: 20,
  cholesterol_mg: 300,
  volume_ml: 2000,
  weight_g: null,
};

/**
 * Get daily objectives for a profile.
 * @param {string} profile - 'standard', 'low-cal', 'high-protein', etc.
 * @returns {Object<string, number|null>}
 */
export function getDailyObjectives(profile = 'standard') {
  switch (profile) {
    case 'low-cal':
      return {
        ...DEFAULT_DAILY_OBJECTIVES,
        energy_kcal: 1500,
        carbs_g: 180,
        fat_g: 55,
      };
    case 'high-protein':
      return {
        ...DEFAULT_DAILY_OBJECTIVES,
        protein_g: 100,
        carbs_g: 200,
      };
    case 'low-sodium':
      return {
        ...DEFAULT_DAILY_OBJECTIVES,
        sodium_mg: 1500,
      };
    default:
      return { ...DEFAULT_DAILY_OBJECTIVES };
  }
}

/**
 * Calculate the percentage of daily objective met.
 * @param {number|null} value - Current value (null if pending)
 * @param {number|null} objective - Daily objective (null if not applicable)
 * @returns {number|null} - Percentage (0-100+), or null if pending/no objective
 */
export function calculatePercentage(value, objective) {
  if (value === null || objective === null || objective === undefined) {
    return null;
  }
  if (objective === 0) {
    return value > 0 ? 100 : 0;
  }
  return Math.round((value / objective) * 100);
}

/**
 * Get the status of a nutrient relative to its objective.
 * @param {number|null} value
 * @param {number|null} objective
 * @returns {string} - 'within', 'exceeded', 'pending', or 'no-objective'
 */
export function getNutrientStatus(value, objective) {
  if (value === null) {
    return 'pending';
  }
  if (objective === null || objective === undefined) {
    return 'no-objective';
  }
  const pct = calculatePercentage(value, objective);
  if (pct === null) return 'no-objective';
  if (pct <= 100) return 'within';
  return 'exceeded';
}