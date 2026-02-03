import { useState, useEffect, useCallback } from 'react';

const GIST_ID_KEY = 'checklist_gist_id';
const GITHUB_TOKEN_KEY = 'checklist_github_token';
const GIST_FILENAME = 'personal-checklist-data.json';

const useGistStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(initialValue);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState(null);
  const [isConfigured, setIsConfigured] = useState(false);

  // Check if GitHub token is configured
  useEffect(() => {
    const token = localStorage.getItem(GITHUB_TOKEN_KEY);
    setIsConfigured(!!token);

    if (token) {
      loadFromGist(token);
    } else {
      // Fall back to localStorage
      const localData = localStorage.getItem(key);
      if (localData) {
        setStoredValue(JSON.parse(localData));
      }
      setIsLoading(false);
    }
  }, [key]);

  const getHeaders = (token) => ({
    'Authorization': `Bearer ${token}`,
    'Accept': 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  });

  const loadFromGist = async (token) => {
    setIsLoading(true);
    setError(null);

    try {
      const gistId = localStorage.getItem(GIST_ID_KEY);

      if (gistId) {
        // Try to load existing gist
        const response = await fetch(`https://api.github.com/gists/${gistId}`, {
          headers: getHeaders(token),
        });

        if (response.ok) {
          const gist = await response.json();
          const content = gist.files[GIST_FILENAME]?.content;

          if (content) {
            const data = JSON.parse(content);
            const tasks = data[key] || initialValue;
            setStoredValue(tasks);
            localStorage.setItem(key, JSON.stringify(tasks));
          }
        } else if (response.status === 404) {
          // Gist was deleted, create a new one
          localStorage.removeItem(GIST_ID_KEY);
          await createGist(token, initialValue);
        } else {
          throw new Error('Failed to load data from GitHub');
        }
      } else {
        // No gist exists, create one
        await createGist(token, initialValue);
      }
    } catch (err) {
      console.error('Gist load error:', err);
      setError(err.message);
      // Fall back to localStorage
      const localData = localStorage.getItem(key);
      if (localData) {
        setStoredValue(JSON.parse(localData));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const createGist = async (token, data) => {
    const response = await fetch('https://api.github.com/gists', {
      method: 'POST',
      headers: getHeaders(token),
      body: JSON.stringify({
        description: 'Personal Checklist App Data - Do not delete',
        public: false,
        files: {
          [GIST_FILENAME]: {
            content: JSON.stringify({ [key]: data }, null, 2),
          },
        },
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to create gist');
    }

    const gist = await response.json();
    localStorage.setItem(GIST_ID_KEY, gist.id);
    return gist;
  };

  const saveToGist = useCallback(async (value) => {
    const token = localStorage.getItem(GITHUB_TOKEN_KEY);
    const gistId = localStorage.getItem(GIST_ID_KEY);

    if (!token || !gistId) {
      return;
    }

    setIsSyncing(true);
    setError(null);

    try {
      const response = await fetch(`https://api.github.com/gists/${gistId}`, {
        method: 'PATCH',
        headers: getHeaders(token),
        body: JSON.stringify({
          files: {
            [GIST_FILENAME]: {
              content: JSON.stringify({ [key]: value }, null, 2),
            },
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save to GitHub');
      }
    } catch (err) {
      console.error('Gist save error:', err);
      setError(err.message);
    } finally {
      setIsSyncing(false);
    }
  }, [key]);

  const setValue = useCallback((value) => {
    const valueToStore = value instanceof Function ? value(storedValue) : value;
    setStoredValue(valueToStore);

    // Always save to localStorage as backup
    localStorage.setItem(key, JSON.stringify(valueToStore));

    // Sync to Gist if configured
    if (isConfigured) {
      saveToGist(valueToStore);
    }
  }, [key, storedValue, isConfigured, saveToGist]);

  const configureGitHub = useCallback(async (token) => {
    localStorage.setItem(GITHUB_TOKEN_KEY, token);
    setIsConfigured(true);

    // Load or create gist with current data
    const currentData = storedValue;

    try {
      setIsLoading(true);

      // First, try to find existing gist
      const response = await fetch('https://api.github.com/gists', {
        headers: getHeaders(token),
      });

      if (!response.ok) {
        throw new Error('Invalid token or API error');
      }

      const gists = await response.json();
      const existingGist = gists.find(g =>
        g.files[GIST_FILENAME] && g.description?.includes('Personal Checklist')
      );

      if (existingGist) {
        // Found existing gist, load its data
        localStorage.setItem(GIST_ID_KEY, existingGist.id);
        const content = existingGist.files[GIST_FILENAME]?.content;
        if (content) {
          const data = JSON.parse(content);
          const tasks = data[key] || initialValue;
          setStoredValue(tasks);
          localStorage.setItem(key, JSON.stringify(tasks));
        }
      } else {
        // No existing gist, create one with current localStorage data
        await createGist(token, currentData);
      }

      return { success: true };
    } catch (err) {
      console.error('GitHub config error:', err);
      localStorage.removeItem(GITHUB_TOKEN_KEY);
      setIsConfigured(false);
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  }, [key, storedValue, initialValue]);

  const disconnectGitHub = useCallback(() => {
    localStorage.removeItem(GITHUB_TOKEN_KEY);
    localStorage.removeItem(GIST_ID_KEY);
    setIsConfigured(false);
  }, []);

  const refreshFromGist = useCallback(async () => {
    const token = localStorage.getItem(GITHUB_TOKEN_KEY);
    if (token) {
      await loadFromGist(token);
    }
  }, []);

  return [
    storedValue,
    setValue,
    {
      isLoading,
      isSyncing,
      error,
      isConfigured,
      configureGitHub,
      disconnectGitHub,
      refreshFromGist,
    },
  ];
};

export default useGistStorage;
