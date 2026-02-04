# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build Commands

```bash
npm run dev      # Start development server with HMR
npm run build    # Production build to ./dist
npm run lint     # ESLint check
npm run preview  # Preview production build locally
```

## Deployment

Pushes to `main` automatically deploy to GitHub Pages via `.github/workflows/deploy.yml`. The build requires `VITE_GITHUB_TOKEN` (stored as `GIST_TOKEN` secret) for cloud sync functionality.

Live URL: https://dagrynch.github.io/personal-checklist/

## Architecture

### Data Layer
- **`src/hooks/useGistStorage.js`** - Central data management hook that syncs to GitHub Gist. Returns `{ tasks, folders, tags, setTasks, setFolders, setTags, syncStatus }`. Handles v1→v2 migration automatically.
- **`src/utils/migrationUtils.js`** - Schema migration between data versions. Current version is 2.

### Data Models (v2)
```javascript
// Task
{ id, title, description, deadline, priority, completed, createdAt, completedAt,
  folderId, tagIds[], assignee, links[], order }

// Folder
{ id, name, color, icon, order, createdAt, isDefault }

// Tag
{ id, name, color, createdAt }
```

### Component Structure
- **`App.jsx`** - Main state orchestration, CRUD operations for tasks/folders/tags
- **`Sidebar.jsx`** - Folder navigation, tag display, dashboard toggle, mobile drawer
- **`Dashboard.jsx`** - Analytics view with charts (uses custom SVG charts, no external chart library)
- **`TaskForm.jsx`** - Create/edit tasks with folder, tags, assignee, links inputs
- **`TaskList.jsx`** - Filtered task display with drag-and-drop (@dnd-kit)
- **`TaskItem.jsx`** - Individual task with completion, tags, links display

### Key Patterns
- Dynamic Tailwind classes for colors require `safelist` in `tailwind.config.js`
- Framer Motion used for all animations
- Password gate (`PasswordGate.jsx`) wraps app for private access
- Link type detection (`src/utils/linkUtils.js`) auto-detects Google Drive, GitHub, Figma, etc.

### Styling
- Tailwind CSS with custom dark theme colors in `tailwind.config.js`
- CSS variables and component classes in `src/index.css`
- Color tokens: `dark-*` (backgrounds), `accent-*` (emerald green theme)
