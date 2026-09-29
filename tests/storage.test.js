import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { createStorage } from "../src/storage.js";

describe("storage: in-memory adapter (REQ-07)", () => {
  test("stores and retrieves a product", () => {
    const store = createStorage();
    const product = {
      id: "p1",
      name: "Schär Waffeln",
      brand: "Dr. Schär AG",
      basis: "100 g",
      serving: { amount: 30, unit: "g" },
      nutrients: {
        energy: { value: 2292, unit: "kJ" },
        fat: { value: 33, unit: "g" },
      },
      warnings: [],
    };
    store.saveProduct(product);
    const retrieved = store.getProduct("p1");
    assert.deepStrictEqual(retrieved, product);
  });

  test("returns undefined for missing product", () => {
    const store = createStorage();
    assert.strictEqual(store.getProduct("nonexistent"), undefined);
  });

  test("lists all products", () => {
    const store = createStorage();
    store.saveProduct({ id: "p1", name: "A", basis: "100 g", nutrients: {}, warnings: [] });
    store.saveProduct({ id: "p2", name: "B", basis: "100 ml", nutrients: {}, warnings: [] });
    const products = store.listProducts();
    assert.strictEqual(products.length, 2);
    assert.strictEqual(products[0].id, "p1");
    assert.strictEqual(products[1].id, "p2");
  });

  test("stores and retrieves a meal", () => {
    const store = createStorage();
    const meal = {
      id: "m1",
      date: "2025-01-15",
      name: "Desayuno",
      items: [
        { productId: "p1", quantity: 60, unit: "g" },
      ],
    };
    store.saveMeal(meal);
    const retrieved = store.getMeal("m1");
    assert.deepStrictEqual(retrieved, meal);
  });

  test("lists meals by date", () => {
    const store = createStorage();
    store.saveMeal({ id: "m1", date: "2025-01-15", name: "Desayuno", items: [] });
    store.saveMeal({ id: "m2", date: "2025-01-15", name: "Almuerzo", items: [] });
    store.saveMeal({ id: "m3", date: "2025-01-16", name: "Cena", items: [] });
    const meals = store.listMealsByDate("2025-01-15");
    assert.strictEqual(meals.length, 2);
    assert.strictEqual(meals[0].id, "m1");
    assert.strictEqual(meals[1].id, "m2");
  });

  test("stores and retrieves objectives", () => {
    const store = createStorage();
    const objectives = [
      { nutrient: "energy", type: "max", value: 2000, unit: "kcal", period: "daily" },
      { nutrient: "fat", type: "max", value: 70, unit: "g", period: "daily" },
    ];
    store.saveObjectives(objectives);
    const retrieved = store.getObjectives();
    assert.deepStrictEqual(retrieved, objectives);
  });

  test("stores and retrieves a profile", () => {
    const store = createStorage();
    const profile = {
      id: "prof1",
      name: "Mi perfil",
      objectives: [
        { nutrient: "energy", type: "max", value: 2000, unit: "kcal", period: "daily" },
      ],
    };
    store.saveProfile(profile);
    const retrieved = store.getProfile("prof1");
    assert.deepStrictEqual(retrieved, profile);
  });

  test("lists all profiles", () => {
    const store = createStorage();
    store.saveProfile({ id: "prof1", name: "Perfil 1", objectives: [] });
    store.saveProfile({ id: "prof2", name: "Perfil 2", objectives: [] });
    const profiles = store.listProfiles();
    assert.strictEqual(profiles.length, 2);
  });

  test("deletes a product", () => {
    const store = createStorage();
    store.saveProduct({ id: "p1", name: "A", basis: "100 g", nutrients: {}, warnings: [] });
    store.deleteProduct("p1");
    assert.strictEqual(store.getProduct("p1"), undefined);
  });

  test("deletes a meal", () => {
    const store = createStorage();
    store.saveMeal({ id: "m1", date: "2025-01-15", name: "Desayuno", items: [] });
    store.deleteMeal("m1");
    assert.strictEqual(store.getMeal("m1"), undefined);
  });

  test("deletes a profile", () => {
    const store = createStorage();
    store.saveProfile({ id: "prof1", name: "Perfil 1", objectives: [] });
    store.deleteProfile("prof1");
    assert.strictEqual(store.getProfile("prof1"), undefined);
  });
});