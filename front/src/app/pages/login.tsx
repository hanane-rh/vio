import { useState } from 'react';
import { useNavigate } from 'react-router';
import { apiService } from '../services/api';
import { useUser } from '../context/user-context';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card } from '../components/ui/card';
import { toast } from 'sonner';

export function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { setAuthToken, setProfile } = useUser();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      const response = await apiService.login(username, password);
      
      // Sauvegarder le token
      setAuthToken(response.data.token);
      
      // Rediriger selon l'état d'onboarding
      if (response.data.has_completed_onboarding) {
        navigate('/');
      } else {
        navigate('/onboarding');
      }
      
      toast.success('Login successful!');
    } catch (error: any) {
      toast.error('Login failed: ' + (error.response?.data?.error || error.message));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-50 via-teal-50 to-emerald-50 p-4">
      <Card className="w-full max-w-md p-8">
        <h1 className="text-3xl font-bold text-slate-800 mb-6">CarePath</h1>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Username</label>
            <Input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Password</label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-teal-400 to-emerald-400"
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </Button>
        </form>
      </Card>
    </div>
  );
}