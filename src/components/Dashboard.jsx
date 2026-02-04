import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  getPriorityDistribution,
  getCompletionHistory,
  getOverdueTasks,
  getSummaryStats,
} from '../utils/dashboardUtils';
import { getRelativeTime } from '../utils/dateUtils';
import PriorityChart from './charts/PriorityChart';
import CompletionChart from './charts/CompletionChart';
import AssigneeAvatar from './AssigneeAvatar';
import TagBadge from './TagBadge';

const Dashboard = ({
  tasks,
  folders,
  tags,
  onToggle,
  onEdit,
  onToggleChecklistItem
}) => {
  // Filters state
  const [showCompleted, setShowCompleted] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterFolder, setFilterFolder] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterDeadline, setFilterDeadline] = useState('all');

  const stats = getSummaryStats(tasks, folders);
  const priorityData = getPriorityDistribution(tasks);
  const completionData = getCompletionHistory(tasks);
  const overdueTasks = getOverdueTasks(tasks);

  // Get tasks due this week
  const thisWeekTasks = useMemo(() => {
    const now = new Date();
    const endOfWeek = new Date(now);
    endOfWeek.setDate(now.getDate() + (7 - now.getDay()));
    endOfWeek.setHours(23, 59, 59, 999);

    return tasks
      .filter(t => !t.completed && t.deadline)
      .filter(t => {
        const deadline = new Date(t.deadline);
        return deadline >= now && deadline <= endOfWeek;
      })
      .sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
  }, [tasks]);

  // Filtered tasks for All Tasks section
  const filteredTasks = useMemo(() => {
    let result = tasks;

    // Filter by completion
    if (!showCompleted) {
      result = result.filter(t => !t.completed);
    }

    // Filter by search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(t =>
        t.title.toLowerCase().includes(query) ||
        t.description?.toLowerCase().includes(query)
      );
    }

    // Filter by folder
    if (filterFolder !== 'all') {
      if (filterFolder === 'inbox') {
        result = result.filter(t => !t.folderId || t.folderId === 'inbox');
      } else {
        result = result.filter(t => t.folderId === filterFolder);
      }
    }

    // Filter by priority
    if (filterPriority !== 'all') {
      result = result.filter(t => t.priority === filterPriority);
    }

    // Filter by deadline
    if (filterDeadline !== 'all') {
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      const today = new Date(now);
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const weekEnd = new Date(now);
      weekEnd.setDate(weekEnd.getDate() + 7);

      if (filterDeadline === 'overdue') {
        result = result.filter(t => t.deadline && new Date(t.deadline) < now);
      } else if (filterDeadline === 'today') {
        result = result.filter(t => {
          if (!t.deadline) return false;
          const d = new Date(t.deadline);
          return d >= today && d < tomorrow;
        });
      } else if (filterDeadline === 'week') {
        result = result.filter(t => {
          if (!t.deadline) return false;
          const d = new Date(t.deadline);
          return d >= now && d <= weekEnd;
        });
      } else if (filterDeadline === 'no-deadline') {
        result = result.filter(t => !t.deadline);
      }
    }

    // Sort by priority then by deadline then by creation date
    return result.sort((a, b) => {
      if (a.completed !== b.completed) return a.completed ? 1 : -1;
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      const priorityDiff = (priorityOrder[a.priority] || 1) - (priorityOrder[b.priority] || 1);
      if (priorityDiff !== 0) return priorityDiff;
      if (a.deadline && b.deadline) return new Date(a.deadline) - new Date(b.deadline);
      if (a.deadline) return -1;
      if (b.deadline) return 1;
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
  }, [tasks, showCompleted, searchQuery, filterFolder, filterPriority, filterDeadline]);

  // Helper to get folder name by ID
  const getFolderName = (folderId) => {
    if (!folderId || folderId === 'inbox') return 'Inbox';
    const folder = folders.find(f => f.id === folderId);
    return folder?.name || 'Unknown';
  };

  // Get task's tags
  const getTaskTags = (task) => {
    return tags.filter(tag => task.tagIds?.includes(tag.id));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Summary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Active Tasks"
          value={stats.active}
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          }
          color="emerald"
        />
        <StatCard
          label="Completed"
          value={stats.completed}
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          color="blue"
        />
        <StatCard
          label="Overdue"
          value={stats.overdue}
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          color="red"
          highlight={stats.overdue > 0}
        />
        <StatCard
          label="Completed Today"
          value={stats.completedToday}
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          }
          color="amber"
        />
      </div>

      {/* Charts Row with Overdue */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Completion History */}
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
            Weekly Activity
          </h3>
          <CompletionChart data={completionData} />
        </div>

        {/* Priority Distribution */}
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
            By Priority
          </h3>
          {priorityData.length > 0 ? (
            <PriorityChart data={priorityData} />
          ) : (
            <p className="text-gray-500 text-center py-8">No active tasks</p>
          )}
        </div>

        {/* Overdue Tasks */}
        <div className={`card p-5 ${overdueTasks.length > 0 ? 'border border-red-500/30' : ''}`}>
          <h3 className={`text-sm font-semibold uppercase tracking-wider mb-4 ${overdueTasks.length > 0 ? 'text-red-400' : 'text-gray-400'}`}>
            Overdue Tasks ({overdueTasks.length})
          </h3>
          {overdueTasks.length > 0 ? (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {overdueTasks.map((task) => (
                <div
                  key={task.id}
                  onClick={() => onEdit?.(task)}
                  className="flex items-center gap-3 p-2.5 rounded-lg bg-red-500/10 border border-red-500/20 cursor-pointer hover:bg-red-500/20 transition-colors"
                >
                  <svg className="w-4 h-4 text-red-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white truncate">{task.title}</p>
                    <p className="text-xs text-red-400">{getRelativeTime(task.deadline)}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No overdue tasks</p>
          )}
        </div>
      </div>

      {/* This Week Section */}
      <div className="card p-5 border border-amber-500/30">
        <h3 className="text-sm font-semibold text-amber-400 uppercase tracking-wider mb-4">
          Due This Week ({thisWeekTasks.length})
        </h3>
        {thisWeekTasks.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
            {thisWeekTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                folders={folders}
                tags={tags}
                onEdit={onEdit}
                onToggle={onToggle}
                onToggleChecklistItem={onToggleChecklistItem}
                getFolderName={getFolderName}
                getTaskTags={getTaskTags}
                compact
              />
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-6">No tasks due this week</p>
        )}
      </div>

      {/* All Tasks Section with Filters */}
      <div className="card p-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4">
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
            All Tasks ({filteredTasks.length})
          </h3>
          <button
            onClick={() => setShowCompleted(!showCompleted)}
            className={`text-xs px-3 py-1.5 rounded-lg transition-colors ${
              showCompleted
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'bg-dark-600 text-gray-400 border border-dark-400 hover:border-gray-500'
            }`}
          >
            {showCompleted ? 'Hide Completed' : 'Show Completed'}
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-4 pb-4 border-b border-dark-400">
          {/* Search */}
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tasks..."
                className="w-full pl-10 pr-4 py-2 rounded-lg input-dark text-white text-sm placeholder-gray-500"
              />
            </div>
          </div>

          {/* Folder Filter */}
          <select
            value={filterFolder}
            onChange={(e) => setFilterFolder(e.target.value)}
            className="px-3 py-2 rounded-lg input-dark text-white text-sm"
          >
            <option value="all">All Folders</option>
            {folders.map((folder) => (
              <option key={folder.id} value={folder.id}>
                {folder.name}
              </option>
            ))}
          </select>

          {/* Priority Filter */}
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="px-3 py-2 rounded-lg input-dark text-white text-sm"
          >
            <option value="all">All Priorities</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          {/* Deadline Filter */}
          <select
            value={filterDeadline}
            onChange={(e) => setFilterDeadline(e.target.value)}
            className="px-3 py-2 rounded-lg input-dark text-white text-sm"
          >
            <option value="all">All Deadlines</option>
            <option value="overdue">Overdue</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="no-deadline">No Deadline</option>
          </select>
        </div>

        {/* Task List */}
        {filteredTasks.length > 0 ? (
          <div className="space-y-3">
            {filteredTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                folders={folders}
                tags={tags}
                onEdit={onEdit}
                onToggle={onToggle}
                onToggleChecklistItem={onToggleChecklistItem}
                getFolderName={getFolderName}
                getTaskTags={getTaskTags}
              />
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">No tasks match your filters</p>
        )}
      </div>
    </motion.div>
  );
};

// Task Card Component with full details
const TaskCard = ({
  task,
  folders,
  tags,
  onEdit,
  onToggle,
  onToggleChecklistItem,
  getFolderName,
  getTaskTags,
  compact = false
}) => {
  const taskTags = getTaskTags(task);
  const isOverdue = task.deadline && new Date(task.deadline) < new Date() && !task.completed;

  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      className={`rounded-xl border transition-all ${
        task.completed
          ? 'bg-dark-700 border-dark-500 opacity-60'
          : isOverdue
          ? 'bg-dark-600 border-red-500/30'
          : 'bg-dark-600 border-dark-400 hover:border-emerald-500/30'
      } ${compact ? 'p-3' : 'p-4'}`}
    >
      <div className="flex items-start gap-3">
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
          {/* Title & Priority */}
          <div className="flex items-start gap-2">
            <div className={`w-2 h-2 rounded-full flex-shrink-0 mt-1.5 ${
              task.priority === 'high' ? 'bg-red-500' :
              task.priority === 'low' ? 'bg-emerald-500' : 'bg-amber-500'
            }`} />
            <h4 className={`font-medium flex-1 ${
              task.completed ? 'line-through text-gray-500' : 'text-white'
            }`}>
              {task.title}
            </h4>
          </div>

          {/* Description */}
          {task.description && !compact && (
            <p className={`text-sm mt-1.5 ml-4 ${
              task.completed ? 'line-through text-gray-600' : 'text-gray-400'
            }`}>
              {task.description}
            </p>
          )}

          {/* Tags */}
          {taskTags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2 ml-4">
              {taskTags.map(tag => (
                <TagBadge key={tag.id} tag={tag} size="xs" />
              ))}
            </div>
          )}

          {/* Checklist */}
          {task.checklist?.length > 0 && !compact && (
            <div className="mt-3 ml-4 space-y-1.5">
              <div className="flex items-center gap-2">
                <svg className="w-3.5 h-3.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
                <span className="text-xs text-gray-500">
                  {task.checklist.filter(i => i.completed).length}/{task.checklist.length} completed
                </span>
              </div>
              {task.checklist.map((item) => (
                <div key={item.id} className="flex items-center gap-2">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleChecklistItem?.(task.id, item.id);
                    }}
                    className={`w-4 h-4 rounded border flex items-center justify-center transition-all flex-shrink-0 ${
                      item.completed
                        ? 'bg-emerald-500 border-emerald-500'
                        : 'border-dark-300 hover:border-emerald-500'
                    }`}
                  >
                    {item.completed && (
                      <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </motion.button>
                  <span className={`text-sm ${
                    item.completed ? 'text-gray-500 line-through' : 'text-gray-300'
                  }`}>
                    {item.text}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Meta row */}
          <div className="flex items-center gap-3 mt-2 ml-4 flex-wrap">
            {/* Folder */}
            <span className="text-xs text-gray-600 flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
              {getFolderName(task.folderId)}
            </span>

            {/* Deadline */}
            {task.deadline && (
              <span className={`text-xs flex items-center gap-1 ${
                isOverdue ? 'text-red-400' : 'text-gray-500'
              }`}>
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {getRelativeTime(task.deadline)}
                {isOverdue && (
                  <span className="ml-1 px-1.5 py-0.5 bg-red-500/20 text-red-400 rounded text-xs font-medium">
                    Overdue
                  </span>
                )}
              </span>
            )}

            {/* Assignee */}
            {task.assignee && (
              <span className="text-xs text-gray-500 flex items-center gap-1">
                <AssigneeAvatar name={task.assignee} size="xs" />
                {task.assignee}
              </span>
            )}

            {/* Links count */}
            {task.links?.length > 0 && (
              <span className="text-xs text-gray-500 flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
                {task.links.length} link{task.links.length > 1 ? 's' : ''}
              </span>
            )}

            {/* Checklist summary for compact view */}
            {task.checklist?.length > 0 && compact && (
              <span className="text-xs text-gray-500 flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
                {task.checklist.filter(i => i.completed).length}/{task.checklist.length}
              </span>
            )}
          </div>
        </div>

        {/* Edit Button */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => onEdit?.(task)}
          className="p-2 rounded-lg text-gray-500 hover:text-emerald-400 hover:bg-emerald-500/10 transition-colors flex-shrink-0"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </motion.button>
      </div>
    </motion.div>
  );
};

// Stat Card Component
const StatCard = ({ label, value, icon, color, highlight = false }) => {
  const colorClasses = {
    emerald: { bg: 'bg-emerald-500/20', text: 'text-emerald-400', border: 'border-emerald-500/30' },
    blue: { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/30' },
    red: { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/30' },
    amber: { bg: 'bg-amber-500/20', text: 'text-amber-400', border: 'border-amber-500/30' },
  };

  const colors = colorClasses[color] || colorClasses.emerald;

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className={`card p-4 ${highlight ? colors.border : ''}`}
    >
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${colors.bg} ${colors.text}`}>
          {icon}
        </div>
        <div>
          <p className="text-2xl font-bold text-white">{value}</p>
          <p className="text-xs text-gray-500">{label}</p>
        </div>
      </div>
    </motion.div>
  );
};

export default Dashboard;
