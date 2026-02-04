import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getTodayString } from '../utils/dateUtils';
import TagSelector from './TagSelector';
import AssigneeInput from './AssigneeInput';
import LinkInput from './LinkInput';
import ChecklistInput from './ChecklistInput';

const TaskForm = ({
  onAddTask,
  editTask,
  onUpdateTask,
  onCancelEdit,
  folders = [],
  tags = [],
  tasks = [],
  activeFolderId,
  onCreateTag,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState('');
  const [priority, setPriority] = useState('medium');
  const [folderId, setFolderId] = useState(null);
  const [tagIds, setTagIds] = useState([]);
  const [assignee, setAssignee] = useState(null);
  const [links, setLinks] = useState([]);
  const [checklist, setChecklist] = useState([]);
  const [recurrence, setRecurrence] = useState('none');

  useEffect(() => {
    if (editTask) {
      setTitle(editTask.title || '');
      setDescription(editTask.description || '');
      setDeadline(editTask.deadline || '');
      setPriority(editTask.priority || 'medium');
      setFolderId(editTask.folderId || null);
      setTagIds(editTask.tagIds || []);
      setAssignee(editTask.assignee || null);
      setLinks(editTask.links || []);
      setChecklist(editTask.checklist || []);
      setRecurrence(editTask.recurrence || 'none');
      setIsExpanded(true);
    } else {
      // Set folder to active folder when creating new task
      setFolderId(activeFolderId === 'inbox' ? null : activeFolderId);
    }
  }, [editTask, activeFolderId]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    const taskData = {
      title: title.trim(),
      description: description.trim(),
      deadline: deadline || null,
      priority,
      folderId: folderId || null,
      tagIds,
      assignee,
      links,
      checklist,
      recurrence,
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
    setFolderId(activeFolderId === 'inbox' ? null : activeFolderId);
    setTagIds([]);
    setAssignee(null);
    setLinks([]);
    setChecklist([]);
    setRecurrence('none');
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
                {/* Description */}
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Add a description (optional)"
                  rows={2}
                  className="w-full px-4 py-3 rounded-xl input-dark text-white placeholder-gray-500 resize-none"
                />

                {/* Row 1: Deadline & Priority */}
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

                {/* Row 1.5: Recurrence */}
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Repeat
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { value: 'none', label: 'Never' },
                      { value: 'daily', label: 'Daily' },
                      { value: 'weekly', label: 'Weekly' },
                      { value: 'monthly', label: 'Monthly' },
                      { value: 'yearly', label: 'Yearly' },
                    ].map((opt) => (
                      <motion.button
                        key={opt.value}
                        type="button"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setRecurrence(opt.value)}
                        className={`px-4 py-2 rounded-xl font-medium transition-all text-sm ${
                          recurrence === opt.value
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-dark-600 text-gray-400 border border-dark-400 hover:border-gray-500'
                        }`}
                      >
                        {opt.label}
                      </motion.button>
                    ))}
                  </div>
                  {recurrence !== 'none' && (
                    <p className="text-xs text-gray-500 mt-2">
                      Task will repeat {recurrence} after completion
                    </p>
                  )}
                </div>

                {/* Row 2: Folder & Assignee */}
                <div className="flex flex-col sm:flex-row gap-4">
                  {/* Folder Selector */}
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Folder
                    </label>
                    <select
                      value={folderId || 'inbox'}
                      onChange={(e) => setFolderId(e.target.value === 'inbox' ? null : e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl input-dark text-white"
                    >
                      {folders.map((folder) => (
                        <option key={folder.id} value={folder.id}>
                          {folder.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Assignee */}
                  <div className="flex-1">
                    <AssigneeInput
                      value={assignee}
                      onChange={setAssignee}
                      tasks={tasks}
                    />
                  </div>
                </div>

                {/* Row 3: Tags */}
                <TagSelector
                  tags={tags}
                  selectedTagIds={tagIds}
                  onChange={setTagIds}
                  onCreateTag={onCreateTag}
                />

                {/* Row 4: Links */}
                <LinkInput
                  links={links}
                  onChange={setLinks}
                />

                {/* Row 5: Checklist */}
                <ChecklistInput
                  items={checklist}
                  onChange={setChecklist}
                />

                {/* Cancel Button (only when editing) */}
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
