# Changelog

All notable changes to the WriteSpace project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2024-01-15

### Added

- **Public Landing Page**: Welcome page with featured blog posts and navigation for unauthenticated visitors.
- **Authentication System**: Login and registration pages with form validation and error handling.
- **Role-Based Access Control**: Support for Admin, Editor, and Viewer roles with route protection and conditional UI rendering.
- **Blog CRUD Operations**: Full create, read, update, and delete functionality for blog posts with rich text content support.
- **Admin Dashboard**: Overview dashboard displaying platform statistics including total posts, users, and recent activity.
- **User Management**: Admin interface for viewing, editing roles, and removing user accounts.
- **localStorage Persistence**: Client-side data persistence for user sessions, blog posts, and application state using browser localStorage.
- **Vercel Deployment Configuration**: Production-ready `vercel.json` with SPA rewrite rules for client-side routing support.
- **Responsive Design**: Mobile-first UI built with Tailwind CSS supporting all screen sizes.
- **Dark Mode Support**: Theme toggle with dark mode styling across all components.
- **Protected Routes**: Route guards that redirect unauthenticated users to the login page and enforce role-based page access.
- **Search and Filtering**: Blog post search by title and content with category filtering.
- **Toast Notifications**: User feedback system for successful actions and error states.

### Technical Stack

- React 18 with Vite for fast development and optimized production builds.
- React Router v6 for client-side routing with nested layouts.
- Tailwind CSS for utility-first styling.
- PropTypes for runtime prop validation.
- localStorage API for client-side data persistence.

[1.0.0]: https://github.com/writespace/writespace/releases/tag/v1.0.0