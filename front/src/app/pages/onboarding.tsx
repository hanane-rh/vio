// src/app/pages/onboarding.tsx - VERSION CORRIGÉE AVEC INTÉGRATION API

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Heart, ChevronRight } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { AvatarConfig, AVATAR_OPTIONS, UserProfile } from '../types/avatar';
import { apiService } from '../../services/api';
import { toast } from 'sonner';

interface OnboardingProps {
  onComplete: (profile: UserProfile) => void;
}

export function Onboarding({ onComplete }: OnboardingProps) {
  const [step, setStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  
  // Step 2: Avatar name
  const [avatarName, setAvatarName] = useState('');
  
  // Step 3: Avatar customization
  const [avatar, setAvatar] = useState<AvatarConfig>({
    appearance: 'gentle',
    expression: 'warm',
    tone: 'encouraging',
  });
  
  // Step 4: Treatment details
  const [treatmentInfo, setTreatmentInfo] = useState({
    treatment: '',
    duration: '',
  });

  const steps = [
    {
      title: 'Welcome to VIO',
      description: 'Your compassionate companion on your healing journey',
    },
    {
      title: 'Meet your future self',
      description: 'Create an avatar that represents the healthier, thriving version of you',
    },
    {
      title: 'Customize Your Companion',
      description: 'Choose how your future self appears and speaks to you',
    },
    {
      title: 'Tell me about your journey',
      description: 'Help us understand your treatment path',
    },
  ];

  // ✅ Fonction finale qui envoie TOUT au backend
  const handleComplete = async () => {
    try {
      setIsLoading(true);
      console.log('🚀 Starting onboarding completion process...');

      // ✅ ÉTAPE 1: Vérifier que nous avons un token
      const token = localStorage.getItem('vio-auth-token');
      if (!token) {
        console.error('❌ No authentication token found!');
        toast.error('Authentication required. Please log in again.');
        window.location.href = '/login';
        return;
      }

      console.log('✅ Authentication token found');

      // ✅ ÉTAPE 2: Préparer les données pour le backend
      const onboardingData = {
        // Avatar
        avatar_name: avatarName.trim() || 'Your Future Self',
        avatar_appearance: avatar.appearance,
        avatar_expression: avatar.expression,
        avatar_tone: avatar.tone,
        
        // Treatment Info
        diagnosis: '',
        treatment_type: treatmentInfo.treatment.trim() || '',
        doctor_name: '',
        hospital: '',
        start_date: new Date().toISOString().split('T')[0],
        duration_weeks: parseInt(treatmentInfo.duration) || 12,
        notes: '',
        
        // Task templates (vide pour l'instant, sera géré par le backend)
        task_templates: []
      };

      console.log('📤 Sending onboarding data:', onboardingData);

      // ✅ ÉTAPE 3: Envoyer au backend
      const response = await apiService.completeOnboarding(onboardingData);
      console.log('✅ Onboarding completed successfully:', response.data);
      
      // ✅ ÉTAPE 4: Récupérer le profil complet depuis l'API
      let fullProfile: UserProfile;
      
      try {
        const profileResponse = await apiService.getCurrentProfile();
        const avatarResponse = await apiService.getCurrentAvatar();
        
        fullProfile = {
          hasCompletedOnboarding: true,
          avatar: {
            name: avatarResponse.data.name || avatarName.trim() || 'Your Future Self',
            appearance: avatarResponse.data.appearance || avatar.appearance,
            expression: avatarResponse.data.expression || avatar.expression,
            tone: avatarResponse.data.tone || avatar.tone,
          },
          startDate: profileResponse.data.start_date || new Date().toISOString(),
          ...profileResponse.data,
        };
        
        console.log('✅ Full profile retrieved:', fullProfile);
      } catch (profileError) {
        console.warn('⚠️ Could not retrieve full profile, using local data:', profileError);
        
        // Fallback: créer un profil avec les données locales
        fullProfile = {
          hasCompletedOnboarding: true,
          avatar: {
            ...avatar,
            name: avatarName.trim() || 'Your Future Self',
          },
          startDate: new Date().toISOString(),
        };
      }
      
      // ✅ ÉTAPE 5: Sauvegarder le profil dans localStorage
      console.log('💾 Saving profile to localStorage:', fullProfile);
      localStorage.setItem('vio-user-profile', JSON.stringify(fullProfile));
      
      // ✅ ÉTAPE 6: Notification de succès
      toast.success('🎉 Setup complete! Welcome to VIO.', {
        description: 'Your personalized treatment journey begins now.',
        duration: 3000,
      });
      
      console.log('✅ Onboarding process completed successfully');
      console.log('➡️ Calling onComplete callback');
      
      // ✅ ÉTAPE 7: Appeler le callback avec le profil
      onComplete(fullProfile);
      
    } catch (error: any) {
      console.error('❌ Onboarding error:', error);
      console.error('Error details:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      
      // ✅ GESTION D'ERREURS DÉTAILLÉE
      let errorMsg = 'Failed to complete onboarding. Please try again.';
      
      if (error.response?.status === 401) {
        errorMsg = 'Your session has expired. Please log in again.';
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
      } else if (error.response?.data) {
        const data = error.response.data;
        
        if (typeof data === 'string') {
          errorMsg = data;
        } else if (data.error) {
          errorMsg = data.error;
        } else if (data.detail) {
          errorMsg = data.detail;
        } else if (data.avatar_name || data.treatment_type || data.duration_weeks) {
          // Erreurs de validation spécifiques
          const errors = [];
          if (data.avatar_name) errors.push(`Avatar name: ${data.avatar_name}`);
          if (data.treatment_type) errors.push(`Treatment: ${data.treatment_type}`);
          if (data.duration_weeks) errors.push(`Duration: ${data.duration_weeks}`);
          errorMsg = errors.join(', ');
        }
      }
      
      toast.error(errorMsg, {
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getAvatarGradient = () => {
    const gradients = {
      youthful: 'from-violet-400 to-purple-400',
      mature: 'from-blue-400 to-cyan-400',
      gentle: 'from-teal-400 to-emerald-400',
      energetic: 'from-amber-400 to-orange-400',
    };
    return gradients[avatar.appearance];
  };

  // ✅ Validation pour chaque étape
  const canProceedToStep = (stepNum: number): boolean => {
    switch (stepNum) {
      case 1: return true; // Welcome screen
      case 2: return true; // Avatar name (optional)
      case 3: return true; // Avatar customization (has defaults)
      case 4: return treatmentInfo.treatment.trim().length > 0 && treatmentInfo.duration.length > 0;
      default: return true;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-teal-50 to-emerald-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-2xl"
      >
        <Card className="p-8 md:p-12 bg-white/80 backdrop-blur-sm border-teal-100 shadow-xl">
          <AnimatePresence mode="wait">
            {/* STEP 0: Welcome */}
            {step === 0 && (
              <motion.div
                key="step0"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8 text-center"
              >
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-teal-400 to-emerald-400 shadow-lg mb-4">
                  <Heart className="w-10 h-10 text-white" fill="currentColor" />
                </div>
                
                <div className="space-y-4">
                  <h1 className="text-4xl font-bold text-slate-800">
                    {steps[0].title}
                  </h1>
                  <p className="text-xl text-slate-600 leading-relaxed">
                    {steps[0].description}
                  </p>
                </div>

                <div className="bg-gradient-to-r from-teal-50 to-emerald-50 rounded-2xl p-6 border border-teal-100">
                  <p className="text-slate-700 leading-relaxed">
                    VIO transforms your treatment journey into a meaningful, emotionally supportive experience. 
                    You'll create a personal connection with your future healthy self, map your resilience through 
                    a beautiful constellation of achievements, and receive adaptive support that meets you exactly where you are.
                  </p>
                </div>

                <Button
                  onClick={() => setStep(1)}
                  size="lg"
                  className="bg-gradient-to-r from-teal-400 to-emerald-400 hover:from-teal-500 hover:to-emerald-500 text-white px-8"
                  disabled={isLoading}
                >
                  Begin your Journey
                  <ChevronRight className="ml-2 w-5 h-5" />
                </Button>
              </motion.div>
            )}

            {/* STEP 1: Avatar Name */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="text-center space-y-4">
                  <div className={`inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br ${getAvatarGradient()} shadow-lg mb-4`}>
                    <Sparkles className="w-10 h-10 text-white" />
                  </div>
                  
                  <h2 className="text-3xl font-bold text-slate-800">
                    {steps[1].title}
                  </h2>
                  <p className="text-lg text-slate-600">
                    {steps[1].description}
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="avatar-name" className="text-slate-700 mb-2 block">
                      What would you like to call your future self?
                    </Label>
                    <Input
                      id="avatar-name"
                      value={avatarName}
                      onChange={(e) => setAvatarName(e.target.value)}
                      placeholder="E.g: Future Me, Tomorrow's Champion..."
                      className="text-lg"
                      disabled={isLoading}
                      maxLength={50}
                    />
                    <p className="text-sm text-slate-500 mt-2">
                      This is optional – we'll use "Your Future Self" if you'd prefer to leave it blank
                    </p>
                  </div>

                  <div className="bg-gradient-to-r from-violet-50 to-purple-50 rounded-2xl p-6 border border-violet-100">
                    <p className="text-slate-700 leading-relaxed italic">
                      "This avatar represents the healthiest version of you – the one who made it through treatment, 
                      who learned resilience, who is thriving. As you progress, they'll grow more vivid and present."
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={() => setStep(0)}
                    variant="outline"
                    className="flex-1"
                    disabled={isLoading}
                  >
                    Back
                  </Button>
                  <Button
                    onClick={() => setStep(2)}
                    className="flex-1 bg-gradient-to-r from-teal-400 to-emerald-400 hover:from-teal-500 hover:to-emerald-500"
                    disabled={isLoading}
                  >
                    Continue
                    <ChevronRight className="ml-2 w-4 h-4" />
                  </Button>
                </div>
              </motion.div>
            )}

            {/* STEP 2: Avatar Customization */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="text-center space-y-4">
                  <div className={`inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br ${getAvatarGradient()} shadow-lg mb-4`}>
                    <Sparkles className="w-10 h-10 text-white" />
                  </div>
                  
                  <h2 className="text-3xl font-bold text-slate-800">
                    {steps[2].title}
                  </h2>
                  <p className="text-lg text-slate-600">
                    Choose how {avatarName || 'your future self'} speaks to you
                  </p>
                </div>

                <div className="space-y-6">
                  {/* Communication Tone */}
                  <div>
                    <Label className="text-slate-700 mb-3 block">Communication tone</Label>
                    <div className="grid grid-cols-2 gap-3">
                      {AVATAR_OPTIONS.tone.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => setAvatar({ ...avatar, tone: option.value as any })}
                          className={`p-4 rounded-xl border-2 text-left transition-all ${
                            avatar.tone === option.value
                              ? 'border-teal-400 bg-gradient-to-br from-teal-50 to-emerald-50 shadow-md'
                              : 'border-slate-200 bg-white hover:border-teal-200'
                          }`}
                          disabled={isLoading}
                          type="button"
                        >
                          <div className="font-semibold text-slate-800 mb-1">{option.label}</div>
                          <div className="text-sm text-slate-600">{option.description}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={() => setStep(1)}
                    variant="outline"
                    className="flex-1"
                    disabled={isLoading}
                  >
                    Back
                  </Button>
                  <Button
                    onClick={() => setStep(3)}
                    className="flex-1 bg-gradient-to-r from-teal-400 to-emerald-400 hover:from-teal-500 hover:to-emerald-500"
                    disabled={isLoading}
                  >
                    Continue
                    <ChevronRight className="ml-2 w-4 h-4" />
                  </Button>
                </div>
              </motion.div>
            )}

            {/* STEP 3: Treatment Journey Details */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="text-center space-y-4">
                  <div className={`inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br ${getAvatarGradient()} shadow-lg mb-4`}>
                    <Sparkles className="w-10 h-10 text-white" />
                  </div>
                  
                  <h2 className="text-3xl font-bold text-slate-800">
                    {steps[3].title}
                  </h2>
                  <p className="text-lg text-slate-600">
                    {steps[3].description}
                  </p>
                </div>

                {/* Avatar speaking bubble */}
                <div className="flex justify-center mb-6">
                  <div className="relative">
                    <div className="bg-gradient-to-r from-violet-50 to-purple-50 rounded-2xl p-4 border border-violet-100 max-w-md">
                      <p className="text-slate-700 italic">
                        "Hello, I'm your future self. Let's make this journey together"
                      </p>
                    </div>
                    <div className="mt-4 flex justify-center">
                      <div className="w-16 h-16 bg-gradient-to-br from-violet-400 to-purple-400 rounded-full flex items-center justify-center">
                        <Sparkles className="w-8 h-8 text-white" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="treatment" className="text-slate-700 mb-2 block">
                      What's your long-term treatment? *
                    </Label>
                    <Input
                      id="treatment"
                      value={treatmentInfo.treatment}
                      onChange={(e) => setTreatmentInfo({ ...treatmentInfo, treatment: e.target.value })}
                      placeholder="E.g: post surgery, chemotherapy, physical therapy..."
                      className="text-lg"
                      disabled={isLoading}
                      required
                    />
                    {treatmentInfo.treatment.trim() && (
                      <p className="text-xs text-teal-600 mt-1">✓ Treatment specified</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="duration" className="text-slate-700 mb-2 block">
                      Duration (in weeks) *
                    </Label>
                    <Input
                      id="duration"
                      type="number"
                      min="1"
                      max="520"
                      value={treatmentInfo.duration}
                      onChange={(e) => setTreatmentInfo({ ...treatmentInfo, duration: e.target.value })}
                      placeholder="E.g: 12, 26, 52..."
                      className="text-lg"
                      disabled={isLoading}
                      required
                    />
                    {treatmentInfo.duration && parseInt(treatmentInfo.duration) > 0 && (
                      <p className="text-xs text-teal-600 mt-1">
                        ✓ {treatmentInfo.duration} weeks (~{Math.round(parseInt(treatmentInfo.duration) / 4.3)} months)
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={() => setStep(2)}
                    variant="outline"
                    className="flex-1"
                    disabled={isLoading}
                  >
                    Back
                  </Button>
                  <Button
                    onClick={handleComplete}
                    className="flex-1 bg-gradient-to-r from-teal-400 to-emerald-400 hover:from-teal-500 hover:to-emerald-500"
                    disabled={isLoading || !canProceedToStep(4)}
                  >
                    {isLoading ? (
                      <>
                        <span className="animate-spin mr-2">⏳</span>
                        Completing Setup...
                      </>
                    ) : (
                      <>
                        Complete setup
                        <Sparkles className="ml-2 w-4 h-4" />
                      </>
                    )}
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Progress Indicator */}
          <div className="flex justify-center gap-2 mt-8">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className={`h-2 rounded-full transition-all duration-300 ${
                  i === step 
                    ? 'w-8 bg-gradient-to-r from-teal-400 to-emerald-400' 
                    : i < step 
                    ? 'w-2 bg-teal-300'
                    : 'w-2 bg-slate-300'
                }`}
              />
            ))}
          </div>
        </Card>
      </motion.div>
    </div>
  );
}