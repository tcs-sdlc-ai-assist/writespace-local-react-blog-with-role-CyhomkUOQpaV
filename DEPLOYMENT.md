# Deployment Guide — WriteSpace

## Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Vercel Deployment](#vercel-deployment)
  - [Initial Setup](#initial-setup)
  - [vercel.json Configuration](#verceljson-configuration)
  - [Build Commands](#build-commands)
  - [SPA Routing & Rewrites](#spa-routing--rewrites)
- [Environment Variables](#environment-variables)
- [Custom Domain Setup](#custom-domain-setup)
- [Troubleshooting](#troubleshooting)
  - [Direct URL Access Returns 404](#direct-url-access-returns-404)
  - [Blank Page After Deployment](#blank-page-after-deployment)
  - [Environment Variables Not Available](#environment-variables-not-available)
  - [Build Failures](#build-failures)
- [Alternative Deployment Targets](#alternative-deployment-targets)
  - [Netlify](#netlify)
  - [GitHub Pages](#github-pages)
  - [Docker](#docker)

---

## Overview

WriteSpace is a single-page application (SPA) built with **React 18+** and **Vite**. It compiles to static assets (HTML, CSS, JS) that can be served from any static hosting provider. This guide focuses on **Vercel** as the primary deployment platform but includes notes for alternatives.

---

## Prerequisites

- **Node.js** 18+ installed locally
- **npm** 9+ or **yarn** 1.22+
- A [Vercel account](https://vercel.com/signup)
- The [Vercel CLI](https://vercel.com/docs/cli) installed globally (optional but recommended):
  ```bash
  npm install -g vercel
  ```
- Your project pushed to a Git repository (GitHub, GitLab, or Bitbucket)

---

## Vercel Deployment

### Initial Setup

**Option A — Via Vercel Dashboard (recommended for first deploy):**

1. Log in to [vercel.com](https://vercel.com).
2. Click **"Add New… → Project"**.
3. Import your Git repository containing the WriteSpace project.
4. Vercel auto-detects the Vite framework. Verify the following settings:
   - **Framework Preset:** Vite
   - **Root Directory:** `./` (or the subdirectory if using a monorepo)
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`
5. Add any required environment variables (see [Environment Variables](#environment-variables)).
6. Click **Deploy**.

**Option B — Via Vercel CLI:**

```bash
# From the project root
vercel

# Follow the interactive prompts:
# - Link to existing project or create new
# - Confirm settings
```

For production deployment:

```bash
vercel --prod
```

### vercel.json Configuration

Create a `vercel.json` file in the project root to configure routing, headers, and build settings:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/((?!assets/).*)",
      "destination": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    },
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        }
      ]
    }
  ]
}
```

**Key sections explained:**

| Field | Purpose |
|---|---|
| `buildCommand` | Tells Vercel how to build the project |
| `outputDirectory` | Points to Vite's default output folder |
| `framework` | Enables Vite-specific optimizations on Vercel |
| `rewrites` | Routes all non-asset requests to `index.html` for SPA client-side routing |
| `headers` | Sets caching for hashed assets and security headers for all routes |

### Build Commands

The following npm scripts are used during deployment:

| Command | Purpose |
|---|---|
| `npm install` | Installs all dependencies |
| `npm run build` | Runs `vite build`, producing optimized static assets in `dist/` |
| `npm run preview` | Locally previews the production build on `http://localhost:4173` |

To verify your build works before deploying:

```bash
npm run build
npm run preview
```

Open `http://localhost:4173` and confirm all routes work correctly.

### SPA Routing & Rewrites

WriteSpace uses client-side routing (React Router). When a user navigates to `/editor/123` directly (by typing the URL or refreshing the page), the server must return `index.html` so React Router can handle the route.

**How the rewrite rule works:**

```json
{
  "source": "/((?!assets/).*)",
  "destination": "/index.html"
}
```

- Any request that does **not** start with `/assets/` is rewritten to `/index.html`.
- Requests to `/assets/*` (Vite's hashed JS, CSS, images) are served as-is with long-lived cache headers.
- React Router then reads `window.location` and renders the correct component.

**Without this rewrite**, direct URL access to any route other than `/` will return a **404 error** from Vercel's static file server.

---

## Environment Variables

Vite exposes environment variables to client-side code only if they are prefixed with `VITE_`.

### Setting Variables in Vercel

1. Go to your project in the Vercel Dashboard.
2. Navigate to **Settings → Environment Variables**.
3. Add each variable with the appropriate scope:

| Variable | Example Value | Scope |
|---|---|---|
| `VITE_API_BASE_URL` | `https://api.writespace.app` | Production |
| `VITE_API_BASE_URL` | `https://staging-api.writespace.app` | Preview |
| `VITE_APP_TITLE` | `WriteSpace` | All |

### Local Development

Create a `.env.local` file in the project root (this file is gitignored):

```env
VITE_API_BASE_URL=http://localhost:3001
VITE_APP_TITLE=WriteSpace Dev
```

### Accessing Variables in Code

```javascript
const apiUrl = import.meta.env.VITE_API_BASE_URL;
```

> **Important:** Never use `process.env` in a Vite project. Always use `import.meta.env.VITE_*`. Variables without the `VITE_` prefix are **not** exposed to the browser bundle for security reasons.

### Environment-Specific Considerations

- **Production:** Ensure all `VITE_*` variables are set in Vercel's Production environment scope. Missing variables will be `undefined` at runtime.
- **Preview deployments:** Vercel creates a preview deployment for every pull request. Set Preview-scoped variables for staging API endpoints.
- **Secrets:** Never put API keys, database credentials, or other secrets in `VITE_*` variables — they are embedded in the client-side JavaScript bundle and visible to anyone.

---

## Custom Domain Setup

1. In the Vercel Dashboard, go to **Settings → Domains**.
2. Add your domain (e.g., `writespace.app`).
3. Configure DNS records as instructed by Vercel:
   - **A Record:** `76.76.21.21`
   - **CNAME:** `cname.vercel-dns.com` (for `www` subdomain)
4. Vercel automatically provisions and renews SSL certificates.

---

## Troubleshooting

### Direct URL Access Returns 404

**Symptom:** Navigating to `https://yourapp.vercel.app/editor` directly shows a Vercel 404 page, but clicking links within the app works fine.

**Cause:** The server is looking for a file at `/editor/index.html` which doesn't exist. SPA routing requires all paths to serve `/index.html`.

**Fix:** Ensure `vercel.json` contains the rewrite rule:

```json
{
  "rewrites": [
    {
      "source": "/((?!assets/).*)",
      "destination": "/index.html"
    }
  ]
}
```

After adding or modifying `vercel.json`, commit and push — Vercel will redeploy automatically.

**Verification:** After deployment, open a route directly in a new browser tab (not by clicking a link). It should render correctly.

### Blank Page After Deployment

**Symptom:** The page loads but shows a white screen. No visible errors in the browser.

**Possible causes and fixes:**

1. **Incorrect `base` in `vite.config.js`:**
   ```javascript
   // vite.config.js — base should be '/' for Vercel root deployments
   export default defineConfig({
     plugins: [react()],
     base: '/',
   });
   ```
   If deploying to a subdirectory, set `base` accordingly (e.g., `'/my-app/'`).

2. **Missing root element:** Ensure `index.html` has `<div id="root"></div>`.

3. **JavaScript errors:** Open the browser DevTools console (F12) and check for runtime errors. Common issues:
   - Missing environment variables (`undefined` values)
   - Failed API calls blocking render
   - Import errors from missing dependencies

4. **Output directory mismatch:** Confirm `vercel.json` has `"outputDirectory": "dist"` matching Vite's default output.

### Environment Variables Not Available

**Symptom:** `import.meta.env.VITE_API_BASE_URL` is `undefined` in the deployed app.

**Fixes:**

1. Confirm the variable is set in Vercel Dashboard under the correct environment scope (Production, Preview, or Development).
2. Confirm the variable name starts with `VITE_`.
3. **Redeploy after adding variables.** Environment variables are injected at build time, not runtime. Adding a variable requires a new deployment:
   ```bash
   vercel --prod
   ```
   Or trigger a redeploy from the Vercel Dashboard.

### Build Failures

**Symptom:** Deployment fails during the build step.

**Common causes:**

1. **Missing dependencies:** Run `npm install` locally and ensure `package.json` is committed with all required dependencies.
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   npm run build
   ```

2. **Node.js version mismatch:** Specify the Node.js version in Vercel:
   - Dashboard → Settings → General → Node.js Version → Select **18.x** or **20.x**
   - Or add to `package.json`:
     ```json
     {
       "engines": {
         "node": ">=18"
       }
     }
     ```

3. **ESLint or TypeScript errors treated as build errors:** Vite's build will fail on syntax errors. Check the build log in the Vercel Dashboard for the specific error message.

4. **Case sensitivity:** Vercel runs on Linux where file paths are case-sensitive. `import App from './app'` will fail if the file is `App.jsx`. Verify all import paths match the exact file names.

---

## Alternative Deployment Targets

### Netlify

Create a `netlify.toml` in the project root:

```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

The `[[redirects]]` block serves the same purpose as Vercel's `rewrites` — enabling SPA client-side routing.

### GitHub Pages

1. Install the deployment plugin:
   ```bash
   npm install -D gh-pages
   ```

2. Set the `base` in `vite.config.js` to your repository name:
   ```javascript
   export default defineConfig({
     plugins: [react()],
     base: '/writespace/',
   });
   ```

3. Add a deploy script to `package.json`:
   ```json
   {
     "scripts": {
       "deploy": "gh-pages -d dist"
     }
   }
   ```

4. Add a `404.html` that redirects to `index.html` for SPA routing (GitHub Pages does not support rewrites natively).

> **Note:** GitHub Pages does not support server-side rewrites. Deep links will show a brief 404 before the redirect script loads. For production apps, Vercel or Netlify is recommended.

### Docker

Create a `Dockerfile` for serving the built assets with Nginx:

```dockerfile
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

Create an `nginx.conf` for SPA routing:

```nginx
server {
    listen 80;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;

    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

Build and run:

```bash
docker build -t writespace .
docker run -p 8080:80 writespace
```

---

## Deployment Checklist

Before every production deployment, verify:

- [ ] `npm run build` completes locally with zero errors
- [ ] `npm run preview` serves the app correctly on all routes
- [ ] All `VITE_*` environment variables are set in Vercel for the Production scope
- [ ] `vercel.json` is committed with the correct rewrite rules
- [ ] No secrets or sensitive keys are in `VITE_*` variables
- [ ] Direct URL access works (test by pasting a deep link in a new tab)
- [ ] Assets load with correct cache headers (check DevTools Network tab)
- [ ] The app works in both light and dark mode (if applicable)
- [ ] Console is free of errors and warnings in production build