import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { parseQuickAdd, getQuickAddSuggestions } from '../utils/quickAddParser';

const QuickAdd = ({ onAddTask, folders, tags, onCreateTag }) => {
  const [input, setInput] = useState('');
  const [preview, setPreview] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [showHelp, setShowHelp] = useState(false);
  const inputRef = useRef(null);

  // Parse input and update preview
  useEffect(() => {
    if (input.trim()) {
      const parsed = parseQuickAdd(input, tags, folders);
      setPreview(parsed);
      setSuggestions(getQuickAddSuggestions(input, tags, folders));
    } else {
      setPreview(null);
      setSuggestions([]);
    }
  }, [input, tags, folders]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!preview || !preview.title.trim()) return;

    // Create tags that don't exist
    let tagIds = [...preview.tagIds];
    for (const tagName of preview.tagNames) {
      if (onCreateTag) {
        // Create tag and get its ID
        const newTag = {
          name: tagName.charAt(0).toUpperCase() + tagName.slice(1),
          color: getRandomColor(),
        };
        onCreateTag(newTag);
        // Note: In a real app, we'd need to wait for the tag to be created
        // and get its ID. For now, we'll skip adding these new tags.
      }
    }

    const taskData = {
      title: preview.title,
      description: '',
      deadline: preview.deadline,
      priority: preview.priority,
      folderId: preview.folderId,
      tagIds: tagIds,
      assignee: preview.assignee,
      links: [],
      checklist: [],
    };

    onAddTask(taskData);
    setInput('');
    setPreview(null);
  };

  const applySuggestion = (suggestion) => {
    // Replace the partial match with the suggestion
    let newInput = input;
    if (suggestion.type === 'tag') {
      newInput = input.replace(/#\w*$/, suggestion.value + ' ');
    } else if (suggestion.type === 'folder') {
      newInput = input.replace(/\/\w*$/, suggestion.value + ' ');
    } else if (suggestion.type === 'priority') {
      newInput = input.replace(/!$/, suggestion.value + ' ');
    } else if (suggestion.type === 'date') {
      const words = input.split(' ');
      words[words.length - 1] = suggestion.value;
      newInput = words.join(' ') + ' ';
    }
    setInput(newInput);
    inputRef.current?.focus();
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-400 bg-red-500/20';
      case 'low': return 'text-emerald-400 bg-emerald-500/20';
      default: return 'text-amber-400 bg-amber-500/20';
    }
  };

  return (
    <div className="card p-4">
      <form onSubmit={handleSubmit}>
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <div className="relative">
              <svg
                className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Quick add: Buy milk tomorrow #shopping !high"
                className="w-full pl-10 pr-10 py-3 rounded-xl input-dark text-white placeholder-gray-500"
              />
              <button
                type="button"
                onClick={() => setShowHelp(!showHelp)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>
            </div>

            {/* Suggestions dropdown */}
            <AnimatePresence>
              {suggestions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-full left-0 right-0 mt-1 bg-dark-700 border border-dark-400 rounded-xl overflow-hidden z-10"
                >
                  {suggestions.map((s, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => applySuggestion(s)}
                      className="w-full px-4 py-2 text-left text-sm hover:bg-dark-600 flex items-center gap-2"
                    >
                      <span className="text-gray-500">{s.value}</span>
                      <span className="text-gray-400">{s.label}</span>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={!preview?.title?.trim()}
            className="px-6 py-3 rounded-xl btn-primary disabled:opacity-50"
          >
            Add
          </motion.button>
        </div>

        {/* Preview */}
        <AnimatePresence>
          {preview && preview.title && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-3 p-3 rounded-lg bg-dark-600 border border-dark-400"
            >
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-white font-medium">{preview.title}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${getPriorityColor(preview.priority)}`}>
                  {preview.priority}
                </span>
                {preview.deadline && (
                  <span className="text-xs text-gray-400 flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {preview.deadline}
                  </span>
                )}
                {preview.assignee && (
                  <span className="text-xs text-gray-400">@{preview.assignee}</span>
                )}
                {preview.folderId && (
                  <span className="text-xs text-gray-400">
                    /{folders.find(f => f.id === preview.folderId)?.name}
                  </span>
                )}
                {preview.tagIds.map(tagId => {
                  const tag = tags.find(t => t.id === tagId);
                  return tag ? (
                    <span key={tagId} className="text-xs text-gray-400">#{tag.name}</span>
                  ) : null;
                })}
                {preview.tagNames.map(name => (
                  <span key={name} className="text-xs text-amber-400">#{name} (new)</span>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Help panel */}
        <AnimatePresence>
          {showHelp && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-3 p-4 rounded-lg bg-dark-600 border border-dark-400 text-sm"
            >
              <h4 className="font-semibold text-white mb-2">Quick Add Syntax</h4>
              <div className="grid grid-cols-2 gap-2 text-gray-400">
                <div><code className="text-emerald-400">!high</code> or <code className="text-emerald-400">!h</code></div>
                <div>High priority</div>
                <div><code className="text-emerald-400">!medium</code> or <code className="text-emerald-400">!m</code></div>
                <div>Medium priority</div>
                <div><code className="text-emerald-400">!low</code> or <code className="text-emerald-400">!l</code></div>
                <div>Low priority</div>
                <div><code className="text-emerald-400">#tagname</code></div>
                <div>Add a tag</div>
                <div><code className="text-emerald-400">@name</code></div>
                <div>Assign to someone</div>
                <div><code className="text-emerald-400">/folder</code></div>
                <div>Set folder</div>
                <div><code className="text-emerald-400">today</code></div>
                <div>Due today</div>
                <div><code className="text-emerald-400">tomorrow</code></div>
                <div>Due tomorrow</div>
                <div><code className="text-emerald-400">monday</code>-<code className="text-emerald-400">sunday</code></div>
                <div>Due on that day</div>
                <div><code className="text-emerald-400">next week</code></div>
                <div>Due in 7 days</div>
                <div><code className="text-emerald-400">in 3 days</code></div>
                <div>Due in X days</div>
              </div>
              <p className="mt-3 text-gray-500">
                Example: <code className="text-white">Buy milk tomorrow #shopping !high @john</code>
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </form>
    </div>
  );
};

// Helper to get random color for new tags
const getRandomColor = () => {
  const colors = ['red', 'orange', 'amber', 'yellow', 'lime', 'green', 'emerald', 'teal', 'cyan', 'sky', 'blue', 'indigo', 'violet', 'purple', 'fuchsia', 'pink', 'rose'];
  return colors[Math.floor(Math.random() * colors.length)];
};

export default QuickAdd;
