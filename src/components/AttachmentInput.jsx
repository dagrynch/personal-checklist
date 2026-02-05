import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  validateFile,
  createAttachment,
  canAddAttachment,
  formatFileSize,
  ATTACHMENT_LIMITS,
} from '../utils/attachmentUtils';

const AttachmentInput = ({ existingAttachments = [], onAdd }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const processFile = useCallback(async (file) => {
    setError(null);

    // Validate file
    const validation = validateFile(file);
    if (!validation.valid) {
      setError(validation.error);
      return;
    }

    // Check total size limit
    const canAdd = canAddAttachment(existingAttachments, file.size);
    if (!canAdd.allowed) {
      setError(canAdd.error);
      return;
    }

    setIsProcessing(true);

    try {
      const attachment = await createAttachment(file);
      onAdd(attachment);

      if (validation.warning) {
        setError(validation.warning);
      }
    } catch (err) {
      setError(err.message || 'Failed to process file');
    } finally {
      setIsProcessing(false);
    }
  }, [existingAttachments, onAdd]);

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files || []);
    files.forEach(processFile);
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files || []);
    files.forEach(processFile);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-2">
      {/* Drop Zone */}
      <motion.div
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        animate={{
          borderColor: isDragging ? 'rgb(16, 185, 129)' : 'rgb(55, 65, 81)',
          backgroundColor: isDragging ? 'rgba(16, 185, 129, 0.1)' : 'transparent',
        }}
        className="border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-colors hover:border-emerald-500/50 hover:bg-emerald-500/5"
      >
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileSelect}
          accept={ATTACHMENT_LIMITS.ALLOWED_TYPES.join(',')}
          className="hidden"
          multiple
        />

        {isProcessing ? (
          <div className="flex items-center justify-center gap-2 text-gray-400">
            <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            <span>Processing...</span>
          </div>
        ) : (
          <div className="text-gray-400">
            <svg className="w-8 h-8 mx-auto mb-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <p className="text-sm">
              {isDragging ? (
                'Drop files here'
              ) : (
                <>
                  <span className="text-emerald-400 hover:underline">Click to upload</span>
                  {' '}or drag and drop
                </>
              )}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Images, PDF, text up to {formatFileSize(ATTACHMENT_LIMITS.MAX_FILE_SIZE)}
            </p>
          </div>
        )}
      </motion.div>

      {/* Error/Warning Message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`flex items-start gap-2 p-3 rounded-lg text-sm ${
              error.includes('warning') || error.includes('Large')
                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                : 'bg-red-500/10 text-red-400 border border-red-500/30'
            }`}
          >
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div className="flex-1">
              <p>{error}</p>
              <button
                onClick={() => setError(null)}
                className="text-xs underline mt-1 opacity-75 hover:opacity-100"
              >
                Dismiss
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AttachmentInput;
