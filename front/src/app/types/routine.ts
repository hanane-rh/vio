export interface RoutineTask {
  id: string;
  title: string;
  time: string; // HH:MM format
  frequency: 'daily' | 'weekly' | 'custom';
  customDays?: number[]; // 0-6 for Sunday-Saturday
  notes?: string;
  icon?: string;
  isPaused: boolean;
  createdAt: string;
  lastCompleted?: string;
  completionDates: string[]; // Array of ISO date strings
}

export interface RoutineCompletion {
  taskId: string;
  completedAt: string;
  date: string; // YYYY-MM-DD format
}

export const ROUTINE_ICONS = [
  { value: 'pill', label: 'Medication', emoji: '💊' },
  { value: 'activity', label: 'Exercise', emoji: '🏃' },
  { value: 'food', label: 'Nutrition', emoji: '🥗' },
  { value: 'water', label: 'Hydration', emoji: '💧' },
  { value: 'sleep', label: 'Rest', emoji: '😴' },
  { value: 'meditation', label: 'Mindfulness', emoji: '🧘' },
  { value: 'heart', label: 'Self-care', emoji: '❤️' },
  { value: 'book', label: 'Learning', emoji: '📖' },
  { value: 'phone', label: 'Connection', emoji: '📞' },
  { value: 'check', label: 'General Task', emoji: '✓' },
];

export const REMINDER_MESSAGES = [
  "It might be time for your treatment step. You are doing great.",
  "A small step today supports your healing tomorrow.",
  "We are here whenever you are ready.",
  "Time for a gentle reminder — your health matters.",
  "This moment is for your wellbeing. You have got this.",
  "A caring nudge to support your journey today.",
  "Your healing routine is calling — no pressure, just support.",
];