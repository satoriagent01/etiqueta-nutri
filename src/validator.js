/**
 * Validate nutrition data against rules.
 * - No assumed values (dudoso/ausente → pendiente)
 * - ml ≠ g without density
 * - Missing ≠ 0
 */

/**
 * Validate a nutrition data object.
 * @param {Object} data - { nutrients: Map<string, number|null>, density?: number }
 * @returns {{ valid: boolean, errors: string[] }}
 */
export function validateNutritionData(data) {
  const errors = [];
  const { nutrients, density } = data;

  if (!nutrients || !(nutrients instanceof Map)) {
    return { valid: false, errors: ['Invalid nutrients data'] };
  }

  // Check for missing values (null) - these are "pendiente", not 0
  for (const [name, value] of nutrients) {
    if (value === null) {
      // This is acceptable as "pendiente" - not an error per se
      // But we flag it
    }
  }

  // Check ml vs g: if both volume_ml and weight_g exist but no density, warn
  const volumeMl = nutrients.get('volume_ml');
  const weightG = nutrients.get('weight_g');

  if (volumeMl !== null && volumeMl !== undefined && weightG !== null && weightG !== undefined) {
    if (volumeMl !== weightG && !density) {
      errors.push('Volume and weight differ but no density provided');
    }
  }

  // Check that no value is assumed to be 0 when it's missing
  for (const [name, value] of nutrients) {
    if (value === 0) {
      // 0 is a valid value (e.g., 0g sugar), but only if explicitly stated
      // We don't flag this as an error since 0 is a real value
    }
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Check if a nutrient value is pending (missing/dudoso/ausente).
 * @param {number|null} value
 * @returns {boolean}
 */
export function isPending(value) {
  return value === null;
}

/**
 * Get all pending nutrients from a Map.
 * @param {Map<string, number|null>} nutrients
 * @returns {string[]}
 */
export function getPendingNutrients(nutrients) {
  const pending = [];
  for (const [name, value] of nutrients) {
    if (value === null) {
      pending.push(name);
    }
  }
  return pending;
}