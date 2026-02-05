// Note utility functions

/**
 * Generate an excerpt from markdown content
 * @param {string} content - Markdown content
 * @param {number} maxLength - Maximum length of excerpt
 * @returns {string} Plain text excerpt
 */
export const generateExcerpt = (content, maxLength = 150) => {
  if (!content) return '';

  // Remove markdown formatting
  let text = content
    // Remove headers
    .replace(/^#{1,6}\s+/gm, '')
    // Remove bold/italic
    .replace(/(\*\*|__)(.*?)\1/g, '$2')
    .replace(/(\*|_)(.*?)\1/g, '$2')
    // Remove links
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    // Remove images
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, '')
    // Remove code blocks
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`([^`]+)`/g, '$1')
    // Remove blockquotes
    .replace(/^>\s+/gm, '')
    // Remove horizontal rules
    .replace(/^[-*_]{3,}$/gm, '')
    // Remove list markers
    .replace(/^[\s]*[-*+]\s+/gm, '')
    .replace(/^[\s]*\d+\.\s+/gm, '')
    // Remove checkboxes
    .replace(/\[[ x]\]\s*/gi, '')
    // Collapse whitespace
    .replace(/\n+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (text.length <= maxLength) return text;

  // Cut at word boundary
  const truncated = text.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');
  return (lastSpace > 0 ? truncated.substring(0, lastSpace) : truncated) + '...';
};

/**
 * Search notes by query
 * @param {Array} notes - Array of note objects
 * @param {string} query - Search query
 * @returns {Array} Filtered notes
 */
export const searchNotes = (notes, query) => {
  if (!query || !query.trim()) return notes;

  const searchTerms = query.toLowerCase().trim().split(/\s+/);

  return notes.filter(note => {
    const searchableText = `${note.title || ''} ${note.content || ''}`.toLowerCase();
    return searchTerms.every(term => searchableText.includes(term));
  });
};

/**
 * Sort notes by various criteria
 * @param {Array} notes - Array of note objects
 * @param {string} sortBy - Sort criteria: 'updatedAt', 'createdAt', 'title', 'order'
 * @param {boolean} ascending - Sort direction
 * @returns {Array} Sorted notes
 */
export const sortNotes = (notes, sortBy = 'updatedAt', ascending = false) => {
  const sorted = [...notes].sort((a, b) => {
    let comparison = 0;

    switch (sortBy) {
      case 'updatedAt':
      case 'createdAt':
        comparison = new Date(b[sortBy] || 0) - new Date(a[sortBy] || 0);
        break;
      case 'title':
        comparison = (a.title || '').localeCompare(b.title || '');
        break;
      case 'order':
        comparison = (a.order || 0) - (b.order || 0);
        break;
      default:
        comparison = 0;
    }

    return ascending ? -comparison : comparison;
  });

  return sorted;
};

/**
 * Filter notes by folder
 * @param {Array} notes - Array of note objects
 * @param {string} folderId - Folder ID to filter by
 * @returns {Array} Filtered notes
 */
export const filterNotesByFolder = (notes, folderId) => {
  if (!folderId || folderId === 'all') return notes;

  if (folderId === 'inbox') {
    return notes.filter(note => !note.folderId || note.folderId === 'inbox');
  }

  return notes.filter(note => note.folderId === folderId);
};

/**
 * Filter notes by tags
 * @param {Array} notes - Array of note objects
 * @param {Array} tagIds - Array of tag IDs to filter by
 * @returns {Array} Filtered notes
 */
export const filterNotesByTags = (notes, tagIds) => {
  if (!tagIds || tagIds.length === 0) return notes;

  return notes.filter(note =>
    tagIds.some(tagId => note.tagIds?.includes(tagId))
  );
};

/**
 * Get pinned notes first, then rest
 * @param {Array} notes - Array of note objects
 * @returns {Object} { pinned: [], unpinned: [] }
 */
export const separatePinnedNotes = (notes) => {
  const pinned = notes.filter(note => note.isPinned);
  const unpinned = notes.filter(note => !note.isPinned);
  return { pinned, unpinned };
};

/**
 * Get notes linked to a specific task
 * @param {Array} notes - Array of note objects
 * @param {string} taskId - Task ID
 * @returns {Array} Notes linked to the task
 */
export const getNotesLinkedToTask = (notes, taskId) => {
  return notes.filter(note => note.linkedTaskIds?.includes(taskId));
};

/**
 * Get note statistics
 * @param {Array} notes - Array of note objects
 * @returns {Object} Statistics object
 */
export const getNoteStats = (notes) => {
  return {
    total: notes.length,
    pinned: notes.filter(n => n.isPinned).length,
    favorites: notes.filter(n => n.isFavorite).length,
    withAttachments: notes.filter(n => n.attachments?.length > 0).length,
    linkedToTasks: notes.filter(n => n.linkedTaskIds?.length > 0).length,
  };
};

/**
 * Create a new note object with defaults
 * @param {Object} data - Partial note data
 * @returns {Object} Complete note object
 */
export const createNote = (data = {}) => {
  const now = new Date().toISOString();
  return {
    id: Date.now().toString(),
    title: '',
    content: '',
    folderId: null,
    tagIds: [],
    linkedTaskIds: [],
    attachments: [],
    isPinned: false,
    isFavorite: false,
    createdAt: now,
    updatedAt: now,
    order: 0,
    ...data,
  };
};
