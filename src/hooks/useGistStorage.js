import { useState, useEffect, useCallback, useRef } from 'react';
import { migrateData, getDefaultData, CURRENT_VERSION } from '../utils/migrationUtils';

// Token is injected at build time from GitHub Secrets
const GITHUB_TOKEN = import.meta.env.VITE_GITHUB_TOKEN;
const GIST_FILENAME = 'personal-checklist-data.json';
const GIST_DESCRIPTION = 'Personal Checklist App Data - Do not delete';

// Storage keys
const STORAGE_KEYS = {
  TASKS: 'checklist-tasks',
  FOLDERS: 'checklist-folders',
  TAGS: 'checklist-tags',
  SETTINGS: 'checklist-settings',
};

/**
 * Hook for multi-key gist storage with automatic sync
 * Returns all data and setters for each data type
 */
const useGistStorage = () => {
  // Initialize from localStorage first for immediate display
  const [data, setData] = useState(() => {
    try {
      const defaults = getDefaultData();
      const stored = {};

      // Load each key from localStorage
      for (const key of Object.values(STORAGE_KEYS)) {
        const item = localStorage.getItem(key);
        stored[key] = item ? JSON.parse(item) : defaults[key];
      }

      return stored;
    } catch (e) {
      console.error('Error loading from localStorage:', e);
      return getDefaultData();
    }
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState(null);
  const gistIdRef = useRef(null);
  const initializedRef = useRef(false);
  const syncTimeoutRef = useRef(null);

  const getHeaders = useCallback(() => ({
    'Authorization': `Bearer ${GITHUB_TOKEN}`,
    'Accept': 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  }), []);

  // Save all data to localStorage
  const saveToLocalStorage = useCallback((newData) => {
    for (const [key, value] of Object.entries(newData)) {
      localStorage.setItem(key, JSON.stringify(value));
    }
  }, []);

  // Initialize Gist connection
  useEffect(() => {
    // Prevent double initialization in React StrictMode
    if (initializedRef.current) return;
    initializedRef.current = true;

    // If no token, just use localStorage
    if (!GITHUB_TOKEN) {
      console.warn('No GitHub token configured, using localStorage only');
      setIsLoading(false);
      return;
    }

    const initGist = async () => {
      setError(null);

      try {
        // Search for existing gist
        const response = await fetch('https://api.github.com/gists', {
          headers: getHeaders(),
        });

        if (!response.ok) {
          throw new Error('Failed to connect to GitHub: ' + response.status);
        }

        const gists = await response.json();
        const existingGist = gists.find(g =>
          g.files && g.files[GIST_FILENAME] && g.description === GIST_DESCRIPTION
        );

        if (existingGist) {
          // Found existing gist - load its data
          gistIdRef.current = existingGist.id;

          // Get full gist content
          const fullResponse = await fetch(`https://api.github.com/gists/${existingGist.id}`, {
            headers: getHeaders(),
          });

          if (fullResponse.ok) {
            const fullGist = await fullResponse.json();
            const content = fullGist.files[GIST_FILENAME]?.content;

            if (content) {
              let gistData = JSON.parse(content);

              // Handle legacy format (just tasks array or single key)
              if (Array.isArray(gistData)) {
                gistData = { [STORAGE_KEYS.TASKS]: gistData };
              } else if (gistData[STORAGE_KEYS.TASKS] && !gistData[STORAGE_KEYS.SETTINGS]) {
                // Old format with just tasks key
                gistData = { [STORAGE_KEYS.TASKS]: gistData[STORAGE_KEYS.TASKS] };
              }

              // Migrate data to current version
              const migratedData = migrateData(gistData);

              // Update state and localStorage
              setData(migratedData);
              saveToLocalStorage(migratedData);

              // If we migrated, save back to gist
              const currentVersion = gistData[STORAGE_KEYS.SETTINGS]?.version;
              if (currentVersion !== CURRENT_VERSION) {
                await saveToGist(migratedData);
              }
            }
          }
        } else {
          // No existing gist - create one with current localStorage data
          const currentData = data;
          const dataToSave = {
            ...getDefaultData(),
            ...currentData,
          };

          const createResponse = await fetch('https://api.github.com/gists', {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({
              description: GIST_DESCRIPTION,
              public: false,
              files: {
                [GIST_FILENAME]: {
                  content: JSON.stringify(dataToSave, null, 2),
                },
              },
            }),
          });

          if (!createResponse.ok) {
            throw new Error('Failed to create gist: ' + createResponse.status);
          }

          const newGist = await createResponse.json();
          gistIdRef.current = newGist.id;
        }
      } catch (err) {
        console.error('Gist init error:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    initGist();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getHeaders]);

  // Save to gist (debounced)
  const saveToGist = useCallback(async (newData) => {
    if (!gistIdRef.current || !GITHUB_TOKEN) return;

    setIsSyncing(true);
    setError(null);

    try {
      const response = await fetch(`https://api.github.com/gists/${gistIdRef.current}`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify({
          files: {
            [GIST_FILENAME]: {
              content: JSON.stringify(newData, null, 2),
            },
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save: ' + response.status);
      }
    } catch (err) {
      console.error('Gist save error:', err);
      setError(err.message);
    } finally {
      setIsSyncing(false);
    }
  }, [getHeaders]);

  // Debounced sync to gist
  const scheduleSyncToGist = useCallback((newData) => {
    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current);
    }

    syncTimeoutRef.current = setTimeout(() => {
      saveToGist(newData);
    }, 500);
  }, [saveToGist]);

  // Generic setter factory
  const createSetter = useCallback((key) => {
    return (value) => {
      setData(prevData => {
        const newValue = value instanceof Function ? value(prevData[key]) : value;
        const newData = {
          ...prevData,
          [key]: newValue,
        };

        // Save to localStorage immediately
        localStorage.setItem(key, JSON.stringify(newValue));

        // Schedule sync to gist
        if (GITHUB_TOKEN && gistIdRef.current) {
          scheduleSyncToGist(newData);
        }

        return newData;
      });
    };
  }, [scheduleSyncToGist]);

  // Individual setters
  const setTasks = createSetter(STORAGE_KEYS.TASKS);
  const setFolders = createSetter(STORAGE_KEYS.FOLDERS);
  const setTags = createSetter(STORAGE_KEYS.TAGS);
  const setSettings = createSetter(STORAGE_KEYS.SETTINGS);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }
    };
  }, []);

  return {
    // Data
    tasks: data[STORAGE_KEYS.TASKS] || [],
    folders: data[STORAGE_KEYS.FOLDERS] || getDefaultData()[STORAGE_KEYS.FOLDERS],
    tags: data[STORAGE_KEYS.TAGS] || [],
    settings: data[STORAGE_KEYS.SETTINGS] || { version: CURRENT_VERSION },

    // Setters
    setTasks,
    setFolders,
    setTags,
    setSettings,

    // Status
    syncStatus: {
      isLoading,
      isSyncing,
      error,
      isConfigured: !!GITHUB_TOKEN,
    },
  };
};

// Legacy hook for backwards compatibility during migration
export const useSingleKeyStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (e) {
      return initialValue;
    }
  });

  const setValue = useCallback((value) => {
    setStoredValue(prevValue => {
      const valueToStore = value instanceof Function ? value(prevValue) : value;
      localStorage.setItem(key, JSON.stringify(valueToStore));
      return valueToStore;
    });
  }, [key]);

  return [storedValue, setValue];
};

export default useGistStorage;
export { STORAGE_KEYS };
