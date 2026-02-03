import { motion } from 'framer-motion';

const EmptyState = ({ filter }) => {
  const getMessage = () => {
    switch (filter) {
      case 'active':
        return {
          title: 'All caught up!',
          subtitle: "You've completed all your tasks. Time to add more!",
          icon: (
            <svg className="w-16 h-16 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
        };
      case 'completed':
        return {
          title: 'No completed tasks',
          subtitle: 'Start checking off your tasks to see them here.',
          icon: (
            <svg className="w-16 h-16 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          ),
        };
      default:
        return {
          title: 'No tasks yet',
          subtitle: 'Add your first task to get started!',
          icon: (
            <svg className="w-16 h-16 text-emerald-500/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          ),
        };
    }
  };

  const { title, subtitle, icon } = getMessage();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-12 px-4"
    >
      <motion.div
        animate={{
          scale: [1, 1.05, 1],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          repeatType: 'reverse',
        }}
        className="mb-4 p-4 rounded-2xl bg-dark-600"
      >
        {icon}
      </motion.div>
      <h3 className="text-lg font-semibold text-white mb-1 text-center">
        {title}
      </h3>
      <p className="text-gray-500 text-center text-sm max-w-xs">
        {subtitle}
      </p>
    </motion.div>
  );
};

export default EmptyState;
