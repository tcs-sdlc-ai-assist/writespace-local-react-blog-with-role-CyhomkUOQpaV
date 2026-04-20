import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Home from './Home';
import * as storage from '../utils/storage';
import * as auth from '../utils/auth';

vi.mock('../utils/storage', () => ({
  getPosts: vi.fn(),
  savePosts: vi.fn(),
  getUsers: vi.fn(),
  saveUsers: vi.fn(),
  getSession: vi.fn(),
  saveSession: vi.fn(),
  clearSession: vi.fn(),
}));

vi.mock('../utils/auth', () => ({
  getCurrentUser: vi.fn(),
  isAdmin: vi.fn(),
  login: vi.fn(),
  logout: vi.fn(),
  register: vi.fn(),
}));

function renderHome() {
  return render(
    <MemoryRouter>
      <Home />
    </MemoryRouter>
  );
}

const mockPosts = [
  {
    id: 'post-1',
    title: 'First Post',
    content: 'This is the first post content.',
    createdAt: '2024-01-10T10:00:00.000Z',
    authorId: 'user-1',
    authorName: 'Alice',
  },
  {
    id: 'post-2',
    title: 'Second Post',
    content: 'This is the second post content.',
    createdAt: '2024-01-15T10:00:00.000Z',
    authorId: 'user-2',
    authorName: 'Bob',
  },
  {
    id: 'post-3',
    title: 'Third Post',
    content: 'This is the third post content.',
    createdAt: '2024-01-20T10:00:00.000Z',
    authorId: 'admin',
    authorName: 'Admin',
  },
];

describe('Home', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    storage.getPosts.mockReturnValue([]);
    auth.getCurrentUser.mockReturnValue(null);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('empty state', () => {
    it('renders empty state message when there are no posts', () => {
      storage.getPosts.mockReturnValue([]);
      auth.getCurrentUser.mockReturnValue(null);

      renderHome();

      expect(screen.getByText('No posts yet')).toBeInTheDocument();
      expect(
        screen.getByText(/It looks like there are no blog posts yet/)
      ).toBeInTheDocument();
    });

    it('renders a link to write the first post in empty state', () => {
      storage.getPosts.mockReturnValue([]);
      auth.getCurrentUser.mockReturnValue(null);

      renderHome();

      const writeLink = screen.getByRole('link', { name: /write your first post/i });
      expect(writeLink).toBeInTheDocument();
      expect(writeLink).toHaveAttribute('href', '/write');
    });
  });

  describe('rendering blog cards', () => {
    it('renders blog cards for each post', () => {
      storage.getPosts.mockReturnValue(mockPosts);
      auth.getCurrentUser.mockReturnValue(null);

      renderHome();

      expect(screen.getByText('First Post')).toBeInTheDocument();
      expect(screen.getByText('Second Post')).toBeInTheDocument();
      expect(screen.getByText('Third Post')).toBeInTheDocument();
    });

    it('displays the correct post count', () => {
      storage.getPosts.mockReturnValue(mockPosts);
      auth.getCurrentUser.mockReturnValue(null);

      renderHome();

      expect(screen.getByText('3 posts published')).toBeInTheDocument();
    });

    it('displays singular post count for one post', () => {
      storage.getPosts.mockReturnValue([mockPosts[0]]);
      auth.getCurrentUser.mockReturnValue(null);

      renderHome();

      expect(screen.getByText('1 post published')).toBeInTheDocument();
    });

    it('renders a New Post link when posts exist', () => {
      storage.getPosts.mockReturnValue(mockPosts);
      auth.getCurrentUser.mockReturnValue(null);

      renderHome();

      const newPostLink = screen.getByRole('link', { name: /new post/i });
      expect(newPostLink).toBeInTheDocument();
      expect(newPostLink).toHaveAttribute('href', '/write');
    });

    it('renders author names on blog cards', () => {
      storage.getPosts.mockReturnValue(mockPosts);
      auth.getCurrentUser.mockReturnValue(null);

      renderHome();

      expect(screen.getByText('Alice')).toBeInTheDocument();
      expect(screen.getByText('Bob')).toBeInTheDocument();
      expect(screen.getByText('Admin')).toBeInTheDocument();
    });
  });

  describe('sorting newest first', () => {
    it('renders posts sorted by createdAt descending (newest first)', () => {
      const unsortedPosts = [
        {
          id: 'old',
          title: 'Old Post',
          content: 'Old content',
          createdAt: '2024-01-01T00:00:00.000Z',
          authorId: 'user-1',
          authorName: 'Alice',
        },
        {
          id: 'new',
          title: 'New Post',
          content: 'New content',
          createdAt: '2024-06-01T00:00:00.000Z',
          authorId: 'user-2',
          authorName: 'Bob',
        },
        {
          id: 'mid',
          title: 'Mid Post',
          content: 'Mid content',
          createdAt: '2024-03-01T00:00:00.000Z',
          authorId: 'user-3',
          authorName: 'Charlie',
        },
      ];
      storage.getPosts.mockReturnValue(unsortedPosts);
      auth.getCurrentUser.mockReturnValue(null);

      renderHome();

      const headings = screen.getAllByRole('heading', { level: 3 });
      const titles = headings.map((h) => h.textContent);

      expect(titles[0]).toBe('New Post');
      expect(titles[1]).toBe('Mid Post');
      expect(titles[2]).toBe('Old Post');
    });
  });

  describe('edit icon visibility based on role/ownership', () => {
    it('does not show edit buttons when user is not logged in', () => {
      storage.getPosts.mockReturnValue(mockPosts);
      auth.getCurrentUser.mockReturnValue(null);

      renderHome();

      const editButtons = screen.queryAllByRole('button', { name: /edit/i });
      expect(editButtons).toHaveLength(0);
    });

    it('shows edit button only on posts owned by the current user', () => {
      storage.getPosts.mockReturnValue(mockPosts);
      auth.getCurrentUser.mockReturnValue({
        userId: 'user-1',
        username: 'alice',
        displayName: 'Alice',
        role: 'user',
      });

      renderHome();

      const editButtons = screen.queryAllByRole('button', { name: /edit/i });
      expect(editButtons).toHaveLength(1);
      expect(editButtons[0]).toHaveAttribute('aria-label', 'Edit First Post');
    });

    it('shows edit buttons on all posts when user is admin', () => {
      storage.getPosts.mockReturnValue(mockPosts);
      auth.getCurrentUser.mockReturnValue({
        userId: 'admin',
        username: 'admin',
        displayName: 'Admin',
        role: 'admin',
      });

      renderHome();

      const editButtons = screen.queryAllByRole('button', { name: /edit/i });
      expect(editButtons).toHaveLength(3);
    });

    it('does not show edit button on posts not owned by a regular user', () => {
      storage.getPosts.mockReturnValue(mockPosts);
      auth.getCurrentUser.mockReturnValue({
        userId: 'user-2',
        username: 'bob',
        displayName: 'Bob',
        role: 'user',
      });

      renderHome();

      const editButtons = screen.queryAllByRole('button', { name: /edit/i });
      expect(editButtons).toHaveLength(1);
      expect(editButtons[0]).toHaveAttribute('aria-label', 'Edit Second Post');
    });
  });

  describe('blog card links', () => {
    it('renders links to individual blog posts', () => {
      storage.getPosts.mockReturnValue([mockPosts[0]]);
      auth.getCurrentUser.mockReturnValue(null);

      renderHome();

      const postLink = screen.getByRole('link', { name: /First Post/i });
      expect(postLink).toHaveAttribute('href', '/blog/post-1');
    });
  });
});