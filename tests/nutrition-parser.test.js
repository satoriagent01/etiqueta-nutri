import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { parseNutritionTable } from "../src/nutrition-parser.js";
import { schaarOCR, juiceOCR, sprayOCR } from "./fixtures.js";

describe("parseNutritionTable - REQ-002, REQ-003, REQ-004", () => {
  test("Schär: parses per 100g and per serving (30g) columns", () => {
    const result = parseNutritionTable(schaarOCR);
    assert.equal(result.basis, "100g");
    assert.ok(result.serving);
    assert.equal(result.serving.amount, 30);
    assert.equal(result.serving.unit, "g");
    // Check that energy is parsed from the 100g column
    const energy = result.nutrients["energy"];
    assert.ok(energy);
    assert.equal(energy.value, 2292);
    assert.equal(energy.unit, "kJ");
    assert.equal(energy.source, "100g");
  });

  test("Schär: parses all nutrients from the table", () => {
    const result = parseNutritionTable(schaarOCR);
    assert.ok(result.nutrients["fat"]);
    assert.ok(result.nutrients["saturated-fat"]);
    assert.ok(result.nutrients["carbohydrates"]);
    assert.ok(result.nutrients["sugars"]);
    assert.ok(result.nutrients["fiber"]);
    assert.ok(result.nutrients["protein"]);
    assert.ok(result.nutrients["salt"]);
  });

  test("Schär: generates warning for missing sodium (not in table)", () => {
    const result = parseNutritionTable(schaarOCR);
    assert.ok(result.warnings.length > 0);
    const sodiumWarning = result.warnings.find(w => w.nutrient === "sodium");
    assert.ok(sodiumWarning);
    assert.equal(sodiumWarning.status, "pending");
  });

  test("Juice: parses per 100ml and per serving (200ml) columns", () => {
    const result = parseNutritionTable(juiceOCR);
    assert.equal(result.basis, "100ml");
    assert.ok(result.serving);
    assert.equal(result.serving.amount, 200);
    assert.equal(result.serving.unit, "ml");
    const energy = result.nutrients["energy"];
    assert.ok(energy);
    assert.equal(energy.value, 199);
    assert.equal(energy.unit, "kJ");
    assert.equal(energy.source, "100ml");
  });

  test("Juice: parses vitamin C from the table", () => {
    const result = parseNutritionTable(juiceOCR);
    assert.ok(result.nutrients["vitamin-c"]);
    assert.equal(result.nutrients["vitamin-c"].value, 26);
    assert.equal(result.nutrients["vitamin-c"].unit, "%RI");
  });

  test("Spray: parses per 100ml column", () => {
    const result = parseNutritionTable(sprayOCR);
    assert.equal(result.basis, "100ml");
    assert.ok(!result.serving || result.serving === null);
    const energy = result.nutrients["energy"];
    assert.ok(energy);
    assert.equal(energy.value, 3404);
    assert.equal(energy.unit, "kJ");
  });

  test("Empty OCR: returns empty product with warnings", () => {
    const result = parseNutritionTable({ language: "en", basis: "100g", serving: null, rows: [], warnings: [] });
    assert.equal(result.basis, "100g");
    assert.equal(Object.keys(result.nutrients).length, 0);
    assert.ok(result.warnings.length > 0);
  });

  test("OCR with no rows: returns empty product", () => {
    const result = parseNutritionTable({ language: "de", basis: "100g", serving: null, rows: [], warnings: [] });
    assert.equal(Object.keys(result.nutrients).length, 0);
  });
});