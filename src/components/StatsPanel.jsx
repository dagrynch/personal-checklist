import { motion } from 'framer-motion';
import ProgressRing from './ProgressRing';

const StatsPanel = ({ streak, weeklyStats, dailyProgress, totalCompleted }) => {
  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.1 }}
      className="card p-5"
    >
      <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
        Statistics
      </h2>

      <div className="space-y-5">
        {/* Daily Progress */}
        <div className="flex items-center gap-4">
          <ProgressRing progress={dailyProgress.percentage} size={64} strokeWidth={5} />
          <div>
            <p className="text-white font-medium">Today's Progress</p>
            <p className="text-sm text-gray-500">
              {dailyProgress.completed}/{dailyProgress.total} tasks done
            </p>
          </div>
        </div>

        <div className="h-px bg-dark-400" />

        {/* Streak */}
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-xl bg-dark-600 flex items-center justify-center relative">
            <span className="text-2xl">{streak > 0 ? '🔥' : '💪'}</span>
            {streak > 0 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 bg-emerald-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center"
              >
                {streak}
              </motion.div>
            )}
          </div>
          <div>
            <p className="text-white font-medium">
              {streak > 0 ? `${streak} Day Streak` : 'Start a Streak'}
            </p>
            <p className="text-sm text-gray-500">
              {streak > 0 ? 'Keep it going!' : 'Complete tasks daily'}
            </p>
          </div>
        </div>

        <div className="h-px bg-dark-400" />

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-dark-600 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-emerald-400 stat-value">
              {weeklyStats.completedCount}
            </p>
            <p className="text-xs text-gray-500 mt-1">This Week</p>
          </div>
          <div className="bg-dark-600 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-emerald-400 stat-value">
              {totalCompleted}
            </p>
            <p className="text-xs text-gray-500 mt-1">All Time</p>
          </div>
        </div>

        {/* Completion Rate */}
        <div className="bg-dark-600 rounded-xl p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-400">Weekly Rate</span>
            <span className="text-sm font-medium text-emerald-400">
              {weeklyStats.completionRate}%
            </span>
          </div>
          <div className="h-2 bg-dark-400 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${weeklyStats.completionRate}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="h-full bg-emerald-500 rounded-full"
              style={{ boxShadow: '0 0 10px rgba(16, 185, 129, 0.5)' }}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default StatsPanel;
