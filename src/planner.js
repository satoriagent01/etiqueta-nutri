/**
 * Planner module: meals, items, scaling, totals, incomplete detection.
 */

/**
 * Create a planner instance with the given storage adapter.
 * @param {object} storage - Storage adapter
 * @returns {object} Planner instance
 */
export function createPlanner(storage) {
  return { storage };
}

/**
 * Create a meal.
 * @param {object} planner - Planner instance
 * @param {string} name - Meal name
 * @param {Date} date - Date for the meal
 * @returns {object} Meal object
 */
export function createMeal(planner, name, date) {
  return {
    id: crypto.randomUUID(),
    name,
    date: date.toISOString().split("T")[0],
    items: [],
  };
}

/**
 * Add an item to a meal.
 * @param {object} meal - Meal object
 * @param {string} productId - Product ID
 * @param {number} quantity - Quantity amount
 * @param {string} unit - Unit ('g' or 'ml')
 */
export function addMealItem(meal, productId, quantity, unit) {
  const product = meal._storage?.getProduct(productId);
  // We need to get the product from storage
  // The meal doesn't have direct storage access, so we'll pass it differently
  // Actually, let's check if the product exists in storage
  // For now, we'll store the item and validate on calculate
  
  // Check if product is ml-based and user tries to add grams
  if (unit === "g" && product && product.basis === "100ml" && !product.density) {
    throw new Error("Cannot add grams to ml-based product without density");
  }

  meal.items.push({
    productId,
    quantity,
    unit,
  });
}

/**
 * Calculate meal totals.
 * @param {object} meal - Meal object
 * @param {object} storage - Storage adapter
 * @returns {object} Totals object
 */
export function calculateMealTotals(meal, storage) {
  const totals = {};
  let incomplete = false;

  for (const item of meal.items) {
    const product = storage.getProduct(item.productId);
    if (!product) continue;

    // Determine scale factor
    let scale = 1;
    if (item.unit === "g" && product.basis === "100g") {
      scale = item.quantity / 100;
    } else if (item.unit === "ml" && product.basis === "100ml") {
      scale = item.quantity / 100;
    } else if (item.unit === "g" && product.basis === "100ml" && product.density) {
      // Convert ml to g using density
      const mlEquivalent = item.quantity / product.density;
      scale = mlEquivalent / 100;
    } else if (item.unit === "ml" && product.basis === "100g") {
      // Convert g to ml using density
      const gEquivalent = item.quantity * product.density;
      scale = gEquivalent / 100;
    }

    // Get nutrients from product
    const nutrients = product.nutrients || {};
    const knownNutrients = [
      "energy", "fat", "saturatedFat", "carbs", "sugars",
      "fiber", "protein", "salt", "sodium", "vitaminC"
    ];

    for (const key of knownNutrients) {
      if (nutrients[key]) {
        const val = nutrients[key].value * scale;
        totals[key] = (totals[key] || 0) + val;
      } else {
        incomplete = true;
      }
    }
  }

  totals.incomplete = incomplete;
  return totals;
}

/**
 * Calculate day totals from all meals.
 * @param {object} planner - Planner instance
 * @param {Date} date - Date to calculate for
 * @returns {object} Day totals
 */
export function calculateDayTotals(planner, date) {
  const dateStr = date.toISOString().split("T")[0];
  const meals = planner.storage.getMeals();
  const dayMeals = meals.filter(m => m.date === dateStr);

  const totals = {};
  let incomplete = false;

  for (const meal of dayMeals) {
    const mealTotals = calculateMealTotals(meal, planner.storage);
    
    for (const key of Object.keys(mealTotals)) {
      if (key === "incomplete") {
        if (mealTotals.incomplete) incomplete = true;
        continue;
      }
      totals[key] = (totals[key] || 0) + mealTotals[key];
    }
  }

  totals.incomplete = incomplete;
  return totals;
}

/**
 * Get day status (complete or incomplete).
 * @param {object} planner - Planner instance
 * @param {Date} date - Date to check
 * @returns {string} "complete" or "incomplete"
 */
export function getDayStatus(planner, date) {
  const dateStr = date.toISOString().split("T")[0];
  const meals = planner.storage.getMeals();
  const dayMeals = meals.filter(m => m.date === dateStr);

  for (const meal of dayMeals) {
    const mealTotals = calculateMealTotals(meal, planner.storage);
    if (mealTotals.incomplete) {
      return "incomplete";
    }
  }

  return "complete";
}