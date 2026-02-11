// src/app/routes.tsx - VERSION CORRIGÉE

import { createBrowserRouter, Navigate } from 'react-router-dom';
import { Layout } from './components/layout';
import { ProtectedRoute } from './components/protected-route';

// Pages protégées
import { Dashboard } from './pages/dashboard';
import { FutureSelfDialogue } from './pages/future-self-dialogue';
import { Constellation } from './pages/constellation';
import { AdaptiveChallenges } from './pages/adaptive-challenges';

// Pages d'authentification
import { LoginPage } from './pages/login';
import { SignUpPage } from './pages/signup';
import { OnboardingPage } from './pages/onboarding';

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
  {
    path: '/onboarding',
    element: (
      <ProtectedRoute>
        <OnboardingPage />
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
    ],
  },

  // ============ CATCH ALL ============
  {
    path: '*',
    element: <Navigate to="/login" replace />,
  },
]);