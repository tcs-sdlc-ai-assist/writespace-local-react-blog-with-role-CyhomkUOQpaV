import { Link } from 'react-router-dom';
import { getCurrentUser } from '../utils/auth';
import { Avatar } from './Avatar';

export function PublicNavbar() {
  const user = getCurrentUser();
  const isAuthenticated = user !== null;

  return (
    <nav className="sticky top-0 z-50 border-b border-gray-200 bg-white/80 backdrop-blur-md dark:border-gray-700 dark:bg-gray-900/80">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link
          to="/"
          className="flex items-center gap-2 text-xl font-bold tracking-tight text-gray-900 transition-colors hover:text-primary-600 dark:text-white dark:hover:text-primary-400"
        >
          <span
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-primary text-white text-sm"
            aria-hidden="true"
          >
            W
          </span>
          <span>WriteSpace</span>
        </Link>

        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <Link
                to="/dashboard"
                className="inline-flex items-center rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
              >
                Dashboard
              </Link>
              <Link
                to="/dashboard"
                className="flex items-center gap-2"
                aria-label="Go to dashboard"
              >
                <Avatar role={user.role === 'admin' ? 'Admin' : 'User'} />
                <span className="hidden text-sm font-medium text-gray-700 dark:text-gray-300 sm:inline">
                  {user.displayName || user.username}
                </span>
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="inline-flex items-center rounded-lg px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white dark:focus:ring-offset-gray-900"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="inline-flex items-center rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default PublicNavbar;