import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getPosts } from '../utils/storage';
import { getCurrentUser } from '../utils/auth';
import { BlogCard } from '../components/BlogCard';

function Home() {
  const [posts, setPosts] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const user = getCurrentUser();
    setCurrentUser(user);

    const allPosts = getPosts();
    const sorted = [...allPosts].sort((a, b) => {
      const dateA = new Date(a.createdAt || 0);
      const dateB = new Date(b.createdAt || 0);
      return dateB - dateA;
    });
    setPosts(sorted);
  }, []);

  const handleEdit = (post) => {
    window.location.href = `/write/${post.id}`;
  };

  if (posts.length === 0) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary-50 dark:bg-primary-900/20">
          <span className="text-4xl" role="img" aria-label="Writing">
            ✍️
          </span>
        </div>
        <h2 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">
          No posts yet
        </h2>
        <p className="mb-6 max-w-md text-gray-500 dark:text-gray-400">
          It looks like there are no blog posts yet. Be the first to share your thoughts with the community!
        </p>
        <Link
          to="/write"
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-primary px-6 py-3 text-sm font-semibold text-white shadow-sm transition-shadow hover:shadow-md"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="h-5 w-5"
            aria-hidden="true"
          >
            <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
          </svg>
          Write your first post
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Blog Posts
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {posts.length} {posts.length === 1 ? 'post' : 'posts'} published
          </p>
        </div>
        <Link
          to="/write"
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-shadow hover:shadow-md"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="h-4 w-4"
            aria-hidden="true"
          >
            <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
          </svg>
          New Post
        </Link>
      </div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <BlogCard
            key={post.id}
            post={post}
            currentUser={currentUser}
            onEdit={handleEdit}
          />
        ))}
      </div>
    </div>
  );
}

export default Home;