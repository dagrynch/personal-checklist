import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const TaskLinkSelector = ({ tasks = [], selectedTaskIds = [], onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  // Filter available tasks (not completed, not already selected)
  const availableTasks = tasks.filter(task =>
    !task.completed &&
    !selectedTaskIds.includes(task.id) &&
    (search === '' || task.title.toLowerCase().includes(search.toLowerCase()))
  );

  // Get selected task objects
  const selectedTasks = tasks.filter(task => selectedTaskIds.includes(task.id));

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggleTask = (taskId) => {
    if (selectedTaskIds.includes(taskId)) {
      onChange(selectedTaskIds.filter(id => id !== taskId));
    } else {
      onChange([...selectedTaskIds, taskId]);
    }
  };

  const handleRemoveTask = (taskId) => {
    onChange(selectedTaskIds.filter(id => id !== taskId));
  };

  return (
    <div ref={containerRef} className="relative">
      <div className="flex items-center gap-2 mb-2">
        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
        </svg>
        <span className="text-sm font-medium text-gray-400">Linked Tasks</span>
      </div>

      {/* Selected Tasks */}
      {selectedTasks.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {selectedTasks.map(task => (
            <motion.span
              key={task.id}
              layout
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-lg text-sm"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <span className="truncate max-w-[150px]">{task.title}</span>
              <button
                onClick={() => handleRemoveTask(task.id)}
                className="p-0.5 rounded hover:bg-blue-500/30 transition-colors"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </motion.span>
          ))}
        </div>
      )}

      {/* Add Button / Dropdown */}
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          setTimeout(() => inputRef.current?.focus(), 100);
        }}
        className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-400 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Link task
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-20 mt-2 w-full max-w-md bg-dark-700 border border-dark-400 rounded-xl shadow-xl overflow-hidden"
          >
            {/* Search Input */}
            <div className="p-2 border-b border-dark-400">
              <input
                ref={inputRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search tasks..."
                className="w-full px-3 py-2 bg-dark-600 border border-dark-400 rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Task List */}
            <div className="max-h-60 overflow-y-auto">
              {availableTasks.length === 0 ? (
                <div className="p-4 text-center text-gray-500 text-sm">
                  {search ? 'No tasks match your search' : 'No available tasks to link'}
                </div>
              ) : (
                availableTasks.map(task => (
                  <button
                    key={task.id}
                    onClick={() => {
                      handleToggleTask(task.id);
                      setSearch('');
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-dark-600 transition-colors"
                  >
                    <svg className="w-4 h-4 text-gray-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white truncate">{task.title}</p>
                      {task.deadline && (
                        <p className="text-xs text-gray-500">Due: {task.deadline}</p>
                      )}
                    </div>
                    <span className={`px-2 py-0.5 rounded text-xs ${
                      task.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                      task.priority === 'medium' ? 'bg-amber-500/20 text-amber-400' :
                      'bg-emerald-500/20 text-emerald-400'
                    }`}>
                      {task.priority}
                    </span>
                  </button>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TaskLinkSelector;
