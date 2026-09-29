/**
 * Shared fixture data for tests.
 *
 * Each fixture represents the output of the OCR AI adapter (extract(image))
 * for one of the three photos shared by the user:
 *  1. Schär multilingual bar (DE/FR/NL/IT) – 100 g column + 30 g serving
 *  2. Dutch juice bottle – 100 ml column + 200 ml glass, includes Vitamina C
 *  3. Dutch oil spray – 100 ml column, rotated label
 *
 * These fixtures are used by the normalizer, parser, validator, planner,
 * and server tests.  They are deliberately *raw* – the normalizer/parser
 * must turn them into clean, validated product data.
 */

// ──────────────────────────────────────────────────────────────
// 1. Schär multilingual bar (Image 1)
// ──────────────────────────────────────────────────────────────
/**
 * OCR output for the Schär bar.
 *
 * The label shows:
 *   - Basis: 100 g
 *   - Serving: 30 g = 1 Melto
 *   - Nutrients in DE/FR/NL/IT/EN/ES variants
 *   - Some values are clear, some have low confidence (blur/reflection)
 *
 * We simulate the AI returning a structured JSON with:
 *   - language: detected primary language (DE)
 *   - basis: { amount: 100, unit: 'g' }
 *   - serving: { amount: 30, unit: 'g', label: '1 Melto' }
 *   - rows: array of { label, rawText, value, unit, confidence }
 *   - warnings: array of warning strings
 */
export const schaarOcrOutput = {
  language: 'de',
  basis: { amount: 100, unit: 'g' },
  serving: { amount: 30, unit: 'g', label: '1 Melto' },
  rows: [
    {
      label: 'Energie',
      rawText: 'Energie / énergie / energie / energia',
      value: 2292,
      unit: 'kJ',
      confidence: 0.95,
    },
    {
      label: 'Energie',
      rawText: '549 kcal',
      value: 549,
      unit: 'kcal',
      confidence: 0.95,
    },
    {
      label: 'Fett',
      rawText: 'Fett / matières grasses / vetten / grassi',
      value: 33,
      unit: 'g',
      confidence: 0.93,
    },
    {
      label: 'davon gesättigte Fettsäuren',
      rawText: 'davon gesättigte Fettsäuren / dont acides gras saturés / waarvan verzadigde vetzuren / di cui acidi grassi saturi',
      value: 13,
      unit: 'g',
      confidence: 0.90,
    },
    {
      label: 'Kohlenhydrate',
      rawText: 'Kohlenhydrate / glucides / koolhydraten / carboidrati',
      value: 55,
      unit: 'g',
      confidence: 0.94,
    },
    {
      label: 'davon Zucker',
      rawText: 'davon Zucker / dont sucres / waarvan suikers / di cui zuccheri',
      value: 45,
      unit: 'g',
      confidence: 0.92,
    },
    {
      label: 'Ballaststoffe',
      rawText: 'Ballaststoffe / fibres alimentaires / vezels / fibre',
      value: 2.4,
      unit: 'g',
      confidence: 0.88,
    },
    {
      label: 'Eiweiß',
      rawText: 'Eiweiß / protéines / eiwitten / proteine',
      value: 6.8,
      unit: 'g',
      confidence: 0.91,
    },
    {
      label: 'Salz',
      rawText: 'Salz / sel / zout / sale',
      value: 0.18,
      unit: 'g',
      confidence: 0.89,
    },
    // Serving column values (30 g)
    {
      label: 'Energie',
      rawText: '688 kJ',
      value: 688,
      unit: 'kJ',
      confidence: 0.93,
    },
    {
      label: 'Energie',
      rawText: '165 kcal',
      value: 165,
      unit: 'kcal',
      confidence: 0.93,
    },
    {
      label: 'Fett',
      rawText: '10 g',
      value: 10,
      unit: 'g',
      confidence: 0.90,
    },
    {
      label: 'davon gesättigte Fettsäuren',
      rawText: '3,9 g',
      value: 3.9,
      unit: 'g',
      confidence: 0.87,
    },
    {
      label: 'Kohlenhydrate',
      rawText: '16 g',
      value: 16,
      unit: 'g',
      confidence: 0.91,
    },
    {
      label: 'davon Zucker',
      rawText: '14 g',
      value: 14,
      unit: 'g',
      confidence: 0.89,
    },
    {
      label: 'Ballaststoffe',
      rawText: '0,7 g',
      value: 0.7,
      unit: 'g',
      confidence: 0.85,
    },
    {
      label: 'Eiweiß',
      rawText: '2,0 g',
      value: 2.0,
      unit: 'g',
      confidence: 0.86,
    },
    {
      label: 'Salz',
      rawText: '0,05 g',
      value: 0.05,
      unit: 'g',
      confidence: 0.84,
    },
  ],
  warnings: [],
};

// ──────────────────────────────────────────────────────────────
// 2. Dutch juice bottle (Image 2)
// ──────────────────────────────────────────────────────────────
/**
 * OCR output for the juice bottle.
 *
 * The label shows:
 *   - Product: VERSGEPERST APPEL-SINAASAPPEL- EN MANGOSAP
 *   - Basis: 100 ml
 *   - Serving: glas (200 ml) = 5 porties per 1 L
 *   - Nutrients per 100 ml and per glass (200 ml)
 *   - Includes Vitamine C with %RI
 *   - Some values are small text, may have lower confidence
 */
export const juiceOcrOutput = {
  language: 'nl',
  basis: { amount: 100, unit: 'ml' },
  serving: { amount: 200, unit: 'ml', label: 'glas' },
  rows: [
    {
      label: 'energie',
      rawText: 'energie',
      value: 199,
      unit: 'kJ',
      confidence: 0.92,
    },
    {
      label: 'energie',
      rawText: '47 kcal',
      value: 47,
      unit: 'kcal',
      confidence: 0.92,
    },
    {
      label: 'vetten',
      rawText: 'vetten, waarvan',
      value: 0,
      unit: 'g',
      confidence: 0.95,
    },
    {
      label: 'verzadigde vetzuren',
      rawText: '- verzadigde vetzuren',
      value: 0,
      unit: 'g',
      confidence: 0.93,
    },
    {
      label: 'onverzadigde vetzuren',
      rawText: '- onverzadigde vetzuren',
      value: 0,
      unit: 'g',
      confidence: 0.90,
    },
    {
      label: 'koolhydraten',
      rawText: 'koolhydraten, waarvan',
      value: 11,
      unit: 'g',
      confidence: 0.91,
    },
    {
      label: 'suikers',
      rawText: '- suikers',
      value: 10,
      unit: 'g',
      confidence: 0.90,
    },
    {
      label: 'vezels',
      rawText: '- vezels',
      value: 0.7,
      unit: 'g',
      confidence: 0.85,
    },
    {
      label: 'eiwitten',
      rawText: 'eiwitten',
      value: 0.4,
      unit: 'g',
      confidence: 0.88,
    },
    {
      label: 'zout',
      rawText: 'zout',
      value: 0,
      unit: 'g',
      confidence: 0.94,
    },
    {
      label: 'vitamine C',
      rawText: 'vitamine C',
      value: 26,
      unit: '%RI',
      confidence: 0.87,
    },
    // Per glass (200 ml) values
    {
      label: 'energie',
      rawText: '399 kJ',
      value: 399,
      unit: 'kJ',
      confidence: 0.90,
    },
    {
      label: 'energie',
      rawText: '94 kcal',
      value: 94,
      unit: 'kcal',
      confidence: 0.90,
    },
    {
      label: 'vetten',
      rawText: '0 g',
      value: 0,
      unit: 'g',
      confidence: 0.93,
    },
    {
      label: 'koolhydraten',
      rawText: '22 g',
      value: 22,
      unit: 'g',
      confidence: 0.89,
    },
    {
      label: 'suikers',
      rawText: '20 g',
      value: 20,
      unit: 'g',
      confidence: 0.88,
    },
    {
      label: 'zout',
      rawText: '0 g',
      value: 0,
      unit: 'g',
      confidence: 0.92,
    },
  ],
  warnings: [],
};

// ──────────────────────────────────────────────────────────────
// 3. Dutch oil spray (Image 3)
// ──────────────────────────────────────────────────────────────
/**
 * OCR output for the oil spray bottle.
 *
 * The label is rotated and shows:
 *   - Product: EXTRA OLIEFOLIE VAN DE EERSTE PERSING
 *   - Basis: 100 ml
 *   - Nutrients per 100 ml
 *   - Some text is harder to read due to rotation
 */
export const sprayOcrOutput = {
  language: 'nl',
  basis: { amount: 100, unit: 'ml' },
  serving: null,
  rows: [
    {
      label: 'energie',
      rawText: 'energie',
      value: 3404,
      unit: 'kJ',
      confidence: 0.78,
    },
    {
      label: 'energie',
      rawText: '828 kcal',
      value: 828,
      unit: 'kcal',
      confidence: 0.76,
    },
    {
      label: 'vetten',
      rawText: 'vetten',
      value: 92,
      unit: 'g',
      confidence: 0.82,
    },
    {
      label: 'verzadigde vetzuren',
      rawText: 'waarvan verzadigde vetzuren',
      value: 14,
      unit: 'g',
      confidence: 0.75,
    },
    {
      label: 'koolhydraten',
      rawText: 'koolhydraten',
      value: 0,
      unit: 'g',
      confidence: 0.80,
    },
    {
      label: 'suikers',
      rawText: 'waarvan suikers',
      value: 0,
      unit: 'g',
      confidence: 0.79,
    },
    {
      label: 'vezels',
      rawText: 'vezels',
      value: 0,
      unit: 'g',
      confidence: 0.77,
    },
    {
      label: 'eiwitten',
      rawText: 'eiwitten',
      value: 0,
      unit: 'g',
      confidence: 0.81,
    },
    {
      label: 'zout',
      rawText: 'zout',
      value: 0,
      unit: 'g',
      confidence: 0.83,
    },
    {
      label: 'vitamine E',
      rawText: 'vitamine E',
      value: 150,
      unit: '%RI',
      confidence: 0.74,
    },
  ],
  warnings: [],
};

// ──────────────────────────────────────────────────────────────
// Helper: create a minimal OCR output with a single nutrient
// ──────────────────────────────────────────────────────────────
export function makeOcrRow(label, value, unit, confidence = 0.95) {
  return { label, rawText: label, value, unit, confidence };
}

/**
 * Create a minimal OCR output for testing the parser.
 */
export function makeOcrOutput(rows, basis = { amount: 100, unit: 'g' }, warnings = []) {
  return {
    language: 'en',
    basis,
    serving: null,
    rows,
    warnings,
  };
}

/**
 * Create an OCR output with low-confidence rows to test
 * the "pending correction" logic.
 */
export function makeLowConfidenceOcrOutput() {
  return {
    language: 'en',
    basis: { amount: 100, unit: 'g' },
    serving: null,
    rows: [
      { label: 'Energy', rawText: 'Energy', value: 200, unit: 'kcal', confidence: 0.40 },
      { label: 'Fat', rawText: 'Fat', value: 10, unit: 'g', confidence: 0.35 },
      { label: 'Carbs', rawText: 'Carbs', value: 30, unit: 'g', confidence: 0.50 },
    ],
    warnings: ['Low confidence values detected'],
  };
}

/**
 * Create an OCR output with inconsistent values to test validation.
 */
export function makeInconsistentOcrOutput() {
  return {
    language: 'en',
    basis: { amount: 100, unit: 'g' },
    serving: null,
    rows: [
      { label: 'Energy', rawText: 'Energy', value: 500, unit: 'kcal', confidence: 0.95 },
      { label: 'Energy', rawText: 'Energy', value: 1000, unit: 'kJ', confidence: 0.95 },
      { label: 'Fat', rawText: 'Fat', value: 5, unit: 'g', confidence: 0.95 },
      { label: 'Saturated Fat', rawText: 'Saturated Fat', value: 10, unit: 'g', confidence: 0.95 },
      { label: 'Carbs', rawText: 'Carbs', value: 20, unit: 'g', confidence: 0.95 },
      { label: 'Sugars', rawText: 'Sugars', value: 25, unit: 'g', confidence: 0.95 },
    ],
    warnings: [],
  };
}

/**
 * Create an OCR output with missing values.
 */
export function makeMissingValuesOcrOutput() {
  return {
    language: 'en',
    basis: { amount: 100, unit: 'g' },
    serving: null,
    rows: [
      { label: 'Energy', rawText: 'Energy', value: 200, unit: 'kcal', confidence: 0.95 },
      { label: 'Fat', rawText: 'Fat', value: null, unit: 'g', confidence: 0.95 },
      { label: 'Carbs', rawText: 'Carbs', value: 30, unit: 'g', confidence: 0.95 },
    ],
    warnings: ['Missing value for Fat'],
  };
}

export default {
  schaarOcrOutput,
  juiceOcrOutput,
  sprayOcrOutput,
  makeOcrRow,
  makeOcrOutput,
  makeLowConfidenceOcrOutput,
  makeInconsistentOcrOutput,
  makeMissingValuesOcrOutput,
};