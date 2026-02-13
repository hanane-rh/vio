// src/app/pages/avatar-customize.tsx
// Updated design - Simpler avatar selection with images

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';

// Avatar logo component (the teal swirl at top)
const VioLogo = () => (
  <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M24 4C20 4 16 6 14 10C12 14 12 20 16 24C20 28 28 28 32 24C36 20 36 14 34 10C32 6 28 4 24 4Z" 
          fill="url(#gradient)" stroke="#14b8a6" strokeWidth="2"/>
    <path d="M20 24C18 28 18 34 22 38C26 42 32 42 36 38" 
          stroke="#14b8a6" strokeWidth="2.5" strokeLinecap="round"/>
    <defs>
      <linearGradient id="gradient" x1="14" y1="4" x2="34" y2="28">
        <stop offset="0%" stopColor="#14b8a6"/>
        <stop offset="100%" stopColor="#10b981"/>
      </linearGradient>
    </defs>
  </svg>
);

const AVATAR_OPTIONS = [
  { 
    id: 'avatar1', 
    name: 'Gentle Guide',
    image: '/assert/avatar1.png', // Update with your actual image path
    alt: 'Gentle avatar with purple outfit'
  },
  { 
    id: 'avatar2', 
    name: 'Energetic Companion',
    image: '/assert/avatar2.png', // Update with your actual image path
    alt: 'Energetic avatar with red outfit'
  },
];

const TONE_OPTIONS = [
  { value: 'encouraging', label: 'Encouraging' },
  { value: 'gentle', label: 'Gentle' },
  { value: 'inspiring', label: 'Inspiring' },
  { value: 'celebratory', label: 'Celebratory' },
];

export function AvatarCustomizePage() {
  const navigate = useNavigate();
  const [avatarName, setAvatarName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('avatar1');
  const [selectedTone, setSelectedTone] = useState('encouraging');

  useEffect(() => {
    // Load avatar name from previous step
    const savedName = localStorage.getItem('vio-onboarding-avatar-name');
    if (savedName) setAvatarName(savedName);

    // Load saved preferences if they exist
    const savedConfig = localStorage.getItem('vio-onboarding-avatar-config');
    if (savedConfig) {
      const config = JSON.parse(savedConfig);
      if (config.avatar) setSelectedAvatar(config.avatar);
      if (config.tone) setSelectedTone(config.tone);
    }
  }, []);

  const handleContinue = () => {
    // Save configuration to localStorage
    const avatarConfig = {
      avatar: selectedAvatar,
      tone: selectedTone,
      // Map to backend expected format
      appearance: selectedAvatar === 'avatar1' ? 'gentle' : 'energetic',
      expression: 'warm',
    };
    
    localStorage.setItem('vio-onboarding-avatar-config', JSON.stringify(avatarConfig));
    console.log('✅ Avatar config saved:', avatarConfig);
    
    // Navigate to next step
    navigate('/future-self-talk');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-50 to-teal-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-2xl"
      >
        <Card className="p-8 md:p-12 bg-white/80 backdrop-blur-sm border-teal-100 shadow-xl">
          <div className="space-y-4">
            {/* Logo */}
            <div className="flex justify-center">
              <div className="inline-flex items-center justify-center w-28 h-28 mb-4">
                                        <img 
                                         src='/assert/logovio.png'
                                          alt="VIO Logo" 
                                         className="w-full h-full object-contain"
                                         />
                                        </div>
            </div>

            {/* Title */}
            <div className="text-center space-y-2">
              <h2 className="text-2xl md:text-3xl font-bold text-slate-800">
                Customize Your Companion
              </h2>
              <p className="text-slate-600">
                Choose how your future self appears and speaks to you
              </p>
            </div>

            {/* Avatar Selection */}
            <div className="space-y-2">
              <div className="flex justify-center gap-6">
                {AVATAR_OPTIONS.map((avatar) => (
                  <button
                    key={avatar.id}
                    onClick={() => setSelectedAvatar(avatar.id)}
                    className="relative group"
                  >
                    <div
                      className={`relative w-24 h-24 md:w-32 md:h-32 rounded-2xl bg-white border-2 transition-all duration-200 overflow-hidden ${
                        selectedAvatar === avatar.id
                          ? 'border-teal-400 shadow-lg scale-105'
                          : 'border-slate-200 hover:border-teal-200'
                      }`}
                    >
                      {/* Placeholder for avatar image */}
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-teal-50 to-emerald-50">
                        <img
                          src={avatar.image}
                          alt={avatar.alt}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            // Fallback if image doesn't load
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.parentElement!.innerHTML = `
                              <div class="w-full h-full flex items-center justify-center text-4xl">
                                ${avatar.id === 'avatar1' ? '👤' : '🙂'}
                              </div>
                            `;
                          }}
                        />
                      </div>
                      
                      {/* Selection indicator */}
                      {selectedAvatar === avatar.id && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-teal-400 rounded-full flex items-center justify-center shadow-md"
                        >
                          <svg
                            className="w-4 h-4 text-white"
                            fill="none"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path d="M5 13l4 4L19 7"></path>
                          </svg>
                        </motion.div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Communication Tone */}
            <div className="space-y-3">
              <label className="block text-center text-sm font-medium text-slate-700">
                Communication Tone :
              </label>
              <div className="flex flex-wrap justify-center gap-3">
                {TONE_OPTIONS.map((tone) => (
                  <button
                    key={tone.value}
                    onClick={() => setSelectedTone(tone.value)}
                    className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-200 ${
                      selectedTone === tone.value
                        ? 'bg-teal-400 text-white shadow-md'
                        : 'bg-white text-slate-700 border border-slate-200 hover:border-teal-200'
                    }`}
                  >
                    {tone.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
              <Button
                onClick={() => navigate('/avatar-name')}
                variant="outline"
                className="flex-1 py-6 text-base border-2 border-slate-200 hover:border-slate-300 rounded-xl"
              >
                Back
              </Button>
              <Button
                onClick={handleContinue}
                className="flex-1 py-6 text-base bg-teal-400 hover:bg-teal-500 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
              >
                Continue
                <ChevronRight className="ml-2 w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Progress Indicator */}
          <div className="flex justify-center gap-2 mt-8">
            <div className="w-2 h-2 rounded-full bg-slate-300" />
            <div className="w-2 h-2 rounded-full bg-slate-300" />
            <div className="w-8 h-2 rounded-full bg-teal-400" />
            <div className="w-2 h-2 rounded-full bg-slate-300" />
          </div>
        </Card>
      </motion.div>
    </div>
  );
}