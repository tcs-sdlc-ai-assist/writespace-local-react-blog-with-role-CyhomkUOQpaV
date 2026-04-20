import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { login, logout, register, getCurrentUser, isAdmin } from './auth';
import * as storage from './storage';

vi.mock('./storage', () => ({
  getUsers: vi.fn(),
  saveUsers: vi.fn(),
  getSession: vi.fn(),
  saveSession: vi.fn(),
  clearSession: vi.fn(),
}));

vi.mock('uuid', () => ({
  v4: () => 'test-uuid-1234',
}));

describe('auth utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    storage.getUsers.mockReturnValue([]);
    storage.getSession.mockReturnValue(null);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('login', () => {
    it('authenticates the hard-coded admin with correct credentials', () => {
      const result = login('admin', 'admin123');

      expect(result.success).toBe(true);
      expect(result.session).toEqual({
        userId: 'admin',
        username: 'admin',
        displayName: 'Admin',
        role: 'admin',
      });
      expect(storage.saveSession).toHaveBeenCalledWith({
        userId: 'admin',
        username: 'admin',
        displayName: 'Admin',
        role: 'admin',
      });
    });

    it('authenticates the admin with case-insensitive username', () => {
      const result = login('Admin', 'admin123');

      expect(result.success).toBe(true);
      expect(result.session.username).toBe('admin');
    });

    it('authenticates the admin with leading/trailing whitespace in username', () => {
      const result = login('  admin  ', 'admin123');

      expect(result.success).toBe(true);
      expect(result.session.username).toBe('admin');
    });

    it('rejects admin login with wrong password', () => {
      const result = login('admin', 'wrongpassword');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid credentials');
      expect(storage.saveSession).not.toHaveBeenCalled();
    });

    it('authenticates a localStorage user with correct credentials', () => {
      const users = [
        {
          id: 'user-1',
          username: 'alice',
          displayName: 'Alice',
          password: 'password123',
          role: 'user',
        },
      ];
      storage.getUsers.mockReturnValue(users);

      const result = login('alice', 'password123');

      expect(result.success).toBe(true);
      expect(result.session).toEqual({
        userId: 'user-1',
        username: 'alice',
        displayName: 'Alice',
        role: 'user',
      });
      expect(storage.saveSession).toHaveBeenCalledWith({
        userId: 'user-1',
        username: 'alice',
        displayName: 'Alice',
        role: 'user',
      });
    });

    it('authenticates a localStorage user with case-insensitive username', () => {
      const users = [
        {
          id: 'user-1',
          username: 'Alice',
          displayName: 'Alice',
          password: 'password123',
          role: 'user',
        },
      ];
      storage.getUsers.mockReturnValue(users);

      const result = login('alice', 'password123');

      expect(result.success).toBe(true);
      expect(result.session.userId).toBe('user-1');
    });

    it('rejects login with wrong password for localStorage user', () => {
      const users = [
        {
          id: 'user-1',
          username: 'alice',
          displayName: 'Alice',
          password: 'password123',
          role: 'user',
        },
      ];
      storage.getUsers.mockReturnValue(users);

      const result = login('alice', 'wrongpassword');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid credentials');
    });

    it('rejects login with non-existent username', () => {
      storage.getUsers.mockReturnValue([]);

      const result = login('nonexistent', 'password123');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid credentials');
    });

    it('returns error when username is empty', () => {
      const result = login('', 'password123');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Username and password are required');
    });

    it('returns error when password is empty', () => {
      const result = login('admin', '');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Username and password are required');
    });

    it('returns error when both username and password are empty', () => {
      const result = login('', '');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Username and password are required');
    });

    it('returns error when username is null', () => {
      const result = login(null, 'password123');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Username and password are required');
    });

    it('returns error when password is undefined', () => {
      const result = login('admin', undefined);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Username and password are required');
    });
  });

  describe('logout', () => {
    it('clears the session from localStorage', () => {
      logout();

      expect(storage.clearSession).toHaveBeenCalledTimes(1);
    });
  });

  describe('register', () => {
    it('creates a new user with valid data', () => {
      storage.getUsers.mockReturnValue([]);

      const result = register({
        displayName: 'Bob',
        username: 'bob',
        password: 'password123',
      });

      expect(result.success).toBe(true);
      expect(result.session).toEqual({
        userId: 'test-uuid-1234',
        username: 'bob',
        displayName: 'Bob',
        role: 'user',
      });
      expect(storage.saveUsers).toHaveBeenCalledTimes(1);
      const savedUsers = storage.saveUsers.mock.calls[0][0];
      expect(savedUsers).toHaveLength(1);
      expect(savedUsers[0]).toMatchObject({
        id: 'test-uuid-1234',
        displayName: 'Bob',
        username: 'bob',
        password: 'password123',
        role: 'user',
      });
      expect(savedUsers[0].createdAt).toBeDefined();
      expect(storage.saveSession).toHaveBeenCalledWith({
        userId: 'test-uuid-1234',
        username: 'bob',
        displayName: 'Bob',
        role: 'user',
      });
    });

    it('trims whitespace from displayName and username', () => {
      storage.getUsers.mockReturnValue([]);

      const result = register({
        displayName: '  Bob  ',
        username: '  bob  ',
        password: 'password123',
      });

      expect(result.success).toBe(true);
      expect(result.session.displayName).toBe('Bob');
      expect(result.session.username).toBe('bob');
    });

    it('rejects registration with duplicate username (case-insensitive)', () => {
      const users = [
        {
          id: 'user-1',
          username: 'alice',
          displayName: 'Alice',
          password: 'password123',
          role: 'user',
        },
      ];
      storage.getUsers.mockReturnValue(users);

      const result = register({
        displayName: 'Alice 2',
        username: 'Alice',
        password: 'password456',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Username is already taken');
      expect(storage.saveUsers).not.toHaveBeenCalled();
      expect(storage.saveSession).not.toHaveBeenCalled();
    });

    it('rejects registration with the admin username', () => {
      storage.getUsers.mockReturnValue([]);

      const result = register({
        displayName: 'Fake Admin',
        username: 'admin',
        password: 'password123',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Username is already taken');
    });

    it('rejects registration with the admin username (case-insensitive)', () => {
      storage.getUsers.mockReturnValue([]);

      const result = register({
        displayName: 'Fake Admin',
        username: 'ADMIN',
        password: 'password123',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Username is already taken');
    });

    it('returns error when displayName is missing', () => {
      const result = register({
        displayName: '',
        username: 'bob',
        password: 'password123',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('All fields are required');
    });

    it('returns error when username is missing', () => {
      const result = register({
        displayName: 'Bob',
        username: '',
        password: 'password123',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('All fields are required');
    });

    it('returns error when password is missing', () => {
      const result = register({
        displayName: 'Bob',
        username: 'bob',
        password: '',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('All fields are required');
    });

    it('returns error when all fields are missing', () => {
      const result = register({});

      expect(result.success).toBe(false);
      expect(result.error).toBe('All fields are required');
    });

    it('returns error when called with no arguments', () => {
      const result = register();

      expect(result.success).toBe(false);
      expect(result.error).toBe('All fields are required');
    });

    it('returns error when password is shorter than 6 characters', () => {
      storage.getUsers.mockReturnValue([]);

      const result = register({
        displayName: 'Bob',
        username: 'bob',
        password: '12345',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Password must be at least 6 characters');
    });

    it('accepts password with exactly 6 characters', () => {
      storage.getUsers.mockReturnValue([]);

      const result = register({
        displayName: 'Bob',
        username: 'bob',
        password: '123456',
      });

      expect(result.success).toBe(true);
    });

    it('returns error when displayName is only whitespace', () => {
      const result = register({
        displayName: '   ',
        username: 'bob',
        password: 'password123',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Display name is required');
    });

    it('returns error when username is only whitespace', () => {
      const result = register({
        displayName: 'Bob',
        username: '   ',
        password: 'password123',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Username is required');
    });

    it('appends new user to existing users array', () => {
      const existingUsers = [
        {
          id: 'user-1',
          username: 'alice',
          displayName: 'Alice',
          password: 'password123',
          role: 'user',
        },
      ];
      storage.getUsers.mockReturnValue(existingUsers);

      const result = register({
        displayName: 'Bob',
        username: 'bob',
        password: 'password123',
      });

      expect(result.success).toBe(true);
      const savedUsers = storage.saveUsers.mock.calls[0][0];
      expect(savedUsers).toHaveLength(2);
      expect(savedUsers[0].username).toBe('alice');
      expect(savedUsers[1].username).toBe('bob');
    });
  });

  describe('getCurrentUser', () => {
    it('returns the session when a user is logged in', () => {
      const session = {
        userId: 'user-1',
        username: 'alice',
        displayName: 'Alice',
        role: 'user',
      };
      storage.getSession.mockReturnValue(session);

      const result = getCurrentUser();

      expect(result).toEqual(session);
      expect(storage.getSession).toHaveBeenCalledTimes(1);
    });

    it('returns null when no user is logged in', () => {
      storage.getSession.mockReturnValue(null);

      const result = getCurrentUser();

      expect(result).toBeNull();
    });
  });

  describe('isAdmin', () => {
    it('returns true when the current user has admin role', () => {
      storage.getSession.mockReturnValue({
        userId: 'admin',
        username: 'admin',
        displayName: 'Admin',
        role: 'admin',
      });

      expect(isAdmin()).toBe(true);
    });

    it('returns false when the current user has user role', () => {
      storage.getSession.mockReturnValue({
        userId: 'user-1',
        username: 'alice',
        displayName: 'Alice',
        role: 'user',
      });

      expect(isAdmin()).toBe(false);
    });

    it('returns false when no user is logged in', () => {
      storage.getSession.mockReturnValue(null);

      expect(isAdmin()).toBe(false);
    });

    it('returns false when session has no role property', () => {
      storage.getSession.mockReturnValue({
        userId: 'user-1',
        username: 'alice',
      });

      expect(isAdmin()).toBe(false);
    });
  });
});