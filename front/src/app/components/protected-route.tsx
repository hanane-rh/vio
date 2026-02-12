// src/app/components/protected-route.tsx

import { Navigate, useLocation } from 'react-router-dom';
import { ReactNode, useEffect } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const location = useLocation();
  const token = localStorage.getItem('vio-auth-token');
  const profileStr = localStorage.getItem('vio-user-profile');

  // Pas de token → rediriger vers login
  if (!token) {
    console.log('🔒 No token - redirecting to login');
    return <Navigate to="/login" replace />;
  }

  // Token existe, vérifier si onboarding est complété
  if (profileStr) {
    try {
      const profile = JSON.parse(profileStr);
      
      // Si onboarding pas complété → rediriger vers onboarding
      if (!profile.hasCompletedOnboarding) {
        console.log('📋 Onboarding not completed - redirecting');
        return <Navigate to="/welcome" replace />;
      }
    } catch (e) {
      console.error('❌ Error parsing profile:', e);
    }
  }

  // Tout est bon, afficher la page
  return <>{children}</>;
}