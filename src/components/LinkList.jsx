import { motion } from 'framer-motion';
import LinkTypeIcon from './LinkTypeIcon';
import { LINK_TYPES } from '../utils/linkUtils';

const LinkList = ({ links = [], compact = false }) => {
  if (!links || links.length === 0) return null;

  if (compact) {
    // Show just icons for compact mode (in task list)
    return (
      <div className="flex items-center gap-1 mt-2">
        {links.slice(0, 3).map((link) => (
          <motion.a
            key={link.id}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.15 }}
            className={`p-1.5 rounded-lg ${
              LINK_TYPES[Object.keys(LINK_TYPES).find(k =>
                LINK_TYPES[k].id === link.type
              )]?.bgColor || 'bg-gray-500/20'
            } hover:brightness-110 transition-all`}
            title={link.title}
            onClick={(e) => e.stopPropagation()}
          >
            <LinkTypeIcon type={link.type} className="w-3.5 h-3.5" />
          </motion.a>
        ))}
        {links.length > 3 && (
          <span className="text-xs text-gray-500 ml-1">
            +{links.length - 3}
          </span>
        )}
      </div>
    );
  }

  // Full link list
  return (
    <div className="space-y-1.5">
      {links.map((link) => {
        const type = LINK_TYPES[Object.keys(LINK_TYPES).find(k =>
          LINK_TYPES[k].id === link.type
        )] || LINK_TYPES.GENERIC;

        return (
          <motion.a
            key={link.id}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ x: 4 }}
            className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg ${type.bgColor} hover:brightness-110 transition-all group`}
            onClick={(e) => e.stopPropagation()}
          >
            <LinkTypeIcon type={link.type} className="w-4 h-4 flex-shrink-0" />
            <span className={`text-sm ${type.color} truncate group-hover:underline`}>
              {link.title}
            </span>
            <svg
              className="w-3 h-3 text-gray-500 opacity-0 group-hover:opacity-100 flex-shrink-0 ml-auto transition-opacity"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
          </motion.a>
        );
      })}
    </div>
  );
};

export default LinkList;
