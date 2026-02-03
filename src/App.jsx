import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import PasswordGate from './components/PasswordGate';
import Header from './components/Header';
import TaskForm from './components/TaskForm';
import TaskList from './components/TaskList';
import StatsPanel from './components/StatsPanel';
import useGistStorage from './hooks/useGistStorage';
import useNotifications from './hooks/useNotifications';
import {
  calculateStreak,
  getWeeklyStats,
  getDailyProgress,
  getTotalCompleted,
  getMilestones,
} from './utils/statsUtils';

function App() {
  const [tasks, setTasks, syncStatus] = useGistStorage('checklist-tasks', []);
  const [filter, setFilter] = useState('all');
  const [editTask, setEditTask] = useState(null);
  const [milestone, setMilestone] = useState(null);

  const { permission, requestPermission } = useNotifications(tasks);

  // Calculate stats
  const streak = calculateStreak(tasks);
  const weeklyStats = getWeeklyStats(tasks);
  const dailyProgress = getDailyProgress(tasks);
  const totalCompleted = getTotalCompleted(tasks);

  // Check for milestones
  useEffect(() => {
    const newMilestone = getMilestones(totalCompleted);
    if (newMilestone) {
      setMilestone(newMilestone);
      const timer = setTimeout(() => setMilestone(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [totalCompleted]);

  const addTask = (taskData) => {
    const newTask = {
      id: Date.now().toString(),
      ...taskData,
      completed: false,
      createdAt: new Date().toISOString(),
      completedAt: null,
    };
    setTasks((prev) => [newTask, ...prev]);
  };

  const updateTask = (updatedTask) => {
    setTasks((prev) =>
      prev.map((task) => (task.id === updatedTask.id ? updatedTask : task))
    );
    setEditTask(null);
  };

  const toggleTask = (id) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id
          ? {
              ...task,
              completed: !task.completed,
              completedAt: !task.completed ? new Date().toISOString() : null,
            }
          : task
      )
    );
  };

  const deleteTask = (id) => {
    setTasks((prev) => prev.filter((task) => task.id !== id));
  };

  const reorderTasks = (newTasks) => {
    setTasks(newTasks);
  };

  // Show loading state while syncing initial data
  if (syncStatus.isLoading) {
    return (
      <PasswordGate>
        <div className="min-h-screen bg-dark-900 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-2 border-accent-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-dark-300">Loading your tasks...</p>
          </div>
        </div>
      </PasswordGate>
    );
  }

  return (
    <PasswordGate>
      <div className="bg-main min-h-screen">
        <div className="container mx-auto px-4 py-6 lg:py-8">
          {/* Header - Full width */}
          <Header
            onRequestNotifications={requestPermission}
            notificationPermission={permission}
            isSyncing={syncStatus.isSyncing}
          />

          {/* Desktop: Side-by-side layout, Mobile: Stacked */}
          <div className="mt-6 lg:grid lg:grid-cols-[320px_1fr] lg:gap-6">
            {/* Left column - Stats (sticky on desktop) */}
            <div className="lg:sticky lg:top-6 lg:h-fit">
              <StatsPanel
                streak={streak}
                weeklyStats={weeklyStats}
                dailyProgress={dailyProgress}
                totalCompleted={totalCompleted}
              />
            </div>

            {/* Right column - Form and Tasks */}
            <div className="mt-6 lg:mt-0 space-y-6">
              <TaskForm
                onAddTask={addTask}
                editTask={editTask}
                onUpdateTask={updateTask}
                onCancelEdit={() => setEditTask(null)}
              />

              <TaskList
                tasks={tasks}
                onToggle={toggleTask}
                onDelete={deleteTask}
                onEdit={setEditTask}
                onReorder={reorderTasks}
                filter={filter}
                setFilter={setFilter}
              />
            </div>
          </div>

          {/* Sync error notification */}
          <AnimatePresence>
            {syncStatus.error && (
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 50 }}
                className="fixed bottom-20 left-1/2 -translate-x-1/2 bg-red-500/90 text-white px-4 py-2 rounded-lg text-sm z-50"
              >
                Sync error: {syncStatus.error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Milestone Celebration */}
          <AnimatePresence>
            {milestone && (
              <motion.div
                initial={{ opacity: 0, scale: 0.5, y: 50 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.5, y: 50 }}
                className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-emerald-500 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 z-50"
                style={{ boxShadow: '0 0 40px rgba(16, 185, 129, 0.5)' }}
              >
                <span className="text-3xl">🏆</span>
                <div>
                  <p className="font-bold">Milestone Reached!</p>
                  <p className="text-sm opacity-90">{milestone} tasks completed!</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </PasswordGate>
  );
}

export default App;
