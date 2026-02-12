// src/app/routes.tsx - VERSION AVEC ONBOARDING PAGES SÉPARÉES

import { createBrowserRouter, Navigate } from 'react-router-dom';
import { Layout } from './components/layout';
import { ProtectedRoute } from './components/protected-route';

// Pages protégées
import { Dashboard } from './pages/dashboard';
import { FutureSelfDialogue } from './pages/future-self-dialogue';
import { Constellation } from './pages/constellation';
import { AdaptiveChallenges } from './pages/adaptive-challenges';
import { BreathingMeditation } from './pages/breathing-meditation';
import { RoutineBuilder } from './pages/routine-builder';

// Pages d'authentification
import { LoginPage } from './pages/login';
import { SignUpPage } from './pages/signup';

// Onboarding (avec sous-routes)
import { Onboarding } from './pages/onboarding';

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
  
  // ============ ONBOARDING (PROTÉGÉ AVEC SOUS-ROUTES) ============
  {
    path: '/onboarding/*',
    element: (
      <ProtectedRoute>
        <Onboarding />
      </ProtectedRoute>
    ),
  },

  // ============ PAGES PROTÉGÉES ============
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
      { path: 'challenges', element: <AdaptiveChallenges /> },
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