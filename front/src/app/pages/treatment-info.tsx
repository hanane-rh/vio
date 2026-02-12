// src/app/pages/treatment-info.tsx
// Step 3: Informations de traitement + Completion
// ✅ VERSION SIMPLIFIÉE : start_date supprimé (automatiquement aujourd'hui côté backend)

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Pill, Sparkles } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { apiService } from '../../services/api';
import { useUser } from '../../context/user-context';
import { toast } from 'sonner';

export function TreatmentInfoPage() {
  const navigate = useNavigate();
  const { syncWithBackend } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  
  // ✅ SIMPLIFIÉ : start_date supprimé de l'état
  const [treatmentData, setTreatmentData] = useState({
    diagnosis: '',
    treatment_type: '',
    doctor_name: '',
    hospital: '',
    duration_weeks: '',
    notes: '',
  });

  useEffect(() => {
    // Charger depuis localStorage si existe
    const saved = localStorage.getItem('vio-onboarding-treatment');
    if (saved) {
      const savedData = JSON.parse(saved);
      setTreatmentData(savedData);
    }
  }, []);

  const handleComplete = async () => {
    // Validation
    if (!treatmentData.diagnosis.trim()) {
      toast.error('Please enter your diagnosis');
      return;
    }

    if (!treatmentData.duration_weeks || parseInt(treatmentData.duration_weeks) <= 0) {
      toast.error('Please enter treatment duration');
      return;
    }

    try {
      setIsLoading(true);
      console.log('🚀 Starting onboarding completion...');

      // Récupérer toutes les données sauvegardées
      const avatarName = localStorage.getItem('vio-onboarding-avatar-name') || 'Your Future Self';
      const avatarConfigStr = localStorage.getItem('vio-onboarding-avatar-config');
      const avatarConfig = avatarConfigStr ? JSON.parse(avatarConfigStr) : {
        appearance: 'gentle',
        expression: 'warm',
        tone: 'encouraging',
      };

      // ✅ Préparer les données pour l'API (SANS start_date)
      const onboardingData = {
        // Avatar
        avatar_name: avatarName,
        avatar_appearance: avatarConfig.appearance,
        avatar_expression: avatarConfig.expression,
        avatar_tone: avatarConfig.tone,

        // Treatment Info (start_date sera automatiquement aujourd'hui)
        diagnosis: treatmentData.diagnosis,
        treatment_type: treatmentData.treatment_type || '',
        doctor_name: treatmentData.doctor_name || '',
        hospital: treatmentData.hospital || '',
        duration_weeks: parseInt(treatmentData.duration_weeks),
        notes: treatmentData.notes || '',

        // Task Templates avec TOUS les champs requis par Django
        task_templates: [
          {
            title: 'Morning medication',
            description: 'Take prescribed morning doses',
            frequency: 'daily',
            timing: 'morning',
            is_important: true,
            dosage: '',
            quantity: '',
            custom_frequency_days: null,
            monday: true,
            tuesday: true,
            wednesday: true,
            thursday: true,
            friday: true,
            saturday: true,
            sunday: true,
          },
          {
            title: 'Evening medication',
            description: 'Take prescribed evening doses',
            frequency: 'daily',
            timing: 'evening',
            is_important: true,
            dosage: '',
            quantity: '',
            custom_frequency_days: null,
            monday: true,
            tuesday: true,
            wednesday: true,
            thursday: true,
            friday: true,
            saturday: true,
            sunday: true,
          },
          {
            title: 'Hydration check',
            description: 'Drink 8 glasses of water',
            frequency: 'daily',
            timing: 'anytime',
            is_important: false,
            dosage: '',
            quantity: '',
            custom_frequency_days: null,
            monday: true,
            tuesday: true,
            wednesday: true,
            thursday: true,
            friday: true,
            saturday: true,
            sunday: true,
          },
        ],
      };

      console.log('📤 Sending onboarding data:');
      console.log('  - avatar_name:', onboardingData.avatar_name);
      console.log('  - duration_weeks:', onboardingData.duration_weeks);
      console.log('  - task_templates count:', onboardingData.task_templates.length);
      console.log('  ✅ start_date will be automatically set to today by backend');
      console.log('Full payload:', JSON.stringify(onboardingData, null, 2));

      // Appel API
      const response = await apiService.completeOnboarding(onboardingData);

      console.log('✅ Onboarding completed:', response.data);

      // Nettoyer localStorage temporaire
      localStorage.removeItem('vio-onboarding-avatar-name');
      localStorage.removeItem('vio-onboarding-avatar-config');
      localStorage.removeItem('vio-onboarding-treatment');

      // Synchroniser le profil
      await syncWithBackend();

      toast.success('✨ Setup complete! Welcome to VIO', {
        description: 'Your journey begins now.',
        duration: 3000,
      });

      // Rediriger vers le dashboard
      setTimeout(() => {
        navigate('/', { replace: true });
      }, 500);

    } catch (error: any) {
      console.error('❌ Onboarding error:', error);
      
      // 🔍 DEBUG: Afficher les erreurs détaillées de Django
      if (error.response?.data) {
        console.error('🔴 Django validation errors:');
        console.error(JSON.stringify(error.response.data, null, 2));
      }
      
      let errorMsg = 'Failed to complete setup. Please try again.';
      if (error.response?.data) {
        const data = error.response.data;
        if (typeof data === 'string') {
          errorMsg = data;
        } else if (data.error) {
          errorMsg = data.error;
        } else if (data.detail) {
          errorMsg = data.detail;
        } else if (Object.keys(data).length > 0) {
          // Afficher le premier champ en erreur
          const firstError = Object.values(data)[0];
          if (Array.isArray(firstError)) {
            errorMsg = firstError[0];
          }
        }
      }

      toast.error(errorMsg, { duration: 5000 });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    const updated = { ...treatmentData, [field]: value };
    setTreatmentData(updated);
    // Sauvegarder automatiquement dans localStorage
    localStorage.setItem('vio-onboarding-treatment', JSON.stringify(updated));
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
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-blue-400 to-cyan-400 shadow-lg mb-4">
                <Pill className="w-10 h-10 text-white" />
              </div>
              
              <h2 className="text-3xl font-bold text-slate-800">
                Your Treatment Journey
              </h2>
              <p className="text-lg text-slate-600">
                Help us support you better by sharing your treatment details
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="diagnosis" className="text-slate-700 mb-2 block">
                  Diagnosis / Condition *
                </Label>
                <Input
                  id="diagnosis"
                  value={treatmentData.diagnosis}
                  onChange={(e) => handleChange('diagnosis', e.target.value)}
                  placeholder="e.g., Breast cancer, Leukemia, etc."
                  required
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="treatment_type" className="text-slate-700 mb-2 block">
                    Treatment Type
                  </Label>
                  <Input
                    id="treatment_type"
                    value={treatmentData.treatment_type}
                    onChange={(e) => handleChange('treatment_type', e.target.value)}
                    placeholder="e.g., Chemotherapy"
                  />
                </div>

                <div>
                  <Label htmlFor="duration_weeks" className="text-slate-700 mb-2 block">
                    Duration (weeks) *
                  </Label>
                  <Input
                    id="duration_weeks"
                    type="number"
                    value={treatmentData.duration_weeks}
                    onChange={(e) => handleChange('duration_weeks', e.target.value)}
                    placeholder="e.g., 12"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="doctor_name" className="text-slate-700 mb-2 block">
                    Doctor Name
                  </Label>
                  <Input
                    id="doctor_name"
                    value={treatmentData.doctor_name}
                    onChange={(e) => handleChange('doctor_name', e.target.value)}
                    placeholder="Dr. Smith"
                  />
                </div>

                <div>
                  <Label htmlFor="hospital" className="text-slate-700 mb-2 block">
                    Hospital / Clinic
                  </Label>
                  <Input
                    id="hospital"
                    value={treatmentData.hospital}
                    onChange={(e) => handleChange('hospital', e.target.value)}
                    placeholder="City Hospital"
                  />
                </div>
              </div>

              {/* ✅ SUPPRIMÉ : Champ start_date - sera automatiquement aujourd'hui */}

              <div>
                <Label htmlFor="notes" className="text-slate-700 mb-2 block">
                  Additional Notes
                </Label>
                <Input
                  id="notes"
                  value={treatmentData.notes}
                  onChange={(e) => handleChange('notes', e.target.value)}
                  placeholder="Any additional information..."
                />
              </div>

              {/* ✅ Info message pour l'utilisateur */}
              <div className="bg-gradient-to-r from-teal-50 to-emerald-50 rounded-xl p-4 border border-teal-100">
                <p className="text-sm text-slate-600 text-center">
                  💡 Your treatment will start today by default
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={() => navigate('/avatar-customize')}
                variant="outline"
                className="flex-1"
                disabled={isLoading}
              >
                Back
              </Button>
              <Button
                onClick={handleComplete}
                disabled={isLoading || !treatmentData.diagnosis.trim() || !treatmentData.duration_weeks}
                className="flex-1 bg-gradient-to-r from-teal-400 to-emerald-400 hover:from-teal-500 hover:to-emerald-500"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="animate-spin">⏳</span>
                    Completing setup...
                  </span>
                ) : (
                  <>
                    Complete Setup
                    <Sparkles className="ml-2 w-4 h-4" />
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Progress Indicator */}
          <div className="flex justify-center gap-2 mt-8">
            <div className="w-2 h-2 rounded-full bg-slate-300" />
            <div className="w-2 h-2 rounded-full bg-slate-300" />
            <div className="w-2 h-2 rounded-full bg-slate-300" />
            <div className="w-8 h-2 rounded-full bg-gradient-to-r from-teal-400 to-emerald-400" />
          </div>
        </Card>
      </motion.div>
    </div>
  );
}