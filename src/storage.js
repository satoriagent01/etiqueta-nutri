/**
 * Storage abstraction - works in browser (localStorage) and Node (memory).
 */

/**
 * Create a storage instance.
 * @param {Object} options
 * @param {Function} options.getWindow - Returns window object (browser) or null (Node)
 * @returns {Object}
 */
export function createStorage(options = {}) {
  const { getWindow = () => (typeof window !== 'undefined' ? window : null) } = options;

  const store = new Map();
  const window = getWindow();
  const useLocalStorage = window && window.localStorage;

  // Load from localStorage if available
  if (useLocalStorage) {
    try {
      const data = window.localStorage.getItem('etiqueta-nutri');
      if (data) {
        const parsed = JSON.parse(data);
        for (const [key, value] of Object.entries(parsed)) {
          store.set(key, value);
        }
      }
    } catch (e) {
      // Ignore parse errors
    }
  }

  return {
    /**
     * Get a value from storage.
     * @param {string} key
     * @returns {*}
     */
    get(key) {
      return store.get(key);
    },

    /**
     * Set a value in storage.
     * @param {string} key
     * @param {*} value
     */
    set(key, value) {
      store.set(key, value);
      if (useLocalStorage) {
        try {
          window.localStorage.setItem('etiqueta-nutri', JSON.stringify(Object.fromEntries(store)));
        } catch (e) {
          // Ignore quota errors
        }
      }
    },

    /**
     * Remove a value from storage.
     * @param {string} key
     */
    remove(key) {
      store.delete(key);
      if (useLocalStorage) {
        try {
          window.localStorage.removeItem('etiqueta-nutri');
          const remaining = {};
          for (const [k, v] of store) {
            remaining[k] = v;
          }
          window.localStorage.setItem('etiqueta-nutri', JSON.stringify(remaining));
        } catch (e) {
          // Ignore errors
        }
      }
    },

    /**
     * Clear all storage.
     */
    clear() {
      store.clear();
      if (useLocalStorage) {
        try {
          window.localStorage.removeItem('etiqueta-nutri');
        } catch (e) {
          // Ignore errors
        }
      }
    },

    /**
     * Get all entries.
     * @returns {Map<string, *>}
     */
    getAll() {
      return new Map(store);
    },
  };
}