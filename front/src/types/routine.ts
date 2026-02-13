// src/types/routine.ts - TYPE DEFINITIONS FOR BACKEND INTEGRATION

export interface Routine {
  id: number;
  title: string;
  time: string;  // Format: "09:00:00"
  frequency: 'daily' | 'weekly' | 'custom';
  notes: string;
  icon: string;
  custom_days: number[] | null;  // [0,1,2,3,4,5,6] for days of week
  is_paused: boolean;
  created_at: string;
  updated_at: string;
  last_completed: string | null;
  completion_dates: string[];  // ["2026-02-13", "2026-02-14"]
}

export interface RoutineCompletion {
  id: number;
  routine: number;
  routine_title: string;
  completion_date: string;  // "2026-02-13"
  completed_at: string;     // ISO datetime
}

export interface UserScore {
  id: number;
  username: string;
  total_score: number;
  total_completions: number;
  current_streak: number;
  longest_streak: number;
  last_completion_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface ScoreHistory {
  id: number;
  points_earned: number;
  reason: string;
  routine: number | null;
  routine_title: string | null;
  created_at: string;
}

export interface LeaderboardEntry {
  rank: number;
  username: string;
  total_score: number;
  total_completions: number;
  current_streak: number;
}

export interface CompleteRoutineResponse {
  detail: string;
  completion: RoutineCompletion;
  score: UserScore;
  points_earned: number;
}

export interface RoutineStatistics {
  total_routines: number;
  active_routines: number;
  paused_routines: number;
  completions_today: number;
  completions_this_week: number;
}

// Routine creation/update payload
export interface RoutinePayload {
  title: string;
  time: string;  // "09:00:00"
  frequency: 'daily' | 'weekly' | 'custom';
  notes?: string;
  icon?: string;
  custom_days?: number[] | null;
}

// API Error Response
export interface ApiError {
  detail?: string;
  error?: string;
  [key: string]: any;
}

// ROUTINE ICONS (keep your existing ones)
export const ROUTINE_ICONS = [
  { value: 'pill', emoji: '💊', label: 'Medication' },
  { value: 'yoga', emoji: '🧘', label: 'Yoga' },
  { value: 'water', emoji: '💧', label: 'Hydration' },
  { value: 'food', emoji: '🥗', label: 'Nutrition' },
  { value: 'sleep', emoji: '😴', label: 'Sleep' },
  { value: 'walk', emoji: '🚶', label: 'Walk' },
  { value: 'meditation', emoji: '🧠', label: 'Meditation' },
  { value: 'vitamin', emoji: '🌿', label: 'Vitamins' },
  { value: 'exercise', emoji: '💪', label: 'Exercise' },
  { value: 'heart', emoji: '❤️', label: 'Self-care' },
];

// REMINDER MESSAGES (keep your existing ones)
export const REMINDER_MESSAGES = [
  "A gentle reminder from your future self",
  "Time for your routine - you've got this",
  "Your healing journey continues",
  "Every step matters",
  "Taking care of yourself today",
];

// DAYS OF WEEK
export const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];