import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { validateNutrientRow, validateProduct, validateMeal } from "../src/validator.js";

describe("validateNutrientRow", () => {
  test("REQ-V01: saturated fat must not exceed total fat", () => {
    const row = {
      nutrients: {
        fat: { value: 10, unit: "g" },
        saturatedFat: { value: 12, unit: "g" }
      }
    };
    const result = validateNutrientRow(row);
    assert.equal(result.valid, false);
    assert.ok(result.warnings.some(w => w.type === "saturated_exceeds_total"));
  });

  test("REQ-V02: sugars must not exceed total carbs", () => {
    const row = {
      nutrients: {
        carbs: { value: 20, unit: "g" },
        sugars: { value: 25, unit: "g" }
      }
    };
    const result = validateNutrientRow(row);
    assert.equal(result.valid, false);
    assert.ok(result.warnings.some(w => w.type === "sugars_exceed_carbs"));
  });

  test("REQ-V03: kcal and kJ must be within tolerance (4.184 factor)", () => {
    // Valid: 549 kcal * 4.184 = 2297 kJ (within tolerance of 2292)
    const row = {
      nutrients: {
        energyKJ: { value: 2292, unit: "kJ" },
        energyKcal: { value: 549, unit: "kcal" }
      }
    };
    const result = validateNutrientRow(row);
    assert.equal(result.valid, true);
  });

  test("REQ-V04: inconsistent kcal/kJ flags as pending", () => {
    // Invalid: 549 kcal * 4.184 = 2297 kJ, but row says 1000 kJ
    const row = {
      nutrients: {
        energyKJ: { value: 1000, unit: "kJ" },
        energyKcal: { value: 549, unit: "kcal" }
      }
    };
    const result = validateNutrientRow(row);
    assert.equal(result.valid, false);
    assert.ok(result.warnings.some(w => w.type === "energy_mismatch"));
  });

  test("REQ-V05: missing nutrients don't cause validation failure", () => {
    const row = {
      nutrients: {
        fat: { value: 10, unit: "g" }
      }
    };
    const result = validateNutrientRow(row);
    assert.equal(result.valid, true);
  });
});

describe("validateProduct", () => {
  test("REQ-V06: product with all warnings has pending status", () => {
    const product = {
      id: "schar-test",
      name: "Schär Test",
      basis: "100g",
      nutrients: {
        energyKJ: { value: 2292, unit: "kJ", status: "confirmed" },
        energyKcal: { value: 549, unit: "kcal", status: "confirmed" },
        fat: { value: 33, unit: "g", status: "confirmed" },
        saturatedFat: { value: 13, unit: "g", status: "confirmed" },
        carbs: { value: 55, unit: "g", status: "confirmed" },
        sugars: { value: 45, unit: "g", status: "confirmed" },
        fiber: { value: 2.4, unit: "g", status: "confirmed" },
        protein: { value: 6.8, unit: "g", status: "confirmed" },
        salt: { value: 0.18, unit: "g", status: "confirmed" }
      },
      warnings: [
        { type: "saturated_exceeds_total", field: "saturatedFat" }
      ]
    };
    const result = validateProduct(product);
    assert.equal(result.valid, false);
    assert.equal(result.status, "pending");
  });

  test("REQ-V07: product with no warnings is valid", () => {
    const product = {
      id: "valid-product",
      name: "Valid Product",
      basis: "100g",
      nutrients: {
        energyKJ: { value: 2292, unit: "kJ", status: "confirmed" },
        energyKcal: { value: 549, unit: "kcal", status: "confirmed" },
        fat: { value: 33, unit: "g", status: "confirmed" },
        saturatedFat: { value: 10, unit: "g", status: "confirmed" },
        carbs: { value: 55, unit: "g", status: "confirmed" },
        sugars: { value: 45, unit: "g", status: "confirmed" },
        fiber: { value: 2.4, unit: "g", status: "confirmed" },
        protein: { value: 6.8, unit: "g", status: "confirmed" },
        salt: { value: 0.18, unit: "g", status: "confirmed" }
      },
      warnings: []
    };
    const result = validateProduct(product);
    assert.equal(result.valid, true);
    assert.equal(result.status, "confirmed");
  });
});

describe("validateMeal", () => {
  test("REQ-V08: meal with incomplete nutrients is flagged", () => {
    const meal = {
      id: "meal-1",
      date: "2024-01-01",
      items: [
        { productId: "product-1", quantity: 100, unit: "g" }
      ],
      calculatedNutrients: {
        energyKcal: { value: 549, unit: "kcal" },
        fat: { value: 33, unit: "g" }
        // missing: carbs, protein, etc.
      }
    };
    const result = validateMeal(meal);
    assert.equal(result.valid, false);
    assert.equal(result.status, "incomplete");
  });

  test("REQ-V09: meal with all nutrients is complete", () => {
    const meal = {
      id: "meal-2",
      date: "2024-01-01",
      items: [
        { productId: "product-1", quantity: 100, unit: "g" }
      ],
      calculatedNutrients: {
        energyKcal: { value: 549, unit: "kcal" },
        fat: { value: 33, unit: "g" },
        carbs: { value: 55, unit: "g" },
        protein: { value: 6.8, unit: "g" },
        sugars: { value: 45, unit: "g" },
        fiber: { value: 2.4, unit: "g" },
        salt: { value: 0.18, unit: "g" }
      }
    };
    const result = validateMeal(meal);
    assert.equal(result.valid, true);
    assert.equal(result.status, "complete");
  });
});