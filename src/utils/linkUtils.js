// Link type detection and utilities

const LINK_TYPES = {
  GOOGLE_DRIVE: {
    id: 'google-drive',
    name: 'Google Drive',
    patterns: [/drive\.google\.com/, /docs\.google\.com/],
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-500/20',
  },
  GOOGLE_DOCS: {
    id: 'google-docs',
    name: 'Google Docs',
    patterns: [/docs\.google\.com\/document/],
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/20',
  },
  GOOGLE_SHEETS: {
    id: 'google-sheets',
    name: 'Google Sheets',
    patterns: [/docs\.google\.com\/spreadsheets/],
    color: 'text-green-400',
    bgColor: 'bg-green-500/20',
  },
  GOOGLE_SLIDES: {
    id: 'google-slides',
    name: 'Google Slides',
    patterns: [/docs\.google\.com\/presentation/],
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/20',
  },
  GITHUB: {
    id: 'github',
    name: 'GitHub',
    patterns: [/github\.com/],
    color: 'text-gray-300',
    bgColor: 'bg-gray-500/20',
  },
  GITLAB: {
    id: 'gitlab',
    name: 'GitLab',
    patterns: [/gitlab\.com/],
    color: 'text-orange-400',
    bgColor: 'bg-orange-500/20',
  },
  NOTION: {
    id: 'notion',
    name: 'Notion',
    patterns: [/notion\.so/, /notion\.site/],
    color: 'text-gray-200',
    bgColor: 'bg-gray-500/20',
  },
  FIGMA: {
    id: 'figma',
    name: 'Figma',
    patterns: [/figma\.com/],
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/20',
  },
  SLACK: {
    id: 'slack',
    name: 'Slack',
    patterns: [/slack\.com/],
    color: 'text-fuchsia-400',
    bgColor: 'bg-fuchsia-500/20',
  },
  TRELLO: {
    id: 'trello',
    name: 'Trello',
    patterns: [/trello\.com/],
    color: 'text-sky-400',
    bgColor: 'bg-sky-500/20',
  },
  JIRA: {
    id: 'jira',
    name: 'Jira',
    patterns: [/atlassian\.net/, /jira\./],
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/20',
  },
  CONFLUENCE: {
    id: 'confluence',
    name: 'Confluence',
    patterns: [/atlassian\.net.*\/wiki/, /confluence\./],
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/20',
  },
  DROPBOX: {
    id: 'dropbox',
    name: 'Dropbox',
    patterns: [/dropbox\.com/],
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/20',
  },
  YOUTUBE: {
    id: 'youtube',
    name: 'YouTube',
    patterns: [/youtube\.com/, /youtu\.be/],
    color: 'text-red-400',
    bgColor: 'bg-red-500/20',
  },
  LINEAR: {
    id: 'linear',
    name: 'Linear',
    patterns: [/linear\.app/],
    color: 'text-violet-400',
    bgColor: 'bg-violet-500/20',
  },
  GENERIC: {
    id: 'generic',
    name: 'Link',
    patterns: [],
    color: 'text-gray-400',
    bgColor: 'bg-gray-500/20',
  },
};

/**
 * Detect link type from URL
 */
export const detectLinkType = (url) => {
  if (!url) return LINK_TYPES.GENERIC;

  const lowerUrl = url.toLowerCase();

  // Check specific types first (more specific patterns)
  for (const type of [
    LINK_TYPES.GOOGLE_DOCS,
    LINK_TYPES.GOOGLE_SHEETS,
    LINK_TYPES.GOOGLE_SLIDES,
    LINK_TYPES.CONFLUENCE,
  ]) {
    if (type.patterns.some(pattern => pattern.test(lowerUrl))) {
      return type;
    }
  }

  // Check general types
  for (const [key, type] of Object.entries(LINK_TYPES)) {
    if (key === 'GENERIC') continue;
    if (type.patterns.some(pattern => pattern.test(lowerUrl))) {
      return type;
    }
  }

  return LINK_TYPES.GENERIC;
};

/**
 * Extract title from URL (fallback if not provided)
 */
export const extractTitleFromUrl = (url) => {
  try {
    const urlObj = new URL(url);
    const type = detectLinkType(url);

    // For known types, try to extract meaningful title
    if (type.id === 'github') {
      // Extract repo name or path
      const path = urlObj.pathname.slice(1);
      if (path) return path.split('/').slice(0, 2).join('/');
    }

    // Default: use hostname
    return urlObj.hostname.replace('www.', '');
  } catch {
    return 'Link';
  }
};

/**
 * Validate URL format
 */
export const isValidUrl = (string) => {
  try {
    new URL(string);
    return true;
  } catch {
    return false;
  }
};

/**
 * Create a new link object
 */
export const createLink = (url, title = '') => {
  const type = detectLinkType(url);

  return {
    id: Date.now().toString(),
    url,
    title: title || extractTitleFromUrl(url),
    type: type.id,
  };
};

export { LINK_TYPES };
