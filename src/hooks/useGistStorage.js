import { useState, useEffect, useCallback, useRef } from 'react';

// Token is injected at build time from GitHub Secrets
const GITHUB_TOKEN = import.meta.env.VITE_GITHUB_TOKEN;
const GIST_FILENAME = 'personal-checklist-data.json';
const GIST_DESCRIPTION = 'Personal Checklist App Data - Do not delete';

const useGistStorage = (key, initialValue) => {
  // Initialize from localStorage first for immediate display
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (e) {
      return initialValue;
    }
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState(null);
  const gistIdRef = useRef(null);
  const initializedRef = useRef(false);

  const getHeaders = useCallback(() => ({
    'Authorization': `Bearer ${GITHUB_TOKEN}`,
    'Accept': 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  }), []);

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
              const data = JSON.parse(content);
              const tasks = data[key];

              if (Array.isArray(tasks)) {
                setStoredValue(tasks);
                localStorage.setItem(key, JSON.stringify(tasks));
              }
            }
          }
        } else {
          // No existing gist - create one with current localStorage data
          const currentData = localStorage.getItem(key);
          const tasksToSave = currentData ? JSON.parse(currentData) : initialValue;

          const createResponse = await fetch('https://api.github.com/gists', {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({
              description: GIST_DESCRIPTION,
              public: false,
              files: {
                [GIST_FILENAME]: {
                  content: JSON.stringify({ [key]: tasksToSave }, null, 2),
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
  }, [key, getHeaders, initialValue]);

  // Save to gist
  const saveToGist = useCallback(async (value) => {
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
              content: JSON.stringify({ [key]: value }, null, 2),
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
  }, [key, getHeaders]);

  // Update value and sync
  const setValue = useCallback((value) => {
    setStoredValue(prevValue => {
      const valueToStore = value instanceof Function ? value(prevValue) : value;

      // Save to localStorage immediately
      localStorage.setItem(key, JSON.stringify(valueToStore));

      // Sync to gist
      if (GITHUB_TOKEN && gistIdRef.current) {
        saveToGist(valueToStore);
      }

      return valueToStore;
    });
  }, [key, saveToGist]);

  return [
    storedValue,
    setValue,
    {
      isLoading,
      isSyncing,
      error,
      isConfigured: !!GITHUB_TOKEN,
    },
  ];
};

export default useGistStorage;
