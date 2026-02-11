// src/app/pages/signup.tsx - VERSION CORRIGÉE

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Eye, EyeOff, Check } from 'lucide-react';
import { apiService } from '../../services/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card } from '../components/ui/card';
import { toast } from 'sonner';

export function SignUpPage() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    password_confirm: '',
    first_name: '',
    last_name: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const [passwordStrength, setPasswordStrength] = useState<'weak' | 'medium' | 'strong' | null>(null);

  const checkPasswordStrength = (pwd: string) => {
    if (pwd.length < 8) return 'weak';
    if (pwd.length < 12 || !/[A-Z]/.test(pwd) || !/[0-9]/.test(pwd)) return 'medium';
    return 'strong';
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (name === 'password') {
      setPasswordStrength(checkPasswordStrength(value) as any);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validations
    if (formData.password !== formData.password_confirm) {
      toast.error('Passwords do not match');
      return;
    }

    if (formData.password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    if (!formData.username || !formData.email || !formData.password) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setIsLoading(true);
      console.log('📝 Attempting registration...', { 
        username: formData.username, 
        email: formData.email 
      });
      
      const response = await apiService.register(
        formData.username,
        formData.email,
        formData.password,
        formData.first_name,
        formData.last_name
      );
      
      console.log('✅ Registration response:', response.data);
      
      const { token } = response.data;
      
      if (!token) {
        toast.error('Registration successful but no token received');
        navigate('/login');
        return;
      }

      // 🔑 CRUCIAL: Sauvegarder le token dans localStorage ET dans apiService
      localStorage.setItem('vio-auth-token', token);
      apiService.setToken(token);
      
      console.log('💾 Token saved:', token.substring(0, 10) + '...');

      // Créer un profil minimal pour l'onboarding
      const profile = {
        hasCompletedOnboarding: false,
      };
      localStorage.setItem('vio-user-profile', JSON.stringify(profile));
      
      toast.success('✨ Account created! Let\'s set up your treatment plan.');
      console.log('➡️ Redirecting to onboarding');
      
      navigate('/onboarding', { replace: true });
    } catch (error: any) {
      console.error('❌ Sign up error:', error);
      console.error('Error response:', error.response?.data);
      
      // Gérer les différents types d'erreurs
      let errorMsg = 'Sign up failed. Please try again.';
      
      if (error.response?.data) {
        const data = error.response.data;
        
        if (data.username) {
          errorMsg = Array.isArray(data.username) ? data.username[0] : data.username;
        } else if (data.email) {
          errorMsg = Array.isArray(data.email) ? data.email[0] : data.email;
        } else if (data.password) {
          errorMsg = Array.isArray(data.password) ? data.password[0] : data.password;
        } else if (data.error) {
          errorMsg = data.error;
        } else if (data.detail) {
          errorMsg = data.detail;
        } else if (data.non_field_errors) {
          errorMsg = Array.isArray(data.non_field_errors) 
            ? data.non_field_errors[0] 
            : data.non_field_errors;
        }
      }
      
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const passwordsMatch = formData.password && formData.password === formData.password_confirm;

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
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-400 to-cyan-400 shadow-lg mb-4">
              <span className="text-2xl font-bold text-white">VIO</span>
            </div>
            <h1 className="text-3xl font-bold text-slate-800">Join VIO</h1>
            <p className="text-slate-600 mt-2">Begin your treatment journey</p>
          </motion.div>

          {/* Form */}
          <form onSubmit={handleSignUp} className="space-y-4">
            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  First Name
                </label>
                <Input
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  placeholder="First"
                  disabled={isLoading}
                  autoComplete="given-name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Last Name
                </label>
                <Input
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  placeholder="Last"
                  disabled={isLoading}
                  autoComplete="family-name"
                />
              </div>
            </div>

            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Username *
              </label>
              <Input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Choose a username"
                disabled={isLoading}
                required
                autoComplete="username"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Email *
              </label>
              <Input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="your@email.com"
                disabled={isLoading}
                required
                autoComplete="email"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Password *
              </label>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="At least 8 characters"
                  disabled={isLoading}
                  required
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-500"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {formData.password && (
                <div className="mt-2 flex items-center gap-2">
                  <div className={`h-1 flex-1 rounded ${
                    passwordStrength === 'strong' 
                      ? 'bg-green-500' 
                      : passwordStrength === 'medium' 
                      ? 'bg-yellow-500' 
                      : 'bg-red-500'
                  }`} />
                  <span className="text-xs font-semibold capitalize">
                    {passwordStrength || ''}
                  </span>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Confirm Password *
              </label>
              <div className="relative">
                <Input
                  type={showPasswordConfirm ? 'text' : 'password'}
                  name="password_confirm"
                  value={formData.password_confirm}
                  onChange={handleChange}
                  placeholder="Confirm your password"
                  disabled={isLoading}
                  required
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                  className="absolute right-3 top-3 text-slate-500"
                  tabIndex={-1}
                >
                  {showPasswordConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
                {passwordsMatch && formData.password_confirm && (
                  <Check className="absolute right-10 top-3 text-green-500" size={20} />
                )}
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading || !passwordsMatch}
              className="w-full bg-gradient-to-r from-teal-400 to-cyan-400 hover:from-teal-500 hover:to-cyan-500 text-white font-semibold py-2 rounded-lg transition-all disabled:opacity-50"
            >
              {isLoading ? 'Creating account...' : 'Sign Up'}
            </Button>
          </form>

          {/* Login Link */}
          <div className="text-center mt-6">
            <p className="text-slate-600">
              Already have an account?{' '}
              <button
                onClick={() => navigate('/login')}
                className="text-teal-600 hover:text-teal-700 font-semibold"
                type="button"
              >
                Login
              </button>
            </p>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}