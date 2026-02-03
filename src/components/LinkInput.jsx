import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { isValidUrl, createLink, LINK_TYPES } from '../utils/linkUtils';
import LinkTypeIcon from './LinkTypeIcon';

const LinkInput = ({ links = [], onChange }) => {
  const [inputValue, setInputValue] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState('');

  const handleAdd = () => {
    if (!inputValue.trim()) return;

    // Add protocol if missing
    let url = inputValue.trim();
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }

    if (!isValidUrl(url)) {
      setError('Please enter a valid URL');
      return;
    }

    const newLink = createLink(url);
    onChange([...links, newLink]);
    setInputValue('');
    setError('');
  };

  const handleRemove = (linkId) => {
    onChange(links.filter(l => l.id !== linkId));
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAdd();
    } else if (e.key === 'Escape') {
      setIsAdding(false);
      setInputValue('');
      setError('');
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-400 mb-2">
        Links
      </label>

      {/* Existing Links */}
      {links.length > 0 && (
        <div className="space-y-2 mb-3">
          {links.map((link) => {
            const type = LINK_TYPES[Object.keys(LINK_TYPES).find(k =>
              LINK_TYPES[k].id === link.type
            )] || LINK_TYPES.GENERIC;

            return (
              <motion.div
                key={link.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg ${type.bgColor} border border-dark-400 group`}
              >
                <LinkTypeIcon type={link.type} className="w-4 h-4 flex-shrink-0" />
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex-1 text-sm ${type.color} hover:underline truncate`}
                  title={link.url}
                >
                  {link.title}
                </a>
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleRemove(link.id)}
                  className="p-1 rounded opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-400 transition-all"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </motion.button>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Add Link */}
      <AnimatePresence mode="wait">
        {isAdding ? (
          <motion.div
            key="input"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2"
          >
            <div className="flex gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => {
                  setInputValue(e.target.value);
                  setError('');
                }}
                onKeyDown={handleKeyDown}
                placeholder="Paste URL here..."
                className="flex-1 px-3 py-2 rounded-lg input-dark text-white text-sm placeholder-gray-500"
                autoFocus
              />
              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleAdd}
                className="px-3 py-2 rounded-lg btn-primary text-sm"
              >
                Add
              </motion.button>
              <motion.button
                type="button"
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setIsAdding(false);
                  setInputValue('');
                  setError('');
                }}
                className="px-3 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-dark-500 transition-colors text-sm"
              >
                Cancel
              </motion.button>
            </div>
            {error && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-xs text-red-400"
              >
                {error}
              </motion.p>
            )}
          </motion.div>
        ) : (
          <motion.button
            key="button"
            type="button"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setIsAdding(true)}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg border border-dashed border-dark-400 text-gray-500 hover:border-emerald-500/50 hover:text-emerald-400 transition-colors text-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
            Add link
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LinkInput;
