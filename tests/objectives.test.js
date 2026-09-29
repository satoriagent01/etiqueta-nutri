import { test, describe } from "node:test";
import assert from "node:assert/strict";
import {
  createObjective,
  createProfile,
  addObjective,
  removeObjective,
  getProfile,
  calculateDailyStatus,
  addIntake,
} from "../src/objectives.js";

describe("createObjective", () => {
  test("creates a max objective for energy (kcal)", () => {
    const obj = createObjective({
      id: "obj-energy",
      nutrient: "energy_kcal",
      type: "max",
      value: 2000,
      period: "daily",
    });
    assert.equal(obj.id, "obj-energy");
    assert.equal(obj.nutrient, "energy_kcal");
    assert.equal(obj.type, "max");
    assert.equal(obj.value, 2000);
    assert.equal(obj.period, "daily");
  });

  test("creates a min objective for fiber", () => {
    const obj = createObjective({
      id: "obj-fiber",
      nutrient: "fiber",
      type: "min",
      value: 25,
      period: "daily",
    });
    assert.equal(obj.type, "min");
    assert.equal(obj.value, 25);
  });

  test("creates a range objective for sodium", () => {
    const obj = createObjective({
      id: "obj-sodium",
      nutrient: "sodium",
      type: "range",
      min: 1500,
      max: 2300,
      period: "daily",
    });
    assert.equal(obj.type, "range");
    assert.equal(obj.min, 1500);
    assert.equal(obj.max, 2300);
  });
});

describe("createProfile", () => {
  test("creates an empty profile", () => {
    const profile = createProfile({ id: "profile-1", name: "Test Profile" });
    assert.equal(profile.id, "profile-1");
    assert.equal(profile.name, "Test Profile");
    assert.equal(profile.objectives.length, 0);
  });
});

describe("addObjective / removeObjective", () => {
  test("adds an objective to a profile", () => {
    const profile = createProfile({ id: "p1", name: "P1" });
    const obj = createObjective({
      id: "obj1",
      nutrient: "energy_kcal",
      type: "max",
      value: 2000,
      period: "daily",
    });
    addObjective(profile, obj);
    assert.equal(profile.objectives.length, 1);
    assert.strictEqual(profile.objectives[0], obj);
  });

  test("removes an objective from a profile", () => {
    const profile = createProfile({ id: "p2", name: "P2" });
    const obj = createObjective({
      id: "obj2",
      nutrient: "fat",
      type: "max",
      value: 70,
      period: "daily",
    });
    addObjective(profile, obj);
    removeObjective(profile, "obj2");
    assert.equal(profile.objectives.length, 0);
  });

  test("removeObjective throws if id not found", () => {
    const profile = createProfile({ id: "p3", name: "P3" });
    assert.throws(() => removeObjective(profile, "nonexistent"), {
      message: /Objective not found/,
    });
  });
});

describe("getProfile", () => {
  test("returns the profile by id", () => {
    const profile = createProfile({ id: "p4", name: "P4" });
    const found = getProfile(profile.id);
    assert.strictEqual(found, profile);
  });

  test("returns null if profile not found", () => {
    const found = getProfile("nonexistent");
    assert.equal(found, null);
  });
});

describe("calculateDailyStatus", () => {
  test("returns 'within' when all objectives are met (max type)", () => {
    const profile = createProfile({ id: "p5", name: "P5" });
    const obj = createObjective({
      id: "obj-energy",
      nutrient: "energy_kcal",
      type: "max",
      value: 2000,
      period: "daily",
    });
    addObjective(profile, obj);

    const status = calculateDailyStatus(profile, {
      "energy_kcal": 1500,
    });

    assert.equal(status["energy_kcal"], "within");
  });

  test("returns 'exceeded' when max objective is exceeded", () => {
    const profile = createProfile({ id: "p6", name: "P6" });
    const obj = createObjective({
      id: "obj-energy",
      nutrient: "energy_kcal",
      type: "max",
      value: 2000,
      period: "daily",
    });
    addObjective(profile, obj);

    const status = calculateDailyStatus(profile, {
      "energy_kcal": 2500,
    });

    assert.equal(status["energy_kcal"], "exceeded");
  });

  test("returns 'within' when min objective is met", () => {
    const profile = createProfile({ id: "p7", name: "P7" });
    const obj = createObjective({
      id: "obj-fiber",
      nutrient: "fiber",
      type: "min",
      value: 25,
      period: "daily",
    });
    addObjective(profile, obj);

    const status = calculateDailyStatus(profile, {
      "fiber": 30,
    });

    assert.equal(status["fiber"], "within");
  });

  test("returns 'missing' when min objective is not met", () => {
    const profile = createProfile({ id: "p8", name: "P8" });
    const obj = createObjective({
      id: "obj-fiber",
      nutrient: "fiber",
      type: "min",
      value: 25,
      period: "daily",
    });
    addObjective(profile, obj);

    const status = calculateDailyStatus(profile, {
      "fiber": 10,
    });

    assert.equal(status["fiber"], "missing");
  });

  test("returns 'within' for range objective within bounds", () => {
    const profile = createProfile({ id: "p9", name: "P9" });
    const obj = createObjective({
      id: "obj-sodium",
      nutrient: "sodium",
      type: "range",
      min: 1500,
      max: 2300,
      period: "daily",
    });
    addObjective(profile, obj);

    const status = calculateDailyStatus(profile, {
      "sodium": 2000,
    });

    assert.equal(status["sodium"], "within");
  });

  test("returns 'exceeded' for range objective above max", () => {
    const profile = createProfile({ id: "p10", name: "P10" });
    const obj = createObjective({
      id: "obj-sodium",
      nutrient: "sodium",
      type: "range",
      min: 1500,
      max: 2300,
      period: "daily",
    });
    addObjective(profile, obj);

    const status = calculateDailyStatus(profile, {
      "sodium": 3000,
    });

    assert.equal(status["sodium"], "exceeded");
  });

  test("returns 'missing' for range objective below min", () => {
    const profile = createProfile({ id: "p11", name: "P11" });
    const obj = createObjective({
      id: "obj-sodium",
      nutrient: "sodium",
      type: "range",
      min: 1500,
      max: 2300,
      period: "daily",
    });
    addObjective(profile, obj);

    const status = calculateDailyStatus(profile, {
      "sodium": 1000,
    });

    assert.equal(status["sodium"], "missing");
  });

  test("returns 'missing' when nutrient is not provided", () => {
    const profile = createProfile({ id: "p12", name: "P12" });
    const obj = createObjective({
      id: "obj-fiber",
      nutrient: "fiber",
      type: "min",
      value: 25,
      period: "daily",
    });
    addObjective(profile, obj);

    const status = calculateDailyStatus(profile, {
      "energy_kcal": 1500,
    });

    assert.equal(status["fiber"], "missing");
  });

  test("returns 'within' when nutrient is provided but not in objectives", () => {
    const profile = createProfile({ id: "p13", name: "P13" });
    const status = calculateDailyStatus(profile, {
      "energy_kcal": 1500,
    });

    assert.equal(status["energy_kcal"], "within");
  });
});

describe("addIntake", () => {
  test("adds intake to a profile's daily log", () => {
    const profile = createProfile({ id: "p14", name: "P14" });
    const obj = createObjective({
      id: "obj-energy",
      nutrient: "energy_kcal",
      type: "max",
      value: 2000,
      period: "daily",
    });
    addObjective(profile, obj);

    addIntake(profile, "2024-01-01", { "energy_kcal": 1500 });

    const dayLog = profile.dailyLogs["2024-01-01"];
    assert.equal(dayLog["energy_kcal"], 1500);
  });

  test("accumulates intake across multiple calls", () => {
    const profile = createProfile({ id: "p15", name: "P15" });
    const obj = createObjective({
      id: "obj-energy",
      nutrient: "energy_kcal",
      type: "max",
      value: 2000,
      period: "daily",
    });
    addObjective(profile, obj);

    addIntake(profile, "2024-01-01", { "energy_kcal": 800 });
    addIntake(profile, "2024-01-01", { "energy_kcal": 900 });

    const dayLog = profile.dailyLogs["2024-01-01"];
    assert.equal(dayLog["energy_kcal"], 1700);
  });
});