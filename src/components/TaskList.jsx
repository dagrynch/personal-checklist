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

const TaskList = ({ tasks, onToggle, onDelete, onEdit, onReorder, filter, setFilter }) => {
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

  const filteredTasks = tasks.filter((task) => {
    if (filter === 'active') return !task.completed;
    if (filter === 'completed') return task.completed;
    return true;
  });

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = tasks.findIndex((t) => t.id === active.id);
      const newIndex = tasks.findIndex((t) => t.id === over.id);
      onReorder(arrayMove(tasks, oldIndex, newIndex));
    }
  };

  const counts = {
    all: tasks.length,
    active: tasks.filter((t) => !t.completed).length,
    completed: tasks.filter((t) => t.completed).length,
  };

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.2 }}
      className="card p-4 lg:p-5"
    >
      {/* Filter Tabs */}
      <div className="flex gap-2 mb-5">
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
              tasks.filter((t) => t.completed).forEach((t) => onDelete(t.id));
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
