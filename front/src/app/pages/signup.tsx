// src/app/pages/signup-DEBUG.tsx
// VERSION DE DIAGNOSTIC AVEC LOGS DÉTAILLÉS

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Eye, EyeOff, Check } from 'lucide-react';
import { apiService } from '../../services/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card } from '../components/ui/card';
import { toast } from 'sonner';
import logoVio from '../assets/logovio.png';

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
    if (!formData.username.trim()) {
      toast.error('Username is required');
      return;
    }

    if (!formData.email.trim()) {
      toast.error('Email is required');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    if (!formData.password) {
      toast.error('Password is required');
      return;
    }

    if (formData.password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    if (!formData.password_confirm) {
      toast.error('Please confirm your password');
      return;
    }

    if (formData.password !== formData.password_confirm) {
      toast.error('Passwords do not match');
      return;
    }

    try {
      setIsLoading(true);
      console.log('🔐 [SIGNUP] Starting registration process...');
      console.log('📝 [SIGNUP] Form data:', { 
        username: formData.username, 
        email: formData.email,
        first_name: formData.first_name,
        last_name: formData.last_name
      });

      // Préparer les données
      const registrationData = {
        username: formData.username.trim(),
        email: formData.email.trim(),
        password: formData.password,
        password_confirm: formData.password_confirm,
        first_name: formData.first_name.trim() || '',
        last_name: formData.last_name.trim() || '',
      };

      console.log('📤 [SIGNUP] Sending registration data to API...');
      
      // Appel API
      const result = await apiService.register(
        registrationData.username,
        registrationData.email,
        registrationData.password,
        registrationData.password_confirm,
        registrationData.first_name,
        registrationData.last_name
      );
      
      console.log('✅ [SIGNUP] Registration API call successful!');
      console.log('📦 [SIGNUP] Full response:', result);
      console.log('📦 [SIGNUP] Response data:', result.data);
      console.log('📦 [SIGNUP] Response data keys:', Object.keys(result.data));
      
      // Extraire les données
      console.log('🔍 [SIGNUP] Extracting data from response...');
      console.log('🔍 [SIGNUP] result.data.token:', result.data.token);
      console.log('🔍 [SIGNUP] result.data.user:', result.data.user);
      console.log('🔍 [SIGNUP] result.data.user_id:', result.data.user_id);
      console.log('🔍 [SIGNUP] result.data.username:', result.data.username);
      console.log('🔍 [SIGNUP] result.data.email:', result.data.email);
      
      const token = result.data.token;
      const user_id = result.data.user_id;
      const username = result.data.username;
      const email = result.data.email;
      
      console.log('🎯 [SIGNUP] Extracted values:');
      console.log('  - token:', token ? `${token.substring(0, 10)}...` : 'UNDEFINED/NULL');
      console.log('  - user_id:', user_id);
      console.log('  - username:', username);
      console.log('  - email:', email);
      
      // Vérification du token
      if (!token) {
        console.error('❌ [SIGNUP] NO TOKEN RECEIVED!');
        console.error('❌ [SIGNUP] This will redirect to login');
        toast.error('Registration successful but authentication failed. Please log in.');
        console.log('🔀 [SIGNUP] Navigating to /login');
        navigate('/login');
        return;
      }

      console.log('✅ [SIGNUP] Token found! Proceeding with authentication...');

      // Sauvegarder le token
      console.log('💾 [SIGNUP] Saving token to localStorage...');
      localStorage.setItem('vio-auth-token', token);
      console.log('💾 [SIGNUP] Token saved to localStorage');
      
      console.log('🔧 [SIGNUP] Setting token in apiService...');
      apiService.setToken(token);
      console.log('✅ [SIGNUP] Token set in apiService');

      // Créer l'objet user
      const userObject = {
        id: user_id,
        username: username,
        email: email,
        first_name: formData.first_name,
        last_name: formData.last_name,
      };
      
      console.log('👤 [SIGNUP] Created user object:', userObject);

      // Créer le profil
      const profile = {
        hasCompletedOnboarding: false,
        user: userObject
      };
      
      console.log('📝 [SIGNUP] Created profile object:', profile);
      console.log('💾 [SIGNUP] Saving profile to localStorage...');
      localStorage.setItem('vio-user-profile', JSON.stringify(profile));
      console.log('✅ [SIGNUP] Profile saved to localStorage');
      
      // Vérification finale
      const savedToken = localStorage.getItem('vio-auth-token');
      const savedProfile = localStorage.getItem('vio-user-profile');
      console.log('🔍 [SIGNUP] Verification - localStorage check:');
      console.log('  - vio-auth-token exists?', !!savedToken);
      console.log('  - vio-user-profile exists?', !!savedProfile);
      
      // Notification
      toast.success('✨ Account created successfully!', {
        description: "Let's set up your treatment plan.",
        duration: 3000,
      });
      
      console.log('🎉 [SIGNUP] All done! Preparing to navigate...');
      console.log('🔀 [SIGNUP] Will navigate to: /welcome');
      
      setTimeout(() => {
        console.log('🚀 [SIGNUP] NAVIGATING NOW to /welcome');
        navigate('/welcome', { replace: true });
        console.log('✅ [SIGNUP] Navigate called');
      }, 500);

    } catch (error: any) {
      console.error('❌ [SIGNUP] ERROR OCCURRED!');
      console.error('❌ [SIGNUP] Error object:', error);
      console.error('❌ [SIGNUP] Error response:', error.response);
      console.error('❌ [SIGNUP] Error response data:', error.response?.data);
      console.error('❌ [SIGNUP] Error response status:', error.response?.status);
      console.error('❌ [SIGNUP] Error message:', error.message);
      
      // Gestion d'erreurs
      let errorMsg = 'Sign up failed. Please try again.';
      
      if (error.response?.data) {
        const data = error.response.data;
        
        if (data.username) {
          const usernameError = Array.isArray(data.username) ? data.username[0] : data.username;
          errorMsg = `Username: ${usernameError}`;
        } else if (data.email) {
          const emailError = Array.isArray(data.email) ? data.email[0] : data.email;
          errorMsg = `Email: ${emailError}`;
        } else if (data.password) {
          const passwordError = Array.isArray(data.password) ? data.password[0] : data.password;
          errorMsg = `Password: ${passwordError}`;
        } else if (data.password_confirm) {
          const confirmError = Array.isArray(data.password_confirm) ? data.password_confirm[0] : data.password_confirm;
          errorMsg = `Password confirmation: ${confirmError}`;
        } else if (data.non_field_errors) {
          errorMsg = Array.isArray(data.non_field_errors) 
            ? data.non_field_errors[0] 
            : data.non_field_errors;
        } else if (data.error) {
          errorMsg = data.error;
        } else if (data.detail) {
          errorMsg = data.detail;
        } else if (typeof data === 'string') {
          errorMsg = data;
        }
      } else if (error.message) {
        errorMsg = `Network error: ${error.message}`;
      }
      
      console.log('📢 [SIGNUP] Showing error toast:', errorMsg);
      toast.error(errorMsg, {
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
      console.log('🏁 [SIGNUP] Process complete (success or failure)');
    }
  };

  const passwordsMatch = formData.password && formData.password === formData.password_confirm;
  const isFormValid = 
    formData.username.trim() &&
    formData.email.trim() &&
    formData.password.length >= 8 &&
    formData.password === formData.password_confirm;

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
            <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
              Create Your Account
            </h1>
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
                className={formData.username.trim() ? 'border-teal-200' : ''}
              />
              {formData.username.trim() && (
                <p className="text-xs text-teal-600 mt-1">✓ Username looks good</p>
              )}
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
                className={formData.email.includes('@') ? 'border-teal-200' : ''}
              />
              {formData.email.includes('@') && (
                <p className="text-xs text-teal-600 mt-1">✓ Email format is valid</p>
              )}
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
                  className="absolute right-3 top-3 text-slate-500 hover:text-slate-700"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {formData.password && (
                <div className="mt-2 space-y-1">
                  <div className="flex items-center gap-2">
                    <div className={`h-1 flex-1 rounded transition-colors ${
                      passwordStrength === 'strong' 
                        ? 'bg-green-500' 
                        : passwordStrength === 'medium' 
                        ? 'bg-yellow-500' 
                        : 'bg-red-500'
                    }`} />
                    <span className={`text-xs font-semibold capitalize ${
                      passwordStrength === 'strong' 
                        ? 'text-green-600' 
                        : passwordStrength === 'medium' 
                        ? 'text-yellow-600' 
                        : 'text-red-600'
                    }`}>
                      {passwordStrength}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    {formData.password.length < 8 && '• At least 8 characters'}
                    {formData.password.length >= 8 && formData.password.length < 12 && '• 12+ characters recommended'}
                    {!/[A-Z]/.test(formData.password) && ' • Include uppercase'}
                    {!/[0-9]/.test(formData.password) && ' • Include numbers'}
                  </p>
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
                  className={passwordsMatch && formData.password_confirm ? 'border-green-200' : ''}
                />
                <button
                  type="button"
                  onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                  className="absolute right-3 top-3 text-slate-500 hover:text-slate-700"
                  tabIndex={-1}
                >
                  {showPasswordConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
                {passwordsMatch && formData.password_confirm && (
                  <Check className="absolute right-10 top-3 text-green-500" size={20} />
                )}
              </div>
              {formData.password_confirm && !passwordsMatch && (
                <p className="text-xs text-red-600 mt-1">✗ Passwords do not match</p>
              )}
              {passwordsMatch && formData.password_confirm && (
                <p className="text-xs text-green-600 mt-1">✓ Passwords match</p>
              )}
            </div>

            <Button
              type="submit"
              disabled={isLoading || !isFormValid}
              className="w-full bg-gradient-to-r from-teal-400 to-cyan-400 hover:from-teal-500 hover:to-cyan-500 text-white font-semibold py-2 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin">⏳</span>
                  Creating account...
                </span>
              ) : (
                'Create Account'
              )}
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
                disabled={isLoading}
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