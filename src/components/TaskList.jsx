import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import TaskItem from './TaskItem';
import EmptyState from './EmptyState';
import TagFilter from './TagFilter';

const TaskList = ({
  tasks,
  onToggle,
  onDelete,
  onEdit,
  onReorder,
  onToggleChecklistItem,
  filter,
  setFilter,
  activeFolderId,
  tags = [],
  folders = [],
  filterTagIds = [],
  onFilterTagsChange,
  filterAssignee = null,
  onFilterAssigneeChange,
}) => {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Filter tasks by folder
  const folderTasks = useMemo(() => {
    return tasks.filter(task => {
      if (activeFolderId === 'inbox' || !activeFolderId) {
        return !task.folderId || task.folderId === 'inbox';
      }
      return task.folderId === activeFolderId;
    });
  }, [tasks, activeFolderId]);

  // Filter by completion status
  const statusFilteredTasks = useMemo(() => {
    return folderTasks.filter((task) => {
      if (filter === 'active') return !task.completed;
      if (filter === 'completed') return task.completed;
      return true;
    });
  }, [folderTasks, filter]);

  // Filter by tags
  const tagFilteredTasks = useMemo(() => {
    if (!filterTagIds || filterTagIds.length === 0) return statusFilteredTasks;

    return statusFilteredTasks.filter(task =>
      filterTagIds.some(tagId => task.tagIds?.includes(tagId))
    );
  }, [statusFilteredTasks, filterTagIds]);

  // Filter by assignee
  const filteredTasks = useMemo(() => {
    if (!filterAssignee) return tagFilteredTasks;

    return tagFilteredTasks.filter(task => task.assignee === filterAssignee);
  }, [tagFilteredTasks, filterAssignee]);

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = tasks.findIndex((t) => t.id === active.id);
      const newIndex = tasks.findIndex((t) => t.id === over.id);
      onReorder(arrayMove(tasks, oldIndex, newIndex));
    }
  };

  // Counts for folder tasks only
  const counts = {
    all: folderTasks.length,
    active: folderTasks.filter((t) => !t.completed).length,
    completed: folderTasks.filter((t) => t.completed).length,
  };

  // Get unique assignees in current folder
  const assignees = useMemo(() => {
    const names = folderTasks
      .map(t => t.assignee)
      .filter(Boolean)
      .filter((name, index, arr) => arr.indexOf(name) === index);
    return names.sort();
  }, [folderTasks]);

  // Get folder name for display
  const folderName = folders.find(f => f.id === activeFolderId)?.name || 'Inbox';

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.2 }}
      className="card p-4 lg:p-5"
    >
      {/* Header with folder name */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-white">{folderName}</h2>
        <span className="text-sm text-gray-500">{counts.active} active</span>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-4">
        {['all', 'active', 'completed'].map((f) => (
          <motion.button
            key={f}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setFilter(f)}
            className={`flex-1 py-2.5 px-4 rounded-xl font-medium capitalize transition-all text-sm ${
              filter === f
                ? 'bg-emerald-500 text-white'
                : 'bg-dark-600 text-gray-400 border border-dark-400 hover:border-emerald-500/50 hover:text-gray-300'
            }`}
            style={filter === f ? { boxShadow: '0 0 20px rgba(16, 185, 129, 0.3)' } : {}}
          >
            {f}
            <span className="ml-1.5 opacity-70">({counts[f]})</span>
          </motion.button>
        ))}
      </div>

      {/* Tag Filter */}
      {tags.length > 0 && (
        <div className="mb-4">
          <TagFilter
            tags={tags}
            selectedTagIds={filterTagIds}
            onChange={onFilterTagsChange}
          />
        </div>
      )}

      {/* Assignee Filter */}
      {assignees.length > 0 && (
        <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-2">
          <span className="text-xs text-gray-500 whitespace-nowrap">Assignee:</span>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => onFilterAssigneeChange(null)}
            className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
              !filterAssignee
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'bg-dark-600 text-gray-400 border border-dark-400 hover:border-gray-500'
            }`}
          >
            All
          </motion.button>
          {assignees.map((name) => (
            <motion.button
              key={name}
              whileTap={{ scale: 0.95 }}
              onClick={() => onFilterAssigneeChange(name)}
              className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
                filterAssignee === name
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-dark-600 text-gray-400 border border-dark-400 hover:border-gray-500'
              }`}
            >
              {name}
            </motion.button>
          ))}
        </div>
      )}

      {/* Task List */}
      {filteredTasks.length === 0 ? (
        <EmptyState filter={filter} />
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={filteredTasks.map((t) => t.id)}
            strategy={verticalListSortingStrategy}
          >
            <AnimatePresence mode="popLayout">
              {filteredTasks.map((task) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  onToggle={onToggle}
                  onDelete={onDelete}
                  onEdit={onEdit}
                  onToggleChecklistItem={onToggleChecklistItem}
                  tags={tags}
                  folders={folders}
                />
              ))}
            </AnimatePresence>
          </SortableContext>
        </DndContext>
      )}

      {/* Clear Completed */}
      {counts.completed > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-4 pt-4 border-t border-dark-400"
        >
          <button
            onClick={() => {
              folderTasks.filter((t) => t.completed).forEach((t) => onDelete(t.id));
            }}
            className="text-sm text-gray-500 hover:text-red-400 transition-colors"
          >
            Clear completed ({counts.completed})
          </button>
        </motion.div>
      )}
    </motion.div>
  );
};

export default TaskList;
