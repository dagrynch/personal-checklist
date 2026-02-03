import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Header from './components/Header';
import TaskForm from './components/TaskForm';
import TaskList from './components/TaskList';
import StatsPanel from './components/StatsPanel';
import useLocalStorage from './hooks/useLocalStorage';
import useNotifications from './hooks/useNotifications';
import {
  calculateStreak,
  getWeeklyStats,
  getDailyProgress,
  getTotalCompleted,
  getMilestones,
} from './utils/statsUtils';

function App() {
  const [tasks, setTasks] = useLocalStorage('checklist-tasks', []);
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

  return (
    <div className="bg-main min-h-screen">
      <div className="container mx-auto px-4 py-6 lg:py-8">
        {/* Header - Full width */}
        <Header
          onRequestNotifications={requestPermission}
          notificationPermission={permission}
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
  );
}

export default App;
