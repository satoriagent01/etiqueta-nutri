# Tests Documentation for etiqueta-nutri

This document describes the test structure, module signatures, and fixtures
for the backend developer (src/ implementation).

## Test Framework

- Node 24, ES modules (`"type": "module"` in package.json)
- `node:test` with `assert/strict`
- No external dependencies
- No network calls (all AI/OCR is mocked via injectable adapters)

## Module Signatures (src/)

### 1. src/nutrient-normalizer.js

```js
// Maps multilingual labels to canonical internal keys
export function normalizeLabel(label)

// Parses a raw string value into a number (handles comma decimals, "<0.1", etc.)
export function parseValue(rawValue)

// Converts kJ to kcal or kcal to kJ (factor 4.184)
export function convertEnergy(value, fromUnit, toUnit)

// Converts salt to sodium (salt / 2.5) or sodium to salt (sodium * 2.5)
export function convertSaltSodium(value, fromUnit, toUnit)

// Returns the canonical unit for a nutrient
export function getCanonicalUnit(nutrientKey)

// Maps multilingual aliases to canonical keys
// e.g. "Energie" → "energy", "Gras" → "fat", "Salz" → "salt"
export const LABEL_ALIASES = {
  // DE
  "energie": "energy", "fett": "fat", "davon gesättigte fettsäuren": "saturated_fat",
  "kohlenhydrate": "carbohydrates", "davon zucker": "sugars", "ballaststoffe": "fiber",
  "eiweiß": "protein", "salz": "salt",
  // FR
  "énergie": "energy", "matières grasses": "fat", "dont acides gras saturés": "saturated_fat",
  "glucides": "carbohydrates", "dont sucres": "sugars", "fibres alimentaires": "fiber",
  "protéines": "protein", "sel": "salt",
  // NL
  "energie": "energy", "vetten": "fat", "waarvan verzadigde vetzuren": "saturated_fat",
  "koolhydraten": "carbohydrates", "waarvan suikers": "sugars", "vezels": "fiber",
  "eiwitten": "protein", "zout": "salt",
  // IT
  "energia": "energy", "grassi": "fat", "di cui acidi grassi saturi": "saturated_fat",
  "carboidrati": "carbohydrates", "di cui zuccheri": "sugars", "fibre": "fiber",
  "proteine": "protein", "sale": "salt",
  // EN
  "energy": "energy", "fat": "fat", "of which saturates": "saturated_fat",
  "carbohydrates": "carbohydrates", "of which sugars": "sugars", "fibre": "fiber",
  "protein": "protein", "salt": "salt",
  // ES
  "energía": "energy", "grasa": "fat", "grasas saturadas": "saturated_fat",
  "hidratos de carbono": "carbohydrates", "azúcares": "sugars", "fibra": "fiber",
  "proteínas": "protein", "sal": "salt",
}
```

### 2. src/nutrition-parser.js

```js
// Parses OCR output into a structured product
// input: { language, basis, serving, rows, warnings } from OCR adapter
// output: { id, name, basisUnit, basisValues, servingValues, warnings, pendingCorrections }
export function parseNutritionData(ocrResult)

// Selects the correct column value (per 100g/ml or per serving)
// Returns { value, unit, column }
export function selectColumnValue(row, basisUnit, serving)

// Detects serving size from OCR text
export function detectServing(ocrResult)
```

### 3. src/validator.js

```js
// Validates a product's nutrition data
// Returns { valid: boolean, warnings: string[], pendingCorrections: string[] }
export function validateProduct(product)

// Checks if a value is within tolerance (for kJ/kcal consistency)
export function withinTolerance(actual, expected, tolerancePercent)
```

### 4. src/objectives.js

```js
// Creates an objective
// { nutrient, type: "max"|"min"|"range", value, rangeEnd?, period: "daily" }
export function createObjective(objectiveDef)

// Creates a profile (set of objectives)
export function createProfile(id, objectives)

// Calculates daily status given consumed nutrients
// Returns { status: "within"|"exceeded"|"missing", details: Map<nutrient, status> }
export function calculateDailyStatus(profile, consumedNutrients)
```

### 5. src/planner.js

```js
// Adds an item to a meal
// { productId, quantity, unit: "g"|"ml" }
export function addMealItem(meal, item)

// Calculates meal totals (scaled by quantity)
// Returns { nutrients: Map<nutrient, { value, unit }>, incomplete: boolean }
export function calculateMealTotals(meal, products)

// Calculates daily totals from meals
export function calculateDailyTotals(meals, products)

// Checks if a nutrient value is missing (incomplete ≠ 0)
export function isNutrientMissing(nutrientValue)
```

### 6. src/storage.js

```js
// Creates an in-memory storage adapter
export function createStorage()

// CRUD operations
export function storageAddProduct(storage, product)
export function storageGetProduct(storage, id)
export function storageAddMeal(storage, meal)
export function storageGetMeal(storage, id)
export function storageAddObjective(storage, objective)
export function storageGetProfile(storage, profileId)
```

### 7. server.js (top-level)

```js
// HTTP server that:
// - Serves static files from public/
// - Handles POST /api/extract with OCR adapter
// - Returns "OCR no disponible" if no AI key is set
// - Runs on port 3000 by default
```

## Fixtures (tests/fixtures.js)

Three OCR adapter outputs based on the shared photos:

### Schär Waffle (Photo 1)
- Language: multilingual (DE primary)
- Basis: 100 g
- Serving: 30 g (1 Melto)
- Rows: energy, fat, saturated fat, carbohydrates, sugars, fiber, protein, salt
- Values in kJ and kcal columns

### Juice Bottle (Photo 2)
- Language: NL
- Basis: 100 ml
- Serving: 200 ml (glas)
- Rows: energy, fat, saturated fat, carbohydrates, sugars, fiber, protein, salt, vitamin C
- Values in kJ and kcal columns

### Oil Spray (Photo 3)
- Language: NL
- Basis: 100 ml
- Serving: null (no serving size on label)
- Rows: energy, fat, saturated fat, carbohydrates, sugars, protein
- Values in kJ and kcal columns

## Test Files

| File | Module | What it checks |
|------|--------|----------------|
| `tests/nutrient-normalizer.test.js` | `src/nutrient-normalizer.js` | Label aliasing, value parsing, unit conversion, decimal handling |
| `tests/nutrition-parser.test.js` | `src/nutrition-parser.js` | OCR parsing, column selection, serving detection |
| `tests/validator.test.js` | `src/validator.js` | Validation rules, tolerance checks, pending corrections |
| `tests/objectives.test.js` | `src/objectives.js` | Objective creation, profile management, daily status |
| `tests/planner.test.js` | `src/planner.js` | Meal items, scaling, totals, incomplete detection |
| `tests/storage.test.js` | `src/storage.js` | CRUD operations on in-memory storage |
| `tests/server.test.js` | `server.js` | HTTP server, OCR endpoint, unavailable OCR response |

## Acceptance Criteria References

- REQ-001 to REQ-010: Multilingual nutrition label parsing
- REQ-011 to REQ-015: Unit conversion and normalization
- REQ-016 to REQ-020: Validation and pending corrections
- REQ-021 to REQ-025: Objectives and profiles
- REQ-026 to REQ-030: Meal planning and scaling
- REQ-031 to REQ-035: Storage and server