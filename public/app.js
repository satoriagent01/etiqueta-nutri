/**
 * Main app module: navigation, camera, OCR, review, library, objectives, planner.
 * Coordinates all public modules and manages app state.
 */

import { initCamera, capturePhoto, selectFile, handleFile } from './camera.js';
import { extractFromImage, isOcrAvailable } from './ocr.js';
import { showReview, saveProductFromReview, updateReviewRow } from './review.js';
import { renderLibrary, selectProduct, searchProducts } from './library.js';
import { renderObjectives, addObjective, removeObject, checkProgress } from './objectives.js';
import { renderPlanner, addMealItem, calculateTotals, detectIncomplete } from './planner.js';

// ── App State ──────────────────────────────────────────────────────
const state = {
  currentScreen: 'camera',
  currentProduct: null,
  currentMeal: null,
  selectedProduct: null,
  ocrAvailable: true,
  products: [],
  meals: [],
  objectives: [],
  profile: null,
};

// ── Navigation ─────────────────────────────────────────────────────
function navigateTo(screen) {
  state.currentScreen = screen;
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(`screen-${screen}`).classList.add('active');
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.querySelector(`[data-nav="${screen}"]`).classList.add('active');

  // Initialize screen-specific content
  switch (screen) {
    case 'camera':
      initCamera();
      break;
    case 'library':
      renderLibrary();
      break;
    case 'objectives':
      renderObjectives();
      break;
    case 'planner':
      renderPlanner();
      break;
    case 'review':
      // review.js handles its own rendering
      break;
  }
}

// ── Camera & OCR ───────────────────────────────────────────────────
async function takePhoto() {
  try {
    const blob = await capturePhoto();
    const ocrResult = await extractFromImage(blob);
    showReview(ocrResult);
    navigateTo('review');
  } catch (err) {
    console.error('Camera/OCR error:', err);
    alert('Error al procesar la foto. Intenta subir un archivo manualmente.');
  }
}

async function handlePhotoUpload(file) {
  try {
    const ocrResult = await extractFromImage(file);
    showReview(ocrResult);
    navigateTo('review');
  } catch (err) {
    console.error('File upload error:', err);
    alert('Error al procesar el archivo.');
  }
}

// ── Review & Save ──────────────────────────────────────────────────
function handleSaveProduct(product) {
  state.products.push(product);
  localStorage.setItem('etiqueta-nutri-products', JSON.stringify(state.products));
  alert('Producto guardado en la biblioteca.');
  navigateTo('library');
}

function handleUpdateRow(rowId, field, value) {
  updateReviewRow(rowId, field, value);
}

// ── Library ────────────────────────────────────────────────────────
function handleSelectProduct(productId) {
  const product = state.products.find(p => p.id === productId);
  if (product) {
    state.selectedProduct = product;
    navigateTo('planner');
  }
}

// ── Objectives ─────────────────────────────────────────────────────
function handleAddObjective(obj) {
  addObjective(obj);
  renderObjectives();
}

function handleRemoveObjective(id) {
  removeObject(id);
  renderObjectives();
}

// ── Planner ────────────────────────────────────────────────────────
function handleAddToMeal(productId, quantity, unit) {
  addMealItem(productId, quantity, unit);
  renderPlanner();
}

// ── Initialization ─────────────────────────────────────────────────
async function init() {
  // Load saved data
  const savedProducts = localStorage.getItem('etiqueta-nutri-products');
  if (savedProducts) {
    state.products = JSON.parse(savedProducts);
  }

  const savedObjectives = localStorage.getItem('etiqueta-nutri-objectives');
  if (savedObjectives) {
    state.objectives = JSON.parse(savedObjectives);
  }

  // Check OCR availability
  state.ocrAvailable = await isOcrAvailable();

  // Set up navigation
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', () => {
      navigateTo(item.dataset.nav);
    });
  });

  // Set up camera buttons
  const captureBtn = document.getElementById('capture-btn');
  if (captureBtn) {
    captureBtn.addEventListener('click', takePhoto);
  }

  const fileInput = document.getElementById('file-input');
  if (fileInput) {
    fileInput.addEventListener('change', (e) => {
      if (e.target.files[0]) {
        handlePhotoUpload(e.target.files[0]);
      }
    });
  }

  // Set up review form
  const saveBtn = document.getElementById('save-product-btn');
  if (saveBtn) {
    saveBtn.addEventListener('click', () => {
      const product = saveProductFromReview();
      if (product) {
        handleSaveProduct(product);
      }
    });
  }

  // Set up library search
  const searchInput = document.getElementById('library-search');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      renderLibrary(e.target.value);
    });
  }

  // Set up objectives form
  const addObjBtn = document.getElementById('add-objective-btn');
  if (addObjBtn) {
    addObjBtn.addEventListener('click', () => {
      const nutrient = document.getElementById('objective-nutrient').value;
      const type = document.getElementById('objective-type').value;
      const value = parseFloat(document.getElementById('objective-value').value);
      if (nutrient && type && value) {
        handleAddObjective({ nutrient, type, value });
      }
    });
  }

  // Set up planner add item
  const addToMealBtn = document.getElementById('add-to-meal-btn');
  if (addToMealBtn) {
    addToMealBtn.addEventListener('click', () => {
      const productId = document.getElementById('meal-product-select').value;
      const quantity = parseFloat(document.getElementById('meal-quantity').value);
      const unit = document.getElementById('meal-unit').value;
      if (productId && quantity) {
        handleAddToMeal(productId, quantity, unit);
      }
    });
  }

  // Start on camera screen
  navigateTo('camera');
}

// Make functions available globally for inline handlers
window.navigateApp = navigateTo;
window.takePhoto = takePhoto;
window.handlePhotoUpload = handlePhotoUpload;
window.handleSaveProduct = handleSaveProduct;
window.handleUpdateRow = handleUpdateRow;
window.handleSelectProduct = handleSelectProduct;
window.handleAddObjective = handleAddObjective;
window.handleRemoveObjective = handleRemoveObjective;
window.handleAddToMeal = handleAddToMeal;

// Initialize on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}