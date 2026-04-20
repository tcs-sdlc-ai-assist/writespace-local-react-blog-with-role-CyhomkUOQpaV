import { BrowserRouter, Routes, Route, useLocation, Outlet } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { PublicNavbar } from './components/PublicNavbar';
import { ProtectedRoute } from './components/ProtectedRoute';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Home from './pages/Home';
import WriteBlog from './pages/WriteBlog';
import ReadBlog from './pages/ReadBlog';
import AdminDashboard from './pages/AdminDashboard';
import UserManagement from './pages/UserManagement';

const PUBLIC_PATHS = ['/', '/login', '/register'];

function AppLayout() {
  const location = useLocation();
  const isPublicRoute = PUBLIC_PATHS.includes(location.pathname);

  return (
    <>
      {isPublicRoute ? null : <Navbar />}
      <Outlet />
    </>
  );
}

function PublicLayout() {
  return <Outlet />;
}

function AuthenticatedLayout() {
  return <Outlet />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          {/* Public routes */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Route>

          {/* Protected routes — any authenticated user */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AuthenticatedLayout />}>
              <Route path="/blogs" element={<Home />} />
              <Route path="/write" element={<WriteBlog />} />
              <Route path="/write/:id" element={<WriteBlog />} />
              <Route path="/edit/:id" element={<WriteBlog />} />
              <Route path="/blog/:id" element={<ReadBlog />} />
            </Route>
          </Route>

          {/* Admin-only routes */}
          <Route element={<ProtectedRoute role="admin" />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/users" element={<UserManagement />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;