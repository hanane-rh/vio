// src/app/pages/future-self-talk.tsx
// Introduction page where user's avatar greets them

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ChevronRight } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';

export function FutureSelfTalkPage() {
  const navigate = useNavigate();
  const [avatarName, setAvatarName] = useState('your name');
  const [selectedAvatarImage, setSelectedAvatarImage] = useState('');

  useEffect(() => {
    // Load avatar name from localStorage
    const savedName = localStorage.getItem('vio-onboarding-avatar-name');
    if (savedName) {
      setAvatarName(savedName);
    }

    // Load selected avatar configuration
    const savedConfig = localStorage.getItem('vio-onboarding-avatar-config');
    if (savedConfig) {
      const config = JSON.parse(savedConfig);
      // Map avatar to image path
      if (config.avatar === 'avatar1') {
        setSelectedAvatarImage('/assert/avatar1.png');
      } else if (config.avatar === 'avatar2') {
        setSelectedAvatarImage('/assert/avatar2.png');
      }
    }
  }, []);

  const handleContinue = () => {
    // Navigate to next onboarding step
    navigate('/treatment-info');
  };

  const handleBack = () => {
    // Go back to avatar customization
    navigate('/avatar-customize');
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
          <div className="space-y-8">
            {/* Logo */}
            <div className="flex justify-center">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center justify-center w-25 h-25"
              >
                <img 
                  src='/assert/logovio.png'
                  alt="VIO Logo" 
                  className="w-full h-full object-contain"
                />
              </motion.div>
            </div>

            {/* Speech Bubble */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex justify-center"
            >
              <div className="relative max-w-md">
                {/* Speech bubble content */}
                <div className="bg-white border-2 border-slate-200 rounded-3xl px-8 py-6 shadow-sm">
                  <p className="text-center text-slate-700 text-base md:text-lg leading-relaxed italic">
                    "Hello... I'm your future self '{avatarName}', let's make this journey together"
                  </p>
                </div>
                
                {/* Speech bubble pointer */}
                <div className="absolute left-1/2 -bottom-3 transform -translate-x-1/2">
                  <div className="w-6 h-6 bg-white border-r-2 border-b-2 border-slate-200 transform rotate-45"></div>
                </div>
              </div>
            </motion.div>

            {/* Avatar Display */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6 }}
              className="flex justify-center"
            >
              <div className="w-32 h-32 md:w-40 md:h-40 flex items-center justify-center">
                {selectedAvatarImage ? (
                  <img
                    src={selectedAvatarImage}
                    alt="Your future self avatar"
                    className="w-full h-full object-contain pixelated"
                    style={{ imageRendering: 'pixelated' }}
                    onError={(e) => {
                      // Fallback to emoji if image fails to load
                      e.currentTarget.style.display = 'none';
                      const parent = e.currentTarget.parentElement;
                      if (parent) {
                        parent.innerHTML = '<div class="text-8xl">👤</div>';
                      }
                    }}
                  />
                ) : (
                  // Default fallback avatar
                  <div className="text-8xl">👤</div>
                )}
              </div>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="flex gap-4 pt-4"
            >
              <Button
                onClick={handleBack}
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
            </motion.div>
          </div>

          {/* Progress Indicator */}
          <div className="flex justify-center gap-2 mt-8">
            <div className="w-2 h-2 rounded-full bg-slate-300" />
            <div className="w-2 h-2 rounded-full bg-slate-300" />
            <div className="w-2 h-2 rounded-full bg-slate-300" />
            <div className="w-8 h-2 rounded-full bg-teal-400" />
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
