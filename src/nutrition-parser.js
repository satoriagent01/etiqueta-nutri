/**
 * Parse nutrition table from OCR JSON output.
 * Returns { nutrients: Map<string, Object>, warnings: Array<Object>, basis: string, serving: Object|null }
 */

import { normalizeLabel as normLabel, parseValue, convertSaltToSodium } from './nutrient-normalizer.js';

/**
 * Nutrient label → canonical key mapping (lowercase).
 */
const LABEL_MAP = {
  'energy': 'energy',
  'fett': 'fat', 'matières grasses': 'fat', 'vetten': 'fat', 'grassi': 'fat',
  'fat': 'fat', 'gras': 'fat', 'graisse': 'fat', 'grasa': 'fat',
  'davon gesättigte fettsäuren': 'saturated-fat',
  'dont acides gras saturés': 'saturated-fat',
  'verzadigde vetzuren': 'saturated-fat',
  'acidi grassi saturi': 'saturated-fat',
  'saturated fat': 'saturated-fat', 'saturated fats': 'saturated-fat',
  'kohlenhydrate': 'carbohydrates', 'glucides': 'carbohydrates',
  'koolhydraten': 'carbohydrates', 'carboidrati': 'carbohydrates',
  'carbohydrates': 'carbohydrates', 'carbohidratos': 'carbohydrates',
  'carbohydrate': 'carbohydrates', 'carbs': 'carbohydrates',
  'davon zucker': 'sugars', 'dont sucres': 'sugars', 'suikers': 'sugars',
  'zuccheri': 'sugars', 'sugars': 'sugars', 'azúcares': 'sugars',
  'waarvan suikers': 'sugars',
  'ballaststoffe': 'fiber', 'fibres': 'fiber', 'vezestoffen': 'fiber',
  'fibre': 'fiber', 'fiber': 'fiber', 'fibras': 'fiber',
  'dietary fiber': 'fiber', 'dietary fibres': 'fiber',
  'eiweiß': 'protein', 'proteine': 'protein', 'eiwitten': 'protein',
  'protéines': 'protein', 'protein': 'protein', 'proteínas': 'protein',
  'proteïnen': 'protein',
  'salz': 'salt', 'sel': 'salt', 'zout': 'salt', 'sale': 'salt',
  'salt': 'salt', 'sal': 'salt',
  'vitamine c': 'vitamin-c', 'vitamin c': 'vitamin-c',
  'sodium': 'sodium',
};

/**
 * Normalise a label string to its canonical English name.
 */
function _normalizeLabel(label) {
  if (!label || typeof label !== 'string') return '';
  const trimmed = label.trim().toLowerCase();
  return LABEL_MAP[trimmed] ?? trimmed;
}

/**
 * Parse a numeric value from a string.
 * Handles commas as decimal separators and < prefix.
 */
function _parseValue(str) {
  if (!str || typeof str !== 'string') return null;
  const t = str.trim();
  if (t === '' || t === '—' || t === '-') return null;
  let cleaned = t;
  if (cleaned.startsWith('<')) cleaned = cleaned.slice(1).trim();
  cleaned = cleaned.replace(',', '.');
  const num = parseFloat(cleaned);
  return isNaN(num) ? null : num;
}

// Required nutrients that should be present in a complete nutrition table.
const REQUIRED_NUTRIENTS = ['energy', 'fat', 'saturated-fat', 'carbohydrates', 'sugars', 'protein', 'salt'];

/**
 * Parse an OCR output object into structured nutrition data.
 * @param {Object} ocrData - { language, basis, serving, rows, warnings }
 * @returns {{ nutrients: Map<string, Object>, warnings: Array<Object>, basis: string, serving: Object|null }}
 */
export function parseNutritionTable(ocrData) {
  const nutrients = new Map();
  const warnings = [];

  // Extract basis info
  let basis = '100g';
  let basisType = 'per100g';
  if (ocrData && ocrData.basis) {
    if (ocrData.basis.unit === 'ml') {
      basis = '100ml';
      basisType = 'per100ml';
    } else {
      basis = '100g';
      basisType = 'per100g';
    }
  }

  // Extract serving info
  let serving = null;
  if (ocrData && ocrData.serving && ocrData.serving.amount) {
    serving = {
      amount: ocrData.serving.amount,
      unit: ocrData.serving.unit,
    };
  }

  // Parse rows
  if (ocrData && ocrData.rows && Array.isArray(ocrData.rows)) {
    for (const row of ocrData.rows) {
      const label = row.label || '';
      const canonical = _normalizeLabel(label);
      if (!canonical) continue;

      // Get value from the basis column (per100g or per100ml)
      const baseCol = row[basisType];
      let value = null;
      let unit = '';

      if (baseCol && baseCol.value !== undefined && baseCol.value !== null) {
        value = baseCol.value;
        unit = baseCol.unit || '';
      } else if (row.value !== undefined && row.value !== null) {
        value = row.value;
        unit = row.unit || '';
      }

      if (value === null || value === undefined) {
        // Check for ausente/dudoso markers
        const rawText = (row.rawText || '').toLowerCase();
        if (rawText.includes('ausente') || rawText.includes('afwezig')) {
          warnings.push({ nutrient: canonical, status: 'pending', reason: 'ausente' });
          nutrients.set(canonical, { value: null, unit: '', status: 'pending' });
        } else {
          nutrients.set(canonical, { value: null, unit: '', status: 'pending' });
        }
        continue;
      }

      // Store the nutrient value
      nutrients.set(canonical, {
        value: value,
        unit: unit,
        source: basis,
      });
    }
  }

  // Add warnings from OCR
  if (ocrData && ocrData.warnings && Array.isArray(ocrData.warnings)) {
    for (const w of ocrData.warnings) {
      if (w === 'sodium_not_present') {
        warnings.push({ nutrient: 'sodium', status: 'pending', reason: 'not_in_table' });
      }
    }
  }

  // Check for missing required nutrients
  for (const req of REQUIRED_NUTRIENTS) {
    if (!nutrients.has(req)) {
      // Check if we already have a warning for this nutrient
      const existingWarning = warnings.find(w => w.nutrient === req);
      if (!existingWarning) {
        warnings.push({ nutrient: req, status: 'pending', reason: 'not_in_table' });
      }
    }
  }

  return {
    nutrients,
    warnings,
    basis,
    serving,
  };
}