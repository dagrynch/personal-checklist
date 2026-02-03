import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import TagBadge, { TAG_COLORS } from './TagBadge';

const COLORS = Object.keys(TAG_COLORS);

const TagManager = ({ isOpen, tags, onClose, onCreateTag, onUpdateTag, onDeleteTag }) => {
  const [editingTag, setEditingTag] = useState(null);
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState('emerald');
  const [showCreateForm, setShowCreateForm] = useState(false);

  const handleSaveNewTag = () => {
    if (!newTagName.trim()) return;

    onCreateTag({
      name: newTagName.trim(),
      color: newTagColor,
    });

    setNewTagName('');
    setNewTagColor('emerald');
    setShowCreateForm(false);
  };

  const handleSaveEdit = () => {
    if (!editingTag || !editingTag.name.trim()) return;

    onUpdateTag({
      ...editingTag,
      name: editingTag.name.trim(),
    });

    setEditingTag(null);
  };

  const handleDelete = (tagId) => {
    if (confirm('Are you sure you want to delete this tag? It will be removed from all tasks.')) {
      onDeleteTag(tagId);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-x-4 top-1/2 -translate-y-1/2 max-w-md mx-auto bg-dark-700 rounded-2xl border border-dark-400 shadow-2xl z-50 overflow-hidden max-h-[80vh] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-dark-400">
              <h2 className="text-lg font-semibold text-white">Manage Tags</h2>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-dark-500 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </motion.button>
            </div>

            {/* Tag List */}
            <div className="flex-1 overflow-y-auto p-5 space-y-2">
              {tags.length === 0 ? (
                <p className="text-center text-gray-500 py-8">
                  No tags created yet. Click the button below to create your first tag.
                </p>
              ) : (
                tags.map((tag) => (
                  <div
                    key={tag.id}
                    className="flex items-center gap-3 p-3 rounded-xl bg-dark-600 border border-dark-400"
                  >
                    {editingTag?.id === tag.id ? (
                      /* Edit Mode */
                      <div className="flex-1 space-y-3">
                        <input
                          type="text"
                          value={editingTag.name}
                          onChange={(e) => setEditingTag({ ...editingTag, name: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg input-dark text-white text-sm"
                          autoFocus
                        />
                        <div className="flex flex-wrap gap-1.5">
                          {COLORS.map((color) => (
                            <motion.button
                              key={color}
                              type="button"
                              whileHover={{ scale: 1.2 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => setEditingTag({ ...editingTag, color })}
                              className={`w-5 h-5 rounded-full bg-${color}-500 transition-all ${
                                editingTag.color === color
                                  ? 'ring-2 ring-white ring-offset-1 ring-offset-dark-600'
                                  : 'opacity-50 hover:opacity-100'
                              }`}
                            />
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <motion.button
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setEditingTag(null)}
                            className="flex-1 py-1.5 rounded-lg text-gray-400 text-sm hover:bg-dark-500 transition-colors"
                          >
                            Cancel
                          </motion.button>
                          <motion.button
                            whileTap={{ scale: 0.98 }}
                            onClick={handleSaveEdit}
                            className="flex-1 py-1.5 rounded-lg btn-primary text-sm"
                          >
                            Save
                          </motion.button>
                        </div>
                      </div>
                    ) : (
                      /* Display Mode */
                      <>
                        <TagBadge tag={tag} size="md" />
                        <div className="flex-1" />
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => setEditingTag({ ...tag })}
                          className="p-2 rounded-lg text-gray-500 hover:text-white hover:bg-dark-500 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleDelete(tag.id)}
                          className="p-2 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </motion.button>
                      </>
                    )}
                  </div>
                ))
              )}

              {/* Create New Tag Form */}
              <AnimatePresence>
                {showCreateForm && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="p-3 rounded-xl bg-dark-600 border border-emerald-500/30 space-y-3 mt-3">
                      <input
                        type="text"
                        value={newTagName}
                        onChange={(e) => setNewTagName(e.target.value)}
                        placeholder="Tag name"
                        className="w-full px-3 py-2 rounded-lg input-dark text-white text-sm"
                        autoFocus
                      />
                      <div className="flex flex-wrap gap-1.5">
                        {COLORS.map((color) => (
                          <motion.button
                            key={color}
                            type="button"
                            whileHover={{ scale: 1.2 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setNewTagColor(color)}
                            className={`w-5 h-5 rounded-full bg-${color}-500 transition-all ${
                              newTagColor === color
                                ? 'ring-2 ring-white ring-offset-1 ring-offset-dark-600'
                                : 'opacity-50 hover:opacity-100'
                            }`}
                          />
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <motion.button
                          whileTap={{ scale: 0.98 }}
                          onClick={() => {
                            setShowCreateForm(false);
                            setNewTagName('');
                          }}
                          className="flex-1 py-1.5 rounded-lg text-gray-400 text-sm hover:bg-dark-500 transition-colors"
                        >
                          Cancel
                        </motion.button>
                        <motion.button
                          whileTap={{ scale: 0.98 }}
                          onClick={handleSaveNewTag}
                          disabled={!newTagName.trim()}
                          className="flex-1 py-1.5 rounded-lg btn-primary text-sm"
                        >
                          Create
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Footer */}
            {!showCreateForm && (
              <div className="p-5 border-t border-dark-400">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowCreateForm(true)}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl btn-primary"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Create New Tag
                </motion.button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default TagManager;
