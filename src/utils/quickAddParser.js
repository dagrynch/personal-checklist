// Quick Add Natural Language Parser
// Parses text like: "Buy milk tomorrow #shopping !high @john"

/**
 * Parse a quick add string into task data
 * Syntax:
 * - Title: any text not matching special patterns
 * - #tag: adds a tag (by name, will match existing or suggest creation)
 * - !high, !medium, !low, !h, !m, !l: sets priority
 * - @name: sets assignee
 * - Dates: today, tomorrow, monday-sunday, next week, in X days
 * - /folder: sets folder (by name)
 *
 * @param {string} input - The quick add string
 * @param {Array} existingTags - Available tags for matching
 * @param {Array} existingFolders - Available folders for matching
 * @returns {Object} Parsed task data
 */
export const parseQuickAdd = (input, existingTags = [], existingFolders = []) => {
  let text = input.trim();

  const result = {
    title: '',
    priority: 'medium',
    deadline: null,
    tagIds: [],
    tagNames: [], // For tags that need to be created
    assignee: null,
    folderId: null,
  };

  // Extract priority (!high, !medium, !low, !h, !m, !l)
  const priorityMatch = text.match(/!(high|medium|low|h|m|l)\b/i);
  if (priorityMatch) {
    const p = priorityMatch[1].toLowerCase();
    if (p === 'h' || p === 'high') result.priority = 'high';
    else if (p === 'l' || p === 'low') result.priority = 'low';
    else result.priority = 'medium';
    text = text.replace(priorityMatch[0], '').trim();
  }

  // Extract assignee (@name)
  const assigneeMatch = text.match(/@(\w+)/);
  if (assigneeMatch) {
    result.assignee = assigneeMatch[1];
    text = text.replace(assigneeMatch[0], '').trim();
  }

  // Extract folder (/folder)
  const folderMatch = text.match(/\/(\w+)/);
  if (folderMatch) {
    const folderName = folderMatch[1].toLowerCase();
    const folder = existingFolders.find(f =>
      f.name.toLowerCase() === folderName ||
      f.name.toLowerCase().startsWith(folderName)
    );
    if (folder) {
      result.folderId = folder.id;
    }
    text = text.replace(folderMatch[0], '').trim();
  }

  // Extract tags (#tag)
  const tagMatches = text.match(/#(\w+)/g);
  if (tagMatches) {
    tagMatches.forEach(match => {
      const tagName = match.slice(1).toLowerCase();
      const existingTag = existingTags.find(t =>
        t.name.toLowerCase() === tagName ||
        t.name.toLowerCase().startsWith(tagName)
      );
      if (existingTag) {
        result.tagIds.push(existingTag.id);
      } else {
        result.tagNames.push(tagName);
      }
      text = text.replace(match, '').trim();
    });
  }

  // Extract dates
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // "today"
  if (/\btoday\b/i.test(text)) {
    result.deadline = formatDate(today);
    text = text.replace(/\btoday\b/i, '').trim();
  }
  // "tomorrow"
  else if (/\btomorrow\b/i.test(text)) {
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    result.deadline = formatDate(tomorrow);
    text = text.replace(/\btomorrow\b/i, '').trim();
  }
  // "next week"
  else if (/\bnext week\b/i.test(text)) {
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);
    result.deadline = formatDate(nextWeek);
    text = text.replace(/\bnext week\b/i, '').trim();
  }
  // "in X days"
  else if (/\bin (\d+) days?\b/i.test(text)) {
    const match = text.match(/\bin (\d+) days?\b/i);
    const days = parseInt(match[1], 10);
    const future = new Date(today);
    future.setDate(future.getDate() + days);
    result.deadline = formatDate(future);
    text = text.replace(match[0], '').trim();
  }
  // Day names (monday, tuesday, etc.)
  else {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayMatch = text.match(new RegExp(`\\b(${days.join('|')})\\b`, 'i'));
    if (dayMatch) {
      const targetDay = days.indexOf(dayMatch[1].toLowerCase());
      const currentDay = today.getDay();
      let daysUntil = targetDay - currentDay;
      if (daysUntil <= 0) daysUntil += 7; // Next occurrence
      const targetDate = new Date(today);
      targetDate.setDate(targetDate.getDate() + daysUntil);
      result.deadline = formatDate(targetDate);
      text = text.replace(dayMatch[0], '').trim();
    }
  }

  // Clean up remaining text for title
  result.title = text.replace(/\s+/g, ' ').trim();

  return result;
};

/**
 * Format date as YYYY-MM-DD
 */
const formatDate = (date) => {
  return date.toISOString().split('T')[0];
};

/**
 * Get suggestions for quick add based on partial input
 */
export const getQuickAddSuggestions = (input, existingTags = [], existingFolders = []) => {
  const suggestions = [];

  // Priority suggestions
  if (input.endsWith('!')) {
    suggestions.push(
      { type: 'priority', value: '!high', label: 'High priority' },
      { type: 'priority', value: '!medium', label: 'Medium priority' },
      { type: 'priority', value: '!low', label: 'Low priority' }
    );
  }

  // Tag suggestions
  if (input.includes('#')) {
    const partialTag = input.match(/#(\w*)$/);
    if (partialTag) {
      const query = partialTag[1].toLowerCase();
      existingTags
        .filter(t => t.name.toLowerCase().startsWith(query))
        .slice(0, 5)
        .forEach(t => {
          suggestions.push({ type: 'tag', value: `#${t.name}`, label: t.name });
        });
    }
  }

  // Folder suggestions
  if (input.includes('/')) {
    const partialFolder = input.match(/\/(\w*)$/);
    if (partialFolder) {
      const query = partialFolder[1].toLowerCase();
      existingFolders
        .filter(f => f.name.toLowerCase().startsWith(query))
        .slice(0, 5)
        .forEach(f => {
          suggestions.push({ type: 'folder', value: `/${f.name}`, label: f.name });
        });
    }
  }

  // Date suggestions
  const dateKeywords = ['today', 'tomorrow', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday', 'next week'];
  const lastWord = input.split(' ').pop().toLowerCase();
  if (lastWord.length > 0) {
    dateKeywords
      .filter(d => d.startsWith(lastWord))
      .forEach(d => {
        suggestions.push({ type: 'date', value: d, label: d.charAt(0).toUpperCase() + d.slice(1) });
      });
  }

  return suggestions;
};
