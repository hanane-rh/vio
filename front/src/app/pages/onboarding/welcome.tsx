// src/app/pages/onboarding/welcome.tsx
// Step 0: Page de bienvenue

import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, ChevronRight } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';

export function WelcomePage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-2xl"
      >
        <Card className="p-8 md:p-12 bg-white/80 backdrop-blur-sm border-teal-100 shadow-xl">
          <div className="space-y-8 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-teal-400 to-emerald-400 shadow-lg mb-4">
              <Heart className="w-10 h-10 text-white" fill="currentColor" />
            </div>
            
            <div className="space-y-4">
              <h1 className="text-4xl font-bold text-slate-800">
                Welcome to VIO
              </h1>
              <p className="text-xl text-slate-600 leading-relaxed">
                Your compassionate companion on your healing journey
              </p>
            </div>

            <div className="bg-gradient-to-r from-teal-50 to-emerald-50 rounded-2xl p-6 border border-teal-100">
              <p className="text-slate-700 leading-relaxed">
                VIO transforms your treatment journey into a meaningful, emotionally supportive experience. 
                You'll create a personal connection with your future healthy self, track your progress, 
                and receive adaptive support that meets you exactly where you are.
              </p>
            </div>

            <Button
              onClick={() => navigate('/onboarding/avatar-name')}
              size="lg"
              className="bg-gradient-to-r from-teal-400 to-emerald-400 hover:from-teal-500 hover:to-emerald-500 text-white px-8"
            >
              Begin Your Journey
              <ChevronRight className="ml-2 w-5 h-5" />
            </Button>
          </div>

          {/* Progress Indicator */}
          <div className="flex justify-center gap-2 mt-8">
            <div className="w-8 h-2 rounded-full bg-gradient-to-r from-teal-400 to-emerald-400" />
            <div className="w-2 h-2 rounded-full bg-slate-300" />
            <div className="w-2 h-2 rounded-full bg-slate-300" />
            <div className="w-2 h-2 rounded-full bg-slate-300" />
          </div>
        </Card>
      </motion.div>
    </div>
  );
}