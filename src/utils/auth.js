/**
 * Authentication and session management utilities for WriteSpace.
 *
 * All session data is persisted in localStorage via storage.js.
 * Hard-coded admin credentials: username 'admin', password 'admin123'.
 *
 * Exports:
 *   login(username, password) — authenticate user, returns { success, error?, session? }
 *   logout() — clears session from localStorage
 *   register({ displayName, username, password }) — creates new user, returns { success, error?, session? }
 *   getCurrentUser() — returns current session or null
 *   isAdmin() — returns true if current user has 'admin' role
 */

import { v4 as uuidv4 } from 'uuid';
import {
  getUsers,
  saveUsers,
  getSession,
  saveSession,
  clearSession,
} from './storage.js';

/**
 * Hard-coded admin account.
 * @type {{ userId: string, username: string, displayName: string, role: string, password: string }}
 */
const ADMIN_ACCOUNT = {
  userId: 'admin',
  username: 'admin',
  displayName: 'Admin',
  role: 'admin',
  password: 'admin123',
};

/**
 * Authenticate a user by username and password.
 * Checks the hard-coded admin account first, then localStorage users.
 *
 * @param {string} username - The username to authenticate.
 * @param {string} password - The password to verify.
 * @returns {{ success: boolean, error?: string, session?: Object }}
 */
export function login(username, password) {
  if (!username || !password) {
    return { success: false, error: 'Username and password are required' };
  }

  const trimmedUsername = username.trim();
  const trimmedPassword = password;

  // 1. Check hard-coded admin
  if (
    trimmedUsername.toLowerCase() === ADMIN_ACCOUNT.username.toLowerCase() &&
    trimmedPassword === ADMIN_ACCOUNT.password
  ) {
    const session = {
      userId: ADMIN_ACCOUNT.userId,
      username: ADMIN_ACCOUNT.username,
      displayName: ADMIN_ACCOUNT.displayName,
      role: ADMIN_ACCOUNT.role,
    };
    saveSession(session);
    return { success: true, session };
  }

  // 2. Check localStorage users
  const users = getUsers();
  const user = users.find(
    (u) =>
      u.username.toLowerCase() === trimmedUsername.toLowerCase() &&
      u.password === trimmedPassword
  );

  if (user) {
    const session = {
      userId: user.id,
      username: user.username,
      displayName: user.displayName,
      role: user.role,
    };
    saveSession(session);
    return { success: true, session };
  }

  return { success: false, error: 'Invalid credentials' };
}

/**
 * Log out the current user by clearing the session from localStorage.
 */
export function logout() {
  clearSession();
}

/**
 * Register a new user account.
 * Validates all fields, checks username uniqueness, creates user with 'user' role,
 * saves to localStorage, and starts a session.
 *
 * @param {{ displayName: string, username: string, password: string }} userData
 * @returns {{ success: boolean, error?: string, session?: Object }}
 */
export function register({ displayName, username, password } = {}) {
  // Validate required fields
  if (!displayName || !username || !password) {
    return { success: false, error: 'All fields are required' };
  }

  const trimmedDisplayName = displayName.trim();
  const trimmedUsername = username.trim();

  if (!trimmedDisplayName) {
    return { success: false, error: 'Display name is required' };
  }

  if (!trimmedUsername) {
    return { success: false, error: 'Username is required' };
  }

  // Validate password length
  if (password.length < 6) {
    return { success: false, error: 'Password must be at least 6 characters' };
  }

  // Check against hard-coded admin username
  if (trimmedUsername.toLowerCase() === ADMIN_ACCOUNT.username.toLowerCase()) {
    return { success: false, error: 'Username is already taken' };
  }

  // Check username uniqueness among existing users
  const users = getUsers();
  const exists = users.some(
    (u) => u.username.toLowerCase() === trimmedUsername.toLowerCase()
  );

  if (exists) {
    return { success: false, error: 'Username is already taken' };
  }

  // Create new user
  const newUser = {
    id: uuidv4(),
    displayName: trimmedDisplayName,
    username: trimmedUsername,
    password: password,
    role: 'user',
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);
  saveUsers(users);

  // Start session
  const session = {
    userId: newUser.id,
    username: newUser.username,
    displayName: newUser.displayName,
    role: newUser.role,
  };
  saveSession(session);

  return { success: true, session };
}

/**
 * Get the current authenticated user session from localStorage.
 *
 * @returns {Object|null} The session object, or null if not logged in.
 */
export function getCurrentUser() {
  return getSession();
}

/**
 * Check if the current user has the 'admin' role.
 *
 * @returns {boolean} True if the current user is an admin, false otherwise.
 */
export function isAdmin() {
  const session = getSession();
  return session !== null && session.role === 'admin';
}