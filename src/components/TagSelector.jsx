import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import TagBadge, { TAG_COLORS } from './TagBadge';

const TagSelector = ({ tags, selectedTagIds = [], onChange, onCreateTag }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState('emerald');
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  const selectedTags = tags.filter(tag => selectedTagIds.includes(tag.id));
  const availableTags = tags.filter(tag =>
    !selectedTagIds.includes(tag.id) &&
    tag.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
        setShowCreate(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggleTag = (tagId) => {
    if (selectedTagIds.includes(tagId)) {
      onChange(selectedTagIds.filter(id => id !== tagId));
    } else {
      onChange([...selectedTagIds, tagId]);
    }
  };

  const handleRemoveTag = (tag) => {
    onChange(selectedTagIds.filter(id => id !== tag.id));
  };

  const handleCreateTag = () => {
    if (!newTagName.trim()) return;

    onCreateTag({
      name: newTagName.trim(),
      color: newTagColor,
    });

    setNewTagName('');
    setShowCreate(false);
  };

  return (
    <div ref={containerRef} className="relative">
      <label className="block text-sm font-medium text-gray-400 mb-2">
        Tags
      </label>

      {/* Selected Tags & Input */}
      <div
        onClick={() => {
          setIsOpen(true);
          inputRef.current?.focus();
        }}
        className="w-full min-h-[44px] px-3 py-2 rounded-xl input-dark cursor-text flex flex-wrap items-center gap-2"
      >
        {selectedTags.map(tag => (
          <TagBadge
            key={tag.id}
            tag={tag}
            size="sm"
            onRemove={handleRemoveTag}
          />
        ))}
        <input
          ref={inputRef}
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => setIsOpen(true)}
          placeholder={selectedTags.length === 0 ? "Add tags..." : ""}
          className="flex-1 min-w-[60px] bg-transparent border-none outline-none text-white placeholder-gray-500 text-sm"
        />
      </div>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute left-0 right-0 mt-2 bg-dark-600 border border-dark-400 rounded-xl shadow-xl z-20 overflow-hidden"
          >
            {!showCreate ? (
              <>
                {/* Available Tags */}
                <div className="max-h-48 overflow-y-auto p-2">
                  {availableTags.length > 0 ? (
                    availableTags.map(tag => (
                      <motion.button
                        key={tag.id}
                        type="button"
                        whileHover={{ x: 4 }}
                        onClick={() => handleToggleTag(tag.id)}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-dark-500 transition-colors"
                      >
                        <TagBadge tag={tag} size="sm" />
                      </motion.button>
                    ))
                  ) : searchTerm ? (
                    <p className="px-3 py-2 text-sm text-gray-500">
                      No tags match "{searchTerm}"
                    </p>
                  ) : (
                    <p className="px-3 py-2 text-sm text-gray-500">
                      No more tags available
                    </p>
                  )}
                </div>

                {/* Create New Tag Button */}
                {onCreateTag && (
                  <div className="border-t border-dark-400 p-2">
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        setNewTagName(searchTerm);
                        setShowCreate(true);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-emerald-400 hover:bg-emerald-500/10 transition-colors text-sm"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Create new tag{searchTerm && `: "${searchTerm}"`}
                    </motion.button>
                  </div>
                )}
              </>
            ) : (
              /* Create Tag Form */
              <div className="p-3 space-y-3">
                <input
                  type="text"
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                  placeholder="Tag name"
                  className="w-full px-3 py-2 rounded-lg input-dark text-white text-sm"
                  autoFocus
                />

                <div className="flex flex-wrap gap-1.5">
                  {Object.keys(TAG_COLORS).map((color) => (
                    <motion.button
                      key={color}
                      type="button"
                      whileHover={{ scale: 1.2 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setNewTagColor(color)}
                      className={`w-6 h-6 rounded-full bg-${color}-500 transition-all ${
                        newTagColor === color
                          ? 'ring-2 ring-white ring-offset-1 ring-offset-dark-600'
                          : 'opacity-50 hover:opacity-100'
                      }`}
                    />
                  ))}
                </div>

                <div className="flex gap-2">
                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowCreate(false)}
                    className="flex-1 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-dark-500 transition-colors text-sm"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.98 }}
                    onClick={handleCreateTag}
                    disabled={!newTagName.trim()}
                    className="flex-1 py-2 rounded-lg btn-primary text-sm"
                  >
                    Create
                  </motion.button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TagSelector;
