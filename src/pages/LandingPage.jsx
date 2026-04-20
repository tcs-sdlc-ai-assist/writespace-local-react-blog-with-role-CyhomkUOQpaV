import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getPosts } from '../utils/storage';
import { getCurrentUser } from '../utils/auth';
import { PublicNavbar } from '../components/PublicNavbar';
import { BlogCard } from '../components/BlogCard';

const features = [
  {
    icon: '✍️',
    title: 'Distraction-Free Writing',
    description:
      'A clean, minimal editor that lets you focus on what matters most — your words. No clutter, no distractions.',
  },
  {
    icon: '💾',
    title: 'Auto-Save to Local Storage',
    description:
      'Your work is automatically saved to your browser. Never worry about losing a draft again.',
  },
  {
    icon: '🌙',
    title: 'Dark Mode Support',
    description:
      'Write comfortably day or night with full dark mode support across the entire application.',
  },
];

export default function LandingPage() {
  const [latestPosts, setLatestPosts] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const user = getCurrentUser();
    setCurrentUser(user);

    try {
      const allPosts = getPosts();
      const sorted = [...allPosts]
        .sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dateB - dateA;
        })
        .slice(0, 3);
      setLatestPosts(sorted);
    } catch (err) {
      console.warn('[LandingPage] Failed to load posts:', err);
    }
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <PublicNavbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-primary px-4 py-20 sm:py-28 lg:py-36">
        <div className="mx-auto max-w-7xl text-center">
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
            Your Space to Write Freely
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-white/80 sm:text-xl">
            WriteSpace is a distraction-free writing environment that saves your work automatically.
            Create, edit, and share your thoughts with a clean, minimal interface.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              to="/register"
              className="inline-flex items-center rounded-xl bg-white px-8 py-3.5 text-sm font-semibold text-primary-700 shadow-sm transition-all hover:bg-gray-50 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-primary-600"
            >
              Get Started
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="ml-2 h-4 w-4"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M3 10a.75.75 0 01.75-.75h10.638l-3.96-3.158a.75.75 0 11.964-1.184l5.5 4.25a.75.75 0 010 1.184l-5.5 4.25a.75.75 0 11-.964-1.184l3.96-3.158H3.75A.75.75 0 013 10z"
                  clipRule="evenodd"
                />
              </svg>
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center rounded-xl border-2 border-white/30 px-8 py-3.5 text-sm font-semibold text-white transition-all hover:border-white/60 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-primary-600"
            >
              Login
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-4 py-16 sm:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
              Everything You Need to Write
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-500 dark:text-gray-400">
              Simple, powerful tools designed to help you focus on creating great content.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="rounded-xl bg-gray-50 p-8 text-center transition-shadow hover:shadow-soft dark:bg-gray-800"
              >
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-primary-50 dark:bg-primary-900/20">
                  <span className="text-2xl" role="img" aria-hidden="true">
                    {feature.icon}
                  </span>
                </div>
                <h3 className="mb-2 text-lg font-bold text-gray-900 dark:text-white">
                  {feature.title}
                </h3>
                <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Latest Posts Section */}
      <section className="border-t border-gray-200 bg-gray-50 px-4 py-16 dark:border-gray-700 dark:bg-gray-800/50 sm:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
              Latest Posts
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-500 dark:text-gray-400">
              Discover what our community has been writing about.
            </p>
          </div>
          {latestPosts.length === 0 ? (
            <div className="mx-auto max-w-md rounded-xl bg-white p-8 text-center shadow-sm dark:bg-gray-800">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary-50 dark:bg-primary-900/20">
                <span className="text-3xl" role="img" aria-label="Writing">
                  📝
                </span>
              </div>
              <p className="mb-4 text-gray-500 dark:text-gray-400">
                No posts yet. Be the first to share your thoughts!
              </p>
              <Link
                to="/register"
                className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
              >
                Start Writing
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {latestPosts.map((post) => (
                <BlogCard
                  key={post.id}
                  post={post}
                  currentUser={currentUser}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white px-4 py-12 dark:border-gray-700 dark:bg-gray-900">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
            <div className="flex items-center gap-2">
              <span
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-primary text-white text-sm"
                aria-hidden="true"
              >
                W
              </span>
              <span className="text-lg font-bold text-gray-900 dark:text-white">
                WriteSpace
              </span>
            </div>
            <nav className="flex flex-wrap items-center justify-center gap-6">
              <Link
                to="/"
                className="text-sm text-gray-500 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
              >
                Home
              </Link>
              <Link
                to="/login"
                className="text-sm text-gray-500 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="text-sm text-gray-500 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
              >
                Register
              </Link>
            </nav>
          </div>
          <div className="mt-8 border-t border-gray-200 pt-8 text-center dark:border-gray-700">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              &copy; {new Date().getFullYear()} WriteSpace. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}