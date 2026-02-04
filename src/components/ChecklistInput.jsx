import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ChecklistInput = ({ items = [], onChange }) => {
  const [newItem, setNewItem] = useState('');

  const handleAddItem = (e) => {
    e.preventDefault();
    if (!newItem.trim()) return;

    const item = {
      id: Date.now().toString(),
      text: newItem.trim(),
      completed: false,
    };

    onChange([...items, item]);
    setNewItem('');
  };

  const handleRemoveItem = (id) => {
    onChange(items.filter(item => item.id !== id));
  };

  const handleToggleItem = (id) => {
    onChange(items.map(item =>
      item.id === id ? { ...item, completed: !item.completed } : item
    ));
  };

  const handleUpdateText = (id, text) => {
    onChange(items.map(item =>
      item.id === id ? { ...item, text } : item
    ));
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-400 mb-2">
        Checklist
      </label>

      {/* Existing items */}
      <AnimatePresence>
        {items.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2 mb-3"
          >
            {items.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="flex items-center gap-2 group"
              >
                <span className="text-xs text-gray-600 w-5">{index + 1}.</span>
                <button
                  type="button"
                  onClick={() => handleToggleItem(item.id)}
                  className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all flex-shrink-0 ${
                    item.completed
                      ? 'bg-emerald-500 border-emerald-500'
                      : 'border-dark-300 hover:border-emerald-500'
                  }`}
                >
                  {item.completed && (
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
                <input
                  type="text"
                  value={item.text}
                  onChange={(e) => handleUpdateText(item.id, e.target.value)}
                  className={`flex-1 px-3 py-1.5 rounded-lg input-dark text-sm ${
                    item.completed ? 'text-gray-500 line-through' : 'text-white'
                  }`}
                />
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleRemoveItem(item.id)}
                  className="p-1.5 rounded-lg text-gray-600 hover:text-red-400 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </motion.button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add new item */}
      <div className="flex gap-2">
        <input
          type="text"
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleAddItem(e);
            }
          }}
          placeholder="Add checklist item..."
          className="flex-1 px-3 py-2 rounded-lg input-dark text-white placeholder-gray-500 text-sm"
        />
        <motion.button
          type="button"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleAddItem}
          disabled={!newItem.trim()}
          className="px-3 py-2 rounded-lg bg-dark-500 text-gray-400 hover:text-emerald-400 hover:bg-emerald-500/10 border border-dark-400 hover:border-emerald-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </motion.button>
      </div>

      {items.length > 0 && (
        <p className="text-xs text-gray-600 mt-2">
          {items.filter(i => i.completed).length}/{items.length} completed
        </p>
      )}
    </div>
  );
};

export default ChecklistInput;
