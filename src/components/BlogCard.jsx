import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { Avatar } from './Avatar';

function truncateContent(content, maxLength = 120) {
  if (!content) return '';
  if (content.length <= maxLength) return content;
  return content.slice(0, maxLength).trimEnd() + '…';
}

function formatDate(dateString) {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return '';
  }
}

function canEdit(post, currentUser) {
  if (!currentUser || !post) return false;
  if (currentUser.role === 'admin') return true;
  return post.authorId === currentUser.userId;
}

export function BlogCard({ post, currentUser, onEdit }) {
  const excerpt = truncateContent(post.content);
  const date = formatDate(post.createdAt);
  const showEdit = canEdit(post, currentUser);
  const authorRole = post.authorId === 'admin' ? 'Admin' : 'User';

  return (
    <div className="relative flex flex-col overflow-hidden rounded-xl bg-white shadow-card transition-shadow hover:shadow-soft dark:bg-gray-800">
      <Link
        to={`/blog/${post.id}`}
        className="flex flex-1 flex-col p-5"
      >
        <h3 className="mb-2 text-lg font-bold leading-snug text-gray-900 line-clamp-2 dark:text-white">
          {post.title}
        </h3>
        <p className="mb-4 flex-1 text-sm leading-relaxed text-gray-600 dark:text-gray-300">
          {excerpt}
        </p>
        <div className="mt-auto flex items-center gap-3">
          <Avatar role={authorRole} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
              {post.authorName || 'Unknown'}
            </p>
            {date && (
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {date}
              </p>
            )}
          </div>
        </div>
      </Link>
      {showEdit && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            if (onEdit) onEdit(post);
          }}
          className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 text-gray-500 transition-colors hover:bg-primary-100 hover:text-primary-600 dark:bg-gray-700 dark:text-gray-400 dark:hover:bg-primary-900 dark:hover:text-primary-400"
          aria-label={`Edit ${post.title}`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="h-4 w-4"
            aria-hidden="true"
          >
            <path d="M2.695 14.763l-1.262 3.154a.5.5 0 00.65.65l3.155-1.262a4 4 0 001.343-.885L17.5 5.5a2.121 2.121 0 00-3-3L3.58 13.42a4 4 0 00-.885 1.343z" />
          </svg>
        </button>
      )}
    </div>
  );
}

BlogCard.propTypes = {
  post: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    content: PropTypes.string,
    createdAt: PropTypes.string,
    authorId: PropTypes.string,
    authorName: PropTypes.string,
  }).isRequired,
  currentUser: PropTypes.shape({
    userId: PropTypes.string,
    username: PropTypes.string,
    displayName: PropTypes.string,
    role: PropTypes.string,
  }),
  onEdit: PropTypes.func,
};

BlogCard.defaultProps = {
  currentUser: null,
  onEdit: null,
};

export default BlogCard;