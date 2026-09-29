# Etiqueta Nutri — Product Specification

## 1. Overview

A free, ad-free mobile-friendly web app that lets users photograph nutrition labels on food products, extract the nutritional information using AI OCR, review and correct the extracted data, save products to a library, set custom mixed-nutrient objectives, and plan meals by specifying grams (or ml) of each product to get daily nutrient totals.

- **Stack**: JavaScript (Node 24), ES modules, no framework, no build step.
- **Logic**: Pure deterministic functions in `src/`.
- **UI**: Static files in `public/`, served by a local HTTP server (`server.js`).
- **Tests**: `node:test` (run via `npm test`).
- **OCR**: AI-powered behind an injectable adapter. Tests mock the adapter; no network calls in tests.
- **Storage**: Local storage via an injectable adapter.

## 2. Data Model

### 2.1 Nutrient

A nutrient is a key-value entry:

```js
{
  key: string,        // internal key, e.g. "energy", "fat", "saturatedFat", "salt", "sodium", "vitaminC"
  label: string,      // display label, e.g. "Energy", "Fat", "Saturated Fat", "Salt", "Sodium", "Vitamin C"
  unit: string,       // e.g. "kJ", "kcal", "g", "mg", "µg", "IU", "%"
  value: number,      // numeric value
  confidence: number  // 0..1, from OCR
}
```

### 2.2 Product

```js
{
  id: string,           // unique identifier
  name: string,         // product name
  brand?: string,       // optional brand
  basis: "100g" | "100ml", // reference basis
  density?: number,     // optional density in g/ml (user-provided if needed)
  serving?: {           // optional serving info
    amount: number,     // e.g. 30 (grams) or 200 (ml)
    unit: "g" | "ml",
    label?: string      // e.g. "1 Melto", "1 glass"
  },
  nutrients: Nutrient[] // nutrients per basis (100g or 100ml)
}
```

**Rules**:
- Nutrients are stored per 100g or per 100ml.
- Never treat ml as g without a user-provided density.
- If a nutrient is missing or illegible, it is marked as `"pending"` (not 0).

### 2.3 Objective

```js
{
  id: string,
  nutrientKey: string,  // e.g. "energy", "salt", "saturatedFat"
  type: "max" | "min" | "range",
  value: number,        // target value
  unit: string,         // same unit as the nutrient
  period: "daily"       // currently only daily
}
```

### 2.4 Objective Profile

```js
{
  id: string,
  name: string,         // e.g. "Heart Health", "Weight Loss"
  objectives: Objective[]
}
```

### 2.5 Planner Item

```js
{
  productId: string,
  quantity: number,     // grams or ml
  unit: "g" | "ml"
}
```

### 2.6 Meal / Day

```js
{
  id: string,
  date: string,         // ISO date "YYYY-MM-DD"
  name: string,         // e.g. "Breakfast", "Lunch"
  items: PlannerItem[]
}
```

## 3. OCR Adapter Contract

The AI OCR adapter is injectable. Its interface:

```js
/**
 * @param {Blob|File} image - The photo of the nutrition label.
 * @returns {Promise<{
 *   language: string,       // e.g. "de", "nl", "en"
 *   basis: "100g" | "100ml",
 *   serving: { amount: number, unit: "g" | "ml", label?: string } | null,
 *   rows: Array<{
 *     label: string,        // raw label text from OCR, e.g. "Energie", "Fett"
 *     rawText: string,      // raw text for the value, e.g. "2292 kJ", "33 g"
 *     value: number | null, // parsed numeric value, null if unparseable
 *     unit: string,         // e.g. "kJ", "g"
 *     confidence: number    // 0..1
 *   }>,
 *   warnings: string[]      // e.g. ["image blurry", "text partially occluded"]
 * }>}
 */
async function extract(image) { ... }
```

### Example OCR Output (Photo 1 — Schär, German/French/Dutch/Italian)

```json
{
  "language": "de",
  "basis": "100g",
  "serving": { "amount": 30, "unit": "g", "label": "1 Melto" },
  "rows": [
    { "label": "Energie", "rawText": "2292 kJ / 549 kcal", "value": 2292, "unit": "kJ", "confidence": 0.95 },
    { "label": "Fett", "rawText": "33 g", "value": 33, "unit": "g", "confidence": 0.98 },
    { "label": "davon gesättigte Fettsäuren", "rawText": "13 g", "value": 13, "unit": "g", "confidence": 0.92 },
    { "label": "Kohlenhydrate", "rawText": "55 g", "value": 55, "unit": "g", "confidence": 0.97 },
    { "label": "davon Zucker", "rawText": "45 g", "value": 45, "unit": "g", "confidence": 0.96 },
    { "label": "Ballaststoffe", "rawText": "2,4 g", "value": 2.4, "unit": "g", "confidence": 0.90 },
    { "label": "Eiweiß", "rawText": "6,8 g", "value": 6.8, "unit": "g", "confidence": 0.94 },
    { "label": "Salz", "rawText": "0,18 g", "value": 0.18, "unit": "g", "confidence": 0.93 }
  ],
  "warnings": []
}
```

### Example OCR Output (Photo 2 — Jugo, Dutch, per 100 ml and per glass 200 ml)

```json
{
  "language": "nl",
  "basis": "100ml",
  "serving": { "amount": 200, "unit": "ml", "label": "glas" },
  "rows": [
    { "label": "energie", "rawText": "199 kJ / 47 kcal", "value": 199, "unit": "kJ", "confidence": 0.93 },
    { "label": "vetten", "rawText": "0 g", "value": 0, "unit": "g", "confidence": 0.97 },
    { "label": "waarvan verzadigde vetzuren", "rawText": "0 g", "value": 0, "unit": "g", "confidence": 0.95 },
    { "label": "koolhydraten", "rawText": "11 g", "value": 11, "unit": "g", "confidence": 0.96 },
    { "label": "waarvan suikers", "rawText": "10 g", "value": 10, "unit": "g", "confidence": 0.94 },
    { "label": "vezels", "rawText": "0,7 g", "value": 0.7, "unit": "g", "confidence": 0.88 },
    { "label": "eiwitten", "rawText": "0,4 g", "value": 0.4, "unit": "g", "confidence": 0.91 },
    { "label": "zout", "rawText": "0 g", "value": 0, "unit": "g", "confidence": 0.96 },
    { "label": "vitamine C", "rawText": "26%", "value": 26, "unit": "%", "confidence": 0.85 }
  ],
  "warnings": ["text on curved surface"]
}
```

### Example OCR Output (Photo 3 — Spray de aceite, Dutch, rotated, per 100 ml)

```json
{
  "language": "nl",
  "basis": "100ml",
  "serving": null,
  "rows": [
    { "label": "energie", "rawText": "3404 kJ / 828 kcal", "value": 3404, "unit": "kJ", "confidence": 0.82 },
    { "label": "vetten", "rawText": "92 g", "value": 92, "unit": "g", "confidence": 0.88 },
    { "label": "waarvan verzadigde vetzuren", "rawText": "14 g", "value": 14, "unit": "g", "confidence": 0.80 },
    { "label": "koolhydraten", "rawText": "0 g", "value": 0, "unit": "g", "confidence": 0.90 },
    { "label": "waarvan suikers", "rawText": "0 g", "value": 0, "unit": "g", "confidence": 0.90 },
    { "label": "vezels", "rawText": "0 g", "value": 0, "unit": "g", "confidence": 0.85 },
    { "label": "eiwitten", "rawText": "0 g", "value": 0, "unit": "g", "confidence": 0.87 },
    { "label": "zout", "rawText": "0 g", "value": 0, "unit": "g", "confidence": 0.89 },
    { "label": "vitamine E", "rawText": "150%", "value": 150, "unit": "%", "confidence": 0.78 }
  ],
  "warnings": ["image rotated", "text on curved surface"]
}
```

## 4. Deterministic Parsing & Normalization

### 4.1 Multilingual Alias Mapping

Map common language variants to internal keys:

| Internal Key       | DE                  | FR                  | NL                  | IT                  | EN              | ES              |
|--------------------|---------------------|---------------------|---------------------|---------------------|-----------------|-----------------|
| `energy`           | Energie             | Énergie             | Energie             | Energia             | Energy          | Energía         |
| `fat`              | Fett                | Matières grasses    | Vetten              | Grassi              | Fat             | Gras            |
| `saturatedFat`     | Gesättigte Fettsäuren| Acides gras saturés | Verzadigde vetzuren | Acidi grassi saturi | Saturated Fat   | Gras saturado   |
| `carbohydrates`    | Kohlenhydrate       | Glucides            | Koolhydraten        | Carboidrati         | Carbohydrates   | Hidratos de carbono |
| `sugars`           | Zucker              | Sucres              | Suikers             | Zuccheri            | Sugars          | Azúcares        |
| `fiber`            | Ballaststoffe       | Fibres              | Vezels              | Fibre               | Fiber           | Fibra           |
| `protein`          | Eiweiß              | Protéines           | Eiwitten            | Proteine            | Protein         | Proteínas       |
| `salt`             | Salz                | Sel                 | Zout                | Sale                | Salt            | Sal             |
| `sodium`           | Natrium             | Sodium              | Natrium             | Sodio               | Sodium          | Sodio           |

### 4.2 Unit Conversions

- **kJ ↔ kcal**: 1 kcal = 4.184 kJ. Tolerance: ±2%.
- **Salt ↔ Sodium**: sodium = salt / 2.5.
- **Decimal comma**: "2,4 g" → 2.4.

### 4.3 Validation Rules

- If `saturatedFat > fat` → warning, mark as "pending correction".
- If `sugars > carbohydrates` → warning, mark as "pending correction".
- If `kcal` and `kJ` are both present and differ by more than 2% (after conversion) → warning.
- If a value is `<0,1` or `<0.1`, treat as 0 with a note.
- Illegible values (confidence < 0.5 or parse failure) → "pending correction".

## 5. User Interface

### 5.1 Screens

1. **Capture**: User takes or uploads a photo of the nutrition label.
2. **Review**: Shows extracted nutrients in a table. User can correct values, add missing nutrients, or mark as pending.
3. **Library**: List of saved products. User can view details, edit, or delete.
4. **Objectives**: User sets custom objectives (nutrient, type, value, period).
5. **Planner**: User creates meals with items (product + quantity in g or ml). Shows daily totals and objective status.

### 5.2 Navigation

Simple tab-based navigation between screens.

## 6. Storage

- Local storage via an injectable adapter.
- Default adapter uses `localStorage` (or IndexedDB for larger data).
- Tests provide a mock adapter.

## 7. Server

- Minimal Node HTTP server (`server.js`) serves `public/` and proxies `POST /api/extract` to the AI OCR endpoint.
- AI key is stored in an environment variable, never exposed to the client.
- If no AI key is configured, the UI shows "OCR no disponible" and allows manual entry.

## 8. Acceptance Criteria

### REQ-1: Capture Nutrition Label Photo

- The user can take a photo using the device camera or upload an image file.
- The app accepts common image formats (JPEG, PNG).
- **Fixture**: Photo 1 (Schär), Photo 2 (Jugo), Photo 3 (Spray de aceite).

### REQ-2: OCR Extraction

- The app sends the photo to the AI OCR adapter.
- The adapter returns structured data: language, basis, serving, rows with label, value, unit, confidence, and warnings.
- If OCR is unavailable (no AI key or network failure), the user is prompted to enter data manually.
- **Fixture**: Use the JSON examples in Section 3 for each photo.

### REQ-3: Review and Correct

- The app displays extracted nutrients in a table.
- The user can edit any value, change the unit, or mark a nutrient as "pending correction".
- The app validates consistency (e.g., saturatedFat ≤ fat, sugars ≤ carbohydrates).
- Inconsistent or illegible values are flagged and require user confirmation before saving.
- **Fixture**: Photo 1 — correct "2,4 g" fiber value; Photo 2 — confirm "0 g" salt.

### REQ-4: Save Product

- The user can save a product with its name, brand, basis (100g/100ml), serving info, and nutrients.
- The product is stored locally and appears in the Library.
- **Fixture**: Save Schär product with basis "100g", serving "30 g (1 Melto)".

### REQ-5: Product Library

- The user can view a list of saved products.
- The user can view product details, edit, or delete.
- **Fixture**: List should include Schär, Jugo, and Spray de aceite products.

### REQ-6: Custom Objectives

- The user can create objectives for any nutrient (from the catalog or custom).
- Objectives have a type (max, min, range), value, and unit.
- The user can create multiple objective profiles (e.g., "Heart Health", "Weight Loss").
- **Fixture**: Create objective "Salt ≤ 2 g daily".

### REQ-7: Meal Planner

- The user creates meals with items (product + quantity in g or ml).
- The app calculates nutrient totals for each meal and daily aggregate.
- Nutrients not present in any item are marked as "incomplete", not 0.
- The app shows objective status (within, exceeded, missing) for each day.
- **Fixture**: Create a meal with Schär (50 g) and Jugo (200 ml). Show daily totals.

### REQ-8: Multilingual Support

- The app handles nutrition labels in DE, FR, NL, IT, EN, ES.
- The alias mapping correctly identifies nutrients regardless of language.
- **Fixture**: Photo 1 (DE/FR/NL/IT), Photo 2 (NL), Photo 3 (NL).

### REQ-9: Unit Handling

- The app correctly handles kJ and kcal, converting between them with ±2% tolerance.
- The app correctly converts salt to sodium (salt / 2.5) if both are tracked.
- The app distinguishes between 100g and 100ml bases.
- **Fixture**: Photo 1 — convert 2292 kJ to kcal; Photo 2 — handle 100ml basis.

### REQ-10: Illegible or Missing Data

- If OCR confidence is low or parsing fails, the value is marked "pending correction".
- The user must review and confirm before saving.
- The app never assumes missing values as 0.
- **Fixture**: Photo 3 — low confidence on "vitamina E" due to rotation.

### REQ-11: Free and Ad-Free

- The app is free to use with no advertisements.
- The AI OCR cost is borne by the developer (not passed to the user).

### REQ-12: Local Storage

- All data (products, objectives, meals) is stored locally on the user's device.
- No data is sent to any server except the AI OCR endpoint (which is optional).

## 9. Out of Scope / Open Questions

- **AI Cost**: The cost of AI OCR calls is not passed to the user. The developer must cover this. How this scales with usage is an open question.
- **User Validation**: The first version should be validated with a small group of users who track mixed nutrient objectives.
- **Offline AI**: Currently, AI OCR requires an internet connection. Offline OCR is out of scope for v1.
- **Barcode Scanning**: Not included in v1. Only photo-based OCR.

## 10. Modules and Their Exports

### `src/nutrient-aliases.js`
- `const ALIASES`: Map of language → { label: internalKey }
- `function normalizeLabel(label, language)`: Returns internal key or null.

### `src/unit-conversions.js`
- `function kJToKcal(kJ)`: Returns kcal.
- `function kcalToKJ(kcal)`: Returns kJ.
- `function saltToSodium(salt)`: Returns sodium in same unit.
- `function sodiumToSalt(sodium)`: Returns salt.
- `function normalizeDecimal(str)`: Converts "2,4" to 2.4.

### `src/parse-ocr.js`
- `function parseOCR(ocrResult, aliases)`: Returns `{ nutrients, warnings, pending }`.
- `function validateNutrients(nutrients)`: Returns validation warnings.

### `src/product-model.js`
- `function createProduct(name, brand, basis, serving, nutrients)`: Returns Product.
- `function scaleProduct(product, amount, unit)`: Returns nutrients for given amount.
- `function getProductNutrients(product, amount, unit)`: Returns nutrient values.

### `src/objectives.js`
- `function createObjective(nutrientKey, type, value, unit)`: Returns Objective.
- `function createProfile(name, objectives)`: Returns ObjectiveProfile.
- `function calculateDailyStatus(profile, dailyNutrients)`: Returns status map.

### `src/planner.js`
- `function createMeal(date, name, items)`: Returns Meal.
- `function calculateMealTotals(meal, productLibrary)`: Returns nutrient totals.
- `function calculateDailyTotals(dayMeals, productLibrary)`: Returns daily totals.
- `function getIncompleteNutrients(dailyTotals, allNutrients)`: Returns list of incomplete nutrients.

### `src/storage-adapter.js`
- `interface StorageAdapter`: `get(key)`, `set(key, value)`, `remove(key)`, `getAll()`, `save(product)`, `getProduct(id)`, `deleteProduct(id)`, `saveObjective(profile)`, `getObjectives()`, `saveMeal(meal)`, `getMeals()`, `deleteMeal(id)`.

### `src/ocr-adapter.js`
- `interface OCRAdapter`: `extract(image)`: Promise<OCRResult>.

## 11. UI Screens

1. **Capture Screen**: Button to take photo or upload. Calls `ocrAdapter.extract()`.
2. **Review Screen**: Displays extracted nutrients. Allows editing. Calls `parseOCR()` and `validateNutrients()`.
3. **Library Screen**: Lists products. Calls `storageAdapter.getAll()`, `storageAdapter.save()`, `storageAdapter.delete()`.
4. **Objectives Screen**: Manages objectives. Calls `objectives.createObjective()`, `objectives.createProfile()`, `storageAdapter.saveObjective()`.
5. **Planner Screen**: Creates meals. Calls `planner.createMeal()`, `planner.calculateMealTotals()`, `planner.calculateDailyTotals()`, `objectives.calculateDailyStatus()`.