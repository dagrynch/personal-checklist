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
  searchQuery: externalSearchQuery = '',
}) => {
  const [sortBy, setSortBy] = useState('updatedAt');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [selectedFolderId, setSelectedFolderId] = useState(activeFolderId || 'all');
  const [searchQuery, setSearchQuery] = useState(externalSearchQuery);

  // Filter and sort notes
  const processedNotes = useMemo(() => {
    let result = [...notes];

    // Filter by folder (only if not 'all')
    if (selectedFolderId && selectedFolderId !== 'all') {
      result = filterNotesByFolder(result, selectedFolderId);
    }

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
  }, [notes, selectedFolderId, filterTagIds, showFavoritesOnly, searchQuery, sortBy]);

  // Separate pinned and unpinned
  const { pinned, unpinned } = separatePinnedNotes(processedNotes);

  const isEmpty = processedNotes.length === 0;
  const totalNotes = notes.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card p-4">
        <div className="flex flex-col gap-4">
          {/* Title Row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Notes</h2>
                <p className="text-sm text-gray-500">{totalNotes} note{totalNotes !== 1 ? 's' : ''} total</p>
              </div>
            </div>

            {/* New Note Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onNewNote}
              className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-xl transition-colors shadow-lg shadow-emerald-500/20"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>New Note</span>
            </motion.button>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search notes..."
              className="w-full pl-10 pr-4 py-2.5 bg-dark-600 border border-dark-400 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg text-gray-500 hover:text-white hover:bg-dark-500 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* Filters Row */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Folder Filter */}
            <select
              value={selectedFolderId}
              onChange={(e) => setSelectedFolderId(e.target.value)}
              className="px-3 py-2 bg-dark-600 border border-dark-400 rounded-lg text-sm text-gray-300 focus:outline-none focus:border-emerald-500"
            >
              <option value="all">All Folders</option>
              {folders.map(folder => (
                <option key={folder.id} value={folder.id}>
                  {folder.name}
                </option>
              ))}
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 bg-dark-600 border border-dark-400 rounded-lg text-sm text-gray-300 focus:outline-none focus:border-emerald-500"
            >
              {SORT_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>
                  Sort: {option.label}
                </option>
              ))}
            </select>

            {/* Favorites Toggle */}
            <button
              onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
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

            {/* Results count */}
            {(searchQuery || selectedFolderId !== 'all' || showFavoritesOnly) && (
              <span className="text-sm text-gray-500 ml-auto">
                {processedNotes.length} result{processedNotes.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>
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
          <h3 className="text-lg font-medium text-white mb-2">
            {totalNotes === 0 ? 'No notes yet' : 'No notes found'}
          </h3>
          <p className="text-gray-400 mb-6">
            {totalNotes === 0
              ? 'Create your first note to get started.'
              : searchQuery
              ? 'No notes match your search criteria.'
              : showFavoritesOnly
              ? 'No favorite notes yet. Star some notes to see them here.'
              : 'No notes in this folder.'}
          </p>
          {totalNotes === 0 && (
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
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
            <svg className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
            Pinned ({pinned.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
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
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
              All Notes ({unpinned.length})
            </h3>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
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
