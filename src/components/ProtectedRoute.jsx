import { Navigate, Outlet } from 'react-router-dom';
import PropTypes from 'prop-types';
import { getCurrentUser } from '../utils/auth';

export function ProtectedRoute({ role }) {
  const user = getCurrentUser();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (role === 'admin' && user.role !== 'admin') {
    return <Navigate to="/blogs" replace />;
  }

  return <Outlet />;
}

ProtectedRoute.propTypes = {
  role: PropTypes.string,
};

ProtectedRoute.defaultProps = {
  role: null,
};

export default ProtectedRoute;