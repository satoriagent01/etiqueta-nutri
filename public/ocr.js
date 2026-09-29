/**
 * public/ocr.js — OCR module: send photo to /api/extract, handle responses.
 */

/**
 * Send a photo to the OCR API.
 * @param {File} file - The photo file.
 * @returns {Promise<Object>} The OCR response or error.
 */
export async function extractNutrition(file) {
  const formData = new FormData();
  formData.append('image', file);

  try {
    const response = await fetch('/api/extract', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const text = await response.text();
      return { error: text || `HTTP ${response.status}` };
    }

    return await response.json();
  } catch (err) {
    return { error: err.message || 'Network error' };
  }
}

/**
 * Check if OCR is available (by checking if the server responds).
 * @returns {Promise<boolean>}
 */
export async function isOcrAvailable() {
  try {
    const response = await fetch('/api/extract', {
      method: 'POST',
      body: new FormData(),
    });
    return response.ok;
  } catch {
    return false;
  }
}