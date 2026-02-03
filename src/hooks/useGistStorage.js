import { useState, useEffect, useCallback, useRef } from 'react';

// Token is injected at build time from GitHub Secrets
const GITHUB_TOKEN = import.meta.env.VITE_GITHUB_TOKEN;
const GIST_FILENAME = 'personal-checklist-data.json';
const GIST_DESCRIPTION = 'Personal Checklist App Data - Do not delete';

const useGistStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(initialValue);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState(null);
  const gistIdRef = useRef(null);

  const getHeaders = () => ({
    'Authorization': `Bearer ${GITHUB_TOKEN}`,
    'Accept': 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  });

  // Find or create the gist on mount
  useEffect(() => {
    // If no token, fall back to localStorage only
    if (!GITHUB_TOKEN) {
      console.warn('No GitHub token configured, using localStorage only');
      const localData = localStorage.getItem(key);
      if (localData) {
        try {
          setStoredValue(JSON.parse(localData));
        } catch (e) {
          // ignore parse errors
        }
      }
      setIsLoading(false);
      return;
    }

    const initGist = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Search for existing gist
        const response = await fetch('https://api.github.com/gists', {
          headers: getHeaders(),
        });

        if (!response.ok) {
          throw new Error('Failed to connect to GitHub');
        }

        const gists = await response.json();
        const existingGist = gists.find(g =>
          g.files && g.files[GIST_FILENAME] && g.description === GIST_DESCRIPTION
        );

        if (existingGist) {
          // Load data from existing gist
          gistIdRef.current = existingGist.id;
          const content = existingGist.files[GIST_FILENAME]?.content;
          if (content) {
            const data = JSON.parse(content);
            setStoredValue(data[key] || initialValue);
          }
        } else {
          // Create new gist
          const createResponse = await fetch('https://api.github.com/gists', {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({
              description: GIST_DESCRIPTION,
              public: false,
              files: {
                [GIST_FILENAME]: {
                  content: JSON.stringify({ [key]: initialValue }, null, 2),
                },
              },
            }),
          });

          if (!createResponse.ok) {
            throw new Error('Failed to create sync storage');
          }

          const newGist = await createResponse.json();
          gistIdRef.current = newGist.id;
        }
      } catch (err) {
        console.error('Gist init error:', err);
        setError(err.message);
        // Fall back to localStorage
        const localData = localStorage.getItem(key);
        if (localData) {
          try {
            setStoredValue(JSON.parse(localData));
          } catch (e) {
            // ignore parse errors
          }
        }
      } finally {
        setIsLoading(false);
      }
    };

    initGist();
  }, [key, initialValue]);

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
        throw new Error('Failed to save');
      }
    } catch (err) {
      console.error('Gist save error:', err);
      setError(err.message);
    } finally {
      setIsSyncing(false);
    }
  }, [key]);

  // Update value and sync
  const setValue = useCallback((value) => {
    const valueToStore = value instanceof Function ? value(storedValue) : value;
    setStoredValue(valueToStore);

    // Save to localStorage as backup
    localStorage.setItem(key, JSON.stringify(valueToStore));

    // Sync to gist if configured
    if (GITHUB_TOKEN) {
      saveToGist(valueToStore);
    }
  }, [key, storedValue, saveToGist]);

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
