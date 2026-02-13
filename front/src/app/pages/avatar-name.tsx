// src/app/pages/avatar-name.tsx
// Step 1: Nommer l'avatar

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, ChevronRight } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';

export function AvatarNamePage() {
  const navigate = useNavigate();
  const [avatarName, setAvatarName] = useState('');

  // Charger depuis localStorage si existe
  useEffect(() => {
    const saved = localStorage.getItem('vio-onboarding-avatar-name');
    if (saved) {
      setAvatarName(saved);
    }
  }, []);

  const handleContinue = () => {
    // Sauvegarder dans localStorage
    localStorage.setItem('vio-onboarding-avatar-name', avatarName);
    console.log('✅ Avatar name saved:', avatarName || 'Your Future Self');
    
    // Naviguer vers la prochaine étape
    navigate('/avatar-customize');
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
              <div className="inline-flex items-center justify-center w-28 h-28 mb-4">
                          <img 
                           src='/assert/logovio.png'
                            alt="VIO Logo" 
                           className="w-full h-full object-contain"
                           />
                          </div>
              
              <h2 className="text-3xl font-bold text-slate-800">
                Meet Your Future Self
              </h2>
              <p className="text-lg text-slate-600">
                Create an avatar that represents the healthier you
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
                  placeholder="e.g., Future Me, My Better Self, Tomorrow's Champion..."
                  className="text-lg"
                  autoFocus
                />
                <p className="text-sm text-slate-500 mt-2">
                  Optional — we'll use "Your Future Self" if you leave it blank
                </p>
              </div>

              <div className="bg-gradient-to-r from-violet-50 to-purple-50 rounded-2xl p-6 border border-violet-100">
                <p className="text-slate-700 leading-relaxed italic">
                  "This avatar represents the healthiest version of you — the one who made it through treatment, 
                  who learned resilience, who is thriving."
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={() => navigate('/welcome')}
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
            <div className="w-8 h-2 rounded-full bg-gradient-to-r from-teal-400 to-emerald-400" />
            <div className="w-2 h-2 rounded-full bg-slate-300" />
            <div className="w-2 h-2 rounded-full bg-slate-300" />
          </div>
        </Card>
      </motion.div>
    </div>
  );
}