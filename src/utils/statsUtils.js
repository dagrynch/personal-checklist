import { isSameDay } from './dateUtils';

export const calculateStreak = (tasks) => {
  const completedDates = tasks
    .filter((task) => task.completed && task.completedAt)
    .map((task) => new Date(task.completedAt).toDateString())
    .filter((date, index, arr) => arr.indexOf(date) === index)
    .sort((a, b) => new Date(b) - new Date(a));

  if (completedDates.length === 0) return 0;

  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let checkDate = new Date(today);

  // Check if today has completions
  const todayStr = today.toDateString();
  const hasTodayCompletion = completedDates.includes(todayStr);

  if (!hasTodayCompletion) {
    // Check yesterday
    checkDate.setDate(checkDate.getDate() - 1);
    if (!completedDates.includes(checkDate.toDateString())) {
      return 0;
    }
  }

  // Count consecutive days
  checkDate = new Date(today);
  if (!hasTodayCompletion) {
    checkDate.setDate(checkDate.getDate() - 1);
  }

  while (completedDates.includes(checkDate.toDateString())) {
    streak++;
    checkDate.setDate(checkDate.getDate() - 1);
  }

  return streak;
};

export const getWeeklyStats = (tasks) => {
  const now = new Date();
  const weekAgo = new Date(now);
  weekAgo.setDate(weekAgo.getDate() - 7);

  const completedThisWeek = tasks.filter((task) => {
    if (!task.completed || !task.completedAt) return false;
    const completedDate = new Date(task.completedAt);
    return completedDate >= weekAgo && completedDate <= now;
  });

  const createdThisWeek = tasks.filter((task) => {
    const createdDate = new Date(task.createdAt);
    return createdDate >= weekAgo && createdDate <= now;
  });

  return {
    completedCount: completedThisWeek.length,
    createdCount: createdThisWeek.length,
    completionRate:
      createdThisWeek.length > 0
        ? Math.round((completedThisWeek.length / createdThisWeek.length) * 100)
        : 0,
  };
};

export const getDailyProgress = (tasks) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayTasks = tasks.filter((task) => {
    if (task.deadline) {
      return isSameDay(task.deadline, today);
    }
    return isSameDay(task.createdAt, today);
  });

  const completedToday = todayTasks.filter((task) => task.completed);

  return {
    total: todayTasks.length,
    completed: completedToday.length,
    percentage:
      todayTasks.length > 0
        ? Math.round((completedToday.length / todayTasks.length) * 100)
        : 0,
  };
};

export const getMilestones = (totalCompleted) => {
  const milestones = [5, 10, 25, 50, 100, 250, 500, 1000];
  return milestones.find((m) => totalCompleted === m) || null;
};

export const getTotalCompleted = (tasks) => {
  return tasks.filter((task) => task.completed).length;
};
