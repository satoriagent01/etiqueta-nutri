/**
 * src/validator.js — Validation rules for products and meals.
 *
 * Exports:
 *   validateNutrientRow(row) → { valid, warnings }
 *   validateProduct(product) → { valid, status, warnings }
 *   validateMeal(meal) → { valid, status, warnings }
 */

/**
 * Validate a single nutrient row (product or meal item).
 *
 * @param {object} row - { nutrients: { [key]: { value, unit, status? } } }
 * @returns {{ valid: boolean, warnings: Array<{ type: string, field?: string, message: string }> }}
 */
export function validateNutrientRow(row) {
  const warnings = [];
  const { nutrients } = row;

  if (!nutrients || typeof nutrients !== "object") {
    return { valid: true, warnings: [] };
  }

  // V01: saturated fat must not exceed total fat
  if (nutrients.saturatedFat && nutrients.fat) {
    if (nutrients.saturatedFat.value > nutrients.fat.value) {
      warnings.push({
        type: "saturated_exceeds_total",
        field: "saturatedFat",
        message: "Saturated fat exceeds total fat"
      });
    }
  }

  // V02: sugars must not exceed total carbs
  if (nutrients.sugars && nutrients.carbs) {
    if (nutrients.sugars.value > nutrients.carbs.value) {
      warnings.push({
        type: "sugars_exceed_carbs",
        field: "sugars",
        message: "Sugars exceed total carbs"
      });
    }
  }

  // V03/V04: kcal and kJ must be within tolerance (factor 4.184)
  if (nutrients.energyKJ && nutrients.energyKcal) {
    const kJFromKcal = nutrients.energyKcal.value * 4.184;
    const kJDiff = Math.abs(nutrients.energyKJ.value - kJFromKcal);
    const tolerance = kJFromKcal * 0.10; // 10% tolerance
    if (kJDiff > tolerance) {
      warnings.push({
        type: "energy_mismatch",
        field: "energyKJ",
        message: `Energy mismatch: kJ (${nutrients.energyKJ.value}) and kcal (${nutrients.energyKcal.value}) differ by more than 10%`
      });
    }
  }

  return {
    valid: warnings.length === 0,
    warnings
  };
}

/**
 * Validate a product.
 *
 * @param {object} product - { id, name, basis, nutrients, warnings? }
 * @returns {{ valid: boolean, status: string, warnings: Array }}
 */
export function validateProduct(product) {
  const { nutrients, warnings: existingWarnings = [] } = product;

  // Check all nutrient rows for internal consistency
  const rowWarnings = [];

  // Check saturated fat vs total fat
  if (nutrients.saturatedFat && nutrients.fat) {
    if (nutrients.saturatedFat.value > nutrients.fat.value) {
      rowWarnings.push({
        type: "saturated_exceeds_total",
        field: "saturatedFat",
        message: "Saturated fat exceeds total fat"
      });
    }
  }

  // Check sugars vs carbs
  if (nutrients.sugars && nutrients.carbs) {
    if (nutrients.sugars.value > nutrients.carbs.value) {
      rowWarnings.push({
        type: "sugars_exceed_carbs",
        field: "sugars",
        message: "Sugars exceed total carbs"
      });
    }
  }

  // Check energy consistency
  if (nutrients.energyKJ && nutrients.energyKcal) {
    const kJFromKcal = nutrients.energyKcal.value * 4.184;
    const kJDiff = Math.abs(nutrients.energyKJ.value - kJFromKcal);
    const tolerance = kJFromKcal * 0.10;
    if (kJDiff > tolerance) {
      rowWarnings.push({
        type: "energy_mismatch",
        field: "energyKJ",
        message: `Energy mismatch: kJ (${nutrients.energyKJ.value}) and kcal (${nutrients.energyKcal.value}) differ by more than 10%`
      });
    }
  }

  const allWarnings = [...existingWarnings, ...rowWarnings];
  const hasWarnings = allWarnings.length > 0;

  return {
    valid: !hasWarnings,
    status: hasWarnings ? "pending" : "confirmed",
    warnings: allWarnings
  };
}

/**
 * Validate a meal.
 *
 * @param {object} meal - { id, date, items, calculatedNutrients }
 * @returns {{ valid: boolean, status: string, warnings: Array }}
 */
export function validateMeal(meal) {
  const { calculatedNutrients } = meal;

  if (!calculatedNutrients || typeof calculatedNutrients !== "object") {
    return {
      valid: false,
      status: "incomplete",
      warnings: [{ type: "no_nutrients", message: "No calculated nutrients" }]
    };
  }

  // A meal is complete if it has at least the core nutrients
  const coreNutrients = ["energyKcal", "fat", "carbs", "protein"];
  const missing = coreNutrients.filter(n => !calculatedNutrients[n]);

  if (missing.length > 0) {
    return {
      valid: false,
      status: "incomplete",
      warnings: missing.map(n => ({
        type: "missing_nutrient",
        field: n,
        message: `Missing nutrient: ${n}`
      }))
    };
  }

  return {
    valid: true,
    status: "complete",
    warnings: []
  };
}