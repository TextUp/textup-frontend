export const TRUE = 'true';
export const FALSE = 'false';

export function showManagerKey(username) {
  return `task-manager-${username}-shouldShowTaskManager`;
}

export function taskKey(username, taskId) {
  return `task-manager-${username}-${taskId}`;
}

export function tourKey(username) {
  return `tour-manager-${username}-finished-tour`;
}
