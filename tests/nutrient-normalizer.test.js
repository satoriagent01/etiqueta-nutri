import { test, describe } from "node:test";
import assert from "node:assert/strict";
import {
  normalizeLabel,
  parseValue,
  convertKjToKcal,
  convertKcalToKj,
  convertSaltToSodium,
  convertSodiumToSalt,
  normalizeUnit,
  isPercentRI,
  getBaseValue,
} from "../src/nutrient-normalizer.js";

describe("normalizeLabel", () => {
  test("maps DE 'Energie' to 'energy'", () => {
    assert.strictEqual(normalizeLabel("Energie"), "energy");
  });

  test("maps FR 'Énergie' to 'energy'", () => {
    assert.strictEqual(normalizeLabel("Énergie"), "energy");
  });

  test("maps NL 'Energie' to 'energy'", () => {
    assert.strictEqual(normalizeLabel("Energie"), "energy");
  });

  test("maps IT 'Energia' to 'energy'", () => {
    assert.strictEqual(normalizeLabel("Energia"), "energy");
  });

  test("maps EN 'Energy' to 'energy'", () => {
    assert.strictEqual(normalizeLabel("Energy"), "energy");
  });

  test("maps ES 'Energía' to 'energy'", () => {
    assert.strictEqual(normalizeLabel("Energía"), "energy");
  });

  test("maps DE 'Fett' to 'fat'", () => {
    assert.strictEqual(normalizeLabel("Fett"), "fat");
  });

  test("maps DE 'davon gesättigte Fettsäuren' to 'saturatedFat'", () => {
    assert.strictEqual(normalizeLabel("davon gesättigte Fettsäuren"), "saturatedFat");
  });

  test("maps DE 'Kohlenhydrate' to 'carbs'", () => {
    assert.strictEqual(normalizeLabel("Kohlenhydrate"), "carbs");
  });

  test("maps DE 'davon Zucker' to 'sugars'", () => {
    assert.strictEqual(normalizeLabel("davon Zucker"), "sugars");
  });

  test("maps DE 'Ballaststoffe' to 'fiber'", () => {
    assert.strictEqual(normalizeLabel("Ballaststoffe"), "fiber");
  });

  test("maps DE 'Eiweiß' to 'protein'", () => {
    assert.strictEqual(normalizeLabel("Eiweiß"), "protein");
  });

  test("maps DE 'Salz' to 'salt'", () => {
    assert.strictEqual(normalizeLabel("Salz"), "salt");
  });

  test("maps NL 'zout' to 'salt'", () => {
    assert.strictEqual(normalizeLabel("zout"), "salt");
  });

  test("maps FR 'protéines' to 'protein'", () => {
    assert.strictEqual(normalizeLabel("protéines"), "protein");
  });

  test("maps IT 'proteine' to 'protein'", () => {
    assert.strictEqual(normalizeLabel("proteine"), "protein");
  });

  test("maps ES 'proteínas' to 'protein'", () => {
    assert.strictEqual(normalizeLabel("proteínas"), "protein");
  });

  test("maps DE 'Vitamine C' to 'vitaminC'", () => {
    assert.strictEqual(normalizeLabel("Vitamine C"), "vitaminC");
  });

  test("maps EN 'Vitamin C' to 'vitaminC'", () => {
    assert.strictEqual(normalizeLabel("Vitamin C"), "vitaminC");
  });

  test("unknown label returns lowercase trimmed", () => {
    assert.strictEqual(normalizeLabel("Caffeine"), "caffeine");
  });

  test("handles empty string", () => {
    assert.strictEqual(normalizeLabel(""), "");
  });
});

describe("parseValue", () => {
  test("parses integer '2292'", () => {
    assert.strictEqual(parseValue("2292"), 2292);
  });

  test("parses decimal with comma '33,0'", () => {
    assert.strictEqual(parseValue("33,0"), 33);
  });

  test("parses decimal with dot '33.0'", () => {
    assert.strictEqual(parseValue("33.0"), 33);
  });

  test("parses '<0,1' as 0.1", () => {
    assert.strictEqual(parseValue("<0,1"), 0.1);
  });

  test("parses '<0.1' as 0.1", () => {
    assert.strictEqual(parseValue("<0.1"), 0.1);
  });

  test("parses '0,7' as 0.7", () => {
    assert.strictEqual(parseValue("0,7"), 0.7);
  });

  test("parses '0.7' as 0.7", () => {
    assert.strictEqual(parseValue("0.7"), 0.7);
  });

  test("returns null for empty string", () => {
    assert.strictEqual(parseValue(""), null);
  });

  test("returns null for non-numeric", () => {
    assert.strictEqual(parseValue("—"), null);
  });

  test("returns null for '—'", () => {
    assert.strictEqual(parseValue("—"), null);
  });
});

describe("convertKjToKcal", () => {
  test("converts 2292 kJ to kcal", () => {
    assert.strictEqual(convertKjToKcal(2292), 548);
  });

  test("converts 688 kJ to kcal", () => {
    assert.strictEqual(convertKjToKcal(688), 165);
  });

  test("converts 0 kJ to 0 kcal", () => {
    assert.strictEqual(convertKjToKcal(0), 0);
  });
});

describe("convertKcalToKj", () => {
  test("converts 549 kcal to kJ", () => {
    assert.strictEqual(convertKcalToKj(549), 2297);
  });

  test("converts 165 kcal to kJ", () => {
    assert.strictEqual(convertKcalToKj(165), 690);
  });
});

describe("convertSaltToSodium", () => {
  test("converts 0,18 g salt to sodium", () => {
    assert.strictEqual(convertSaltToSodium(0.18), 0.072);
  });

  test("converts 0 g salt to 0 sodium", () => {
    assert.strictEqual(convertSaltToSodium(0), 0);
  });
});

describe("convertSodiumToSalt", () => {
  test("converts 0.072 g sodium to salt", () => {
    assert.strictEqual(convertSodiumToSalt(0.072), 0.18);
  });
});

describe("normalizeUnit", () => {
  test("normalizes 'kJ' to 'kJ'", () => {
    assert.strictEqual(normalizeUnit("kJ"), "kJ");
  });

  test("normalizes 'kcal' to 'kcal'", () => {
    assert.strictEqual(normalizeUnit("kcal"), "kcal");
  });

  test("normalizes 'g' to 'g'", () => {
    assert.strictEqual(normalizeUnit("g"), "g");
  });

  test("normalizes 'mg' to 'mg'", () => {
    assert.strictEqual(normalizeUnit("mg"), "mg");
  });

  test("normalizes 'µg' to 'µg'", () => {
    assert.strictEqual(normalizeUnit("µg"), "µg");
  });

  test("normalizes 'μg' to 'µg'", () => {
    assert.strictEqual(normalizeUnit("μg"), "µg");
  });

  test("normalizes 'IU' to 'IU'", () => {
    assert.strictEqual(normalizeUnit("IU"), "IU");
  });

  test("normalizes 'ml' to 'ml'", () => {
    assert.strictEqual(normalizeUnit("ml"), "ml");
  });

  test("normalizes 'UI' to 'UI'", () => {
    assert.strictEqual(normalizeUnit("UI"), "UI");
  });
});

describe("isPercentRI", () => {
  test("returns true for '26%'", () => {
    assert.strictEqual(isPercentRI("26%"), true);
  });

  test("returns true for '8,0%'", () => {
    assert.strictEqual(isPercentRI("8,0%"), true);
  });

  test("returns false for '2292'", () => {
    assert.strictEqual(isPercentRI("2292"), false);
  });

  test("returns false for '33 g'", () => {
    assert.strictEqual(isPercentRI("33 g"), false);
  });
});

describe("getBaseValue", () => {
  test("returns value from per 100g column", () => {
    const row = {
      label: "energy",
      per100g: { value: 2292, unit: "kJ" },
      perServing: { value: 688, unit: "kJ" },
    };
    assert.strictEqual(getBaseValue(row, "per100g"), 2292);
  });

  test("returns value from per 100ml column", () => {
    const row = {
      label: "energy",
      per100ml: { value: 199, unit: "kJ" },
      perServing: { value: 399, unit: "kJ" },
    };
    assert.strictEqual(getBaseValue(row, "per100ml"), 199);
  });

  test("returns null if no base column", () => {
    const row = {
      label: "energy",
      perServing: { value: 688, unit: "kJ" },
    };
    assert.strictEqual(getBaseValue(row, "per100g"), null);
  });
});