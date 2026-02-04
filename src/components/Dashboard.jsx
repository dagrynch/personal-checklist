import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  getPriorityDistribution,
  getFolderDistribution,
  getCompletionHistory,
  getUpcomingDeadlines,
  getOverdueTasks,
  getSummaryStats,
  getAssigneeWorkload,
  getTagStats,
} from '../utils/dashboardUtils';
import { getRelativeTime } from '../utils/dateUtils';
import PriorityChart from './charts/PriorityChart';
import FolderChart from './charts/FolderChart';
import CompletionChart from './charts/CompletionChart';
import AssigneeAvatar from './AssigneeAvatar';
import TagBadge from './TagBadge';

const Dashboard = ({ tasks, folders, tags }) => {
  const [showCompleted, setShowCompleted] = useState(false);

  const stats = getSummaryStats(tasks, folders);
  const priorityData = getPriorityDistribution(tasks);
  const folderData = getFolderDistribution(tasks, folders);
  const completionData = getCompletionHistory(tasks);
  const upcomingTasks = getUpcomingDeadlines(tasks);
  const overdueTasks = getOverdueTasks(tasks);
  const assigneeWorkload = getAssigneeWorkload(tasks);
  const tagStats = getTagStats(tasks, tags);

  // Get all tasks sorted by priority then by creation date
  const allTasks = tasks
    .filter(t => showCompleted ? true : !t.completed)
    .sort((a, b) => {
      // Sort by completion status first (active first)
      if (a.completed !== b.completed) return a.completed ? 1 : -1;
      // Then by priority
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      const priorityDiff = (priorityOrder[a.priority] || 1) - (priorityOrder[b.priority] || 1);
      if (priorityDiff !== 0) return priorityDiff;
      // Then by creation date (newest first)
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

  // Helper to get folder name by ID
  const getFolderName = (folderId) => {
    if (!folderId || folderId === 'inbox') return 'Inbox';
    const folder = folders.find(f => f.id === folderId);
    return folder?.name || 'Unknown';
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
          label="Today"
          value={stats.completedToday}
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          }
          color="amber"
        />
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Completion History */}
        <div className="lg:col-span-2 card p-5">
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
      </div>

      {/* Second Row */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Folder Distribution */}
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
            By Folder
          </h3>
          {folderData.length > 0 ? (
            <FolderChart data={folderData} />
          ) : (
            <p className="text-gray-500 text-center py-8">No tasks in folders</p>
          )}
        </div>

        {/* Upcoming Deadlines */}
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
            Upcoming Deadlines
          </h3>
          {upcomingTasks.length > 0 ? (
            <div className="space-y-3">
              {upcomingTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-dark-600 border border-dark-400"
                >
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                    task.priority === 'high' ? 'bg-red-500' :
                    task.priority === 'low' ? 'bg-emerald-500' : 'bg-amber-500'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white truncate">{task.title}</p>
                    <p className="text-xs text-gray-500">{getRelativeTime(task.deadline)}</p>
                  </div>
                  {task.assignee && (
                    <AssigneeAvatar name={task.assignee} size="sm" />
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No upcoming deadlines</p>
          )}
        </div>
      </div>

      {/* Third Row */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Overdue Tasks */}
        {overdueTasks.length > 0 && (
          <div className="card p-5 border-red-500/30">
            <h3 className="text-sm font-semibold text-red-400 uppercase tracking-wider mb-4">
              Overdue Tasks ({overdueTasks.length})
            </h3>
            <div className="space-y-3">
              {overdueTasks.slice(0, 5).map((task) => (
                <div
                  key={task.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-red-500/10 border border-red-500/20"
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
          </div>
        )}

        {/* Assignee Workload */}
        {assigneeWorkload.length > 0 && (
          <div className="card p-5">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
              Team Workload
            </h3>
            <div className="space-y-3">
              {assigneeWorkload.slice(0, 5).map((person) => (
                <div
                  key={person.name}
                  className="flex items-center gap-3 p-3 rounded-lg bg-dark-600 border border-dark-400"
                >
                  <AssigneeAvatar name={person.name} size="md" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white">{person.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      {person.high > 0 && (
                        <span className="text-xs text-red-400">{person.high} high</span>
                      )}
                      {person.medium > 0 && (
                        <span className="text-xs text-amber-400">{person.medium} medium</span>
                      )}
                      {person.low > 0 && (
                        <span className="text-xs text-emerald-400">{person.low} low</span>
                      )}
                    </div>
                  </div>
                  <span className="text-lg font-semibold text-emerald-400">{person.count}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tag Usage */}
        {tagStats.length > 0 && (
          <div className="card p-5">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
              Tag Usage
            </h3>
            <div className="flex flex-wrap gap-2">
              {tagStats.slice(0, 10).map((tag) => (
                <div key={tag.id} className="flex items-center gap-2">
                  <TagBadge tag={tag} size="md" />
                  <span className="text-xs text-gray-500">({tag.count})</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* All Tasks Section */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
            All Tasks ({allTasks.length})
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
        {allTasks.length > 0 ? (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {allTasks.map((task) => (
              <div
                key={task.id}
                className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                  task.completed
                    ? 'bg-dark-700 border-dark-500 opacity-60'
                    : 'bg-dark-600 border-dark-400'
                }`}
              >
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                  task.completed ? 'bg-gray-500' :
                  task.priority === 'high' ? 'bg-red-500' :
                  task.priority === 'low' ? 'bg-emerald-500' : 'bg-amber-500'
                }`} />
                <div className="flex-1 min-w-0">
                  <p className={`text-sm truncate ${task.completed ? 'text-gray-500 line-through' : 'text-white'}`}>
                    {task.title}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-gray-600">{getFolderName(task.folderId)}</span>
                    {task.deadline && (
                      <span className={`text-xs ${
                        !task.completed && new Date(task.deadline) < new Date() ? 'text-red-400' : 'text-gray-500'
                      }`}>
                        {getRelativeTime(task.deadline)}
                      </span>
                    )}
                  </div>
                </div>
                {task.assignee && (
                  <AssigneeAvatar name={task.assignee} size="sm" />
                )}
                {task.completed && (
                  <svg className="w-4 h-4 text-emerald-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">No tasks yet</p>
        )}
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
