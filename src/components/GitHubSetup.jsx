import { useState } from 'react';
import { motion } from 'framer-motion';

const GitHubSetup = ({ onConfigure, onSkip }) => {
  const [token, setToken] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!token.trim()) {
      setError('Please enter a token');
      return;
    }

    setIsLoading(true);
    setError('');

    const result = await onConfigure(token.trim());

    if (!result.success) {
      setError(result.error || 'Invalid token');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md"
      >
        <div className="glass-card p-8 rounded-2xl">
          <div className="text-center mb-6">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-gray-700 to-gray-800
                          flex items-center justify-center shadow-lg">
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Sync Your Tasks</h1>
            <p className="text-dark-300 text-sm">
              Connect GitHub to save your tasks in the cloud and access them from any device.
            </p>
          </div>

          <div className="bg-dark-700/30 rounded-xl p-4 mb-6 text-sm">
            <p className="text-accent-400 font-medium mb-2">How to get a token:</p>
            <ol className="text-dark-300 space-y-1 list-decimal list-inside">
              <li>Go to <span className="text-accent-400">GitHub.com → Settings</span></li>
              <li>Developer settings → Personal access tokens</li>
              <li>Generate new token (classic)</li>
              <li>Select only the <span className="text-accent-400">"gist"</span> scope</li>
              <li>Copy and paste the token below</li>
            </ol>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                type="password"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="ghp_xxxxxxxxxxxx"
                className="w-full px-4 py-3 bg-dark-700/50 border border-dark-500/50 rounded-xl
                         text-white placeholder-dark-400 focus:outline-none focus:border-accent-500/50
                         focus:ring-2 focus:ring-accent-500/20 transition-all duration-200 font-mono text-sm"
                disabled={isLoading}
              />
            </div>

            {error && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-400 text-sm text-center"
              >
                {error}
              </motion.p>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-gradient-to-r from-accent-500 to-accent-600 text-white
                       font-semibold rounded-xl hover:shadow-lg hover:shadow-accent-500/25
                       transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]
                       disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Connecting...
                </span>
              ) : (
                'Connect GitHub'
              )}
            </button>

            <button
              type="button"
              onClick={onSkip}
              className="w-full py-3 text-dark-300 hover:text-white text-sm
                       transition-all duration-200"
            >
              Skip for now (use local storage only)
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default GitHubSetup;
