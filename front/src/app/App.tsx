// src/app/App.tsx - VERSION CORRIGÉE

import { RouterProvider } from 'react-router-dom';
import { Toaster } from './components/ui/sonner';
import { EncouragementSystem } from './components/encouragement-system';
import { UserProvider } from '../context/user-context';
import { router } from './routes';

export default function App() {
  return (
    <UserProvider>
      <RouterProvider router={router} />
      <Toaster position="top-center" />
      <EncouragementSystem />
    </UserProvider>
  );
}