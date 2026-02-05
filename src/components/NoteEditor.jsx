import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import MDEditor from '@uiw/react-md-editor';
import rehypeSanitize from 'rehype-sanitize';
import TagSelector from './TagSelector';
import TaskLinkSelector from './TaskLinkSelector';
import AttachmentInput from './AttachmentInput';
import AttachmentPreview from './AttachmentPreview';
import { createNote } from '../utils/noteUtils';
import { getTotalAttachmentsSize, formatFileSize, ATTACHMENT_LIMITS } from '../utils/attachmentUtils';

const NoteEditor = ({
  note,
  isNew = false,
  folders,
  tags,
  tasks,
  onSave,
  onDelete,
  onClose,
  onCreateTag,
}) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [folderId, setFolderId] = useState(null);
  const [tagIds, setTagIds] = useState([]);
  const [linkedTaskIds, setLinkedTaskIds] = useState([]);
  const [attachments, setAttachments] = useState([]);
  const [isPinned, setIsPinned] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [editorMode, setEditorMode] = useState('edit'); // 'edit', 'preview', 'live'

  // Initialize form with note data
  useEffect(() => {
    if (note) {
      setTitle(note.title || '');
      setContent(note.content || '');
      setFolderId(note.folderId || null);
      setTagIds(note.tagIds || []);
      setLinkedTaskIds(note.linkedTaskIds || []);
      setAttachments(note.attachments || []);
      setIsPinned(note.isPinned || false);
      setIsFavorite(note.isFavorite || false);
    } else {
      // Reset for new note
      setTitle('');
      setContent('');
      setFolderId(null);
      setTagIds([]);
      setLinkedTaskIds([]);
      setAttachments([]);
      setIsPinned(false);
      setIsFavorite(false);
    }
    setHasChanges(false);
  }, [note]);

  // Track changes
  const handleChange = useCallback((setter) => (value) => {
    setter(value);
    setHasChanges(true);
  }, []);

  // Handle save
  const handleSave = () => {
    const noteData = note
      ? {
          ...note,
          title: title || 'Untitled Note',
          content,
          folderId,
          tagIds,
          linkedTaskIds,
          attachments,
          isPinned,
          isFavorite,
        }
      : createNote({
          title: title || 'Untitled Note',
          content,
          folderId,
          tagIds,
          linkedTaskIds,
          attachments,
          isPinned,
          isFavorite,
        });

    onSave(noteData);
    setHasChanges(false);
  };

  // Handle delete
  const handleDelete = () => {
    if (note) {
      onDelete(note.id);
    }
    setShowDeleteConfirm(false);
  };

  // Handle close with unsaved changes check
  const handleClose = () => {
    if (hasChanges) {
      if (window.confirm('You have unsaved changes. Are you sure you want to close?')) {
        onClose();
      }
    } else {
      onClose();
    }
  };

  // Handle attachment add
  const handleAddAttachment = (attachment) => {
    setAttachments(prev => [...prev, attachment]);
    setHasChanges(true);
  };

  // Handle attachment remove
  const handleRemoveAttachment = (attachmentId) => {
    setAttachments(prev => prev.filter(a => a.id !== attachmentId));
    setHasChanges(true);
  };

  // Calculate total attachments size
  const totalAttachmentsSize = getTotalAttachmentsSize(attachments);
  const sizeWarning = totalAttachmentsSize > ATTACHMENT_LIMITS.MAX_TOTAL_SIZE * 0.8;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="h-full flex flex-col bg-dark-800"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-dark-400">
        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleClose}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-dark-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span className="hidden sm:inline">Back</span>
          </motion.button>

          {hasChanges && (
            <span className="text-xs text-amber-400 px-2 py-1 bg-amber-500/10 rounded-full">
              Unsaved
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Pin Toggle */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleChange(setIsPinned)(!isPinned)}
            className={`p-2 rounded-lg transition-colors ${
              isPinned
                ? 'text-amber-400 bg-amber-500/10'
                : 'text-gray-500 hover:text-amber-400 hover:bg-amber-500/10'
            }`}
            title={isPinned ? 'Unpin' : 'Pin'}
          >
            <svg className="w-5 h-5" fill={isPinned ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
          </motion.button>

          {/* Favorite Toggle */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleChange(setIsFavorite)(!isFavorite)}
            className={`p-2 rounded-lg transition-colors ${
              isFavorite
                ? 'text-yellow-400 bg-yellow-500/10'
                : 'text-gray-500 hover:text-yellow-400 hover:bg-yellow-500/10'
            }`}
            title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            <svg className="w-5 h-5" fill={isFavorite ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
          </motion.button>

          {/* Delete Button */}
          {note && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowDeleteConfirm(true)}
              className="p-2 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
              title="Delete note"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </motion.button>
          )}

          {/* Save Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSave}
            disabled={!hasChanges && !isNew}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-colors ${
              hasChanges || isNew
                ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
                : 'bg-dark-600 text-gray-500 cursor-not-allowed'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Save
          </motion.button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto p-4 space-y-4">
          {/* Title */}
          <input
            type="text"
            value={title}
            onChange={(e) => handleChange(setTitle)(e.target.value)}
            placeholder="Note title..."
            className="w-full text-2xl font-bold bg-transparent border-none outline-none text-white placeholder-gray-500"
          />

          {/* Metadata Row */}
          <div className="flex flex-wrap gap-4 items-start">
            {/* Folder Select */}
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
              <select
                value={folderId || ''}
                onChange={(e) => handleChange(setFolderId)(e.target.value || null)}
                className="input-dark text-sm py-1.5"
              >
                <option value="">Inbox</option>
                {folders.filter(f => f.id !== 'inbox').map(folder => (
                  <option key={folder.id} value={folder.id}>
                    {folder.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Tags */}
            <div className="flex-1 min-w-[200px]">
              <TagSelector
                tags={tags}
                selectedTagIds={tagIds}
                onChange={(newTagIds) => handleChange(setTagIds)(newTagIds)}
                onCreateTag={onCreateTag}
              />
            </div>
          </div>

          {/* Linked Tasks */}
          <TaskLinkSelector
            tasks={tasks}
            selectedTaskIds={linkedTaskIds}
            onChange={(newTaskIds) => handleChange(setLinkedTaskIds)(newTaskIds)}
          />

          {/* Attachments */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-gray-400 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                </svg>
                Attachments
              </h4>
              {attachments.length > 0 && (
                <span className={`text-xs ${sizeWarning ? 'text-amber-400' : 'text-gray-500'}`}>
                  {formatFileSize(totalAttachmentsSize)} / {formatFileSize(ATTACHMENT_LIMITS.MAX_TOTAL_SIZE)}
                </span>
              )}
            </div>

            {attachments.length > 0 && (
              <AttachmentPreview
                attachments={attachments}
                onRemove={handleRemoveAttachment}
              />
            )}

            <AttachmentInput
              existingAttachments={attachments}
              onAdd={handleAddAttachment}
            />
          </div>

          {/* Editor Mode Toggle */}
          <div className="flex items-center gap-2 border-b border-dark-400 pb-2">
            {['edit', 'live', 'preview'].map(mode => (
              <button
                key={mode}
                onClick={() => setEditorMode(mode)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  editorMode === mode
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : 'text-gray-400 hover:text-white hover:bg-dark-600'
                }`}
              >
                {mode === 'edit' && 'Edit'}
                {mode === 'live' && 'Live Preview'}
                {mode === 'preview' && 'Preview'}
              </button>
            ))}
          </div>

          {/* Markdown Editor */}
          <div data-color-mode="dark" className="min-h-[400px]">
            <MDEditor
              value={content}
              onChange={(val) => handleChange(setContent)(val || '')}
              preview={editorMode}
              height={500}
              previewOptions={{
                rehypePlugins: [[rehypeSanitize]],
              }}
              textareaProps={{
                placeholder: 'Write your note in Markdown...',
              }}
            />
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
            onClick={() => setShowDeleteConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="card p-6 max-w-md w-full"
            >
              <h3 className="text-lg font-semibold text-white mb-2">Delete Note?</h3>
              <p className="text-gray-400 mb-6">
                Are you sure you want to delete "{title || 'Untitled Note'}"? This action cannot be undone.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-dark-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white transition-colors"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default NoteEditor;
