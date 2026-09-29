/**
 * src/objectives.js
 *
 * Objective and profile management for the nutrition tracker.
 *
 * Exports:
 *   createObjective({ id, nutrient, type, value, min, max, period }) → Objective
 *   createProfile({ id, name }) → Profile
 *   addObjective(profile, objective) → void
 *   removeObjective(profile, id) → void
 *   getProfile(id) → Profile | null
 *   calculateDailyStatus(profile, intakes) → Record<string, "within"|"exceeded"|"missing">
 *   addIntake(profile, date, intakes) → void
 */

// ──────────────────────────────────────────────────────────────
// Global profile store (in-memory, single profile per id)
// ──────────────────────────────────────────────────────────────
const profiles = new Map();

/**
 * Create a new objective.
 *
 * @param {Object} opts
 * @param {string} opts.id
 * @param {string} opts.nutrient
 * @param {"max"|"min"|"range"} opts.type
 * @param {number} [opts.value] – for "max" or "min"
 * @param {number} [opts.min] – for "range"
 * @param {number} [opts.max] – for "range"
 * @param {"daily"} opts.period
 * @returns {Object}
 */
export function createObjective({ id, nutrient, type, value, min, max, period }) {
  return { id, nutrient, type, value, min, max, period };
}

/**
 * Create a new profile.
 *
 * @param {Object} opts
 * @param {string} opts.id
 * @param {string} opts.name
 * @returns {Object}
 */
export function createProfile({ id, name }) {
  const profile = {
    id,
    name,
    objectives: [],
    dailyLogs: {},
  };
  profiles.set(id, profile);
  return profile;
}

/**
 * Add an objective to a profile.
 *
 * @param {Object} profile
 * @param {Object} objective
 */
export function addObjective(profile, objective) {
  profile.objectives.push(objective);
}

/**
 * Remove an objective from a profile by id.
 *
 * @param {Object} profile
 * @param {string} id
 */
export function removeObjective(profile, id) {
  const idx = profile.objectives.findIndex((o) => o.id === id);
  if (idx === -1) {
    throw new Error("Objective not found");
  }
  profile.objectives.splice(idx, 1);
}

/**
 * Get a profile by id from the global store.
 *
 * @param {string} id
 * @returns {Object|null}
 */
export function getProfile(id) {
  return profiles.get(id) || null;
}

/**
 * Calculate the daily status for every objective in the profile
 * given a set of intakes (nutrient → value).
 *
 * @param {Object} profile
 * @param {Record<string, number>} intakes
 * @returns {Record<string, "within"|"exceeded"|"missing">}
 */
export function calculateDailyStatus(profile, intakes) {
  const status = {};

  for (const obj of profile.objectives) {
    const provided = intakes[obj.nutrient];

    if (provided === undefined || provided === null) {
      status[obj.nutrient] = "missing";
      continue;
    }

    if (obj.type === "max") {
      status[obj.nutrient] = provided <= obj.value ? "within" : "exceeded";
    } else if (obj.type === "min") {
      status[obj.nutrient] = provided >= obj.value ? "within" : "missing";
    } else if (obj.type === "range") {
      if (provided >= obj.min && provided <= obj.max) {
        status[obj.nutrient] = "within";
      } else if (provided < obj.min) {
        status[obj.nutrient] = "missing";
      } else {
        status[obj.nutrient] = "exceeded";
      }
    }
  }

  return status;
}

/**
 * Add intake values to a profile's daily log for a given date.
 * Accumulates across multiple calls for the same date.
 *
 * @param {Object} profile
 * @param {string} date – YYYY-MM-DD
 * @param {Record<string, number>} intakes
 */
export function addIntake(profile, date, intakes) {
  if (!profile.dailyLogs[date]) {
    profile.dailyLogs[date] = {};
  }

  for (const [nutrient, value] of Object.entries(intakes)) {
    profile.dailyLogs[date][nutrient] =
      (profile.dailyLogs[date][nutrient] || 0) + value;
  }
}