// src/app/routes.tsx - VERSION CORRIGÉE

import { createBrowserRouter, Navigate } from 'react-router-dom';
import { Layout } from './components/layout';
import { ProtectedRoute } from './components/protected-route';

// Pages protégées
import { Dashboard } from './pages/dashboard';
import { FutureSelfDialogue } from './pages/future-self-dialogue';
import { Constellation } from './pages/constellation';
import { BreathingMeditation } from './pages/breathing-meditation';
import { RoutineBuilder } from './pages/routine-builder';
import { FutureSelfTalkPage } from './pages/future-self-talk';

// Pages d'authentification
import { LoginPage } from './pages/login';
import { SignUpPage } from './pages/signup';

// Pages d'onboarding
import { WelcomePage } from './pages/welcome';
import { AvatarNamePage } from './pages/avatar-name';
import { AvatarCustomizePage } from './pages/avatar-customize';
import { TreatmentInfoPage } from './pages/treatment-info';

// Composant simple pour vérifier uniquement le token (pas l'onboarding)
function RequireAuth({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem('vio-auth-token');
  
  if (!token) {
    console.log('🔒 No token - redirecting to login');
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
}

export const router = createBrowserRouter([
  // ============ PAGES PUBLIQUES ============
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/signup',
    element: <SignUpPage />,
  },
  
  // ============ ONBOARDING PAGES (SEULEMENT TOKEN REQUIS) ============
  {
    path: '/welcome',
    element: (
      <RequireAuth>
        <div className="min-h-screen bg-gradient-to-br from-sky-50 via-teal-50 to-emerald-50">
          <WelcomePage />
        </div>
      </RequireAuth>
    ),
  },
  {
    path: '/avatar-name',
    element: (
      <RequireAuth>
        <div className="min-h-screen bg-gradient-to-br from-sky-50 via-teal-50 to-emerald-50">
          <AvatarNamePage />
        </div>
      </RequireAuth>
    ),
  },
  {
    path: '/avatar-customize',
    element: (
      <RequireAuth>
        <div className="min-h-screen bg-gradient-to-br from-sky-50 via-teal-50 to-emerald-50">
          <AvatarCustomizePage />
        </div>
      </RequireAuth>
    ),
  },
  {
    path: '/treatment-info',
    element: (
      <RequireAuth>
        <div className="min-h-screen bg-gradient-to-br from-sky-50 via-teal-50 to-emerald-50">
          <TreatmentInfoPage />
        </div>
      </RequireAuth>
    ),
  },
  {
     path: '/future-self-talk',
     element: (
      <RequireAuth>
        <div className="min-h-screen bg-gradient-to-br from-sky-50 via-teal-50 to-emerald-50">
          <FutureSelfTalkPage />
        </div>
      </RequireAuth>
    ),
   },

  // ============ PAGES PROTÉGÉES (DASHBOARD - ONBOARDING REQUIS) ============
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <Layout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Dashboard /> },
      { path: 'future-self', element: <FutureSelfDialogue /> },
      { path: 'constellation', element: <Constellation /> },
      { path: 'breathing', element: <BreathingMeditation />},
      { path: 'routines', element: <RoutineBuilder />},
    ],
  },

  // ============ CATCH ALL ============
  {
    path: '*',
    element: <Navigate to="/login" replace />,
  },
]);