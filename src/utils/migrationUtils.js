// Data migration utilities for schema version upgrades

const CURRENT_VERSION = 2;

/**
 * Default data structure for version 2
 */
export const getDefaultData = () => ({
  'checklist-tasks': [],
  'checklist-folders': [
    { id: 'inbox', name: 'Inbox', color: 'gray', icon: 'inbox', order: 0, createdAt: new Date().toISOString(), isDefault: true },
  ],
  'checklist-tags': [],
  'checklist-settings': { version: CURRENT_VERSION },
});

/**
 * Migrate task from v1 to v2 schema
 */
const migrateTaskV1ToV2 = (task) => ({
  ...task,
  folderId: task.folderId ?? null,
  tagIds: task.tagIds ?? [],
  assignee: task.assignee ?? null,
  links: task.links ?? [],
  order: task.order ?? 0,
});

/**
 * Detect data version from stored data
 */
export const detectVersion = (data) => {
  // If it has settings with version, use that
  if (data['checklist-settings']?.version) {
    return data['checklist-settings'].version;
  }

  // If it only has checklist-tasks array, it's v1
  if (Array.isArray(data['checklist-tasks']) && !data['checklist-folders']) {
    return 1;
  }

  // If data is an array (old format where gist stored tasks directly)
  if (Array.isArray(data)) {
    return 1;
  }

  return CURRENT_VERSION;
};

/**
 * Migrate data from any version to current version
 */
export const migrateData = (data) => {
  const version = detectVersion(data);

  // Already current version
  if (version === CURRENT_VERSION) {
    return data;
  }

  let migratedData = { ...getDefaultData() };

  // Handle v1 data
  if (version === 1) {
    // Extract tasks from old format
    let tasks = [];
    if (Array.isArray(data)) {
      tasks = data;
    } else if (Array.isArray(data['checklist-tasks'])) {
      tasks = data['checklist-tasks'];
    }

    // Migrate each task to v2 schema
    migratedData['checklist-tasks'] = tasks.map((task, index) => ({
      ...migrateTaskV1ToV2(task),
      order: index,
    }));

    console.log(`Migrated ${tasks.length} tasks from v1 to v2`);
  }

  return migratedData;
};

/**
 * Merge partial data updates into existing data
 */
export const mergeData = (existingData, updates) => {
  const merged = { ...existingData };

  for (const [key, value] of Object.entries(updates)) {
    if (value !== undefined) {
      merged[key] = value;
    }
  }

  return merged;
};

/**
 * Validate data structure
 */
export const validateData = (data) => {
  const errors = [];

  if (!Array.isArray(data['checklist-tasks'])) {
    errors.push('checklist-tasks must be an array');
  }

  if (!Array.isArray(data['checklist-folders'])) {
    errors.push('checklist-folders must be an array');
  }

  if (!Array.isArray(data['checklist-tags'])) {
    errors.push('checklist-tags must be an array');
  }

  if (!data['checklist-settings'] || typeof data['checklist-settings'] !== 'object') {
    errors.push('checklist-settings must be an object');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export { CURRENT_VERSION };
