import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import NoteItem from './NoteItem';
import {
  searchNotes,
  sortNotes,
  filterNotesByFolder,
  filterNotesByTags,
  separatePinnedNotes,
} from '../utils/noteUtils';

const SORT_OPTIONS = [
  { value: 'updatedAt', label: 'Last Modified' },
  { value: 'createdAt', label: 'Created Date' },
  { value: 'title', label: 'Title' },
];

const NoteList = ({
  notes,
  tags,
  folders,
  activeFolderId,
  filterTagIds = [],
  onNoteClick,
  onTogglePin,
  onToggleFavorite,
  onNewNote,
  searchQuery = '',
}) => {
  const [sortBy, setSortBy] = useState('updatedAt');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  // Filter and sort notes
  const processedNotes = useMemo(() => {
    let result = [...notes];

    // Filter by folder
    result = filterNotesByFolder(result, activeFolderId);

    // Filter by tags
    if (filterTagIds.length > 0) {
      result = filterNotesByTags(result, filterTagIds);
    }

    // Filter by favorites
    if (showFavoritesOnly) {
      result = result.filter(note => note.isFavorite);
    }

    // Search
    if (searchQuery) {
      result = searchNotes(result, searchQuery);
    }

    // Sort
    result = sortNotes(result, sortBy);

    return result;
  }, [notes, activeFolderId, filterTagIds, showFavoritesOnly, searchQuery, sortBy]);

  // Separate pinned and unpinned
  const { pinned, unpinned } = separatePinnedNotes(processedNotes);

  const isEmpty = processedNotes.length === 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h2 className="text-xl font-bold text-white">Notes</h2>

        <div className="flex items-center gap-3">
          {/* Favorites Toggle */}
          <button
            onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${
              showFavoritesOnly
                ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                : 'bg-dark-600 text-gray-400 border border-dark-400 hover:border-yellow-500/50'
            }`}
          >
            <svg className="w-4 h-4" fill={showFavoritesOnly ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
            Favorites
          </button>

          {/* Sort Dropdown */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="input-dark text-sm py-1.5 pr-8"
          >
            {SORT_OPTIONS.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          {/* New Note Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onNewNote}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-xl transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span className="hidden sm:inline">New Note</span>
          </motion.button>
        </div>
      </div>

      {/* Empty State */}
      {isEmpty && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-12 text-center"
        >
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-dark-600 flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-white mb-2">No notes yet</h3>
          <p className="text-gray-400 mb-6">
            {searchQuery
              ? 'No notes match your search.'
              : showFavoritesOnly
              ? 'No favorite notes yet. Star some notes to see them here.'
              : 'Create your first note to get started.'}
          </p>
          {!searchQuery && !showFavoritesOnly && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onNewNote}
              className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-xl transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create Note
            </motion.button>
          )}
        </motion.div>
      )}

      {/* Pinned Notes */}
      {pinned.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
            <svg className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
            Pinned ({pinned.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence mode="popLayout">
              {pinned.map(note => (
                <NoteItem
                  key={note.id}
                  note={note}
                  tags={tags}
                  folders={folders}
                  onClick={onNoteClick}
                  onTogglePin={onTogglePin}
                  onToggleFavorite={onToggleFavorite}
                />
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* All Notes */}
      {unpinned.length > 0 && (
        <div>
          {pinned.length > 0 && (
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
              All Notes ({unpinned.length})
            </h3>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence mode="popLayout">
              {unpinned.map(note => (
                <NoteItem
                  key={note.id}
                  note={note}
                  tags={tags}
                  folders={folders}
                  onClick={onNoteClick}
                  onTogglePin={onTogglePin}
                  onToggleFavorite={onToggleFavorite}
                />
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
};

export default NoteList;
