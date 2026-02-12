// src/app/pages/login.tsx - VERSION CORRIGÉE

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Eye, EyeOff } from 'lucide-react';
import { apiService } from '../../services/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card } from '../components/ui/card';
import { toast } from 'sonner';
import logoVio from '../assets/logovio.png';

export function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      setIsLoading(true);
      console.log('🔐 Attempting login...', { username });
      
      const response = await apiService.login(username, password);
      console.log('✅ Login response:', response.data);
      
      const { token, has_completed_onboarding } = response.data;
      
      if (!token) {
        toast.error('No token received from server');
        return;
      }

      // 🔑 CRUCIAL: Sauvegarder le token dans localStorage ET dans apiService
      localStorage.setItem('vio-auth-token', token);
      apiService.setToken(token);
      
      console.log('💾 Token saved:', token.substring(0, 10) + '...');

      // Créer un profil minimal si onboarding pas complété
      if (!has_completed_onboarding) {
        const profile = {
          hasCompletedOnboarding: false,
        };
        localStorage.setItem('vio-user-profile', JSON.stringify(profile));
        console.log('➡️ Redirecting to onboarding');
        toast.success('✨ Welcome! Let\'s set up your profile.');
        navigate('/onboarding', { replace: true });
      } else {
        // Récupérer le profil complet depuis l'API
        try {
          const profileResponse = await apiService.getCurrentProfile();
          const avatarResponse = await apiService.getCurrentAvatar();
          
          const profile = {
            hasCompletedOnboarding: true,
            avatar: avatarResponse.data,
            ...profileResponse.data,
          };
          
          localStorage.setItem('vio-user-profile', JSON.stringify(profile));
          console.log('➡️ Redirecting to dashboard');
          toast.success('✨ Welcome back!');
          navigate('/', { replace: true });
        } catch (error) {
          console.error('Error fetching profile:', error);
          // Profil minimal en cas d'erreur
          const profile = { hasCompletedOnboarding: true };
          localStorage.setItem('vio-user-profile', JSON.stringify(profile));
          navigate('/', { replace: true });
        }
      }
    } catch (error: any) {
      console.error('❌ Login error:', error);
      
      const errorMsg = 
        error.response?.data?.error || 
        error.response?.data?.detail ||
        error.response?.data?.non_field_errors?.[0] ||
        'Login failed. Please check your credentials.';
      
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-emerald-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md"
      >
        <Card className="p-8 bg-white/80 backdrop-blur-sm border-teal-100 shadow-xl">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <div className="inline-flex items-center justify-center w-25 h-25 mb-4">
            <img 
             src={logoVio} 
              alt="VIO Logo" 
             className="w-full h-full object-contain"
             />
            </div>
            <h1 className="text-3xl font-bold text-slate-800">Welcome to VIO</h1>
            <p className="text-slate-600 mt-2">Your treatment companion</p>
          </motion.div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Username
              </label>
              <Input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                disabled={isLoading}
                required
                autoComplete="username"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  disabled={isLoading}
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-500 hover:text-slate-700"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-teal-400 to-cyan-400 hover:from-teal-500 hover:to-cyan-500 text-white font-semibold py-2 rounded-lg transition-all"
            >
              {isLoading ? 'Logging in...' : 'Login'}
            </Button>
          </form>

          {/* Sign Up Link */}
          <div className="text-center mt-6">
            <p className="text-slate-600">
              Don't have an account?{' '}
              <button
                onClick={() => navigate('/signup')}
                className="text-teal-600 hover:text-teal-700 font-semibold"
                type="button"
              >
                Sign up
              </button>
            </p>
          </div>

          {/* Demo Credentials */}
          <div className="mt-6 p-4 bg-teal-50 rounded-lg border border-teal-200">
            <p className="text-xs text-slate-600 font-semibold mb-2">Demo Credentials:</p>
            <p className="text-xs text-slate-600">
              Username: <span className="font-mono">demo</span>
            </p>
            <p className="text-xs text-slate-600">
              Password: <span className="font-mono">demo1234</span>
            </p>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}