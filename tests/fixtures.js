/**
 * Shared fixture data for tests.
 *
 * Each fixture represents the output of the OCR AI adapter (extract(image))
 * for one of the three photos shared by the user:
 *  1. Schär multilingual bar (DE/FR/NL/IT) – 100 g column + 30 g serving
 *  2. Dutch juice bottle – 100 ml column + 200 ml glass, includes Vitamina C
 *  3. Dutch oil spray – 100 ml column, rotated label
 *
 * These fixtures are used by the normalizer, parser, planner, and server tests.
 */

// ──────────────────────────────────────────────────────────────
// 1. Schär multilingual bar (Image 1)
// ──────────────────────────────────────────────────────────────
export const schaarOcrOutput = {
  language: 'de',
  basis: { amount: 100, unit: 'g' },
  serving: { amount: 30, unit: 'g', label: '1 Melto' },
  rows: [
    { label: 'Energie', rawText: 'Energie / énergie / energie / energia', value: 2292, unit: 'kJ', confidence: 0.95 },
    { label: 'Energie', rawText: '549 kcal', value: 549, unit: 'kcal', confidence: 0.95 },
    { label: 'Fett', rawText: 'Fett / matières grasses / vetten / grassi', value: 33, unit: 'g', confidence: 0.93 },
    { label: 'davon gesättigte Fettsäuren', rawText: 'davon gesättigte Fettsäuren / dont acides gras saturés / verzadigde vetzuren / acidi grassi saturi', value: 17, unit: 'g', confidence: 0.90 },
    { label: 'Kohlenhydrate', rawText: 'Kohlenhydrate / glucides / koolhydraten / carboidrati', value: 75, unit: 'g', confidence: 0.94 },
    { label: 'davon Zucker', rawText: 'davon Zucker / dont sucres / suikers / zuccheri', value: 1, unit: 'g', confidence: 0.92 },
    { label: 'Ballaststoffe', rawText: 'Ballaststoffe / fibres / vezestoffen / fibre', value: 7, unit: 'g', confidence: 0.88 },
    { label: 'Eiweiß', rawText: 'Eiweiß / protéines / eiwitten / proteine', value: 11, unit: 'g', confidence: 0.91 },
    { label: 'Salz', rawText: 'Salz / sel / zout / sale', value: 1.2, unit: 'g', confidence: 0.93 },
  ],
  warnings: ['sodium_not_present'],
};

export const schaarOCR = schaarOcrOutput;

// ──────────────────────────────────────────────────────────────
// 2. Dutch juice bottle (Image 2)
// ──────────────────────────────────────────────────────────────
export const juiceOcrOutput = {
  language: 'nl',
  basis: { amount: 100, unit: 'ml' },
  serving: { amount: 200, unit: 'ml', label: '1 glas' },
  rows: [
    { label: 'Energie', rawText: 'Energie', value: 199, unit: 'kJ', confidence: 0.96 },
    { label: 'Energie', rawText: '48 kcal', value: 48, unit: 'kcal', confidence: 0.96 },
    { label: 'Vetten', rawText: 'Vetten', value: 0.2, unit: 'g', confidence: 0.94 },
    { label: 'Waarvan verzadigd', rawText: 'Waarvan verzadigd', value: 0, unit: 'g', confidence: 0.90 },
    { label: 'Koolhydraten', rawText: 'Koolhydraten', value: 11, unit: 'g', confidence: 0.95 },
    { label: 'Waarvan suikers', rawText: 'Waarvan suikers', value: 11, unit: 'g', confidence: 0.93 },
    { label: 'Eiwitten', rawText: 'Eiwitten', value: 0.1, unit: 'g', confidence: 0.89 },
    { label: 'Zout', rawText: 'Zout', value: 0.01, unit: 'g', confidence: 0.91 },
    { label: 'Vitamine C', rawText: 'Vitamine C', value: 30, unit: 'mg', confidence: 0.85 },
  ],
  warnings: ['sodium_not_present'],
};

export const juiceOCR = juiceOcrOutput;

// ──────────────────────────────────────────────────────────────
// 3. Dutch oil spray (Image 3)
// ──────────────────────────────────────────────────────────────
export const sprayOcrOutput = {
  language: 'nl',
  basis: { amount: 100, unit: 'ml' },
  serving: { amount: 3, unit: 'g', label: '1 spray' },
  rows: [
    { label: 'Energie', rawText: 'Energie', value: 3700, unit: 'kJ', confidence: 0.97 },
    { label: 'Energie', rawText: '884 kcal', value: 884, unit: 'kcal', confidence: 0.97 },
    { label: 'Vetten', rawText: 'Vetten', value: 100, unit: 'g', confidence: 0.98 },
    { label: 'Waarvan verzadigd', rawText: 'Waarvan verzadigd', value: 14, unit: 'g', confidence: 0.92 },
    { label: 'Koolhydraten', rawText: 'Koolhydraten', value: 0, unit: 'g', confidence: 0.95 },
    { label: 'Waarvan suikers', rawText: 'Waarvan suikers', value: 0, unit: 'g', confidence: 0.94 },
    { label: 'Eiwitten', rawText: 'Eiwitten', value: 0, unit: 'g', confidence: 0.90 },
    { label: 'Zout', rawText: 'Zout', value: 0, unit: 'g', confidence: 0.93 },
  ],
  warnings: [],
};

export const sprayOCR = sprayOcrOutput;

// ──────────────────────────────────────────────────────────────
// Products fixture (for planner tests)
// ──────────────────────────────────────────────────────────────
export const productsFixture = {
  schar: {
    id: 'p-schar',
    name: 'Schär Waffeln',
    brand: 'Dr. Schär AG',
    basis: '100 g',
    serving: { amount: 30, unit: 'g' },
    nutrients: {
      energy: { value: 2292, unit: 'kJ' },
      fat: { value: 33, unit: 'g' },
      saturatedFat: { value: 17, unit: 'g' },
      carbs: { value: 75, unit: 'g' },
      sugars: { value: 1, unit: 'g' },
      fiber: { value: 7, unit: 'g' },
      protein: { value: 11, unit: 'g' },
      salt: { value: 1.2, unit: 'g' },
    },
    warnings: ['sodium_not_present'],
  },
  juice: {
    id: 'p-juice',
    name: 'Apelsinensap',
    brand: 'Dutch Juice Co.',
    basis: '100 ml',
    serving: { amount: 200, unit: 'ml' },
    nutrients: {
      energy: { value: 199, unit: 'kJ' },
      fat: { value: 0.2, unit: 'g' },
      carbs: { value: 11, unit: 'g' },
      sugars: { value: 11, unit: 'g' },
      protein: { value: 0.1, unit: 'g' },
      salt: { value: 0.01, unit: 'g' },
      vitaminC: { value: 30, unit: 'mg' },
    },
    warnings: ['sodium_not_present'],
  },
  oilSpray: {
    id: 'p-oil',
    name: 'Olie Spray',
    brand: 'KitchenCo',
    basis: '100 ml',
    serving: { amount: 3, unit: 'g' },
    nutrients: {
      energy: { value: 3700, unit: 'kJ' },
      fat: { value: 100, unit: 'g' },
      saturatedFat: { value: 14, unit: 'g' },
      carbs: { value: 0, unit: 'g' },
      sugars: { value: 0, unit: 'g' },
      protein: { value: 0, unit: 'g' },
      salt: { value: 0, unit: 'g' },
    },
    warnings: [],
  },
};

// ──────────────────────────────────────────────────────────────
// Meal & Day fixtures (for planner tests)
// ──────────────────────────────────────────────────────────────
export const mealFixture = {
  id: 'm1',
  date: '2024-01-15',
  name: 'Ontbijt',
  items: [
    { productId: 'p-schar', quantity: 60, unit: 'g' },
    { productId: 'p-juice', quantity: 200, unit: 'ml' },
  ],
};

export const dayFixture = [
  mealFixture,
  {
    id: 'm2',
    date: '2024-01-15',
    name: 'Lunch',
    items: [
      { productId: 'p-oil', quantity: 6, unit: 'g' },
    ],
  },
];