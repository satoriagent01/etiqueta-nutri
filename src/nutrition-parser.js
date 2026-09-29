/**
 * Parse nutrition table from OCR text.
 * Returns { nutrients: Map<string, number|null>, warnings: string[] }
 */

import { normalizeNutrientName, normalizeNutrientValue } from './nutrient-normalizer.js';

/**
 * Parse a nutrition table from OCR text.
 * Each line is expected to be in format: "Nutrient: value" or "Nutrient value"
 * @param {string} ocrText - Raw OCR text
 * @returns {{ nutrients: Map<string, number|null>, warnings: string[] }}
 */
export function parseNutritionTable(ocrText) {
  const nutrients = new Map();
  const warnings = [];

  if (!ocrText || typeof ocrText !== 'string' || ocrText.trim() === '') {
    warnings.push('OCR text is empty');
    return { nutrients, warnings };
  }

  const lines = ocrText.split('\n');

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;

    // Try to parse "Nutrient: value" or "Nutrient value"
    let nutrientName = null;
    let rawValue = null;

    // Pattern: "Nutrient: value" or "Nutrient - value" or "Nutrient value"
    const colonMatch = line.match(/^(.+?)\s*[:\-–—]\s*(.+)$/);
    if (colonMatch) {
      nutrientName = colonMatch[1].trim();
      rawValue = colonMatch[2].trim();
    } else {
      // Try "Nutrient value" - last token is value
      const parts = line.split(/\s+/);
      if (parts.length >= 2) {
        // Try to find a numeric value at the end
        const lastPart = parts[parts.length - 1];
        const numMatch = lastPart.match(/^([0-9.,]+)\s*(g|mg|μg|µg|mcg|kj|kcal|ml)?$/i);
        if (numMatch) {
          nutrientName = parts.slice(0, -1).join(' ').trim();
          rawValue = lastPart;
        }
      }
    }

    if (!nutrientName || !rawValue) continue;

    const canonicalName = normalizeNutrientName(nutrientName);
    const value = normalizeNutrientValue(rawValue);

    if (value === null) {
      // Check if it's "ausente" or "dudoso"
      const lowerVal = rawValue.toLowerCase().trim();
      if (lowerVal === 'ausente') {
        warnings.push(`${canonicalName}: ausente`);
      } else if (lowerVal === 'dudoso') {
        warnings.push(`${canonicalName}: dudoso`);
      }
      // Store as null for missing/dudoso/ausente
      nutrients.set(canonicalName, null);
    } else {
      nutrients.set(canonicalName, value);
    }
  }

  return { nutrients, warnings };
}