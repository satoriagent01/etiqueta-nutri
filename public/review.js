/**
 * review.js — Review and correct extracted nutrition data, save product.
 */

import { validateProduct } from '../src/validator.js';

/**
 * Render the review screen.
 * @param {Object} data - Extracted data from OCR.
 * @param {Function} onSave - Callback when user saves.
 * @param {Function} onBack - Callback to go back.
 */
export function renderReview(data, onSave, onBack) {
  const container = document.getElementById('screen-review');
  if (!container) return;

  container.innerHTML = `
    <h2>Revisar datos extraídos</h2>
    <p class="hint">Corregí lo que no esté bien. Los valores pendientes se marcan automáticamente.</p>
    <div id="review-product-name">
      <label for="product-name">Nombre del producto:</label>
      <input type="text" id="product-name" value="${data.name || ''}" placeholder="Nombre del producto">
    </div>
    <div id="review-basis">
      <label for="product-basis">Base de referencia:</label>
      <select id="product-basis">
        <option value="100g" ${data.basis === '100g' ? 'selected' : ''}>Por 100 g</option>
        <option value="100ml" ${data.basis === '100ml' ? 'selected' : ''}>Por 100 ml</option>
      </select>
    </div>
    <div id="review-serving">
      <label for="product-serving">Tamaño de porción:</label>
      <input type="text" id="product-serving" value="${data.serving || ''}" placeholder="Ej: 30 g, 1 vaso (200 ml)">
    </div>
    <div id="review-nutrients">
      <h3>Nutrientes</h3>
      <table id="nutrient-table">
        <thead>
          <tr>
            <th>Nutriente</th>
            <th>Valor</th>
            <th>Unidad</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody id="nutrient-tbody"></tbody>
      </table>
    </div>
    <div id="review-warnings"></div>
    <div class="actions">
      <button id="btn-save-product">Guardar producto</button>
      <button id="btn-cancel-review">Cancelar</button>
    </div>
  `;

  // Populate nutrient rows
  const tbody = document.getElementById('nutrient-tbody');
  if (data.nutrients) {
    for (const [key, nutrient] of Object.entries(data.nutrients)) {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${key}</td>
        <td><input type="text" class="nutrient-value" data-key="${key}" value="${nutrient.value !== null ? nutrient.value : ''}"></td>
        <td><input type="text" class="nutrient-unit" data-key="${key}" value="${nutrient.unit || ''}"></td>
        <td class="nutrient-status ${nutrient.status || ''}">${nutrient.status || 'ok'}</td>
      `;
      tbody.appendChild(tr);
    }
  }

  // Show warnings
  const warningsDiv = document.getElementById('review-warnings');
  if (data.warnings && data.warnings.length > 0) {
    warningsDiv.innerHTML = '<h3>Advertencias</h3><ul>' +
      data.warnings.map(w => `<li>${w}</li>`).join('') + '</ul>';
  }

  // Save button
  document.getElementById('btn-save-product').addEventListener('click', () => {
    const name = document.getElementById('product-name').value;
    const basis = document.getElementById('product-basis').value;
    const serving = document.getElementById('product-serving').value;

    // Collect nutrients
    const nutrients = {};
    document.querySelectorAll('#nutrient-tbody tr').forEach(tr => {
      const key = tr.querySelector('.nutrient-value').dataset.key;
      const valueInput = tr.querySelector('.nutrient-value').value;
      const unitInput = tr.querySelector('.nutrient-unit').value;
      const statusCell = tr.querySelector('.nutrient-status');

      let value = null;
      if (valueInput.trim() !== '') {
        value = parseFloat(valueInput.replace(',', '.'));
        if (isNaN(value)) value = null;
      }

      nutrients[key] = {
        value,
        unit: unitInput || 'g',
        status: statusCell.textContent.trim() || 'ok'
      };
    });

    onSave({ name, basis, serving, nutrients, warnings: data.warnings || [] });
  });

  // Cancel button
  document.getElementById('btn-cancel-review').addEventListener('click', onBack);
}

/**
 * Show review screen with extracted data.
 * @param {Object} extractedData - Data from OCR.
 * @param {Object} state - App state.
 * @param {Function} setState - State setter.
 */
export function showReview(extractedData, state, setState) {
  state.currentScreen = 'review';
  state.reviewData = extractedData;
  renderReview(extractedData, (productData) => {
    // Validate
    const validation = validateProduct(productData);
    productData.status = validation.status;
    productData.validationWarnings = validation.warnings;

    // Save to storage
    const productId = 'prod_' + Date.now();
    productData.id = productId;
    productData.createdAt = new Date().toISOString();

    if (state.storage) {
      state.storage.saveProduct(productData);
    }

    // Update state
    setState(prev => ({
      ...prev,
      products: [...prev.products, productData],
      currentScreen: 'library',
      reviewData: null
    }));
  }, () => {
    setState(prev => ({ ...prev, currentScreen: 'camera', reviewData: null }));
  });
}