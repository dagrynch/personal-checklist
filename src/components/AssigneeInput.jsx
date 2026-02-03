import { useState, useRef, useMemo } from 'react';
import { AnimatePresence } from 'framer-motion';
import AssigneeAvatar from './AssigneeAvatar';

const AssigneeInput = ({ value, onChange, tasks = [] }) => {
  const [isOpen, setIsOpen] = useState(false);
  // Derive input value from prop - controlled component pattern
  const inputValue = value || '';
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  // Get unique assignees from all tasks
  const assigneeHistory = useMemo(() => {
    const assignees = tasks
      .map(t => t.assignee)
      .filter(Boolean)
      .filter((name, index, arr) => arr.indexOf(name) === index);

    return assignees.sort((a, b) => a.localeCompare(b));
  }, [tasks]);

  // Filter suggestions based on input
  const suggestions = useMemo(() => {
    if (!inputValue) return assigneeHistory;

    return assigneeHistory.filter(name =>
      name.toLowerCase().includes(inputValue.toLowerCase())
    );
  }, [inputValue, assigneeHistory]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
        // Update value on blur if changed
        if (inputValue !== value) {
          onChange(inputValue.trim() || null);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [inputValue, value, onChange]);

  const handleInputChange = (e) => {
    onChange(e.target.value || null);
    setIsOpen(true);
  };

  const handleSelect = (name) => {
    onChange(name);
    setIsOpen(false);
    inputRef.current?.blur();
  };

  const handleClear = () => {
    onChange(null);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onChange(inputValue.trim() || null);
      setIsOpen(false);
      inputRef.current?.blur();
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      inputRef.current?.blur();
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <label className="block text-sm font-medium text-gray-400 mb-2">
        Assignee
      </label>

      <div className="relative">
        {/* Avatar prefix when assigned */}
        {value && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2">
            <AssigneeAvatar name={value} size="sm" />
          </div>
        )}

        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Assign to someone..."
          className={`w-full py-2.5 rounded-xl input-dark text-white placeholder-gray-500 pr-10 ${
            value ? 'pl-12' : 'pl-4'
          }`}
        />

        {/* Clear button */}
        {value && (
          <motion.button
            type="button"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg text-gray-500 hover:text-white hover:bg-dark-500 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </motion.button>
        )}
      </div>

      {/* Suggestions Dropdown */}
      <AnimatePresence>
        {isOpen && assigneeHistory.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute left-0 right-0 mt-2 bg-dark-600 border border-dark-400 rounded-xl shadow-xl z-20 overflow-hidden"
          >
            <div className="max-h-48 overflow-y-auto p-2">
              {suggestions.length > 0 ? (
                <>
                  <p className="px-3 py-1 text-xs text-gray-500">Recent assignees</p>
                  {suggestions.map((name) => (
                    <motion.button
                      key={name}
                      type="button"
                      whileHover={{ x: 4 }}
                      onClick={() => handleSelect(name)}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-dark-500 transition-colors"
                    >
                      <AssigneeAvatar name={name} size="sm" />
                      <span className="text-sm text-white">{name}</span>
                    </motion.button>
                  ))}
                </>
              ) : inputValue ? (
                <div className="px-3 py-2">
                  <p className="text-sm text-gray-500">
                    Press Enter to assign to "{inputValue}"
                  </p>
                </div>
              ) : null}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AssigneeInput;
