import { motion } from 'framer-motion';
import TagBadge from './TagBadge';

const TagFilter = ({ tags, selectedTagIds = [], onChange }) => {
  if (tags.length === 0) return null;

  const handleToggle = (tagId) => {
    if (selectedTagIds.includes(tagId)) {
      onChange(selectedTagIds.filter(id => id !== tagId));
    } else {
      onChange([...selectedTagIds, tagId]);
    }
  };

  const clearAll = () => {
    onChange([]);
  };

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
      <span className="text-xs text-gray-500 whitespace-nowrap">Filter:</span>

      <div className="flex gap-1.5">
        {tags.map((tag) => (
          <TagBadge
            key={tag.id}
            tag={tag}
            size="sm"
            selected={selectedTagIds.includes(tag.id)}
            onClick={() => handleToggle(tag.id)}
          />
        ))}
      </div>

      {selectedTagIds.length > 0 && (
        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={clearAll}
          className="text-xs text-gray-500 hover:text-white whitespace-nowrap px-2 py-1 rounded-lg hover:bg-dark-500 transition-colors"
        >
          Clear
        </motion.button>
      )}
    </div>
  );
};

export default TagFilter;
