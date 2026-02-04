import { useState, useEffect, useRef, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import PasswordGate from './components/PasswordGate';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import TaskForm from './components/TaskForm';
import TaskList from './components/TaskList';
import StatsPanel from './components/StatsPanel';
import Dashboard from './components/Dashboard';
import QuickAdd from './components/QuickAdd';
import CalendarView from './components/CalendarView';
import KeyboardShortcutsHelp from './components/KeyboardShortcutsHelp';
import useGistStorage from './hooks/useGistStorage';
import useNotifications from './hooks/useNotifications';
import useKeyboardShortcuts from './hooks/useKeyboardShortcuts';
import {
  calculateStreak,
  getWeeklyStats,
  getDailyProgress,
  getTotalCompleted,
  getMilestones,
} from './utils/statsUtils';

function App() {
  // Data from gist storage
  const {
    tasks,
    folders,
    tags,
    setTasks,
    setFolders,
    setTags,
    syncStatus,
  } = useGistStorage();

  // UI State
  const [filter, setFilter] = useState('all');
  const [editTask, setEditTask] = useState(null);
  const [milestone, setMilestone] = useState(null);
  const [activeFolderId, setActiveFolderId] = useState('inbox');
  const [currentView, setCurrentView] = useState('dashboard'); // 'dashboard', 'tasks', 'calendar'
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [filterTagIds, setFilterTagIds] = useState([]);
  const [filterAssignee, setFilterAssignee] = useState(null);
  const [showShortcutsHelp, setShowShortcutsHelp] = useState(false);

  // Refs for keyboard shortcuts
  const quickAddRef = useRef(null);
  const searchRef = useRef(null);

  const { permission, requestPermission } = useNotifications(tasks);

  // Calculate stats
  const streak = calculateStreak(tasks);
  const weeklyStats = getWeeklyStats(tasks);
  const dailyProgress = getDailyProgress(tasks);
  const totalCompleted = getTotalCompleted(tasks);

  // Keyboard shortcuts
  useKeyboardShortcuts({
    onNewTask: () => {
      quickAddRef.current?.focus();
    },
    onSearch: () => {
      searchRef.current?.focus();
    },
    onToggleDashboard: () => {
      setCurrentView(prev => prev === 'dashboard' ? 'tasks' : 'dashboard');
    },
    onToggleCalendar: () => {
      setCurrentView(prev => prev === 'calendar' ? 'dashboard' : 'calendar');
    },
    onEscape: () => {
      setEditTask(null);
      setShowShortcutsHelp(false);
    },
    onShowHelp: () => {
      setShowShortcutsHelp(prev => !prev);
    },
  });

  // Check for milestones
  useEffect(() => {
    const newMilestone = getMilestones(totalCompleted);
    if (newMilestone) {
      setMilestone(newMilestone);
      const timer = setTimeout(() => setMilestone(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [totalCompleted]);

  // Check for recurring tasks that need to be created
  useEffect(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    tasks.forEach(task => {
      if (task.completed && task.recurrence && task.recurrence !== 'none') {
        const completedAt = new Date(task.completedAt);
        const nextDate = getNextRecurrenceDate(completedAt, task.recurrence);

        // Check if we should create a new instance
        if (nextDate <= now) {
          // Check if there's already an active instance of this recurring task
          const hasActiveInstance = tasks.some(t =>
            t.recurringParentId === task.id && !t.completed
          );

          if (!hasActiveInstance) {
            createRecurringTaskInstance(task, nextDate);
          }
        }
      }
    });
  }, [tasks]);

  // Helper to calculate next recurrence date
  const getNextRecurrenceDate = (fromDate, recurrence) => {
    const next = new Date(fromDate);
    switch (recurrence) {
      case 'daily':
        next.setDate(next.getDate() + 1);
        break;
      case 'weekly':
        next.setDate(next.getDate() + 7);
        break;
      case 'monthly':
        next.setMonth(next.getMonth() + 1);
        break;
      case 'yearly':
        next.setFullYear(next.getFullYear() + 1);
        break;
      default:
        break;
    }
    return next;
  };

  // Create a new instance of a recurring task
  const createRecurringTaskInstance = (parentTask, deadline) => {
    const newTask = {
      id: Date.now().toString(),
      title: parentTask.title,
      description: parentTask.description,
      deadline: deadline.toISOString().split('T')[0],
      priority: parentTask.priority,
      folderId: parentTask.folderId,
      tagIds: parentTask.tagIds || [],
      assignee: parentTask.assignee,
      links: parentTask.links || [],
      checklist: parentTask.checklist?.map(item => ({
        ...item,
        id: Date.now().toString() + Math.random(),
        completed: false
      })) || [],
      recurrence: parentTask.recurrence,
      recurringParentId: parentTask.id,
      completed: false,
      createdAt: new Date().toISOString(),
      completedAt: null,
      order: tasks.length,
    };
    setTasks(prev => [newTask, ...prev]);
  };

  // Task CRUD operations
  const addTask = (taskData) => {
    const newTask = {
      id: Date.now().toString(),
      ...taskData,
      completed: false,
      createdAt: new Date().toISOString(),
      completedAt: null,
      order: tasks.length,
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

  const toggleChecklistItem = (taskId, itemId) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId
          ? {
              ...task,
              checklist: task.checklist?.map((item) =>
                item.id === itemId ? { ...item, completed: !item.completed } : item
              ),
            }
          : task
      )
    );
  };

  const reorderTasks = (newTasks) => {
    setTasks(newTasks);
  };

  // Folder CRUD operations
  const createFolder = (folderData) => {
    const newFolder = {
      id: Date.now().toString(),
      ...folderData,
      order: folders.length,
      createdAt: new Date().toISOString(),
    };
    setFolders((prev) => [...prev, newFolder]);
  };

  const updateFolder = (updatedFolder) => {
    setFolders((prev) =>
      prev.map((folder) => (folder.id === updatedFolder.id ? updatedFolder : folder))
    );
  };

  const deleteFolder = (folderId) => {
    // Move tasks from deleted folder to inbox
    setTasks((prev) =>
      prev.map((task) =>
        task.folderId === folderId ? { ...task, folderId: null } : task
      )
    );
    setFolders((prev) => prev.filter((folder) => folder.id !== folderId));
    if (activeFolderId === folderId) {
      setActiveFolderId('inbox');
    }
  };

  // Tag CRUD operations
  const createTag = (tagData) => {
    const newTag = {
      id: Date.now().toString(),
      ...tagData,
      createdAt: new Date().toISOString(),
    };
    setTags((prev) => [...prev, newTag]);
    return newTag;
  };

  const updateTag = (updatedTag) => {
    setTags((prev) =>
      prev.map((tag) => (tag.id === updatedTag.id ? updatedTag : tag))
    );
  };

  const deleteTag = (tagId) => {
    // Remove tag from all tasks
    setTasks((prev) =>
      prev.map((task) => ({
        ...task,
        tagIds: task.tagIds?.filter((id) => id !== tagId) || [],
      }))
    );
    setTags((prev) => prev.filter((tag) => tag.id !== tagId));
    setFilterTagIds((prev) => prev.filter((id) => id !== tagId));
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
            onOpenSidebar={() => setSidebarOpen(true)}
          />

          {/* Main Layout with Sidebar */}
          <div className="mt-6 lg:flex lg:gap-6">
            {/* Sidebar */}
            <Sidebar
              folders={folders}
              tags={tags}
              tasks={tasks}
              activeFolderId={activeFolderId}
              onSelectFolder={(id) => {
                setActiveFolderId(id);
                setCurrentView('tasks');
              }}
              onCreateFolder={createFolder}
              onUpdateFolder={updateFolder}
              onDeleteFolder={deleteFolder}
              onCreateTag={createTag}
              onUpdateTag={updateTag}
              onDeleteTag={deleteTag}
              isOpen={sidebarOpen}
              onClose={() => setSidebarOpen(false)}
              onShowDashboard={() => setCurrentView('dashboard')}
              showDashboard={currentView === 'dashboard'}
              currentView={currentView}
              onChangeView={setCurrentView}
            />

            {/* Main Content */}
            <div className="flex-1 min-w-0">
              {/* Quick Add - Always visible */}
              <div className="mb-6">
                <QuickAdd
                  onAddTask={addTask}
                  folders={folders}
                  tags={tags}
                  onCreateTag={createTag}
                  ref={quickAddRef}
                />
              </div>

              <AnimatePresence mode="wait">
                {currentView === 'dashboard' && (
                  <motion.div
                    key="dashboard"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                  >
                    <Dashboard
                      tasks={tasks}
                      folders={folders}
                      tags={tags}
                      onToggle={toggleTask}
                      onEdit={setEditTask}
                      onToggleChecklistItem={toggleChecklistItem}
                      searchRef={searchRef}
                    />
                  </motion.div>
                )}

                {currentView === 'calendar' && (
                  <motion.div
                    key="calendar"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                  >
                    <CalendarView
                      tasks={tasks}
                      folders={folders}
                      tags={tags}
                      onToggle={toggleTask}
                      onEdit={setEditTask}
                    />
                  </motion.div>
                )}

                {currentView === 'tasks' && (
                  <motion.div
                    key="tasks"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                  >
                    {/* Desktop: Side-by-side layout, Mobile: Stacked */}
                    <div className="lg:grid lg:grid-cols-[320px_1fr] lg:gap-6">
                      {/* Left column - Stats (sticky on desktop) */}
                      <div className="lg:sticky lg:top-6 lg:h-fit hidden lg:block">
                        <StatsPanel
                          streak={streak}
                          weeklyStats={weeklyStats}
                          dailyProgress={dailyProgress}
                          totalCompleted={totalCompleted}
                        />
                      </div>

                      {/* Right column - Form and Tasks */}
                      <div className="space-y-6">
                        <TaskForm
                          onAddTask={addTask}
                          editTask={editTask}
                          onUpdateTask={updateTask}
                          onCancelEdit={() => setEditTask(null)}
                          folders={folders}
                          tags={tags}
                          tasks={tasks}
                          activeFolderId={activeFolderId}
                          onCreateTag={createTag}
                        />

                        <TaskList
                          tasks={tasks}
                          onToggle={toggleTask}
                          onDelete={deleteTask}
                          onEdit={setEditTask}
                          onReorder={reorderTasks}
                          onToggleChecklistItem={toggleChecklistItem}
                          filter={filter}
                          setFilter={setFilter}
                          activeFolderId={activeFolderId}
                          tags={tags}
                          folders={folders}
                          filterTagIds={filterTagIds}
                          onFilterTagsChange={setFilterTagIds}
                          filterAssignee={filterAssignee}
                          onFilterAssigneeChange={setFilterAssignee}
                        />

                        {/* Mobile Stats - Show below task list */}
                        <div className="lg:hidden">
                          <StatsPanel
                            streak={streak}
                            weeklyStats={weeklyStats}
                            dailyProgress={dailyProgress}
                            totalCompleted={totalCompleted}
                          />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Keyboard Shortcuts Help Modal */}
          <KeyboardShortcutsHelp
            isOpen={showShortcutsHelp}
            onClose={() => setShowShortcutsHelp(false)}
          />

          {/* Keyboard shortcuts hint */}
          <div className="fixed bottom-4 right-4 hidden lg:block">
            <button
              onClick={() => setShowShortcutsHelp(true)}
              className="px-3 py-1.5 rounded-lg bg-dark-700 border border-dark-400 text-gray-500 hover:text-gray-300 text-sm transition-colors"
            >
              Press <kbd className="px-1.5 py-0.5 rounded bg-dark-600 text-gray-400 font-mono">?</kbd> for shortcuts
            </button>
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
