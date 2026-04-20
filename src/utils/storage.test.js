import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  getPosts,
  savePosts,
  getUsers,
  saveUsers,
  getSession,
  saveSession,
  clearSession,
} from './storage';

describe('storage utilities', () => {
  let getItemSpy;
  let setItemSpy;
  let removeItemSpy;

  beforeEach(() => {
    localStorage.clear();
    getItemSpy = vi.spyOn(Storage.prototype, 'getItem');
    setItemSpy = vi.spyOn(Storage.prototype, 'setItem');
    removeItemSpy = vi.spyOn(Storage.prototype, 'removeItem');
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getPosts', () => {
    it('returns an empty array when no posts are stored', () => {
      const result = getPosts();
      expect(result).toEqual([]);
      expect(getItemSpy).toHaveBeenCalledWith('writespace_posts');
    });

    it('returns parsed posts array from localStorage', () => {
      const posts = [
        { id: '1', title: 'First Post', content: 'Hello world' },
        { id: '2', title: 'Second Post', content: 'Goodbye world' },
      ];
      localStorage.setItem('writespace_posts', JSON.stringify(posts));

      const result = getPosts();
      expect(result).toEqual(posts);
    });

    it('returns empty array when localStorage contains invalid JSON', () => {
      localStorage.setItem('writespace_posts', '{not valid json!!!');

      const result = getPosts();
      expect(result).toEqual([]);
      expect(console.warn).toHaveBeenCalled();
    });

    it('returns empty array when localStorage.getItem throws', () => {
      getItemSpy.mockImplementation(() => {
        throw new Error('Storage access denied');
      });

      const result = getPosts();
      expect(result).toEqual([]);
      expect(console.warn).toHaveBeenCalled();
    });
  });

  describe('savePosts', () => {
    it('persists posts array to localStorage', () => {
      const posts = [{ id: '1', title: 'Test', content: 'Content' }];
      savePosts(posts);

      expect(setItemSpy).toHaveBeenCalledWith(
        'writespace_posts',
        JSON.stringify(posts)
      );
      const stored = JSON.parse(localStorage.getItem('writespace_posts'));
      expect(stored).toEqual(posts);
    });

    it('handles empty array', () => {
      savePosts([]);

      const stored = JSON.parse(localStorage.getItem('writespace_posts'));
      expect(stored).toEqual([]);
    });

    it('does not throw when localStorage.setItem fails', () => {
      setItemSpy.mockImplementation(() => {
        throw new Error('QuotaExceededError');
      });

      expect(() => savePosts([{ id: '1' }])).not.toThrow();
      expect(console.warn).toHaveBeenCalled();
    });
  });

  describe('getUsers', () => {
    it('returns an empty array when no users are stored', () => {
      const result = getUsers();
      expect(result).toEqual([]);
      expect(getItemSpy).toHaveBeenCalledWith('writespace_users');
    });

    it('returns parsed users array from localStorage', () => {
      const users = [
        { id: '1', name: 'Alice', role: 'Admin' },
        { id: '2', name: 'Bob', role: 'User' },
      ];
      localStorage.setItem('writespace_users', JSON.stringify(users));

      const result = getUsers();
      expect(result).toEqual(users);
    });

    it('returns empty array when localStorage contains corrupted data', () => {
      localStorage.setItem('writespace_users', 'corrupted-data');

      const result = getUsers();
      expect(result).toEqual([]);
      expect(console.warn).toHaveBeenCalled();
    });

    it('returns empty array when localStorage.getItem throws', () => {
      getItemSpy.mockImplementation(() => {
        throw new Error('SecurityError');
      });

      const result = getUsers();
      expect(result).toEqual([]);
    });
  });

  describe('saveUsers', () => {
    it('persists users array to localStorage', () => {
      const users = [{ id: '1', name: 'Alice', role: 'Admin' }];
      saveUsers(users);

      expect(setItemSpy).toHaveBeenCalledWith(
        'writespace_users',
        JSON.stringify(users)
      );
      const stored = JSON.parse(localStorage.getItem('writespace_users'));
      expect(stored).toEqual(users);
    });

    it('does not throw when localStorage.setItem fails', () => {
      setItemSpy.mockImplementation(() => {
        throw new Error('QuotaExceededError');
      });

      expect(() => saveUsers([{ id: '1' }])).not.toThrow();
      expect(console.warn).toHaveBeenCalled();
    });
  });

  describe('getSession', () => {
    it('returns null when no session is stored', () => {
      const result = getSession();
      expect(result).toBeNull();
      expect(getItemSpy).toHaveBeenCalledWith('writespace_session');
    });

    it('returns parsed session object from localStorage', () => {
      const session = { userId: '1', name: 'Alice', role: 'Admin', token: 'abc123' };
      localStorage.setItem('writespace_session', JSON.stringify(session));

      const result = getSession();
      expect(result).toEqual(session);
    });

    it('returns null when session data is invalid JSON', () => {
      localStorage.setItem('writespace_session', '{{invalid}}');

      const result = getSession();
      expect(result).toBeNull();
      expect(console.warn).toHaveBeenCalled();
    });

    it('returns null when localStorage.getItem throws', () => {
      getItemSpy.mockImplementation(() => {
        throw new Error('Storage access denied');
      });

      const result = getSession();
      expect(result).toBeNull();
    });
  });

  describe('saveSession', () => {
    it('persists session object to localStorage', () => {
      const session = { userId: '1', name: 'Alice', role: 'Admin' };
      saveSession(session);

      expect(setItemSpy).toHaveBeenCalledWith(
        'writespace_session',
        JSON.stringify(session)
      );
      const stored = JSON.parse(localStorage.getItem('writespace_session'));
      expect(stored).toEqual(session);
    });

    it('does not throw when localStorage.setItem fails', () => {
      setItemSpy.mockImplementation(() => {
        throw new Error('QuotaExceededError');
      });

      expect(() => saveSession({ userId: '1' })).not.toThrow();
      expect(console.warn).toHaveBeenCalled();
    });
  });

  describe('clearSession', () => {
    it('removes session from localStorage', () => {
      const session = { userId: '1', name: 'Alice' };
      localStorage.setItem('writespace_session', JSON.stringify(session));

      clearSession();

      expect(removeItemSpy).toHaveBeenCalledWith('writespace_session');
      expect(localStorage.getItem('writespace_session')).toBeNull();
    });

    it('does not throw when no session exists', () => {
      expect(() => clearSession()).not.toThrow();
      expect(removeItemSpy).toHaveBeenCalledWith('writespace_session');
    });

    it('does not throw when localStorage.removeItem fails', () => {
      removeItemSpy.mockImplementation(() => {
        throw new Error('Storage access denied');
      });

      expect(() => clearSession()).not.toThrow();
      expect(console.warn).toHaveBeenCalled();
    });
  });

  describe('round-trip persistence', () => {
    it('saves and retrieves posts correctly', () => {
      const posts = [
        { id: 'a', title: 'Post A', content: 'Content A', createdAt: '2024-01-01T00:00:00.000Z' },
        { id: 'b', title: 'Post B', content: 'Content B', createdAt: '2024-01-02T00:00:00.000Z' },
      ];
      savePosts(posts);
      expect(getPosts()).toEqual(posts);
    });

    it('saves and retrieves users correctly', () => {
      const users = [
        { id: 'u1', name: 'Admin User', role: 'Admin' },
      ];
      saveUsers(users);
      expect(getUsers()).toEqual(users);
    });

    it('saves and retrieves session correctly', () => {
      const session = { userId: 'u1', name: 'Test User', role: 'User' };
      saveSession(session);
      expect(getSession()).toEqual(session);
    });

    it('clearSession removes session so getSession returns null', () => {
      saveSession({ userId: 'u1', name: 'Test' });
      expect(getSession()).not.toBeNull();

      clearSession();
      expect(getSession()).toBeNull();
    });
  });
});