import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import * as auth from '../utils/auth';

vi.mock('../utils/auth', () => ({
  getCurrentUser: vi.fn(),
}));

function renderWithRouter(initialRoute, role) {
  return render(
    <MemoryRouter initialEntries={[initialRoute]}>
      <Routes>
        <Route element={<ProtectedRoute role={role} />}>
          <Route
            path="/protected"
            element={<div data-testid="protected-content">Protected Content</div>}
          />
          <Route
            path="/admin-only"
            element={<div data-testid="admin-content">Admin Content</div>}
          />
        </Route>
        <Route
          path="/login"
          element={<div data-testid="login-page">Login Page</div>}
        />
        <Route
          path="/blogs"
          element={<div data-testid="blogs-page">Blogs Page</div>}
        />
      </Routes>
    </MemoryRouter>
  );
}

describe('ProtectedRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('when user is not authenticated', () => {
    it('redirects to /login when no user session exists', () => {
      auth.getCurrentUser.mockReturnValue(null);

      renderWithRouter('/protected');

      expect(screen.getByTestId('login-page')).toBeInTheDocument();
      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
    });

    it('redirects to /login when accessing an admin route without session', () => {
      auth.getCurrentUser.mockReturnValue(null);

      renderWithRouter('/admin-only', 'admin');

      expect(screen.getByTestId('login-page')).toBeInTheDocument();
      expect(screen.queryByTestId('admin-content')).not.toBeInTheDocument();
    });
  });

  describe('when user is authenticated with user role', () => {
    const userSession = {
      userId: 'user-1',
      username: 'alice',
      displayName: 'Alice',
      role: 'user',
    };

    it('renders the protected content for a regular protected route', () => {
      auth.getCurrentUser.mockReturnValue(userSession);

      renderWithRouter('/protected');

      expect(screen.getByTestId('protected-content')).toBeInTheDocument();
      expect(screen.queryByTestId('login-page')).not.toBeInTheDocument();
    });

    it('redirects to /blogs when non-admin user accesses an admin route', () => {
      auth.getCurrentUser.mockReturnValue(userSession);

      renderWithRouter('/admin-only', 'admin');

      expect(screen.getByTestId('blogs-page')).toBeInTheDocument();
      expect(screen.queryByTestId('admin-content')).not.toBeInTheDocument();
    });
  });

  describe('when user is authenticated with admin role', () => {
    const adminSession = {
      userId: 'admin',
      username: 'admin',
      displayName: 'Admin',
      role: 'admin',
    };

    it('renders the protected content for a regular protected route', () => {
      auth.getCurrentUser.mockReturnValue(adminSession);

      renderWithRouter('/protected');

      expect(screen.getByTestId('protected-content')).toBeInTheDocument();
      expect(screen.queryByTestId('login-page')).not.toBeInTheDocument();
    });

    it('renders the admin content when admin accesses an admin route', () => {
      auth.getCurrentUser.mockReturnValue(adminSession);

      renderWithRouter('/admin-only', 'admin');

      expect(screen.getByTestId('admin-content')).toBeInTheDocument();
      expect(screen.queryByTestId('blogs-page')).not.toBeInTheDocument();
    });
  });

  describe('when role prop is not provided', () => {
    it('renders content for any authenticated user when no role is specified', () => {
      const userSession = {
        userId: 'user-1',
        username: 'bob',
        displayName: 'Bob',
        role: 'user',
      };
      auth.getCurrentUser.mockReturnValue(userSession);

      renderWithRouter('/protected');

      expect(screen.getByTestId('protected-content')).toBeInTheDocument();
    });

    it('redirects to /login for unauthenticated user when no role is specified', () => {
      auth.getCurrentUser.mockReturnValue(null);

      renderWithRouter('/protected');

      expect(screen.getByTestId('login-page')).toBeInTheDocument();
    });
  });
});