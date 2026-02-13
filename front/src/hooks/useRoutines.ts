// src/hooks/useRoutines.ts - IMPROVED VERSION WITH ERROR HANDLING

import { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import type { Routine, UserScore, RoutinePayload } from '../types/routine';
import { toast } from 'sonner';

export function useRoutines() {
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadRoutines = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getRoutines();
      
      // ✅ CRITICAL: Ensure data is an array
      if (!Array.isArray(data)) {
        console.error('API returned non-array data:', data);
        setRoutines([]);
        setError('Invalid data format received from server');
        return;
      }
      
      setRoutines(data);
    } catch (err: any) {
      console.error('Failed to load routines:', err);
      setError(err.detail || err.message || 'Failed to load routines');
      setRoutines([]); // ✅ Always set to empty array on error
      
      // Show user-friendly error message
      if (err.detail?.includes('Authentication') || err.detail?.includes('401')) {
        toast.error('Please log in to view your routines');
      } else {
        toast.error('Failed to load routines. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRoutines();
  }, [loadRoutines]);

  const createRoutine = async (data: RoutinePayload) => {
    try {
      const newRoutine = await api.createRoutine(data);
      setRoutines(prev => [...prev, newRoutine]);
      toast.success('Routine created successfully');
      return newRoutine;
    } catch (err: any) {
      console.error('Failed to create routine:', err);
      toast.error(err.detail || 'Failed to create routine');
      throw err;
    }
  };

  const updateRoutine = async (id: number, data: Partial<RoutinePayload>) => {
    try {
      const updated = await api.updateRoutine(id, data);
      setRoutines(prev => prev.map(r => r.id === id ? updated : r));
      toast.success('Routine updated successfully');
      return updated;
    } catch (err: any) {
      console.error('Failed to update routine:', err);
      toast.error(err.detail || 'Failed to update routine');
      throw err;
    }
  };

  const deleteRoutine = async (id: number) => {
    try {
      await api.deleteRoutine(id);
      setRoutines(prev => prev.filter(r => r.id !== id));
      toast.success('Routine removed');
    } catch (err: any) {
      console.error('Failed to delete routine:', err);
      toast.error(err.detail || 'Failed to delete routine');
      throw err;
    }
  };

  const completeRoutine = async (id: number) => {
    try {
      const result = await api.completeRoutine(id);
      
      // Update local state
      setRoutines(prev => prev.map(r => {
        if (r.id === id) {
          return {
            ...r,
            last_completed: new Date().toISOString(),
            completion_dates: [...r.completion_dates, result.completion.completion_date]
          };
        }
        return r;
      }));

      toast.success('Beautiful! Routine completed', {
        description: `+${result.points_earned} points! Total: ${result.score.total_score}`,
      });

      return result;
    } catch (err: any) {
      console.error('Failed to complete routine:', err);
      if (err.detail === 'Routine already completed today') {
        toast.error('Already completed today');
      } else {
        toast.error(err.detail || 'Failed to complete routine');
      }
      throw err;
    }
  };

  const togglePause = async (id: number) => {
    try {
      const result = await api.toggleRoutinePause(id);
      setRoutines(prev => prev.map(r => r.id === id ? result.routine : r));
      toast.success(result.detail);
      return result.routine;
    } catch (err: any) {
      console.error('Failed to toggle pause:', err);
      toast.error(err.detail || 'Failed to update routine');
      throw err;
    }
  };

  return {
    routines,
    loading,
    error,
    reload: loadRoutines,
    createRoutine,
    updateRoutine,
    deleteRoutine,
    completeRoutine,
    togglePause
  };
}

export function useTodayRoutines() {
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTodayRoutines = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getTodayRoutines();
      
      // ✅ Ensure data is an array
      setRoutines(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error('Failed to load today\'s routines:', err);
      setError(err.detail || 'Failed to load today\'s routines');
      setRoutines([]); // ✅ Always set to empty array on error
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTodayRoutines();
  }, [loadTodayRoutines]);

  return { routines, loading, error, reload: loadTodayRoutines };
}

export function useUserScore() {
  const [score, setScore] = useState<UserScore | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadScore = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getCurrentScore();
      setScore(data);
    } catch (err: any) {
      console.error('Failed to load score:', err);
      setError(err.detail || 'Failed to load score');
      setScore(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadScore();
  }, [loadScore]);

  return { score, loading, error, reload: loadScore };
}

export function useLeaderboard() {
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadLeaderboard = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getLeaderboard();
      
      // ✅ Ensure data is an array
      setLeaderboard(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error('Failed to load leaderboard:', err);
      setError(err.detail || 'Failed to load leaderboard');
      setLeaderboard([]); // ✅ Always set to empty array on error
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadLeaderboard();
  }, [loadLeaderboard]);

  return { leaderboard, loading, error, reload: loadLeaderboard };
}