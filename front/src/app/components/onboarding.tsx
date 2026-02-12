import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Heart, ChevronRight } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { AvatarConfig, AVATAR_OPTIONS, UserProfile } from '../types/avatar';

interface OnboardingProps {
  onComplete: (profile: UserProfile) => void;
}

export function Onboarding({ onComplete }: OnboardingProps) {
  const [step, setStep] = useState(0);
  const [avatarName, setAvatarName] = useState('');
  const [avatar, setAvatar] = useState<AvatarConfig>({
    appearance: 'gentle',
    expression: 'warm',
    tone: 'encouraging',
  });

  const steps = [
    {
      title: 'Welcome to VIO',
      description: 'Your compassionate companion on your healing journey',
    },
    {
      title: 'Meet Your Future Self',
      description: 'Create an avatar that represents the healthier, thriving version of you',
    },
    {
      title: 'Customize Your Companion',
      description: 'Choose how your future self appears and communicates',
    },
  ];

  const handleComplete = () => {
    const profile: UserProfile = {
      hasCompletedOnboarding: true,
      avatar: {
        ...avatar,
        name: avatarName || 'Your Future Self',
      },
      startDate: new Date().toISOString(),
    };
    onComplete(profile);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-teal-50 to-emerald-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-2xl"
      >
        <Card className="p-8 md:p-12 bg-white/80 backdrop-blur-sm border-teal-100 shadow-xl">
          <AnimatePresence mode="wait">
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
                >
                  Begin Your Journey
                  <ChevronRight className="ml-2 w-5 h-5" />
                </Button>
              </motion.div>
            )}

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
                      placeholder="e.g., Future Me, My Better Self, Tomorrow's Champion..."
                      className="text-lg"
                    />
                    <p className="text-sm text-slate-500 mt-2">
                      This is optional — we'll use "Your Future Self" if you'd prefer to leave it blank
                    </p>
                  </div>

                  <div className="bg-gradient-to-r from-violet-50 to-purple-50 rounded-2xl p-6 border border-violet-100">
                    <p className="text-slate-700 leading-relaxed italic">
                      "This avatar represents the healthiest version of you — the one who made it through treatment, 
                      who learned resilience, who is thriving. As you progress, they'll grow more vivid and present."
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={() => setStep(0)}
                    variant="outline"
                    className="flex-1"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={() => setStep(2)}
                    className="flex-1 bg-gradient-to-r from-teal-400 to-emerald-400 hover:from-teal-500 hover:to-emerald-500"
                  >
                    Continue
                    <ChevronRight className="ml-2 w-4 h-4" />
                  </Button>
                </div>
              </motion.div>
            )}

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
                          onClick={() => setAvatar({ ...avatar, appearance: option.value as any })}
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
                          onClick={() => setAvatar({ ...avatar, expression: option.value as any })}
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
                          onClick={() => setAvatar({ ...avatar, tone: option.value as any })}
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
                    onClick={() => setStep(1)}
                    variant="outline"
                    className="flex-1"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={handleComplete}
                    className="flex-1 bg-gradient-to-r from-teal-400 to-emerald-400 hover:from-teal-500 hover:to-emerald-500"
                  >
                    Complete Setup
                    <Sparkles className="ml-2 w-4 h-4" />
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Progress Indicator */}
          <div className="flex justify-center gap-2 mt-8">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={`h-2 rounded-full transition-all duration-300 ${
                  i === step ? 'w-8 bg-gradient-to-r from-teal-400 to-emerald-400' : 'w-2 bg-slate-300'
                }`}
              />
            ))}
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
