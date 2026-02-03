export const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined,
  });
};

export const isOverdue = (dateString) => {
  if (!dateString) return false;
  const deadline = new Date(dateString);
  deadline.setHours(23, 59, 59, 999);
  return deadline < new Date();
};

export const isDueToday = (dateString) => {
  if (!dateString) return false;
  const deadline = new Date(dateString);
  const today = new Date();
  return (
    deadline.getDate() === today.getDate() &&
    deadline.getMonth() === today.getMonth() &&
    deadline.getFullYear() === today.getFullYear()
  );
};

export const isDueSoon = (dateString, hoursThreshold = 24) => {
  if (!dateString) return false;
  const deadline = new Date(dateString);
  const now = new Date();
  const diffHours = (deadline - now) / (1000 * 60 * 60);
  return diffHours > 0 && diffHours <= hoursThreshold;
};

export const getRelativeTime = (dateString) => {
  if (!dateString) return '';
  const deadline = new Date(dateString);
  const now = new Date();
  const diffMs = deadline - now;
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    const absDays = Math.abs(diffDays);
    if (absDays === 1) return 'Yesterday';
    if (absDays < 7) return `${absDays} days ago`;
    return formatDate(dateString);
  }

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';
  if (diffDays < 7) return `In ${diffDays} days`;
  return formatDate(dateString);
};

export const getTodayString = () => {
  const today = new Date();
  return today.toISOString().split('T')[0];
};

export const isSameDay = (date1, date2) => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  return (
    d1.getDate() === d2.getDate() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getFullYear() === d2.getFullYear()
  );
};
