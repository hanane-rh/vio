// src/context/user-context.tsx (UPDATED VERSION)
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserProfile } from '../types/avatar';
import { apiService } from '../services/api';

interface UserContextType {
  profile: UserProfile | null;
  setProfile: (profile: UserProfile) => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
  isLoading: boolean;
  error: string | null;
  authToken: string | null;
  setAuthToken: (token: string) => void;
  logout: () => Promise<void>;
  syncWithBackend: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [profile, setProfileState] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('carepath-user-profile');
    return saved ? JSON.parse(saved) : null;
  });

  const [authToken, setAuthTokenState] = useState<string | null>(() => {
    return localStorage.getItem('carepath-auth-token');
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sync local profile avec le backend au chargement
  useEffect(() => {
    if (authToken && !profile) {
      syncWithBackend();
    }
  }, [authToken]);

  // Sauvegarder le profile en local
  useEffect(() => {
    if (profile) {
      localStorage.setItem('carepath-user-profile', JSON.stringify(profile));
    }
  }, [profile]);

  const setAuthToken = (token: string) => {
    setAuthTokenState(token);
    localStorage.setItem('carepath-auth-token', token);
  };

  const setProfile = (newProfile: UserProfile) => {
    setProfileState(newProfile);
  };

  const updateProfile = (updates: Partial<UserProfile>) => {
    setProfileState(prev => prev ? { ...prev, ...updates } : null);
  };

  const syncWithBackend = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Récupérer le profil du backend
      const response = await apiService.getUserProfile();
      const backendProfile = response.data;

      // Merger avec les données locales si nécessaire
      const syncedProfile: UserProfile = {
        hasCompletedOnboarding: backendProfile.has_completed_onboarding,
        avatar: backendProfile.avatar || {
          appearance: 'gentle',
          expression: 'warm',
          tone: 'encouraging',
          name: 'Your Future Self',
        },
        startDate: backendProfile.start_date,
      };

      setProfileState(syncedProfile);
    } catch (err: any) {
      setError(err.message || 'Failed to sync profile');
      console.error('Sync error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await apiService.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      localStorage.removeItem('carepath-auth-token');
      localStorage.removeItem('carepath-user-profile');
      setAuthTokenState(null);
      setProfileState(null);
    }
  };

  return (
    <UserContext.Provider
      value={{
        profile,
        setProfile,
        updateProfile,
        isLoading,
        error,
        authToken,
        setAuthToken,
        logout,
        syncWithBackend,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within UserProvider');
  }
  return context;
}