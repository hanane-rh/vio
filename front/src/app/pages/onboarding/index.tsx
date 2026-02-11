// src/app/pages/onboarding/index.tsx
// Routeur principal pour les étapes d'onboarding

import { Routes, Route, Navigate } from 'react-router-dom';
import { WelcomePage } from './welcome';
import { AvatarNamePage } from './avatar-name';
import { AvatarCustomizePage } from './avatar-customize';
import { TreatmentInfoPage } from './treatment-info';

export function Onboarding() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-teal-50 to-emerald-50">
      <Routes>
        <Route path="/" element={<Navigate to="welcome" replace />} />
        <Route path="welcome" element={<WelcomePage />} />
        <Route path="avatar-name" element={<AvatarNamePage />} />
        <Route path="avatar-customize" element={<AvatarCustomizePage />} />
        <Route path="treatment-info" element={<TreatmentInfoPage />} />
      </Routes>
    </div>
  );
}