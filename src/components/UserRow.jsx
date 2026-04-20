import PropTypes from 'prop-types';
import { Avatar } from './Avatar';

const roleBadgeStyles = {
  Admin:
    'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300',
  User:
    'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300',
};

const defaultBadgeStyle =
  'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300';

function formatDate(dateString) {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return 'Unknown';
    }
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return 'Unknown';
  }
}

export function UserRow({ user, onDelete, isCurrentUser, isProtectedAdmin }) {
  const deleteDisabled = isCurrentUser || isProtectedAdmin;

  let deleteTooltip = 'Delete user';
  if (isProtectedAdmin) {
    deleteTooltip = 'Cannot delete the protected admin account';
  } else if (isCurrentUser) {
    deleteTooltip = 'Cannot delete your own account';
  }

  const badgeStyle = roleBadgeStyles[user.role] || defaultBadgeStyle;

  return (
    <div className="flex items-center justify-between gap-4 rounded-xl bg-white p-4 shadow-sm transition-shadow hover:shadow-md dark:bg-gray-800">
      <div className="flex items-center gap-4 min-w-0">
        <Avatar role={user.role} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="truncate text-sm font-semibold text-gray-900 dark:text-white">
              {user.displayName || user.username}
            </p>
            {isCurrentUser && (
              <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                You
              </span>
            )}
          </div>
          <p className="truncate text-sm text-gray-500 dark:text-gray-400">
            @{user.username}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4 flex-shrink-0">
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${badgeStyle}`}
        >
          {user.role || 'User'}
        </span>

        <span className="hidden text-sm text-gray-500 dark:text-gray-400 sm:inline">
          {formatDate(user.createdAt)}
        </span>

        <button
          type="button"
          onClick={() => onDelete(user)}
          disabled={deleteDisabled}
          title={deleteTooltip}
          className={`inline-flex items-center justify-center rounded-lg px-3 py-1.5 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 ${
            deleteDisabled
              ? 'cursor-not-allowed bg-gray-100 text-gray-400 dark:bg-gray-700 dark:text-gray-500'
              : 'bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40'
          }`}
        >
          Delete
        </button>
      </div>
    </div>
  );
}

UserRow.propTypes = {
  user: PropTypes.shape({
    id: PropTypes.string,
    username: PropTypes.string.isRequired,
    displayName: PropTypes.string,
    role: PropTypes.oneOf(['Admin', 'User']),
    createdAt: PropTypes.string,
  }).isRequired,
  onDelete: PropTypes.func.isRequired,
  isCurrentUser: PropTypes.bool,
  isProtectedAdmin: PropTypes.bool,
};

UserRow.defaultProps = {
  isCurrentUser: false,
  isProtectedAdmin: false,
};

export default UserRow;