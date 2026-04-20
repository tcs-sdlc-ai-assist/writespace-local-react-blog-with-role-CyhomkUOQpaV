import PropTypes from 'prop-types';

const avatarConfig = {
  Admin: {
    emoji: '👑',
    bgClass: 'bg-violet-600',
  },
  User: {
    emoji: '📖',
    bgClass: 'bg-indigo-500',
  },
};

const defaultConfig = {
  emoji: '📖',
  bgClass: 'bg-indigo-500',
};

export function getAvatar(role) {
  const config = avatarConfig[role] || defaultConfig;

  return (
    <span
      className={`${config.bgClass} inline-flex h-8 w-8 items-center justify-center rounded-full text-white text-sm font-medium select-none`}
      role="img"
      aria-label={`${role || 'User'} avatar`}
    >
      {config.emoji}
    </span>
  );
}

export function Avatar({ role }) {
  return getAvatar(role);
}

Avatar.propTypes = {
  role: PropTypes.oneOf(['Admin', 'User']),
};

Avatar.defaultProps = {
  role: 'User',
};

export default Avatar;