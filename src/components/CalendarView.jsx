import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const CalendarView = ({ tasks, folders, tags, onToggle, onEdit }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Get calendar data
  const calendarData = useMemo(() => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startPadding = firstDay.getDay();
    const totalDays = lastDay.getDate();

    const days = [];

    // Add padding for days before month starts
    for (let i = 0; i < startPadding; i++) {
      const prevMonthDay = new Date(year, month, -startPadding + i + 1);
      days.push({ date: prevMonthDay, isCurrentMonth: false });
    }

    // Add days of current month
    for (let i = 1; i <= totalDays; i++) {
      days.push({ date: new Date(year, month, i), isCurrentMonth: true });
    }

    // Add padding for days after month ends
    const endPadding = 42 - days.length; // 6 rows * 7 days
    for (let i = 1; i <= endPadding; i++) {
      days.push({ date: new Date(year, month + 1, i), isCurrentMonth: false });
    }

    return days;
  }, [year, month]);

  // Group tasks by date
  const tasksByDate = useMemo(() => {
    const map = {};
    tasks.forEach(task => {
      if (task.deadline) {
        const dateKey = task.deadline;
        if (!map[dateKey]) map[dateKey] = [];
        map[dateKey].push(task);
      }
    });
    return map;
  }, [tasks]);

  // Get tasks for selected date
  const selectedDateTasks = useMemo(() => {
    if (!selectedDate) return [];
    const dateKey = formatDateKey(selectedDate);
    return tasksByDate[dateKey] || [];
  }, [selectedDate, tasksByDate]);

  const goToPrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(new Date());
  };

  const isToday = (date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSelected = (date) => {
    return selectedDate && date.toDateString() === selectedDate.toDateString();
  };

  const getTasksForDate = (date) => {
    const dateKey = formatDateKey(date);
    return tasksByDate[dateKey] || [];
  };

  const getFolderName = (folderId) => {
    if (!folderId || folderId === 'inbox') return 'Inbox';
    const folder = folders.find(f => f.id === folderId);
    return folder?.name || 'Unknown';
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="space-y-6">
      {/* Calendar Header */}
      <div className="card p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold text-white">
              {monthNames[month]} {year}
            </h2>
            <button
              onClick={goToToday}
              className="px-3 py-1 text-sm rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-colors"
            >
              Today
            </button>
          </div>
          <div className="flex gap-2">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={goToPrevMonth}
              className="p-2 rounded-lg bg-dark-600 text-gray-400 hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={goToNextMonth}
              className="p-2 rounded-lg bg-dark-600 text-gray-400 hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </motion.button>
          </div>
        </div>

        {/* Day names header */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {dayNames.map(day => (
            <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {calendarData.map((day, index) => {
            const dayTasks = getTasksForDate(day.date);
            const hasOverdue = dayTasks.some(t => !t.completed && new Date(t.deadline) < new Date());
            const hasHighPriority = dayTasks.some(t => !t.completed && t.priority === 'high');
            const activeTasks = dayTasks.filter(t => !t.completed);

            return (
              <motion.button
                key={index}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedDate(day.date)}
                className={`relative p-2 min-h-[80px] rounded-lg border transition-all text-left ${
                  !day.isCurrentMonth
                    ? 'bg-dark-800 border-dark-600 text-gray-600'
                    : isSelected(day.date)
                    ? 'bg-emerald-500/20 border-emerald-500 text-white'
                    : isToday(day.date)
                    ? 'bg-dark-600 border-emerald-500/50 text-white'
                    : 'bg-dark-700 border-dark-400 text-gray-300 hover:border-emerald-500/30'
                }`}
              >
                <span className={`text-sm font-medium ${
                  isToday(day.date) ? 'text-emerald-400' : ''
                }`}>
                  {day.date.getDate()}
                </span>

                {/* Task indicators */}
                {activeTasks.length > 0 && (
                  <div className="mt-1 space-y-0.5">
                    {activeTasks.slice(0, 2).map(task => (
                      <div
                        key={task.id}
                        className={`text-xs truncate px-1 py-0.5 rounded ${
                          task.priority === 'high'
                            ? 'bg-red-500/30 text-red-300'
                            : task.priority === 'low'
                            ? 'bg-emerald-500/30 text-emerald-300'
                            : 'bg-amber-500/30 text-amber-300'
                        }`}
                      >
                        {task.title}
                      </div>
                    ))}
                    {activeTasks.length > 2 && (
                      <div className="text-xs text-gray-500 px-1">
                        +{activeTasks.length - 2} more
                      </div>
                    )}
                  </div>
                )}

                {/* Overdue indicator */}
                {hasOverdue && (
                  <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500" />
                )}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Selected date tasks */}
      <AnimatePresence>
        {selectedDate && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="card p-5"
          >
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
              {selectedDate.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
              {selectedDateTasks.length > 0 && (
                <span className="ml-2 text-emerald-400">({selectedDateTasks.length} tasks)</span>
              )}
            </h3>

            {selectedDateTasks.length > 0 ? (
              <div className="space-y-3">
                {selectedDateTasks.map(task => (
                  <div
                    key={task.id}
                    className={`flex items-start gap-3 p-3 rounded-lg border transition-all ${
                      task.completed
                        ? 'bg-dark-700 border-dark-500 opacity-60'
                        : 'bg-dark-600 border-dark-400'
                    }`}
                  >
                    {/* Checkbox */}
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => onToggle?.(task.id)}
                      className={`mt-0.5 w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all flex-shrink-0 ${
                        task.completed
                          ? 'bg-emerald-500 border-emerald-500'
                          : 'border-dark-300 hover:border-emerald-500'
                      }`}
                    >
                      {task.completed && (
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </motion.button>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${
                          task.priority === 'high' ? 'bg-red-500' :
                          task.priority === 'low' ? 'bg-emerald-500' : 'bg-amber-500'
                        }`} />
                        <h4 className={`font-medium ${
                          task.completed ? 'line-through text-gray-500' : 'text-white'
                        }`}>
                          {task.title}
                        </h4>
                      </div>
                      {task.description && (
                        <p className={`text-sm mt-1 ${
                          task.completed ? 'line-through text-gray-600' : 'text-gray-400'
                        }`}>
                          {task.description}
                        </p>
                      )}
                      <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                        <span>{getFolderName(task.folderId)}</span>
                        {task.assignee && <span>@{task.assignee}</span>}
                        {task.checklist?.length > 0 && (
                          <span>
                            {task.checklist.filter(i => i.completed).length}/{task.checklist.length} subtasks
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Edit button */}
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => onEdit?.(task)}
                      className="p-2 rounded-lg text-gray-500 hover:text-emerald-400 hover:bg-emerald-500/10 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </motion.button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No tasks scheduled for this day</p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Helper to format date as YYYY-MM-DD for matching
const formatDateKey = (date) => {
  return date.toISOString().split('T')[0];
};

export default CalendarView;
