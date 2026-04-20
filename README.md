# WriteSpace

A distraction-free writing application built with modern web technologies. WriteSpace provides a clean, minimal interface for focused writing with automatic local persistence.

## Tech Stack

- **React 18** — UI library
- **Vite** — Build tool and dev server
- **Tailwind CSS** — Utility-first styling
- **localStorage** — Client-side data persistence

## Features

- Distraction-free writing environment with a clean, minimal UI
- Auto-saving to localStorage — your work is never lost
- Document management — create, edit, rename, and delete documents
- Word and character count tracking
- Dark mode support
- Responsive design for desktop and mobile
- Markdown-friendly editing
- Full-screen focus mode
- Export documents as plain text

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

### Build

```bash
npm run build
```

Build output is written to the `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

## Folder Structure

```
writespace/
├── public/                  # Static assets
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── Editor/          # Main editor component
│   │   ├── Sidebar/         # Document list sidebar
│   │   ├── Toolbar/         # Toolbar with actions and stats
│   │   └── ui/              # Shared UI primitives (Button, Modal, etc.)
│   ├── hooks/               # Custom React hooks
│   │   ├── useDocuments.js  # Document CRUD operations
│   │   ├── useAutoSave.js   # Auto-save logic
│   │   └── useLocalStorage.js # localStorage wrapper hook
│   ├── utils/               # Utility functions
│   │   ├── storage.js       # localStorage read/write helpers
│   │   └── wordCount.js     # Word and character counting
│   ├── App.jsx              # Root application component
│   ├── main.jsx             # Entry point — renders App into DOM
│   └── index.css            # Tailwind CSS directives and global styles
├── index.html               # HTML entry point
├── vite.config.js           # Vite configuration
├── tailwind.config.js       # Tailwind CSS configuration
├── postcss.config.js        # PostCSS configuration
├── package.json             # Dependencies and scripts
└── README.md                # This file
```

## localStorage Schema

All data is persisted in the browser's `localStorage` under the following keys:

### `writespace_documents`

An array of document objects:

```json
[
  {
    "id": "uuid-v4-string",
    "title": "Untitled Document",
    "content": "Document body text...",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T12:45:00.000Z"
  }
]
```

| Field       | Type   | Description                              |
| ----------- | ------ | ---------------------------------------- |
| `id`        | string | Unique identifier (UUID v4)              |
| `title`     | string | Document title                           |
| `content`   | string | Full document body text                  |
| `createdAt` | string | ISO 8601 timestamp of creation           |
| `updatedAt` | string | ISO 8601 timestamp of last modification  |

### `writespace_active_document`

A string containing the `id` of the currently active document.

### `writespace_preferences`

A JSON object storing user preferences:

```json
{
  "theme": "light",
  "fontSize": 18,
  "fontFamily": "serif",
  "focusMode": false
}
```

| Field        | Type    | Default   | Description                        |
| ------------ | ------- | --------- | ---------------------------------- |
| `theme`      | string  | `"light"` | `"light"` or `"dark"`              |
| `fontSize`   | number  | `18`      | Editor font size in pixels         |
| `fontFamily` | string  | `"serif"` | `"serif"`, `"sans"`, or `"mono"`   |
| `focusMode`  | boolean | `false`   | Whether focus mode is enabled      |

## Deployment

### Vercel

1. Push your repository to GitHub, GitLab, or Bitbucket.
2. Go to [vercel.com](https://vercel.com) and click **New Project**.
3. Import your repository.
4. Vercel will auto-detect the Vite framework. Verify the following settings:
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`
5. Click **Deploy**.

Subsequent pushes to the main branch will trigger automatic deployments.

#### Custom Domain (Optional)

In your Vercel project dashboard, go to **Settings → Domains** to add a custom domain.

## License

Private — All rights reserved.