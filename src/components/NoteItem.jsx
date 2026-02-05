import { motion } from 'framer-motion';
import { generateExcerpt } from '../utils/noteUtils';
import { getRelativeTime } from '../utils/dateUtils';
import TagBadge from './TagBadge';

const NoteItem = ({ note, onClick, onTogglePin, onToggleFavorite, tags = [], folders = [] }) => {
  const noteTags = tags.filter(tag => note.tagIds?.includes(tag.id));
  const folder = folders.find(f => f.id === note.folderId);
  const excerpt = generateExcerpt(note.content, 100);

  const handlePinClick = (e) => {
    e.stopPropagation();
    onTogglePin?.(note.id);
  };

  const handleFavoriteClick = (e) => {
    e.stopPropagation();
    onToggleFavorite?.(note.id);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      whileHover={{ scale: 1.02 }}
      onClick={() => onClick?.(note)}
      className="card p-4 cursor-pointer hover:border-emerald-500/50 transition-all group"
    >
      {/* Header with Pin and Favorite */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="font-medium text-white truncate flex-1">
          {note.title || 'Untitled Note'}
        </h3>
        <div className="flex items-center gap-1 flex-shrink-0">
          {/* Pin Button */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handlePinClick}
            className={`p-1.5 rounded-lg transition-colors ${
              note.isPinned
                ? 'text-amber-400 bg-amber-500/10'
                : 'text-gray-500 hover:text-amber-400 hover:bg-amber-500/10 opacity-0 group-hover:opacity-100'
            }`}
            title={note.isPinned ? 'Unpin' : 'Pin'}
          >
            <svg className="w-4 h-4" fill={note.isPinned ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
          </motion.button>

          {/* Favorite Button */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleFavoriteClick}
            className={`p-1.5 rounded-lg transition-colors ${
              note.isFavorite
                ? 'text-yellow-400 bg-yellow-500/10'
                : 'text-gray-500 hover:text-yellow-400 hover:bg-yellow-500/10 opacity-0 group-hover:opacity-100'
            }`}
            title={note.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            <svg className="w-4 h-4" fill={note.isFavorite ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
          </motion.button>
        </div>
      </div>

      {/* Excerpt */}
      {excerpt && (
        <p className="text-sm text-gray-400 line-clamp-2 mb-3">
          {excerpt}
        </p>
      )}

      {/* Tags */}
      {noteTags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {noteTags.slice(0, 3).map(tag => (
            <TagBadge key={tag.id} tag={tag} size="xs" />
          ))}
          {noteTags.length > 3 && (
            <span className="text-xs text-gray-500">+{noteTags.length - 3}</span>
          )}
        </div>
      )}

      {/* Footer: Meta info */}
      <div className="flex items-center gap-3 text-xs text-gray-500">
        {/* Last modified */}
        <span>{getRelativeTime(note.updatedAt || note.createdAt)}</span>

        {/* Folder */}
        {folder && folder.id !== 'inbox' && (
          <div className="flex items-center gap-1">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
            <span>{folder.name}</span>
          </div>
        )}

        {/* Attachments indicator */}
        {note.attachments?.length > 0 && (
          <div className="flex items-center gap-1">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
            </svg>
            <span>{note.attachments.length}</span>
          </div>
        )}

        {/* Linked tasks indicator */}
        {note.linkedTaskIds?.length > 0 && (
          <div className="flex items-center gap-1">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <span>{note.linkedTaskIds.length}</span>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default NoteItem;
