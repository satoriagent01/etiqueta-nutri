/**
 * camera.js — Camera and file upload module.
 *
 * Exports:
 *  - startCamera(container) → Promise<void>
 *  - capturePhoto() → Promise<string> (base64 data URL)
 *  - stopCamera() → void
 *  - onCapture(callback) → void
 *  - onFileSelect(callback) → void
 */

let stream = null;
let captureCallback = null;
let fileSelectCallback = null;

/**
 * Start the camera preview in the given container element.
 * @param {HTMLElement} container - The container element for the video preview.
 */
export async function startCamera(container) {
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } }
    });
    const video = container.querySelector('video');
    if (video) {
      video.srcObject = stream;
      await video.play();
    }
  } catch (err) {
    console.warn('Camera not available:', err.message);
    throw err;
  }
}

/**
 * Capture a photo from the camera preview.
 * @returns {Promise<string>} Base64 data URL of the captured photo.
 */
export function capturePhoto() {
  return new Promise((resolve, reject) => {
    const video = document.querySelector('video');
    if (!video || !video.srcObject) {
      reject(new Error('Camera not active'));
      return;
    }

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    resolve(dataUrl);
  });
}

/**
 * Stop the camera stream.
 */
export function stopCamera() {
  if (stream) {
    stream.getTracks().forEach(track => track.stop());
    stream = null;
  }
  const video = document.querySelector('video');
  if (video) {
    video.srcObject = null;
  }
}

/**
 * Set callback for photo capture.
 * @param {Function} callback - Called with the base64 data URL.
 */
export function onCapture(callback) {
  captureCallback = callback;
}

/**
 * Set callback for file selection.
 * @param {Function} callback - Called with the base64 data URL.
 */
export function onFileSelect(callback) {
  fileSelectCallback = callback;
}

/**
 * Initialize camera UI event listeners.
 * @param {Object} options - UI element references.
 */
export function initCameraUI(options) {
  const { captureBtn, fileInput, container } = options;

  if (captureBtn) {
    captureBtn.addEventListener('click', async () => {
      try {
        const dataUrl = await capturePhoto();
        if (captureCallback) captureCallback(dataUrl);
      } catch (err) {
        console.error('Capture failed:', err);
        if (captureCallback) captureCallback(null, err.message);
      }
    });
  }

  if (fileInput) {
    fileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = () => {
        if (fileSelectCallback) fileSelectCallback(reader.result);
      };
      reader.readAsDataURL(file);
    });
  }
}