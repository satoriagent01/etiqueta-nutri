/**
 * public/library.js — Product library UI module.
 *
 * Exports:
 *  - renderLibrary(container, products, onSelect)
 *  - renderProductDetail(container, product, onBack, onEdit)
 */

/**
 * Render the product library list.
 * @param {HTMLElement} container - Container element.
 * @param {Array} products - Array of product objects.
 * @param {Function} onSelect - Callback when a product is selected.
 */
export function renderLibrary(container, products, onSelect) {
  container.innerHTML = '';

  const header = document.createElement('h2');
  header.textContent = 'Biblioteca de Productos';
  container.appendChild(header);

  if (products.length === 0) {
    const empty = document.createElement('p');
    empty.textContent = 'No hay productos guardados. Toma una foto para agregar uno.';
    container.appendChild(empty);
    return;
  }

  const list = document.createElement('ul');
  list.style.listStyle = 'none';
  list.style.padding = '0';

  for (const product of products) {
    const li = document.createElement('li');
    li.style.marginBottom = '12px';
    li.style.border = '1px solid #ccc';
    li.style.borderRadius = '8px';
    li.style.padding = '12px';
    li.style.background = '#fff';

    const name = document.createElement('strong');
    name.textContent = product.name || 'Producto sin nombre';
    li.appendChild(name);

    const basis = document.createElement('span');
    basis.style.color = '#666';
    basis.style.fontSize = '0.9em';
    basis.textContent = ` — Base: ${product.basis || '100 g'}`;
    li.appendChild(basis);

    if (product.warnings && product.warnings.length > 0) {
      const warn = document.createElement('span');
      warn.style.color = '#e67e22';
      warn.style.fontSize = '0.8em';
      warn.textContent = ` ⚠️ ${product.warnings.length} advertencia(s)`;
      li.appendChild(warn);
    }

    li.addEventListener('click', () => onSelect(product));
    li.style.cursor = 'pointer';

    list.appendChild(li);
  }

  container.appendChild(list);
}

/**
 * Render a product detail view.
 * @param {HTMLElement} container - Container element.
 * @param {Object} product - Product object.
 * @param {Function} onBack - Callback to go back.
 * @param {Function} onEdit - Callback to edit the product.
 */
export function renderProductDetail(container, product, onBack, onEdit) {
  container.innerHTML = '';

  const backBtn = document.createElement('button');
  backBtn.textContent = '← Volver';
  backBtn.style.marginBottom = '16px';
  backBtn.addEventListener('click', onBack);
  container.appendChild(backBtn);

  const h2 = document.createElement('h2');
  h2.textContent = product.name || 'Producto sin nombre';
  container.appendChild(h2);

  const basis = document.createElement('p');
  basis.textContent = `Base: ${product.basis || '100 g'}`;
  container.appendChild(basis);

  if (product.serving) {
    const serving = document.createElement('p');
    serving.textContent = `Porción: ${product.serving} g`;
    container.appendChild(serving);
  }

  // Nutrient table
  const table = document.createElement('table');
  table.style.width = '100%';
  table.style.borderCollapse = 'collapse';
  table.style.marginTop = '12px';

  const thead = document.createElement('thead');
  const headerRow = document.createElement('tr');
  ['Nutriente', 'Valor', 'Unidad', 'Estado'].forEach(text => {
    const th = document.createElement('th');
    th.textContent = text;
    th.style.textAlign = 'left';
    th.style.borderBottom = '2px solid #333';
    th.style.padding = '8px 4px';
    headerRow.appendChild(th);
  });
  thead.appendChild(headerRow);
  table.appendChild(thead);

  const tbody = document.createElement('tbody');
  const nutrients = product.nutrients || {};
  for (const [key, data] of Object.entries(nutrients)) {
    const tr = document.createElement('tr');
    tr.style.borderBottom = '1px solid #eee';

    const tdLabel = document.createElement('td');
    tdLabel.textContent = key;
    tdLabel.style.padding = '6px 4px';
    tr.appendChild(tdLabel);

    const tdValue = document.createElement('td');
    tdValue.textContent = data.value != null ? data.value : '—';
    tdValue.style.padding = '6px 4px';
    tr.appendChild(tdValue);

    const tdUnit = document.createElement('td');
    tdUnit.textContent = data.unit || '';
    tdUnit.style.padding = '6px 4px';
    tr.appendChild(tdUnit);

    const tdStatus = document.createElement('td');
    tdStatus.textContent = data.status || 'ok';
    tdStatus.style.padding = '6px 4px';
    if (data.status === 'pending') {
      tdStatus.style.color = '#e67e22';
      tdStatus.style.fontWeight = 'bold';
    }
    tr.appendChild(tdStatus);

    tbody.appendChild(tr);
  }
  table.appendChild(tbody);
  container.appendChild(table);

  // Warnings
  if (product.warnings && product.warnings.length > 0) {
    const warnDiv = document.createElement('div');
    warnDiv.style.marginTop = '12px';
    warnDiv.style.padding = '8px';
    warnDiv.style.background = '#fff3cd';
    warnDiv.style.borderRadius = '4px';
    warnDiv.style.color = '#856404';

    const warnTitle = document.createElement('strong');
    warnTitle.textContent = 'Advertencias:';
    warnDiv.appendChild(warnTitle);

    for (const w of product.warnings) {
      const p = document.createElement('p');
      p.textContent = w;
      p.style.margin = '4px 0 0 0';
      warnDiv.appendChild(p);
    }

    container.appendChild(warnDiv);
  }

  // Edit button
  const editBtn = document.createElement('button');
  editBtn.textContent = '✏️ Editar';
  editBtn.style.marginTop = '16px';
  editBtn.addEventListener('click', onEdit);
  container.appendChild(editBtn);
}