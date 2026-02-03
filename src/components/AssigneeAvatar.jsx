import { motion } from 'framer-motion';

// Generate consistent color based on name
const getColorForName = (name) => {
  if (!name) return { bg: 'bg-gray-600', text: 'text-gray-300' };

  const colors = [
    { bg: 'bg-red-600', text: 'text-red-100' },
    { bg: 'bg-orange-600', text: 'text-orange-100' },
    { bg: 'bg-amber-600', text: 'text-amber-100' },
    { bg: 'bg-yellow-600', text: 'text-yellow-100' },
    { bg: 'bg-lime-600', text: 'text-lime-100' },
    { bg: 'bg-green-600', text: 'text-green-100' },
    { bg: 'bg-emerald-600', text: 'text-emerald-100' },
    { bg: 'bg-teal-600', text: 'text-teal-100' },
    { bg: 'bg-cyan-600', text: 'text-cyan-100' },
    { bg: 'bg-sky-600', text: 'text-sky-100' },
    { bg: 'bg-blue-600', text: 'text-blue-100' },
    { bg: 'bg-indigo-600', text: 'text-indigo-100' },
    { bg: 'bg-violet-600', text: 'text-violet-100' },
    { bg: 'bg-purple-600', text: 'text-purple-100' },
    { bg: 'bg-fuchsia-600', text: 'text-fuchsia-100' },
    { bg: 'bg-pink-600', text: 'text-pink-100' },
    { bg: 'bg-rose-600', text: 'text-rose-100' },
  ];

  // Hash the name to get a consistent index
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }

  return colors[Math.abs(hash) % colors.length];
};

// Get initials from name
const getInitials = (name) => {
  if (!name) return '?';

  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase();
  }

  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const AssigneeAvatar = ({ name, size = 'md', showName = false, onClick }) => {
  if (!name) return null;

  const colors = getColorForName(name);
  const initials = getInitials(name);

  const sizeClasses = {
    xs: 'w-5 h-5 text-[10px]',
    sm: 'w-6 h-6 text-xs',
    md: 'w-8 h-8 text-sm',
    lg: 'w-10 h-10 text-base',
  };

  const avatar = (
    <div
      className={`
        ${sizeClasses[size]} ${colors.bg} ${colors.text}
        rounded-full flex items-center justify-center font-semibold
        ${onClick ? 'cursor-pointer hover:brightness-110' : ''}
        transition-all
      `}
      title={name}
    >
      {initials}
    </div>
  );

  if (onClick) {
    return (
      <motion.button
        type="button"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={onClick}
        className="flex items-center gap-2"
      >
        {avatar}
        {showName && (
          <span className="text-sm text-gray-300">{name}</span>
        )}
      </motion.button>
    );
  }

  if (showName) {
    return (
      <div className="flex items-center gap-2">
        {avatar}
        <span className="text-sm text-gray-300">{name}</span>
      </div>
    );
  }

  return avatar;
};

export default AssigneeAvatar;
export { getColorForName, getInitials };
