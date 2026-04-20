/**
 * localStorage persistence layer for WriteSpace.
 * All reads/writes are wrapped in try/catch with graceful fallbacks.
 *
 * Keys:
 *   writespace_posts   - JSON array of post objects
 *   writespace_users   - JSON array of user objects
 *   writespace_session - JSON session object or null
 */

const KEYS = {
  POSTS: 'writespace_posts',
  USERS: 'writespace_users',
  SESSION: 'writespace_session',
};

/**
 * Safely read and parse a JSON value from localStorage.
 * @param {string} key - The localStorage key.
 * @param {*} fallback - The fallback value if read/parse fails.
 * @returns {*} The parsed value or the fallback.
 */
function readFromStorage(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null || raw === undefined) {
      return fallback;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.warn(`[storage] Failed to read "${key}" from localStorage:`, err);
    return fallback;
  }
}

/**
 * Safely stringify and write a value to localStorage.
 * @param {string} key - The localStorage key.
 * @param {*} value - The value to persist.
 */
function writeToStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.warn(`[storage] Failed to write "${key}" to localStorage:`, err);
  }
}

/**
 * Safely remove a key from localStorage.
 * @param {string} key - The localStorage key.
 */
function removeFromStorage(key) {
  try {
    localStorage.removeItem(key);
  } catch (err) {
    console.warn(`[storage] Failed to remove "${key}" from localStorage:`, err);
  }
}

/**
 * Get all posts from localStorage.
 * @returns {Array<Object>} Array of post objects, or empty array on failure.
 */
export function getPosts() {
  return readFromStorage(KEYS.POSTS, []);
}

/**
 * Save posts array to localStorage.
 * @param {Array<Object>} posts - The posts array to persist.
 */
export function savePosts(posts) {
  writeToStorage(KEYS.POSTS, posts);
}

/**
 * Get all users from localStorage.
 * @returns {Array<Object>} Array of user objects, or empty array on failure.
 */
export function getUsers() {
  return readFromStorage(KEYS.USERS, []);
}

/**
 * Save users array to localStorage.
 * @param {Array<Object>} users - The users array to persist.
 */
export function saveUsers(users) {
  writeToStorage(KEYS.USERS, users);
}

/**
 * Get the current session from localStorage.
 * @returns {Object|null} The session object, or null if not logged in or on failure.
 */
export function getSession() {
  return readFromStorage(KEYS.SESSION, null);
}

/**
 * Save a session object to localStorage.
 * @param {Object} session - The session object to persist.
 */
export function saveSession(session) {
  writeToStorage(KEYS.SESSION, session);
}

/**
 * Clear the current session from localStorage (logout).
 */
export function clearSession() {
  removeFromStorage(KEYS.SESSION);
}