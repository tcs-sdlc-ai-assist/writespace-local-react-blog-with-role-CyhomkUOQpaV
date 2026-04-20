import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { getCurrentUser, isAdmin } from '../utils/auth';
import { getUsers, saveUsers } from '../utils/storage';
import { UserRow } from '../components/UserRow';

const HARD_CODED_ADMIN = {
  id: 'admin',
  username: 'admin',
  displayName: 'Admin',
  role: 'Admin',
  createdAt: '2024-01-01T00:00:00.000Z',
};

export default function UserManagement() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    displayName: '',
    username: '',
    password: '',
    role: 'User',
  });
  const [formError, setFormError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  const loadUsers = useCallback(() => {
    const storedUsers = getUsers();
    const normalizedUsers = storedUsers.map((u) => ({
      ...u,
      role: u.role === 'admin' || u.role === 'Admin' ? 'Admin' : 'User',
    }));
    setUsers([HARD_CODED_ADMIN, ...normalizedUsers]);
  }, []);

  useEffect(() => {
    const session = getCurrentUser();
    if (!session || !isAdmin()) {
      navigate('/');
      return;
    }
    setCurrentUser(session);
    loadUsers();
  }, [navigate, loadUsers]);

  function showSuccess(message) {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(''), 3000);
  }

  function handleFormChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFormError('');
  }

  function handleCreateUser(e) {
    e.preventDefault();
    setFormError('');

    const trimmedDisplayName = formData.displayName.trim();
    const trimmedUsername = formData.username.trim();
    const { password, role } = formData;

    if (!trimmedDisplayName || !trimmedUsername || !password) {
      setFormError('All fields are required');
      return;
    }

    if (password.length < 6) {
      setFormError('Password must be at least 6 characters');
      return;
    }

    if (trimmedUsername.toLowerCase() === 'admin') {
      setFormError('Username is already taken');
      return;
    }

    const storedUsers = getUsers();
    const exists = storedUsers.some(
      (u) => u.username.toLowerCase() === trimmedUsername.toLowerCase()
    );

    if (exists) {
      setFormError('Username is already taken');
      return;
    }

    const newUser = {
      id: uuidv4(),
      displayName: trimmedDisplayName,
      username: trimmedUsername,
      password: password,
      role: role === 'Admin' ? 'admin' : 'user',
      createdAt: new Date().toISOString(),
    };

    storedUsers.push(newUser);
    saveUsers(storedUsers);

    setFormData({ displayName: '', username: '', password: '', role: 'User' });
    setShowForm(false);
    loadUsers();
    showSuccess(`User "${trimmedDisplayName}" created successfully`);
  }

  function handleDeleteRequest(user) {
    setDeleteConfirm(user);
  }

  function handleDeleteConfirm() {
    if (!deleteConfirm) return;

    const storedUsers = getUsers();
    const filtered = storedUsers.filter((u) => u.id !== deleteConfirm.id);
    saveUsers(filtered);

    setDeleteConfirm(null);
    loadUsers();
    showSuccess(`User "${deleteConfirm.displayName || deleteConfirm.username}" deleted`);
  }

  function handleDeleteCancel() {
    setDeleteConfirm(null);
  }

  function isCurrentUser(user) {
    if (!currentUser) return false;
    return user.id === currentUser.userId || user.username === currentUser.username;
  }

  function isProtectedAdmin(user) {
    return user.id === 'admin' || user.username === 'admin';
  }

  if (!currentUser) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              User Management
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Manage all user accounts on the platform
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setShowForm((prev) => !prev);
              setFormError('');
              if (showForm) {
                setFormData({ displayName: '', username: '', password: '', role: 'User' });
              }
            }}
            className="inline-flex items-center justify-center rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
          >
            {showForm ? 'Cancel' : '+ Create User'}
          </button>
        </div>

        {successMessage && (
          <div className="mb-6 rounded-lg bg-success-50 p-4 text-sm font-medium text-success-700 dark:bg-green-900/20 dark:text-green-400">
            {successMessage}
          </div>
        )}

        {showForm && (
          <div className="mb-8 rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
            <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              Create New User
            </h2>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="displayName"
                    className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Display Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="displayName"
                    name="displayName"
                    value={formData.displayName}
                    onChange={handleFormChange}
                    required
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-500"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label
                    htmlFor="username"
                    className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Username <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleFormChange}
                    required
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-500"
                    placeholder="johndoe"
                  />
                </div>
                <div>
                  <label
                    htmlFor="password"
                    className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Password <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleFormChange}
                    required
                    minLength={6}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-500"
                    placeholder="Min. 6 characters"
                  />
                </div>
                <div>
                  <label
                    htmlFor="role"
                    className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Role <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="role"
                    name="role"
                    value={formData.role}
                    onChange={handleFormChange}
                    required
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="User">User</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>
              </div>

              {formError && (
                <div className="rounded-lg bg-error-50 p-3 text-sm font-medium text-error-700 dark:bg-red-900/20 dark:text-red-400">
                  {formError}
                </div>
              )}

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="inline-flex items-center justify-center rounded-lg bg-primary-600 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
                >
                  Create User
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="space-y-3">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            {users.length} {users.length === 1 ? 'user' : 'users'} total
          </p>
          {users.map((user) => (
            <UserRow
              key={user.id}
              user={user}
              onDelete={handleDeleteRequest}
              isCurrentUser={isCurrentUser(user)}
              isProtectedAdmin={isProtectedAdmin(user)}
            />
          ))}
        </div>

        {deleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-elevated dark:bg-gray-800">
              <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
                Confirm Delete
              </h3>
              <p className="mb-6 text-sm text-gray-600 dark:text-gray-300">
                Are you sure you want to delete{' '}
                <span className="font-semibold">
                  {deleteConfirm.displayName || deleteConfirm.username}
                </span>
                ? This action cannot be undone.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={handleDeleteCancel}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 dark:focus:ring-offset-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteConfirm}
                  className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}