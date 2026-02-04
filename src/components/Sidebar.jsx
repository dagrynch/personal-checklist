import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import FolderModal from './FolderModal';
import TagManager from './TagManager';

const FOLDER_ICONS = {
  inbox: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
    </svg>
  ),
  folder: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
    </svg>
  ),
  work: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  ),
  personal: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  ),
  star: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
    </svg>
  ),
  archive: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
    </svg>
  ),
};

const FOLDER_COLORS = {
  gray: 'text-gray-400',
  red: 'text-red-400',
  orange: 'text-orange-400',
  amber: 'text-amber-400',
  yellow: 'text-yellow-400',
  lime: 'text-lime-400',
  green: 'text-green-400',
  emerald: 'text-emerald-400',
  teal: 'text-teal-400',
  cyan: 'text-cyan-400',
  sky: 'text-sky-400',
  blue: 'text-blue-400',
  indigo: 'text-indigo-400',
  violet: 'text-violet-400',
  purple: 'text-purple-400',
  fuchsia: 'text-fuchsia-400',
  pink: 'text-pink-400',
  rose: 'text-rose-400',
};

const Sidebar = ({
  folders,
  tags,
  tasks,
  activeFolderId,
  onSelectFolder,
  onCreateFolder,
  onUpdateFolder,
  onDeleteFolder,
  onCreateTag,
  onUpdateTag,
  onDeleteTag,
  isOpen,
  onClose,
  onShowDashboard,
  showDashboard,
}) => {
  const [folderModal, setFolderModal] = useState({ isOpen: false, folder: null });
  const [showTagManager, setShowTagManager] = useState(false);

  const getTaskCount = (folderId) => {
    if (folderId === 'inbox' || folderId === null) {
      return tasks.filter(t => !t.folderId || t.folderId === 'inbox').filter(t => !t.completed).length;
    }
    return tasks.filter(t => t.folderId === folderId).filter(t => !t.completed).length;
  };

  const handleFolderClick = (folderId) => {
    onSelectFolder(folderId);
    onClose?.();
  };

  const handleEditFolder = (folder, e) => {
    e.stopPropagation();
    setFolderModal({ isOpen: true, folder });
  };

  const handleSaveFolder = (folderData) => {
    if (folderModal.folder) {
      onUpdateFolder({ ...folderModal.folder, ...folderData });
    } else {
      onCreateFolder(folderData);
    }
    setFolderModal({ isOpen: false, folder: null });
  };

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Dashboard Button */}
      <div className="p-4 border-b border-dark-400">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            onShowDashboard(!showDashboard);
            onClose?.();
          }}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
            showDashboard
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              : 'bg-dark-600 text-gray-300 border border-dark-400 hover:border-emerald-500/50'
          }`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <span className="font-medium">Dashboard</span>
        </motion.button>
      </div>

      {/* Folders Section */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Folders</h3>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setFolderModal({ isOpen: true, folder: null })}
            className="p-1 rounded-lg text-gray-500 hover:text-emerald-400 hover:bg-emerald-500/10 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </motion.button>
        </div>

        <div className="space-y-1">
          {folders.map((folder) => (
            <motion.button
              key={folder.id}
              whileHover={{ x: 4 }}
              onClick={() => handleFolderClick(folder.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group ${
                activeFolderId === folder.id && !showDashboard
                  ? 'bg-emerald-500/20 text-emerald-400'
                  : 'text-gray-400 hover:bg-dark-500 hover:text-white'
              }`}
            >
              <span className={FOLDER_COLORS[folder.color] || 'text-gray-400'}>
                {FOLDER_ICONS[folder.icon] || FOLDER_ICONS.folder}
              </span>
              <span className="flex-1 text-left text-sm font-medium truncate">{folder.name}</span>
              <span className="text-xs text-gray-600 group-hover:text-gray-400">
                {getTaskCount(folder.id)}
              </span>
              {!folder.isDefault && (
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  onClick={(e) => handleEditFolder(folder, e)}
                  className="p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-dark-400 transition-all"
                  title="Edit or delete folder"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </motion.button>
              )}
            </motion.button>
          ))}
        </div>

        {/* Tags Section */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Tags</h3>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setShowTagManager(true)}
              className="p-1 rounded-lg text-gray-500 hover:text-emerald-400 hover:bg-emerald-500/10 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </motion.button>
          </div>

          {tags.length === 0 ? (
            <p className="text-xs text-gray-600 px-3">No tags yet. Click the settings icon to add tags.</p>
          ) : (
            <div className="flex flex-wrap gap-2 px-1">
              {tags.map((tag) => (
                <span
                  key={tag.id}
                  className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                    `bg-${tag.color}-500/20 text-${tag.color}-400 border border-${tag.color}-500/30`
                  }`}
                  style={{
                    backgroundColor: `rgb(var(--color-${tag.color}-500) / 0.2)`,
                    color: `rgb(var(--color-${tag.color}-400))`,
                  }}
                >
                  {tag.name}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <FolderModal
        isOpen={folderModal.isOpen}
        folder={folderModal.folder}
        onClose={() => setFolderModal({ isOpen: false, folder: null })}
        onSave={handleSaveFolder}
        onDelete={folderModal.folder && !folderModal.folder.isDefault ? () => {
          onDeleteFolder(folderModal.folder.id);
          setFolderModal({ isOpen: false, folder: null });
        } : null}
      />

      <TagManager
        isOpen={showTagManager}
        tags={tags}
        onClose={() => setShowTagManager(false)}
        onCreateTag={onCreateTag}
        onUpdateTag={onUpdateTag}
        onDeleteTag={onDeleteTag}
      />
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:block w-64 flex-shrink-0">
        <div className="sticky top-6 card overflow-hidden">
          {sidebarContent}
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="lg:hidden fixed inset-0 bg-black/60 z-40"
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="lg:hidden fixed inset-y-0 left-0 w-72 bg-dark-800 border-r border-dark-400 z-50"
            >
              <div className="flex items-center justify-between p-4 border-b border-dark-400">
                <h2 className="text-lg font-semibold text-white">Menu</h2>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={onClose}
                  className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-dark-500 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </motion.button>
              </div>
              {sidebarContent}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;
