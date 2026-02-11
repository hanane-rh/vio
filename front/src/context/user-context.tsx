// src/context/user-context.tsx

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserProfile } from '../app/types/avatar';
import { apiService } from '../services/api';

interface UserContextType {
  authToken: string | null;
  profile: UserProfile | null;
  setAuthToken: (token: string | null) => void;
  setProfile: (profile: UserProfile | null) => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
  logout: () => void;
  syncWithBackend: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [authToken, setAuthTokenState] = useState<string | null>(() => {
    // Charger le token depuis localStorage au démarrage
    return localStorage.getItem('vio-auth-token');
  });

  const [profile, setProfileState] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('vio-user-profile');
    return saved ? JSON.parse(saved) : null;
  });

  // Sauvegarder le token dans localStorage
  const setAuthToken = (token: string | null) => {
    setAuthTokenState(token);
    if (token) {
      localStorage.setItem('vio-auth-token', token);
      // Configurer le header Authorization dans axios
      apiService.setToken(token);
    } else {
      localStorage.removeItem('vio-auth-token');
      apiService.setToken(null);
    }
  };

  // Sauvegarder le profil dans localStorage
  const setProfile = (newProfile: UserProfile | null) => {
    setProfileState(newProfile);
    if (newProfile) {
      localStorage.setItem('vio-user-profile', JSON.stringify(newProfile));
    } else {
      localStorage.removeItem('vio-user-profile');
    }
  };

  const updateProfile = (updates: Partial<UserProfile>) => {
    if (profile) {
      const updated = { ...profile, ...updates };
      setProfile(updated);
    }
  };

  // Logout
  const logout = async () => {
    try {
      // Optional: notifier le backend
      // await apiService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Nettoyer le client
      setAuthToken(null);
      setProfile(null);
    }
  };

  // Synchroniser avec le backend (fetch profile)
  const syncWithBackend = async () => {
    if (!authToken) {
      setProfile(null);
      return;
    }

    try {
      const response = await apiService.getCurrentProfile();
      setProfile(response.data);
    } catch (error) {
      console.error('Failed to sync profile:', error);
      // Si 401, logout
      if ((error as any).response?.status === 401) {
        logout();
      }
    }
  };

  // Sync avec backend au démarrage si token existe
  useEffect(() => {
    if (authToken) {
      syncWithBackend();
    }
  }, [authToken]);

  return (
    <UserContext.Provider
      value={{
        authToken,
        profile,
        setAuthToken,
        setProfile,
        updateProfile,
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