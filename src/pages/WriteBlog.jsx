import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { getCurrentUser } from '../utils/auth.js';
import { getPosts, savePosts } from '../utils/storage.js';

const MAX_CONTENT_LENGTH = 5000;

function WriteBlog() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [errors, setErrors] = useState({ title: '', content: '' });
  const [submitError, setSubmitError] = useState('');
  const [loading, setLoading] = useState(isEditMode);

  const currentUser = getCurrentUser();

  useEffect(() => {
    if (!currentUser) {
      navigate('/login', { replace: true });
      return;
    }

    if (isEditMode) {
      const posts = getPosts();
      const post = posts.find((p) => p.id === id);

      if (!post) {
        setSubmitError('Post not found.');
        setLoading(false);
        return;
      }

      const canEdit =
        currentUser.role === 'admin' || post.authorId === currentUser.userId;

      if (!canEdit) {
        setSubmitError('You do not have permission to edit this post.');
        setLoading(false);
        return;
      }

      setTitle(post.title || '');
      setContent(post.content || '');
      setLoading(false);
    }
  }, [id, isEditMode, navigate, currentUser]);

  function validate() {
    const newErrors = { title: '', content: '' };
    let valid = true;

    if (!title.trim()) {
      newErrors.title = 'Title is required';
      valid = false;
    }

    if (!content.trim()) {
      newErrors.content = 'Content is required';
      valid = false;
    } else if (content.length > MAX_CONTENT_LENGTH) {
      newErrors.content = `Content must be ${MAX_CONTENT_LENGTH} characters or less`;
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  }

  function handleSubmit(e) {
    e.preventDefault();
    setSubmitError('');

    if (!currentUser) {
      navigate('/login', { replace: true });
      return;
    }

    if (!validate()) {
      return;
    }

    try {
      const posts = getPosts();

      if (isEditMode) {
        const postIndex = posts.findIndex((p) => p.id === id);

        if (postIndex === -1) {
          setSubmitError('Post not found.');
          return;
        }

        const post = posts[postIndex];
        const canEdit =
          currentUser.role === 'admin' || post.authorId === currentUser.userId;

        if (!canEdit) {
          setSubmitError('You do not have permission to edit this post.');
          return;
        }

        posts[postIndex] = {
          ...post,
          title: title.trim(),
          content: content.trim(),
          updatedAt: new Date().toISOString(),
        };

        savePosts(posts);
        navigate(`/blog/${id}`, { replace: true });
      } else {
        const newPost = {
          id: uuidv4(),
          title: title.trim(),
          content: content.trim(),
          createdAt: new Date().toISOString(),
          authorId: currentUser.userId,
          authorName: currentUser.displayName || currentUser.username,
        };

        posts.unshift(newPost);
        savePosts(posts);
        navigate(`/blog/${newPost.id}`, { replace: true });
      }
    } catch (err) {
      console.warn('[WriteBlog] Failed to save post:', err);
      setSubmitError('Failed to save post. Please try again.');
    }
  }

  function handleCancel() {
    if (isEditMode && id) {
      navigate(`/blog/${id}`);
    } else {
      navigate('/');
    }
  }

  if (!currentUser) {
    return null;
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <p className="text-gray-500 dark:text-gray-400">Loading…</p>
      </div>
    );
  }

  if (submitError && isEditMode && (submitError === 'Post not found.' || submitError === 'You do not have permission to edit this post.')) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 dark:bg-gray-900">
        <div className="w-full max-w-lg rounded-xl bg-white p-8 shadow-soft dark:bg-gray-800">
          <p className="mb-4 text-center text-red-600 dark:text-red-400">
            {submitError}
          </p>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="mx-auto block rounded-lg bg-primary-600 px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8 dark:bg-gray-900">
      <div className="mx-auto w-full max-w-2xl">
        <h1 className="mb-6 text-2xl font-bold text-gray-900 dark:text-white">
          {isEditMode ? 'Edit Post' : 'Create New Post'}
        </h1>

        <form
          onSubmit={handleSubmit}
          noValidate
          className="rounded-xl bg-white p-6 shadow-soft dark:bg-gray-800"
        >
          {submitError && (
            <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
              {submitError}
            </div>
          )}

          <div className="mb-5">
            <label
              htmlFor="post-title"
              className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Title
            </label>
            <input
              id="post-title"
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (errors.title) {
                  setErrors((prev) => ({ ...prev, title: '' }));
                }
              }}
              placeholder="Enter post title"
              className={`w-full rounded-lg border px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 dark:bg-gray-700 dark:text-white dark:placeholder-gray-500 dark:focus:ring-offset-gray-800 ${
                errors.title
                  ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                  : 'border-gray-300 focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600'
              }`}
            />
            {errors.title && (
              <p className="mt-1.5 text-sm text-red-600 dark:text-red-400">
                {errors.title}
              </p>
            )}
          </div>

          <div className="mb-5">
            <label
              htmlFor="post-content"
              className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Content
            </label>
            <textarea
              id="post-content"
              value={content}
              onChange={(e) => {
                setContent(e.target.value);
                if (errors.content) {
                  setErrors((prev) => ({ ...prev, content: '' }));
                }
              }}
              placeholder="Write your post content here…"
              rows={12}
              className={`w-full resize-y rounded-lg border px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 dark:bg-gray-700 dark:text-white dark:placeholder-gray-500 dark:focus:ring-offset-gray-800 ${
                errors.content
                  ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                  : 'border-gray-300 focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600'
              }`}
            />
            <div className="mt-1.5 flex items-center justify-between">
              {errors.content ? (
                <p className="text-sm text-red-600 dark:text-red-400">
                  {errors.content}
                </p>
              ) : (
                <span />
              )}
              <p
                className={`text-xs ${
                  content.length > MAX_CONTENT_LENGTH
                    ? 'text-red-600 dark:text-red-400'
                    : 'text-gray-500 dark:text-gray-400'
                }`}
              >
                {content.length} / {MAX_CONTENT_LENGTH}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={handleCancel}
              className="rounded-lg border border-gray-300 bg-white px-5 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 dark:focus:ring-offset-gray-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-primary-600 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
            >
              {isEditMode ? 'Update Post' : 'Publish Post'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default WriteBlog;