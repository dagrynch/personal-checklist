import { motion, AnimatePresence } from 'framer-motion';
import { formatFileSize, getFileTypeIcon, isImage } from '../utils/attachmentUtils';

const AttachmentPreview = ({ attachments = [], onRemove, readOnly = false }) => {
  if (attachments.length === 0) return null;

  const handleOpen = (attachment) => {
    if (attachment.url) {
      window.open(attachment.url, '_blank');
    } else if (attachment.data) {
      // Open base64 in new tab
      const win = window.open();
      if (win) {
        if (isImage(attachment.type)) {
          win.document.write(`<img src="${attachment.data}" alt="${attachment.name}" style="max-width: 100%; height: auto;" />`);
        } else if (attachment.type === 'application/pdf') {
          win.document.write(`<iframe src="${attachment.data}" style="width: 100%; height: 100%; border: none;"></iframe>`);
        } else {
          // For text files, decode and display
          const base64Content = attachment.data.split(',')[1];
          const decoded = atob(base64Content);
          win.document.write(`<pre style="white-space: pre-wrap; word-wrap: break-word; padding: 20px; font-family: monospace;">${decoded}</pre>`);
        }
        win.document.title = attachment.name;
      }
    }
  };

  const getIcon = (type) => {
    const iconType = getFileTypeIcon(type);
    switch (iconType) {
      case 'image':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        );
      case 'pdf':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        );
      case 'text':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
          </svg>
        );
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <AnimatePresence mode="popLayout">
        {attachments.map((attachment) => (
          <motion.div
            key={attachment.id}
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="flex items-center gap-3 p-3 bg-dark-600 rounded-xl border border-dark-400 group"
          >
            {/* Thumbnail or Icon */}
            <div className="flex-shrink-0">
              {isImage(attachment.type) && (attachment.thumbnailData || attachment.data) ? (
                <img
                  src={attachment.thumbnailData || attachment.data}
                  alt={attachment.name}
                  className="w-12 h-12 object-cover rounded-lg"
                />
              ) : (
                <div className="w-12 h-12 bg-dark-500 rounded-lg flex items-center justify-center text-gray-400">
                  {getIcon(attachment.type)}
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="text-sm text-white truncate">{attachment.name}</p>
              <p className="text-xs text-gray-500">{formatFileSize(attachment.size)}</p>
              {attachment.warning && (
                <p className="text-xs text-amber-400 mt-0.5">{attachment.warning}</p>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1">
              {/* Open/View Button */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => handleOpen(attachment)}
                className="p-2 rounded-lg text-gray-500 hover:text-emerald-400 hover:bg-emerald-500/10 transition-colors"
                title="Open"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </motion.button>

              {/* Remove Button */}
              {!readOnly && onRemove && (
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => onRemove(attachment.id)}
                  className="p-2 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-colors opacity-0 group-hover:opacity-100"
                  title="Remove"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </motion.button>
              )}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default AttachmentPreview;
