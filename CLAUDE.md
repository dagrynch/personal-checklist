# Personal Checklist App

A modern, feature-rich task management application built with React and Vite, featuring cloud sync via GitHub Gist.

## Purpose

This is a personal productivity app designed to:
- Manage tasks with rich metadata (priority, deadlines, checklists, tags, links)
- Organize work into folders
- Track progress with a comprehensive dashboard
- Sync data across devices using GitHub Gist as a free cloud backend
- Work offline with localStorage fallback

**Live URL:** https://dagrynch.github.io/personal-checklist/

---

## Tech Stack

| Technology | Purpose |
|------------|---------|
| **React 19** | UI framework |
| **Vite 7** | Build tool with HMR |
| **Tailwind CSS 3** | Utility-first styling |
| **Framer Motion** | Animations |
| **@dnd-kit** | Drag-and-drop functionality |
| **GitHub Gist API** | Cloud data storage |
| **GitHub Pages** | Static hosting |
| **GitHub Actions** | CI/CD deployment |

---

## Build Commands

```bash
npm install      # Install dependencies
npm run dev      # Start development server (http://localhost:5173)
npm run build    # Production build to ./dist
npm run lint     # ESLint check
npm run preview  # Preview production build locally
```

---

## Deployment & GitHub Connection

### Automatic Deployment
Pushes to `main` branch automatically trigger deployment via `.github/workflows/deploy.yml`:
1. GitHub Actions runs `npm run build`
2. Build artifacts are uploaded to GitHub Pages
3. Site is live at https://dagrynch.github.io/personal-checklist/

### Required Secrets
In repository Settings → Secrets → Actions:
- **`GIST_TOKEN`**: GitHub Personal Access Token with `gist` scope
  - Used as `VITE_GITHUB_TOKEN` during build
  - Enables cloud sync functionality

### Manual Push with Token
To push changes directly using a GitHub token:
```bash
git push https://<GITHUB_TOKEN>@github.com/dagrynch/personal-checklist.git main
```

### Creating a GitHub Token
1. Go to https://github.com/settings/tokens/new
2. Name: "Personal Checklist"
3. Select scope: `gist` (for data sync)
4. If pushing code, also need `repo` scope
5. Generate and copy token

---

## Data Sync Architecture

### How It Works
```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   Browser   │────▶│  localStorage │────▶│ GitHub Gist │
│   (React)   │◀────│  (immediate)  │◀────│  (500ms)    │
└─────────────┘     └──────────────┘     └─────────────┘
```

1. **Immediate**: All changes save to localStorage instantly
2. **Debounced**: After 500ms of no changes, sync to GitHub Gist
3. **On Load**: Fetch from Gist, merge with localStorage, display

### Gist Storage
- **File**: `personal-checklist-data.json`
- **Description**: "Personal Checklist App Data - Do not delete"
- **Visibility**: Private
- **Location**: https://gist.github.com/dagrynch

### Data Keys
```javascript
STORAGE_KEYS = {
  TASKS: 'checklist-tasks',
  FOLDERS: 'checklist-folders',
  TAGS: 'checklist-tags',
  SETTINGS: 'checklist-settings'
}
```

---

## Data Models (v2)

### Task
```javascript
{
  id: string,              // Timestamp-based unique ID
  title: string,           // Required
  description: string,     // Optional
  deadline: string,        // ISO date string (YYYY-MM-DD)
  priority: 'high' | 'medium' | 'low',
  completed: boolean,
  createdAt: string,       // ISO timestamp
  completedAt: string,     // ISO timestamp or null
  folderId: string,        // Folder ID or null (inbox)
  tagIds: string[],        // Array of tag IDs
  assignee: string,        // Name or null
  links: [{url, type}],    // External links
  checklist: [{            // Subtasks
    id: string,
    text: string,
    completed: boolean
  }],
  recurrence: 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly',
  recurringParentId: string, // For auto-created recurring instances
  order: number            // Display order
}
```

### Folder
```javascript
{
  id: string,              // 'inbox' for default
  name: string,
  color: string,           // Tailwind color name
  icon: string,            // inbox|folder|work|personal|star|archive
  order: number,
  createdAt: string,
  isDefault: boolean       // true for Inbox
}
```

### Tag
```javascript
{
  id: string,
  name: string,
  color: string,           // Tailwind color name
  createdAt: string
}
```

---

## Project Structure

```
src/
├── App.jsx                 # Main app, state management, CRUD operations
├── main.jsx                # Entry point
├── index.css               # Global styles, Tailwind imports
├── components/
│   ├── Dashboard.jsx       # Analytics dashboard with charts & task list
│   ├── Sidebar.jsx         # Folder/tag navigation, mobile drawer
│   ├── TaskForm.jsx        # Create/edit task form (with recurrence)
│   ├── TaskList.jsx        # Filtered task list with drag-drop
│   ├── TaskItem.jsx        # Individual task display
│   ├── Header.jsx          # Top bar with sync status
│   ├── StatsPanel.jsx      # Streak, weekly stats
│   ├── QuickAdd.jsx        # Natural language quick add input
│   ├── CalendarView.jsx    # Monthly calendar view
│   ├── KeyboardShortcutsHelp.jsx # Shortcuts modal
│   ├── PasswordGate.jsx    # Optional password protection
│   ├── FolderModal.jsx     # Create/edit folder dialog
│   ├── TagManager.jsx      # Manage tags dialog
│   ├── TagSelector.jsx     # Multi-select tags in form
│   ├── TagFilter.jsx       # Filter tasks by tag
│   ├── TagBadge.jsx        # Tag display component
│   ├── ChecklistInput.jsx  # Subtask input in form
│   ├── AssigneeInput.jsx   # Assignee autocomplete
│   ├── AssigneeAvatar.jsx  # Avatar with initials
│   ├── LinkInput.jsx       # Add links to tasks
│   ├── LinkList.jsx        # Display task links
│   ├── LinkTypeIcon.jsx    # Auto-detect link icons
│   ├── EmptyState.jsx      # Empty list message
│   ├── Confetti.jsx        # Celebration animation
│   ├── ProgressRing.jsx    # Circular progress
│   └── charts/
│       ├── CompletionChart.jsx  # Weekly activity (custom SVG)
│       ├── PriorityChart.jsx    # Priority donut (custom SVG)
│       └── FolderChart.jsx      # Folder distribution (custom SVG)
├── hooks/
│   ├── useGistStorage.js       # Main data sync hook
│   ├── useKeyboardShortcuts.js # Global keyboard shortcuts
│   ├── useNotifications.js     # Browser notifications
│   ├── useLocalStorage.js      # localStorage wrapper
│   └── useTheme.js             # Dark mode hook
└── utils/
    ├── dashboardUtils.js   # Dashboard data processing
    ├── quickAddParser.js   # Natural language parser
    ├── statsUtils.js       # Streak, milestones calculation
    ├── dateUtils.js        # Date formatting, relative time
    ├── linkUtils.js        # Link type detection
    └── migrationUtils.js   # Data schema migration
```

---

## Key Features

### Dashboard (Default View)
- Summary stats: Active, Completed, Overdue, Today
- Weekly activity chart
- Priority distribution chart
- Overdue tasks (prominently displayed)
- "Due This Week" section
- All tasks with filters (search, folder, priority, deadline)
- Edit tasks directly from dashboard

### Quick Add (Natural Language)
Always visible at top of main content. Parse tasks with special syntax:
- `!high` or `!h` - High priority (also `!m`, `!l`)
- `#tagname` - Add a tag
- `@name` - Assign to someone
- `/folder` - Set folder
- `today`, `tomorrow`, `monday`-`sunday` - Set deadline
- `next week`, `in 3 days` - Relative dates

Example: `Buy milk tomorrow #shopping !high @john`

### Calendar View
- Full month calendar with task indicators
- Click any day to see/edit tasks
- Visual priority and overdue indicators
- Navigate months, quick "Today" button

### Recurring Tasks
- Set repeat: daily, weekly, monthly, yearly
- Auto-creates new instance when completed
- Maintains all properties (tags, checklist, etc.)

### Keyboard Shortcuts
| Key | Action |
|-----|--------|
| `N` | Focus quick add input |
| `/` | Focus search |
| `D` | Toggle dashboard view |
| `C` | Toggle calendar view |
| `Esc` | Close modals |
| `?` | Show shortcuts help |

### Task Management
- Create tasks with rich metadata
- Subtasks/checklist within tasks
- Priority levels (high/medium/low)
- Deadlines with overdue detection
- Tags for categorization
- External links (auto-detects Google Drive, GitHub, Figma, etc.)
- Assignee field
- Drag-and-drop reordering
- Recurring tasks support

### Organization
- Folders with custom colors and icons
- Default "Inbox" folder
- Tags with colors
- Filter by folder, tag, assignee, completion status

### Sync & Offline
- Real-time sync to GitHub Gist
- Works offline with localStorage
- Sync status indicator in header

---

## Styling Guide

### Color Tokens
- **Backgrounds**: `dark-900` (darkest) to `dark-300` (lighter)
- **Accent**: `emerald-*` (primary green theme)
- **Priority**: `red-*` (high), `amber-*` (medium), `emerald-*` (low)
- **Status**: `blue-*` (completed)

### CSS Classes
- `.card` - Container with dark background and border
- `.input-dark` - Dark input field styling
- `.btn-primary` - Emerald button
- `.task-item` - Task card with priority border

### Dynamic Colors
Colors from data (folder.color, tag.color) require Tailwind safelist in `tailwind.config.js`.

---

## Development Notes

### Adding New Features
1. Update data model in `migrationUtils.js` if needed
2. Add UI components in `src/components/`
3. Update App.jsx for state management
4. Test locally with `npm run dev`
5. Build with `npm run build`
6. Push to main to deploy

### Password Protection
Optional password gate in `PasswordGate.jsx`. Set password in component or disable by returning children directly.

### Browser Notifications
Implemented in `useNotifications.js`. Requires user permission. Notifies for upcoming deadlines.

---

## Version History

- **v2** (Current): Added folders, tags, checklist, links, assignee, improved dashboard
- **v1**: Basic tasks with title, description, deadline, priority
