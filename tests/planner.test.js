import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { createPlanner, createMeal, addMealItem, calculateMealTotals, calculateDayTotals, getDayStatus } from "../src/planner.js";
import { createStorage } from "../src/storage.js";
import { productsFixture, mealFixture, dayFixture } from "./fixtures.js";

describe("planner - createPlanner", () => {
  test("creates a planner with storage", () => {
    const storage = createStorage();
    const planner = createPlanner(storage);
    assert.ok(planner);
    assert.strictEqual(planner.storage, storage);
  });
});

describe("planner - createMeal", () => {
  test("creates an empty meal", () => {
    const storage = createStorage();
    const planner = createPlanner(storage);
    const meal = createMeal(planner, "Breakfast", new Date("2024-01-15"));
    assert.strictEqual(meal.name, "Breakfast");
    assert.strictEqual(meal.date, "2024-01-15");
    assert.deepStrictEqual(meal.items, []);
  });

  test("returns meal with id", () => {
    const storage = createStorage();
    const planner = createPlanner(storage);
    const meal = createMeal(planner, "Lunch", new Date("2024-01-15"));
    assert.ok(meal.id);
    assert.strictEqual(typeof meal.id, "string");
  });
});

describe("planner - addMealItem", () => {
  test("adds an item with grams", () => {
    const storage = createStorage();
    const planner = createPlanner(storage);
    const meal = createMeal(planner, "Snack", new Date("2024-01-15"));
    storage.saveProduct(productsFixture.schar);

    addMealItem(meal, productsFixture.schar.id, 60, "g");

    assert.strictEqual(meal.items.length, 1);
    assert.strictEqual(meal.items[0].productId, productsFixture.schar.id);
    assert.strictEqual(meal.items[0].quantity, 60);
    assert.strictEqual(meal.items[0].unit, "g");
  });

  test("adds an item with ml", () => {
    const storage = createStorage();
    const planner = createPlanner(storage);
    const meal = createMeal(planner, "Drink", new Date("2024-01-15"));
    storage.saveProduct(productsFixture.juice);

    addMealItem(meal, productsFixture.juice.id, 250, "ml");

    assert.strictEqual(meal.items.length, 1);
    assert.strictEqual(meal.items[0].productId, productsFixture.juice.id);
    assert.strictEqual(meal.items[0].quantity, 250);
    assert.strictEqual(meal.items[0].unit, "ml");
  });
});

describe("planner - calculateMealTotals", () => {
  test("calculates totals for 100g of Schär product", () => {
    const storage = createStorage();
    const planner = createPlanner(storage);
    const meal = createMeal(planner, "Test", new Date("2024-01-15"));
    storage.saveProduct(productsFixture.schar);

    addMealItem(meal, productsFixture.schar.id, 100, "g");
    const totals = calculateMealTotals(meal, storage);

    // Schär: per 100g: energy 2292 kJ, fat 33g, saturates 13g, carbs 55g, sugars 45g, fiber 2.4g, protein 6.8g, salt 0.18g
    assert.strictEqual(totals.energy, 2292);
    assert.strictEqual(totals.fat, 33);
    assert.strictEqual(totals.saturatedFat, 13);
    assert.strictEqual(totals.carbs, 55);
    assert.strictEqual(totals.sugars, 45);
    assert.strictEqual(totals.fiber, 2.4);
    assert.strictEqual(totals.protein, 6.8);
    assert.strictEqual(totals.salt, 0.18);
  });

  test("calculates totals for 30g serving of Schär product", () => {
    const storage = createStorage();
    const planner = createPlanner(storage);
    const meal = createMeal(planner, "Test", new Date("2024-01-15"));
    storage.saveProduct(productsFixture.schar);

    addMealItem(meal, productsFixture.schar.id, 30, "g");
    const totals = calculateMealTotals(meal, storage);

    // 30% of per-100g values
    assert.strictEqual(totals.energy, 687.6);
    assert.strictEqual(totals.fat, 9.9);
    assert.strictEqual(totals.saturatedFat, 3.9);
    assert.strictEqual(totals.carbs, 16.5);
    assert.strictEqual(totals.sugars, 13.5);
    assert.strictEqual(totals.fiber, 0.72);
    assert.strictEqual(totals.protein, 2.04);
    assert.strictEqual(totals.salt, 0.054);
  });

  test("calculates totals for 200ml juice", () => {
    const storage = createStorage();
    const planner = createPlanner(storage);
    const meal = createMeal(planner, "Test", new Date("2024-01-15"));
    storage.saveProduct(productsFixture.juice);

    addMealItem(meal, productsFixture.juice.id, 200, "ml");
    const totals = calculateMealTotals(meal, storage);

    // Juice: per 100ml: energy 199 kJ, fat 0g, carbs 11g, sugars 10g, protein 0.7g, salt 0g, vitaminC 26% RI
    // 200ml = 2x per 100ml
    assert.strictEqual(totals.energy, 398);
    assert.strictEqual(totals.fat, 0);
    assert.strictEqual(totals.carbs, 22);
    assert.strictEqual(totals.sugars, 20);
    assert.strictEqual(totals.protein, 1.4);
    assert.strictEqual(totals.salt, 0);
  });

  test("handles multiple items", () => {
    const storage = createStorage();
    const planner = createPlanner(storage);
    const meal = createMeal(planner, "Test", new Date("2024-01-15"));
    storage.saveProduct(productsFixture.schar);
    storage.saveProduct(productsFixture.juice);

    addMealItem(meal, productsFixture.schar.id, 100, "g");
    addMealItem(meal, productsFixture.juice.id, 200, "ml");
    const totals = calculateMealTotals(meal, storage);

    // Sum of both: Schär 100g + Juice 200ml
    assert.strictEqual(totals.energy, 2292 + 398);
    assert.strictEqual(totals.fat, 33 + 0);
    assert.strictEqual(totals.carbs, 55 + 22);
    assert.strictEqual(totals.sugars, 45 + 20);
  });

  test("returns incomplete when product has missing nutrients", () => {
    const storage = createStorage();
    const planner = createPlanner(storage);
    const meal = createMeal(planner, "Test", new Date("2024-01-15"));
    // spray has no energy, fat, etc. - only partial data
    storage.saveProduct(productsFixture.spray);

    addMealItem(meal, productsFixture.spray.id, 100, "ml");
    const totals = calculateMealTotals(meal, storage);

    // spray has energy 3404 kJ per 100ml but missing many nutrients
    assert.strictEqual(totals.incomplete, true);
  });
});

describe("planner - calculateDayTotals", () => {
  test("sums all meals for a day", () => {
    const storage = createStorage();
    const planner = createPlanner(storage);
    const date = new Date("2024-01-15");

    storage.saveProduct(productsFixture.schar);
    storage.saveProduct(productsFixture.juice);

    const meal1 = createMeal(planner, "Breakfast", date);
    addMealItem(meal1, productsFixture.schar.id, 100, "g");

    const meal2 = createMeal(planner, "Drink", date);
    addMealItem(meal2, productsFixture.juice.id, 200, "ml");

    const dayTotals = calculateDayTotals(planner, date);

    assert.strictEqual(dayTotals.energy, 2292 + 398);
    assert.strictEqual(dayTotals.fat, 33);
    assert.strictEqual(dayTotals.carbs, 55 + 22);
  });

  test("returns incomplete if any meal is incomplete", () => {
    const storage = createStorage();
    const planner = createPlanner(storage);
    const date = new Date("2024-01-15");

    storage.saveProduct(productsFixture.spray);

    const meal = createMeal(planner, "Test", date);
    addMealItem(meal, productsFixture.spray.id, 100, "ml");

    const dayTotals = calculateDayTotals(planner, date);
    assert.strictEqual(dayTotals.incomplete, true);
  });
});

describe("planner - getDayStatus", () => {
  test("returns incomplete when day has incomplete meals", () => {
    const storage = createStorage();
    const planner = createPlanner(storage);
    const date = new Date("2024-01-15");

    storage.saveProduct(productsFixture.spray);

    const meal = createMeal(planner, "Test", date);
    addMealItem(meal, productsFixture.spray.id, 100, "ml");

    const status = getDayStatus(planner, date);
    assert.strictEqual(status, "incomplete");
  });

  test("returns complete when all meals are complete", () => {
    const storage = createStorage();
    const planner = createPlanner(storage);
    const date = new Date("2024-01-15");

    storage.saveProduct(productsFixture.schar);

    const meal = createMeal(planner, "Test", date);
    addMealItem(meal, productsFixture.schar.id, 100, "g");

    const status = getDayStatus(planner, date);
    assert.strictEqual(status, "complete");
  });
});

describe("planner - ml vs g without density", () => {
  test("treats ml and g as separate units, no conversion", () => {
    const storage = createStorage();
    const planner = createPlanner(storage);
    const meal = createMeal(planner, "Test", new Date("2024-01-15"));
    storage.saveProduct(productsFixture.juice);

    // Juice is per 100ml, adding 200ml should work
    addMealItem(meal, productsFixture.juice.id, 200, "ml");
    const totals = calculateMealTotals(meal, storage);

    // 2x per 100ml values
    assert.strictEqual(totals.energy, 398);
    assert.strictEqual(totals.carbs, 22);
  });

  test("cannot add grams to ml-based product without density", () => {
    const storage = createStorage();
    const planner = createPlanner(storage);
    const meal = createMeal(planner, "Test", new Date("2024-01-15"));
    storage.saveProduct(productsFixture.juice);

    // Juice is per 100ml, trying to add grams should fail or warn
    assert.throws(() => {
      addMealItem(meal, productsFixture.juice.id, 200, "g");
    }, /density/);
  });
});