import { useState, useEffect, useCallback } from 'react';
import { isDueSoon, formatDate } from '../utils/dateUtils';

export const useNotifications = (tasks) => {
  const [permission, setPermission] = useState('default');
  const [notifiedTasks, setNotifiedTasks] = useState(new Set());

  // Check and update permission status
  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  // Request notification permission
  const requestPermission = useCallback(async () => {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications');
      return false;
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result === 'granted';
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }, []);

  // Send a notification
  const sendNotification = useCallback(
    (title, options = {}) => {
      if (permission !== 'granted') return;

      try {
        const notification = new Notification(title, {
          icon: '/vite.svg',
          badge: '/vite.svg',
          ...options,
        });

        notification.onclick = () => {
          window.focus();
          notification.close();
        };

        // Auto-close after 5 seconds
        setTimeout(() => notification.close(), 5000);
      } catch (error) {
        console.error('Error sending notification:', error);
      }
    },
    [permission]
  );

  // Check for tasks due soon and send notifications
  useEffect(() => {
    if (permission !== 'granted') return;

    const checkTasks = () => {
      tasks.forEach((task) => {
        if (
          !task.completed &&
          task.deadline &&
          isDueSoon(task.deadline, 24) &&
          !notifiedTasks.has(task.id)
        ) {
          sendNotification(`Task Due Soon: ${task.title}`, {
            body: `Due: ${formatDate(task.deadline)}${task.description ? `\n${task.description}` : ''}`,
            tag: `task-${task.id}`,
          });
          setNotifiedTasks((prev) => new Set([...prev, task.id]));
        }
      });
    };

    // Check immediately and then every 30 minutes
    checkTasks();
    const interval = setInterval(checkTasks, 30 * 60 * 1000);

    return () => clearInterval(interval);
  }, [tasks, permission, notifiedTasks, sendNotification]);

  // Reset notified tasks at midnight
  useEffect(() => {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    const msUntilMidnight = tomorrow - now;

    const timeout = setTimeout(() => {
      setNotifiedTasks(new Set());
    }, msUntilMidnight);

    return () => clearTimeout(timeout);
  }, []);

  return {
    permission,
    requestPermission,
    sendNotification,
    isSupported: 'Notification' in window,
  };
};

export default useNotifications;
