import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

// Simple hash function for client-side password verification
const hashPassword = (password) => {
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash.toString(36);
};

// Pre-computed hash of the password "myPersonalTasks"
const PASSWORD_HASH = hashPassword('myPersonalTasks');
const AUTH_KEY = 'checklist_authenticated';

const PasswordGate = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if already authenticated
    const auth = localStorage.getItem(AUTH_KEY);
    if (auth === PASSWORD_HASH) {
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    const inputHash = hashPassword(password);

    if (inputHash === PASSWORD_HASH) {
      localStorage.setItem(AUTH_KEY, PASSWORD_HASH);
      setIsAuthenticated(true);
      setError('');
    } else {
      setError('Incorrect password');
      setPassword('');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem(AUTH_KEY);
    setIsAuthenticated(false);
    setPassword('');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-accent-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (isAuthenticated) {
    return (
      <>
        {children}
        <button
          onClick={handleLogout}
          className="fixed bottom-4 right-4 px-3 py-1.5 text-xs text-dark-300 hover:text-accent-500
                     bg-dark-800/50 rounded-lg border border-dark-600/50 hover:border-accent-500/30
                     transition-all duration-200 opacity-50 hover:opacity-100"
        >
          Logout
        </button>
      </>
    );
  }

  return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-sm"
      >
        <div className="glass-card p-8 rounded-2xl">
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-accent-500 to-accent-600
                          flex items-center justify-center shadow-lg shadow-accent-500/20">
              <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Personal Checklist</h1>
            <p className="text-dark-300 text-sm">Enter password to access</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full px-4 py-3 bg-dark-700/50 border border-dark-500/50 rounded-xl
                         text-white placeholder-dark-400 focus:outline-none focus:border-accent-500/50
                         focus:ring-2 focus:ring-accent-500/20 transition-all duration-200"
                autoFocus
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
              className="w-full py-3 bg-gradient-to-r from-accent-500 to-accent-600 text-white
                       font-semibold rounded-xl hover:shadow-lg hover:shadow-accent-500/25
                       transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            >
              Unlock
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default PasswordGate;
