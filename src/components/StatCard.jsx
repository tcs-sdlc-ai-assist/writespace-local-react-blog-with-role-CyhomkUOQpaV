import PropTypes from 'prop-types';
import clsx from 'clsx';

const colorMap = {
  blue: {
    gradient: 'from-blue-500 to-blue-600',
    bg: 'bg-blue-50 dark:bg-blue-900/20',
    text: 'text-blue-600 dark:text-blue-400',
  },
  green: {
    gradient: 'from-green-500 to-green-600',
    bg: 'bg-green-50 dark:bg-green-900/20',
    text: 'text-green-600 dark:text-green-400',
  },
  purple: {
    gradient: 'from-purple-500 to-purple-600',
    bg: 'bg-purple-50 dark:bg-purple-900/20',
    text: 'text-purple-600 dark:text-purple-400',
  },
  red: {
    gradient: 'from-red-500 to-red-600',
    bg: 'bg-red-50 dark:bg-red-900/20',
    text: 'text-red-600 dark:text-red-400',
  },
  orange: {
    gradient: 'from-orange-500 to-orange-600',
    bg: 'bg-orange-50 dark:bg-orange-900/20',
    text: 'text-orange-600 dark:text-orange-400',
  },
  teal: {
    gradient: 'from-teal-500 to-teal-600',
    bg: 'bg-teal-50 dark:bg-teal-900/20',
    text: 'text-teal-600 dark:text-teal-400',
  },
};

const defaultColor = {
  gradient: 'from-gray-500 to-gray-600',
  bg: 'bg-gray-50 dark:bg-gray-900/20',
  text: 'text-gray-600 dark:text-gray-400',
};

export function StatCard({ title, value, icon, color = 'blue' }) {
  const colorStyles = colorMap[color] || defaultColor;

  return (
    <div className="relative overflow-hidden rounded-xl bg-white shadow-sm transition-shadow hover:shadow-md dark:bg-gray-800">
      <div
        className={clsx(
          'absolute left-0 top-0 h-full w-1 bg-gradient-to-b',
          colorStyles.gradient
        )}
        aria-hidden="true"
      />
      <div className="flex items-center gap-4 p-5">
        <div
          className={clsx(
            'flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg',
            colorStyles.bg
          )}
        >
          {icon && (
            <span className={clsx('text-xl', colorStyles.text)} aria-hidden="true">
              {icon}
            </span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            {value}
          </p>
          <p className="truncate text-sm font-medium text-gray-500 dark:text-gray-400">
            {title}
          </p>
        </div>
      </div>
    </div>
  );
}

StatCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  icon: PropTypes.node,
  color: PropTypes.oneOf(['blue', 'green', 'purple', 'red', 'orange', 'teal']),
};