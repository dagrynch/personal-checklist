import { motion } from 'framer-motion';

const Header = ({
  onRequestNotifications,
  notificationPermission,
  isSyncing,
  onOpenSidebar,
}) => {
  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="card p-4 lg:p-5"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Mobile Menu Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onOpenSidebar}
            className="lg:hidden p-2 rounded-xl bg-dark-600 text-gray-400 hover:text-white hover:bg-dark-500 transition-colors border border-dark-400"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </motion.button>

          <motion.div
            whileHover={{ scale: 1.05 }}
            className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl bg-emerald-500 flex items-center justify-center"
            style={{ boxShadow: '0 0 20px rgba(16, 185, 129, 0.4)' }}
          >
            <svg
              className="w-6 h-6 lg:w-7 lg:h-7 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
              />
            </svg>
          </motion.div>
          <div>
            <h1 className="text-xl lg:text-2xl font-bold text-white">
              My Checklist
            </h1>
            <p className="text-sm text-gray-500 hidden sm:block">
              Stay organized, stay productive
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Cloud Sync Status */}
          <div
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-dark-600 border border-dark-400 text-xs font-medium"
            title="Your tasks sync automatically to the cloud"
          >
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
            </svg>
            {isSyncing ? (
              <span className="text-accent-400 flex items-center gap-1">
                <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Syncing
              </span>
            ) : (
              <span className="text-emerald-400">Synced</span>
            )}
          </div>

          {notificationPermission !== 'granted' && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onRequestNotifications}
              className="p-2.5 rounded-xl bg-dark-600 text-gray-400 hover:text-emerald-400 hover:bg-dark-500 transition-colors border border-dark-400"
              title="Enable notifications"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
            </motion.button>
          )}

          {notificationPermission === 'granted' && (
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
            </div>
          )}
        </div>
      </div>
    </motion.header>
  );
};

export default Header;
