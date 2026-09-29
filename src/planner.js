/**
 * Meal planning, daily status, meal totals, day totals.
 */

import { calculatePercentage, getNutrientStatus, getDailyObjectives } from './profiles.js';

/**
 * Calculate meal totals from a list of items.
 * Each item has { nutrients: Map<string, number|null>, portionG: number, portionMl: number, density: number }
 * @param {Array<Object>} items
 * @returns {Map<string, number|null>} - Summed nutrients scaled to 100g
 */
export function calculateMealTotals(items) {
  const totals = new Map();

  for (const item of items) {
    const { nutrients, portionG, portionMl, density } = item;
    const scale = getScale(nutrients, portionG, portionMl, density);

    for (const [name, value] of nutrients) {
      if (value === null) {
        // If any value is null, the scaled value is also null
        totals.set(name, null);
        continue;
      }
      const scaled = value * (scale / 100);
      const existing = totals.get(name);
      if (existing === null) {
        totals.set(name, null);
      } else {
        totals.set(name, (existing || 0) + scaled);
      }
    }
  }

  return totals;
}

/**
 * Calculate day totals from meal results.
 * @param {Object} meals - { breakfast: [...], lunch: [...], dinner: [...] }
 * @returns {Map<string, number|null>}
 */
export function calculateDayTotals(meals) {
  const dayTotals = new Map();

  for (const mealKey of ['breakfast', 'lunch', 'dinner']) {
    const mealItems = meals[mealKey] || [];
    const mealTotals = calculateMealTotals(mealItems);

    for (const [name, value] of mealTotals) {
      if (value === null) {
        dayTotals.set(name, null);
      } else {
        const existing = dayTotals.get(name);
        if (existing === null) {
          dayTotals.set(name, null);
        } else {
          dayTotals.set(name, (existing || 0) + value);
        }
      }
    }
  }

  return dayTotals;
}

/**
 * Get the day status comparing day totals against daily objectives.
 * @param {Map<string, number|null>} dayTotals
 * @param {Object<string, number|null>} objectives
 * @returns {Object<string, { value: number|null, objective: number|null, percentage: number|null, status: string }>}
 */
export function getDayStatus(dayTotals, objectives) {
  const status = {};

  for (const [name, value] of dayTotals) {
    const objective = objectives[name] !== undefined ? objectives[name] : null;
    const percentage = calculatePercentage(value, objective);
    const nutrientStatus = getNutrientStatus(value, objective);

    status[name] = {
      value,
      objective,
      percentage,
      status: nutrientStatus,
    };
  }

  return status;
}

/**
 * Calculate the scale factor to normalize to 100g.
 * @param {Map<string, number|null>} nutrients
 * @param {number|null} portionG
 * @param {number|null} portionMl
 * @param {number|null} density
 * @returns {number}
 */
function getScale(nutrients, portionG, portionMl, density) {
  // If we have portion in grams, use that
  if (portionG !== null && portionG !== undefined && portionG > 0) {
    return portionG;
  }

  // If we have portion in ml and density, convert to g
  if (portionMl !== null && portionMl !== undefined && portionMl > 0 && density !== null && density !== undefined && density > 0) {
    return portionMl * density;
  }

  // Default: 100g
  return 100;
}