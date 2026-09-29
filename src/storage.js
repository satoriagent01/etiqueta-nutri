/**
 * src/storage.js — In-memory storage adapter for products, meals, objectives, profiles.
 *
 * Implements the storage contract expected by the planner and server modules.
 * All data is held in memory (no persistence layer).
 */

/**
 * Creates an in-memory storage instance.
 * @returns {Object} Storage adapter with CRUD methods.
 */
export function createStorage() {
  const products = new Map();
  const meals = new Map();
  const profiles = new Map();
  let objectives = [];

  return {
    /**
     * Save a product.
     * @param {Object} product - Product object with id, name, basis, nutrients, warnings, etc.
     */
    saveProduct(product) {
      products.set(product.id, { ...product });
    },

    /**
     * Get a product by id.
     * @param {string} id - Product id.
     * @returns {Object|undefined} Product or undefined.
     */
    getProduct(id) {
      return products.get(id);
    },

    /**
     * List all products.
     * @returns {Object[]} Array of all products.
     */
    listProducts() {
      return Array.from(products.values());
    },

    /**
     * Delete a product by id.
     * @param {string} id - Product id.
     */
    deleteProduct(id) {
      products.delete(id);
    },

    /**
     * Save a meal.
     * @param {Object} meal - Meal object with id, date, name, items.
     */
    saveMeal(meal) {
      meals.set(meal.id, { ...meal });
    },

    /**
     * Get a meal by id.
     * @param {string} id - Meal id.
     * @returns {Object|undefined} Meal or undefined.
     */
    getMeal(id) {
      return meals.get(id);
    },

    /**
     * List meals by date.
     * @param {string} date - Date string (YYYY-MM-DD).
     * @returns {Object[]} Array of meals for the given date.
     */
    listMealsByDate(date) {
      return Array.from(meals.values()).filter(m => m.date === date);
    },

    /**
     * Delete a meal by id.
     * @param {string} id - Meal id.
     */
    deleteMeal(id) {
      meals.delete(id);
    },

    /**
     * Save objectives (replaces all).
     * @param {Object[]} objs - Array of objective objects.
     */
    saveObjectives(objs) {
      objectives = objs.map(o => ({ ...o }));
    },

    /**
     * Get all objectives.
     * @returns {Object[]} Array of objective objects.
     */
    getObjectives() {
      return [...objectives];
    },

    /**
     * Save a profile.
     * @param {Object} profile - Profile object with id, name, objectives.
     */
    saveProfile(profile) {
      profiles.set(profile.id, { ...profile });
    },

    /**
     * Get a profile by id.
     * @param {string} id - Profile id.
     * @returns {Object|undefined} Profile or undefined.
     */
    getProfile(id) {
      return profiles.get(id);
    },

    /**
     * List all profiles.
     * @returns {Object[]} Array of all profiles.
     */
    listProfiles() {
      return Array.from(profiles.values());
    },

    /**
     * Delete a profile by id.
     * @param {string} id - Profile id.
     */
    deleteProfile(id) {
      profiles.delete(id);
    },
  };
}