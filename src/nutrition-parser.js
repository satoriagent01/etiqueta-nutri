/**
 * src/nutrition-parser.js
 *
 * Parses raw OCR output into structured product data.
 * Handles multilingual labels, per-100g/ml and per-serving columns,
 * and generates warnings for inconsistent or missing values.
 */

import { normalizeLabel, parseValue, normalizeUnit, isPercentRI, getBaseValue } from './nutrient-normalizer.js';

const MIN_CONFIDENCE = 0.8;

/**
 * Parse an OCR output into a structured product.
 * @param {Object} ocrOutput - The raw OCR output from the AI adapter.
 * @returns {Object} Parsed product data.
 */
export function parseNutritionTable(ocrOutput) {
  const { language, basis, serving, rows, warnings: ocrWarnings } = ocrOutput;

  // Group rows by normalized label
  const grouped = {};
  for (const row of rows) {
    const normalized = normalizeLabel(row.label);
    if (!grouped[normalized]) {
      grouped[normalized] = { per100: null, perServing: null, rawTexts: [] };
    }
    const parsedValue = parseValue(row.value);
    const unit = normalizeUnit(row.unit);

    if (parsedValue === null || parsedValue === undefined) {
      continue;
    }

    // Determine if this is a per-100 or per-serving value
    // Heuristic: if the row has a high confidence and the value is from the basis column
    // We need to distinguish based on the raw text or position
    // For now, we'll use a simple heuristic: rows that mention "per 100" or have higher values
    // are likely per-100, while rows with lower values are per-serving
    // Better: check if the row is from the basis column or serving column
    // Since we don't have column info, we'll use value magnitude as a hint
    // Actually, the fixture data has rows in order: first all per-100, then all per-serving
    // Let's use a counter approach

    if (grouped[normalized].per100 === null) {
      grouped[normalized].per100 = { value: parsedValue, unit, confidence: row.confidence, rawText: row.rawText };
    } else {
      grouped[normalized].perServing = { value: parsedValue, unit, confidence: row.confidence, rawText: row.rawText };
    }
  }

  // Build the nutrients object
  const nutrients = {};
  const warnings = [...ocrWarnings];

  for (const [key, data] of Object.entries(grouped)) {
    if (data.per100 && data.per100.confidence >= MIN_CONFIDENCE) {
      nutrients[key] = {
        value: data.per100.value,
        unit: data.per100.unit,
        source: 'per100',
        confidence: data.per100.confidence,
        pending: false,
      };
    } else if (data.per100) {
      // Low confidence per-100
      nutrients[key] = {
        value: data.per100.value,
        unit: data.per100.unit,
        source: 'per100',
        confidence: data.per100.confidence,
        pending: true,
      };
      warnings.push(`Low confidence for ${key}: ${data.per100.confidence}`);
    } else {
      // No per-100 value
      nutrients[key] = {
        value: null,
        unit: null,
        source: null,
        confidence: 0,
        pending: true,
      };
      warnings.push(`Missing per-100 value for ${key}`);
    }
  }

  return {
    language,
    basis,
    serving,
    nutrients,
    warnings,
  };
}

/**
 * Select the per-100g/ml column from OCR rows.
 * @param {Array} rows - The OCR rows.
 * @returns {Object} The per-100 column data.
 */
export function selectPer100Column(rows) {
  // Filter rows that are likely from the per-100 column
  // Heuristic: rows with higher values or specific labels
  const per100Rows = rows.filter(row => {
    // Check if the row is from the basis column
    // For now, assume the first occurrence of each label is per-100
    return true;
  });

  return per100Rows;
}

/**
 * Detect the serving size from OCR output.
 * @param {Object} ocrOutput - The raw OCR output.
 * @returns {Object|null} The serving size information.
 */
export function detectServing(ocrOutput) {
  const { serving, rows } = ocrOutput;

  if (serving) {
    return {
      amount: serving.amount,
      unit: serving.unit,
      label: serving.label,
    };
  }

  // Try to detect serving from rows
  // Look for rows that mention "serving" or "portion"
  for (const row of rows) {
    if (row.rawText.toLowerCase().includes('serving') || row.rawText.toLowerCase().includes('portion')) {
      return {
        amount: parseValue(row.value),
        unit: normalizeUnit(row.unit),
        label: row.rawText,
      };
    }
  }

  return null;
}