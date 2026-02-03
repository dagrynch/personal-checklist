// Dashboard utility functions for data processing

/**
 * Get priority distribution data for chart
 */
export const getPriorityDistribution = (tasks) => {
  const activeTasks = tasks.filter(t => !t.completed);

  const counts = {
    high: activeTasks.filter(t => t.priority === 'high').length,
    medium: activeTasks.filter(t => t.priority === 'medium').length,
    low: activeTasks.filter(t => t.priority === 'low').length,
  };

  return [
    { name: 'High', value: counts.high, color: '#ef4444' },
    { name: 'Medium', value: counts.medium, color: '#f59e0b' },
    { name: 'Low', value: counts.low, color: '#10b981' },
  ].filter(item => item.value > 0);
};

/**
 * Get folder distribution data for chart
 */
export const getFolderDistribution = (tasks, folders) => {
  const activeTasks = tasks.filter(t => !t.completed);

  return folders.map(folder => {
    const count = activeTasks.filter(t =>
      folder.id === 'inbox'
        ? !t.folderId || t.folderId === 'inbox'
        : t.folderId === folder.id
    ).length;

    return {
      name: folder.name,
      value: count,
      color: getColorHex(folder.color),
    };
  }).filter(item => item.value > 0);
};

/**
 * Get completion data over time (last 7 days)
 */
export const getCompletionHistory = (tasks) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const data = [];

  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);

    const dayStr = date.toDateString();
    const completed = tasks.filter(t => {
      if (!t.completedAt) return false;
      return new Date(t.completedAt).toDateString() === dayStr;
    }).length;

    const created = tasks.filter(t => {
      return new Date(t.createdAt).toDateString() === dayStr;
    }).length;

    data.push({
      date: date.toLocaleDateString('en-US', { weekday: 'short' }),
      completed,
      created,
    });
  }

  return data;
};

/**
 * Get tasks with upcoming deadlines
 */
export const getUpcomingDeadlines = (tasks, days = 7) => {
  const now = new Date();
  const futureDate = new Date(now);
  futureDate.setDate(futureDate.getDate() + days);

  return tasks
    .filter(t => !t.completed && t.deadline)
    .filter(t => {
      const deadline = new Date(t.deadline);
      return deadline >= now && deadline <= futureDate;
    })
    .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
    .slice(0, 5);
};

/**
 * Get overdue tasks
 */
export const getOverdueTasks = (tasks) => {
  const now = new Date();
  now.setHours(23, 59, 59, 999);

  return tasks
    .filter(t => !t.completed && t.deadline)
    .filter(t => new Date(t.deadline) < now)
    .sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
};

/**
 * Get tasks grouped by deadline date for calendar
 */
export const getTasksByDeadline = (tasks) => {
  const tasksByDate = {};

  tasks
    .filter(t => !t.completed && t.deadline)
    .forEach(t => {
      const dateStr = t.deadline;
      if (!tasksByDate[dateStr]) {
        tasksByDate[dateStr] = [];
      }
      tasksByDate[dateStr].push(t);
    });

  return tasksByDate;
};

/**
 * Get tag usage statistics
 */
export const getTagStats = (tasks, tags) => {
  return tags.map(tag => {
    const count = tasks.filter(t =>
      !t.completed && t.tagIds?.includes(tag.id)
    ).length;

    return {
      ...tag,
      count,
    };
  }).sort((a, b) => b.count - a.count);
};

/**
 * Get assignee workload
 */
export const getAssigneeWorkload = (tasks) => {
  const workload = {};

  tasks
    .filter(t => !t.completed && t.assignee)
    .forEach(t => {
      if (!workload[t.assignee]) {
        workload[t.assignee] = { name: t.assignee, count: 0, high: 0, medium: 0, low: 0 };
      }
      workload[t.assignee].count++;
      workload[t.assignee][t.priority || 'medium']++;
    });

  return Object.values(workload).sort((a, b) => b.count - a.count);
};

/**
 * Get summary statistics
 */
export const getSummaryStats = (tasks, folders) => {
  const total = tasks.length;
  const active = tasks.filter(t => !t.completed).length;
  const completed = tasks.filter(t => t.completed).length;
  const overdue = getOverdueTasks(tasks).length;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = today.toDateString();

  const completedToday = tasks.filter(t =>
    t.completedAt && new Date(t.completedAt).toDateString() === todayStr
  ).length;

  return {
    total,
    active,
    completed,
    overdue,
    completedToday,
    completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
  };
};

// Color helpers
const COLOR_MAP = {
  gray: '#6b7280',
  red: '#ef4444',
  orange: '#f97316',
  amber: '#f59e0b',
  yellow: '#eab308',
  lime: '#84cc16',
  green: '#22c55e',
  emerald: '#10b981',
  teal: '#14b8a6',
  cyan: '#06b6d4',
  sky: '#0ea5e9',
  blue: '#3b82f6',
  indigo: '#6366f1',
  violet: '#8b5cf6',
  purple: '#a855f7',
  fuchsia: '#d946ef',
  pink: '#ec4899',
  rose: '#f43f5e',
};

const getColorHex = (colorName) => {
  return COLOR_MAP[colorName] || COLOR_MAP.gray;
};
