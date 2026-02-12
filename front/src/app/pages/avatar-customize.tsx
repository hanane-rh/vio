// src/app/pages/avatar-customize.tsx
// Step 2: Personnaliser l'avatar

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, ChevronRight } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Label } from '../components/ui/label';

const AVATAR_OPTIONS = {
  appearance: [
    { value: 'gentle', label: 'Gentle', description: 'Soft and calming presence' },
    { value: 'energetic', label: 'Energetic', description: 'Vibrant and motivating' },
    { value: 'mature', label: 'Mature', description: 'Wise and experienced' },
    { value: 'youthful', label: 'Youthful', description: 'Fresh and optimistic' },
  ],
  expression: [
    { value: 'warm', label: 'Warm', description: 'Friendly and welcoming' },
    { value: 'confident', label: 'Confident', description: 'Strong and assured' },
    { value: 'playful', label: 'Playful', description: 'Light and cheerful' },
    { value: 'serene', label: 'Serene', description: 'Peaceful and calm' },
  ],
  tone: [
    { value: 'encouraging', label: 'Encouraging', description: 'Supportive and uplifting' },
    { value: 'direct', label: 'Direct', description: 'Clear and straightforward' },
    { value: 'inspiring', label: 'Inspiring', description: 'Motivational and empowering' },
    { value: 'celebratory', label: 'Celebratory', description: 'Joyful and positive' },
  ],
};

export function AvatarCustomizePage() {
  const navigate = useNavigate();
  const [avatarName, setAvatarName] = useState('');
  const [avatar, setAvatar] = useState({
    appearance: 'gentle',
    expression: 'warm',
    tone: 'encouraging',
  });

  useEffect(() => {
    // Charger le nom de l'avatar
    const savedName = localStorage.getItem('vio-onboarding-avatar-name');
    if (savedName) setAvatarName(savedName);

    // Charger les préférences si elles existent
    const savedAvatar = localStorage.getItem('vio-onboarding-avatar-config');
    if (savedAvatar) {
      setAvatar(JSON.parse(savedAvatar));
    }
  }, []);

  const handleContinue = () => {
    // Sauvegarder dans localStorage
    localStorage.setItem('vio-onboarding-avatar-config', JSON.stringify(avatar));
    console.log('✅ Avatar config saved:', avatar);
    
    // Naviguer vers la prochaine étape
    navigate('/treatment-info');
  };

  const getAvatarGradient = () => {
    const gradients = {
      youthful: 'from-violet-400 to-purple-400',
      mature: 'from-blue-400 to-cyan-400',
      gentle: 'from-teal-400 to-emerald-400',
      energetic: 'from-amber-400 to-orange-400',
    };
    return gradients[avatar.appearance as keyof typeof gradients];
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="w-full max-w-2xl"
      >
        <Card className="p-8 md:p-12 bg-white/80 backdrop-blur-sm border-teal-100 shadow-xl">
          <div className="space-y-8">
            <div className="text-center space-y-4">
              <div className={`inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br ${getAvatarGradient()} shadow-lg mb-4`}>
                <Sparkles className="w-10 h-10 text-white" />
              </div>
              
              <h2 className="text-3xl font-bold text-slate-800">
                Customize Your Companion
              </h2>
              <p className="text-lg text-slate-600">
                Choose how {avatarName || 'your future self'} appears and speaks to you
              </p>
            </div>

            <div className="space-y-6">
              {/* Appearance */}
              <div>
                <Label className="text-slate-700 mb-3 block">Presence Style</Label>
                <div className="grid grid-cols-2 gap-3">
                  {AVATAR_OPTIONS.appearance.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setAvatar({ ...avatar, appearance: option.value })}
                      className={`p-4 rounded-xl border-2 text-left transition-all ${
                        avatar.appearance === option.value
                          ? 'border-teal-400 bg-gradient-to-br from-teal-50 to-emerald-50 shadow-md'
                          : 'border-slate-200 bg-white hover:border-teal-200'
                      }`}
                    >
                      <div className="font-semibold text-slate-800 mb-1">{option.label}</div>
                      <div className="text-sm text-slate-600">{option.description}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Expression */}
              <div>
                <Label className="text-slate-700 mb-3 block">Expression Style</Label>
                <div className="grid grid-cols-2 gap-3">
                  {AVATAR_OPTIONS.expression.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setAvatar({ ...avatar, expression: option.value })}
                      className={`p-4 rounded-xl border-2 text-left transition-all ${
                        avatar.expression === option.value
                          ? 'border-teal-400 bg-gradient-to-br from-teal-50 to-emerald-50 shadow-md'
                          : 'border-slate-200 bg-white hover:border-teal-200'
                      }`}
                    >
                      <div className="font-semibold text-slate-800 mb-1">{option.label}</div>
                      <div className="text-sm text-slate-600">{option.description}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Tone */}
              <div>
                <Label className="text-slate-700 mb-3 block">Communication Tone</Label>
                <div className="grid grid-cols-2 gap-3">
                  {AVATAR_OPTIONS.tone.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setAvatar({ ...avatar, tone: option.value })}
                      className={`p-4 rounded-xl border-2 text-left transition-all ${
                        avatar.tone === option.value
                          ? 'border-teal-400 bg-gradient-to-br from-teal-50 to-emerald-50 shadow-md'
                          : 'border-slate-200 bg-white hover:border-teal-200'
                      }`}
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
                onClick={() => navigate('/avatar-name')}
                variant="outline"
                className="flex-1"
              >
                Back
              </Button>
              <Button
                onClick={handleContinue}
                className="flex-1 bg-gradient-to-r from-teal-400 to-emerald-400 hover:from-teal-500 hover:to-emerald-500"
              >
                Continue
                <ChevronRight className="ml-2 w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Progress Indicator */}
          <div className="flex justify-center gap-2 mt-8">
            <div className="w-2 h-2 rounded-full bg-slate-300" />
            <div className="w-2 h-2 rounded-full bg-slate-300" />
            <div className="w-8 h-2 rounded-full bg-gradient-to-r from-teal-400 to-emerald-400" />
            <div className="w-2 h-2 rounded-full bg-slate-300" />
          </div>
        </Card>
      </motion.div>
    </div>
  );
}