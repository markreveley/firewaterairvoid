export const PRIORITY_LEVELS = {
  IMMEDIATE: 1,
  PRESSING: 2,
  TODO: 3,
  PAUSED: 4,
  DONE: 5,
} as const;

export type PriorityLevel = typeof PRIORITY_LEVELS[keyof typeof PRIORITY_LEVELS];

export const PRIORITY_CONFIG = {
  [PRIORITY_LEVELS.IMMEDIATE]: {
    name: 'Immediate',
    color: '#991b1b', // dark red (red-800)
    label: 'Immediate',
  },
  [PRIORITY_LEVELS.PRESSING]: {
    name: 'Pressing',
    color: '#dc2626', // red (red-600)
    label: 'Pressing',
  },
  [PRIORITY_LEVELS.TODO]: {
    name: 'To Do',
    color: '#f97316', // orange (orange-500)
    label: 'To Do',
  },
  [PRIORITY_LEVELS.PAUSED]: {
    name: 'Paused',
    color: '#9ca3af', // gray (gray-400)
    label: 'Paused',
  },
  [PRIORITY_LEVELS.DONE]: {
    name: 'Done',
    color: '#6b7280', // darker gray (gray-500)
    label: 'Done',
  },
} as const;
