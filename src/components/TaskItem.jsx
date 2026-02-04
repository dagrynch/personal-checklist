import { useState } from 'react';
import { motion } from 'framer-motion';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { formatDate, isOverdue, isDueToday, getRelativeTime } from '../utils/dateUtils';
import Confetti from './Confetti';
import TagBadge from './TagBadge';
import AssigneeAvatar from './AssigneeAvatar';
import LinkList from './LinkList';

const TaskItem = ({ task, onToggle, onDelete, onEdit, onToggleChecklistItem, tags = [], folders = [] }) => {
  const [showConfetti, setShowConfetti] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleToggle = () => {
    if (!task.completed) {
      setShowConfetti(true);
    }
    onToggle(task.id);
  };

  const handleDelete = () => {
    setIsDeleting(true);
    setTimeout(() => {
      onDelete(task.id);
    }, 200);
  };

  const getPriorityClass = () => {
    switch (task.priority) {
      case 'high':
        return 'priority-high';
      case 'low':
        return 'priority-low';
      default:
        return 'priority-medium';
    }
  };

  const getDeadlineColor = () => {
    if (!task.deadline || task.completed) return 'text-gray-500';
    if (isOverdue(task.deadline)) return 'text-red-400';
    if (isDueToday(task.deadline)) return 'text-amber-400';
    return 'text-gray-500';
  };

  // Get task's tags
  const taskTags = tags.filter(tag => task.tagIds?.includes(tag.id));

  // Get folder name
  const folder = folders.find(f => f.id === task.folderId);

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{
        opacity: isDeleting ? 0 : isDragging ? 0.5 : 1,
        y: 0,
        scale: isDragging ? 1.02 : 1,
        x: isDeleting ? 50 : 0,
      }}
      exit={{ opacity: 0, x: 50 }}
      transition={{ duration: 0.2 }}
      className={`task-item rounded-xl p-4 mb-3 ${getPriorityClass()} ${
        isDragging ? 'z-50' : ''
      }`}
    >
      <div className="flex items-start gap-3 relative">
        {/* Confetti */}
        <Confetti active={showConfetti} onComplete={() => setShowConfetti(false)} />

        {/* Drag Handle */}
        <button
          {...attributes}
          {...listeners}
          className="mt-1 p-1 rounded hover:bg-dark-500 cursor-grab active:cursor-grabbing text-gray-600 hover:text-gray-400"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M7 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 2zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 14zm6-8a2 2 0 1 0-.001-4.001A2 2 0 0 0 13 6zm0 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 14z" />
          </svg>
        </button>

        {/* Checkbox */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleToggle}
          className={`mt-0.5 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all flex-shrink-0 ${
            task.completed
              ? 'bg-emerald-500 border-emerald-500'
              : 'border-dark-300 hover:border-emerald-500'
          }`}
          style={task.completed ? { boxShadow: '0 0 12px rgba(16, 185, 129, 0.4)' } : {}}
        >
          {task.completed && (
            <motion.svg
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="w-4 h-4 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
                d="M5 13l4 4L19 7"
              />
            </motion.svg>
          )}
        </motion.button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-2">
            <h3
              className={`font-medium transition-all flex-1 ${
                task.completed ? 'line-through text-gray-500' : 'text-white'
              }`}
            >
              {task.title}
            </h3>
            {/* Assignee Avatar */}
            {task.assignee && (
              <AssigneeAvatar name={task.assignee} size="sm" />
            )}
          </div>

          {task.description && (
            <p
              className={`text-sm mt-1 ${
                task.completed ? 'line-through text-gray-600' : 'text-gray-400'
              }`}
            >
              {task.description}
            </p>
          )}

          {/* Tags */}
          {taskTags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {taskTags.map(tag => (
                <TagBadge key={tag.id} tag={tag} size="xs" />
              ))}
            </div>
          )}

          {/* Links */}
          {task.links?.length > 0 && (
            <LinkList links={task.links} compact />
          )}

          {/* Checklist */}
          {task.checklist?.length > 0 && (
            <div className="mt-3 space-y-1.5">
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-3.5 h-3.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
                <span className="text-xs text-gray-500">
                  {task.checklist.filter(i => i.completed).length}/{task.checklist.length} completed
                </span>
              </div>
              {task.checklist.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-2 pl-1"
                >
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => onToggleChecklistItem?.(task.id, item.id)}
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

          {/* Meta info row */}
          <div className="flex items-center gap-3 mt-2 flex-wrap">
            {/* Deadline */}
            {task.deadline && (
              <div className={`flex items-center gap-1.5 text-xs ${getDeadlineColor()}`}>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <span>{getRelativeTime(task.deadline)}</span>
                {isOverdue(task.deadline) && !task.completed && (
                  <span className="ml-1 px-1.5 py-0.5 bg-red-500/20 text-red-400 rounded text-xs font-medium">
                    Overdue
                  </span>
                )}
              </div>
            )}

            {/* Folder badge */}
            {folder && folder.id !== 'inbox' && (
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                </svg>
                <span>{folder.name}</span>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => onEdit(task)}
            className="p-2 rounded-lg text-gray-500 hover:text-emerald-400 hover:bg-emerald-500/10 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleDelete}
            className="p-2 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default TaskItem;
