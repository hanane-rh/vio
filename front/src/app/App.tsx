import { RouterProvider } from 'react-router';
import { router } from './routes';
import { Toaster } from './components/ui/sonner';
import { EncouragementSystem } from './components/encouragement-system';
import { UserProvider, useUser } from './context/user-context';
import { Onboarding } from './components/onboarding';

function AppContent() {
  const { profile, setProfile } = useUser();

  if (!profile?.hasCompletedOnboarding) {
    return <Onboarding onComplete={setProfile} />;
  }

  return (
    <>
      <RouterProvider router={router} />
      <Toaster position="top-center" />
      <EncouragementSystem />
    </>
  );
}

export default function App() {
  return (
    <UserProvider>
      <AppContent />
    </UserProvider>
  );
}