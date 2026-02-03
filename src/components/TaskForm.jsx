import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getTodayString } from '../utils/dateUtils';

const TaskForm = ({ onAddTask, editTask, onUpdateTask, onCancelEdit }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState('');
  const [priority, setPriority] = useState('medium');

  useEffect(() => {
    if (editTask) {
      setTitle(editTask.title || '');
      setDescription(editTask.description || '');
      setDeadline(editTask.deadline || '');
      setPriority(editTask.priority || 'medium');
      setIsExpanded(true);
    }
  }, [editTask]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    const taskData = {
      title: title.trim(),
      description: description.trim(),
      deadline: deadline || null,
      priority,
    };

    if (editTask) {
      onUpdateTask({ ...editTask, ...taskData });
    } else {
      onAddTask(taskData);
    }

    resetForm();
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setDeadline('');
    setPriority('medium');
    setIsExpanded(false);
    if (editTask) onCancelEdit();
  };

  const isEditing = !!editTask;

  return (
    <motion.div
      layout
      className="card p-4 lg:p-5"
    >
      <form onSubmit={handleSubmit}>
        <div className="flex gap-3">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onFocus={() => setIsExpanded(true)}
            placeholder="What needs to be done?"
            className="flex-1 px-4 py-3 rounded-xl input-dark text-white placeholder-gray-500"
          />
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={!title.trim()}
            className="px-6 py-3 rounded-xl btn-primary"
          >
            {isEditing ? 'Update' : 'Add'}
          </motion.button>
        </div>

        <AnimatePresence>
          {(isExpanded || isEditing) && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="pt-4 space-y-4">
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Add a description (optional)"
                  rows={2}
                  className="w-full px-4 py-3 rounded-xl input-dark text-white placeholder-gray-500 resize-none"
                />

                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Deadline
                    </label>
                    <input
                      type="date"
                      value={deadline}
                      onChange={(e) => setDeadline(e.target.value)}
                      min={getTodayString()}
                      className="w-full px-4 py-2.5 rounded-xl input-dark text-white"
                    />
                  </div>

                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Priority
                    </label>
                    <div className="flex gap-2">
                      {['low', 'medium', 'high'].map((p) => (
                        <motion.button
                          key={p}
                          type="button"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setPriority(p)}
                          className={`flex-1 py-2.5 rounded-xl font-medium capitalize transition-all text-sm ${
                            priority === p
                              ? p === 'low'
                                ? 'bg-emerald-500 text-white'
                                : p === 'medium'
                                ? 'bg-amber-500 text-white'
                                : 'bg-red-500 text-white'
                              : 'bg-dark-600 text-gray-400 border border-dark-400 hover:border-gray-500'
                          }`}
                        >
                          {p}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                </div>

                {isEditing && (
                  <div className="flex justify-end pt-2">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="button"
                      onClick={resetForm}
                      className="px-4 py-2 rounded-xl text-gray-400 hover:text-white hover:bg-dark-500 transition-colors"
                    >
                      Cancel
                    </motion.button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </form>
    </motion.div>
  );
};

export default TaskForm;
