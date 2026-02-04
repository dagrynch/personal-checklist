import { useEffect, useCallback } from 'react';

/**
 * Hook to handle global keyboard shortcuts
 *
 * Shortcuts:
 * - N: New task (focus quick add)
 * - /: Focus search
 * - D: Toggle dashboard
 * - C: Toggle calendar
 * - Escape: Close modals/clear focus
 * - ?: Show shortcuts help
 *
 * @param {Object} handlers - Object with handler functions
 * @param {Function} handlers.onNewTask - Called when N is pressed
 * @param {Function} handlers.onSearch - Called when / is pressed
 * @param {Function} handlers.onToggleDashboard - Called when D is pressed
 * @param {Function} handlers.onToggleCalendar - Called when C is pressed
 * @param {Function} handlers.onEscape - Called when Escape is pressed
 * @param {Function} handlers.onShowHelp - Called when ? is pressed
 * @param {boolean} enabled - Whether shortcuts are enabled
 */
const useKeyboardShortcuts = (handlers = {}, enabled = true) => {
  const handleKeyDown = useCallback((event) => {
    // Don't trigger shortcuts when typing in input fields
    const target = event.target;
    const isInputField = target.tagName === 'INPUT' ||
                         target.tagName === 'TEXTAREA' ||
                         target.isContentEditable;

    // Always allow Escape
    if (event.key === 'Escape') {
      handlers.onEscape?.();
      // Also blur any focused input
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }
      return;
    }

    // Skip other shortcuts if in input field
    if (isInputField) return;

    // Don't trigger if modifier keys are pressed (except for ? which needs Shift)
    if (event.ctrlKey || event.altKey || event.metaKey) return;

    switch (event.key.toLowerCase()) {
      case 'n':
        event.preventDefault();
        handlers.onNewTask?.();
        break;

      case '/':
        event.preventDefault();
        handlers.onSearch?.();
        break;

      case 'd':
        event.preventDefault();
        handlers.onToggleDashboard?.();
        break;

      case 'c':
        event.preventDefault();
        handlers.onToggleCalendar?.();
        break;

      case '?':
        event.preventDefault();
        handlers.onShowHelp?.();
        break;

      default:
        break;
    }
  }, [handlers]);

  useEffect(() => {
    if (!enabled) return;

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown, enabled]);
};

/**
 * List of available shortcuts for display in help
 */
export const KEYBOARD_SHORTCUTS = [
  { key: 'N', description: 'New task (focus quick add)' },
  { key: '/', description: 'Focus search' },
  { key: 'D', description: 'Toggle dashboard view' },
  { key: 'C', description: 'Toggle calendar view' },
  { key: 'Esc', description: 'Close modal / Clear focus' },
  { key: '?', description: 'Show keyboard shortcuts' },
];

export default useKeyboardShortcuts;
