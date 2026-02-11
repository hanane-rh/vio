// src/pages/onboarding.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Heart, ChevronRight, Plus, Trash2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { apiService } from '../../services/api';
import { useUser } from '../../context/user-context';
import { toast } from 'sonner';

interface TaskTemplate {
  title: string;
  description: string;
  frequency: string;
  timing: string;
  dosage: string;
  quantity: string;
  is_important: boolean;
}

export function OnboardingPage() {
  const navigate = useNavigate();
  const { setProfile } = useUser();
  const [step, setStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Avatar step
  const [avatarName, setAvatarName] = useState('');
  const [avatar, setAvatar] = useState({
    appearance: 'gentle',
    expression: 'warm',
    tone: 'encouraging',
  });

  // Treatment info step
  const [treatment, setTreatment] = useState({
    diagnosis: '',
    treatment_type: '',
    doctor_name: '',
    hospital: '',
    start_date: '',
    duration_weeks: '12',
    notes: '',
  });

  // Tasks step
  const [tasks, setTasks] = useState<TaskTemplate[]>([]);
  const [newTask, setNewTask] = useState<TaskTemplate>({
    title: '',
    description: '',
    frequency: 'daily',
    timing: 'anytime',
    dosage: '',
    quantity: '',
    is_important: false,
  });

  const steps = [
    { title: 'Welcome', subtitle: 'Let\'s start your VIO journey' },
    { title: 'Meet Your Future Self', subtitle: 'Create your companion' },
    { title: 'Customize Avatar', subtitle: 'Choose appearance & tone' },
    { title: 'Your Treatment Plan', subtitle: 'Tell us about your journey' },
    { title: 'Add Medications', subtitle: 'Create your daily tasks' },
    { title: 'Review & Confirm', subtitle: 'Ready to begin?' },
  ];

  const getAvatarGradient = () => {
    const gradients = {
      youthful: 'from-violet-400 to-purple-400',
      mature: 'from-blue-400 to-cyan-400',
      gentle: 'from-teal-400 to-emerald-400',
      energetic: 'from-amber-400 to-orange-400',
    };
    return gradients[avatar.appearance as keyof typeof gradients];
  };

  const addTask = () => {
    if (!newTask.title.trim()) {
      toast.error('Please enter a task title');
      return;
    }
    setTasks([...tasks, { ...newTask }]);
    setNewTask({
      title: '',
      description: '',
      frequency: 'daily',
      timing: 'anytime',
      dosage: '',
      quantity: '',
      is_important: false,
    });
    toast.success('✨ Task added!');
  };

  const removeTask = (index: number) => {
    setTasks(tasks.filter((_, i) => i !== index));
  };

  const handleComplete = async () => {
    try {
      setIsLoading(true);

      const onboardingData = {
        avatar_name: avatarName || 'My Future Self',
        avatar_appearance: avatar.appearance,
        avatar_expression: avatar.expression,
        avatar_tone: avatar.tone,
        diagnosis: treatment.diagnosis,
        treatment_type: treatment.treatment_type,
        doctor_name: treatment.doctor_name,
        hospital: treatment.hospital,
        start_date: treatment.start_date,
        duration_weeks: parseInt(treatment.duration_weeks),
        notes: treatment.notes,
        task_templates: tasks.map(t => ({
          title: t.title,
          description: t.description,
          frequency: t.frequency,
          custom_frequency_days: null,
          timing: t.timing,
          dosage: t.dosage,
          quantity: t.quantity,
          is_important: t.is_important,
          monday: true,
          tuesday: true,
          wednesday: true,
          thursday: true,
          friday: true,
          saturday: true,
          sunday: true,
        })),
      };

      const response = await apiService.completeOnboarding(onboardingData);
      toast.success('✨ Welcome to VIO! Your plan is ready.');
      navigate('/dashboard');
    } catch (error: any) {
      toast.error('Failed to complete onboarding: ' + (error.response?.data?.detail || error.message));
      console.error('Onboarding error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-emerald-50">
      {/* Progress Bar */}
      <div className="sticky top-0 z-40 bg-white/70 backdrop-blur-sm border-b border-teal-100">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-800">{steps[step].title}</h2>
            <span className="text-sm text-slate-600">{step + 1}/{steps.length}</span>
          </div>
          <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${((step + 1) / steps.length) * 100}%` }}
              className="h-full bg-gradient-to-r from-teal-400 to-cyan-400"
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          {/* Step 0: Welcome */}
          {step === 0 && (
            <motion.div
              key="step-0"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="text-center space-y-4">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-teal-400 to-emerald-400 shadow-lg">
                  <Heart className="w-10 h-10 text-white" fill="currentColor" />
                </div>
                <h1 className="text-4xl font-bold text-slate-800">Welcome to VIO</h1>
                <p className="text-lg text-slate-600 max-w-xl mx-auto">
                  Your compassionate treatment companion. We'll help you manage your treatment journey with personalized daily tasks and support.
                </p>
              </div>

              <Card className="p-8 bg-white/60 backdrop-blur-sm border-teal-100">
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <Sparkles className="w-6 h-6 text-teal-500 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-semibold text-slate-800">Create Your Future Self</h3>
                      <p className="text-sm text-slate-600">Design a companion to support you through your treatment</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <Heart className="w-6 h-6 text-teal-500 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-semibold text-slate-800">Personalized Daily Tasks</h3>
                      <p className="text-sm text-slate-600">Manage medications and treatments with intelligent scheduling</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <Sparkles className="w-6 h-6 text-teal-500 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-semibold text-slate-800">Track Your Progress</h3>
                      <p className="text-sm text-slate-600">Celebrate milestones and build your resilience story</p>
                    </div>
                  </div>
                </div>
              </Card>

              <Button
                onClick={() => setStep(1)}
                className="w-full bg-gradient-to-r from-teal-400 to-cyan-400 hover:from-teal-500 hover:to-cyan-500 text-white font-semibold py-3"
              >
                Let's Begin <ChevronRight className="ml-2 w-5 h-5" />
              </Button>
            </motion.div>
          )}

          {/* Step 1: Meet Your Future Self */}
          {step === 1 && (
            <motion.div
              key="step-1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-teal-400 to-emerald-400 shadow-lg mb-4">
                  <Sparkles className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-slate-800">Meet Your Future Self</h2>
                <p className="text-slate-600 mt-2">What would you like to call your companion?</p>
              </div>

              <Card className="p-6 bg-white/60 backdrop-blur-sm border-teal-100">
                <Input
                  value={avatarName}
                  onChange={(e) => setAvatarName(e.target.value)}
                  placeholder="e.g., Hope, Resilience, My Future Me..."
                  className="text-lg py-3"
                />
                <p className="text-sm text-slate-500 mt-2">
                  Leave blank for "My Future Self"
                </p>
              </Card>

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
                  className="flex-1 bg-gradient-to-r from-teal-400 to-cyan-400"
                >
                  Next <ChevronRight className="ml-2 w-4 h-4" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* Step 2: Customize Avatar */}
          {step === 2 && (
            <motion.div
              key="step-2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="text-center space-y-4">
                <div className={`inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br ${getAvatarGradient()} shadow-lg mb-4`}>
                  <Sparkles className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-slate-800">Customize Your Companion</h2>
                <p className="text-slate-600">Choose how {avatarName || 'your companion'} appears and speaks to you</p>
              </div>

              <Card className="p-6 bg-white/60 backdrop-blur-sm border-teal-100 space-y-6">
                {/* Appearance */}
                <div>
                  <Label className="text-slate-700 mb-3 block font-semibold">Presence Style</Label>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { value: 'youthful', label: 'Youthful', desc: 'Vibrant & energetic' },
                      { value: 'mature', label: 'Mature', desc: 'Wise & grounded' },
                      { value: 'gentle', label: 'Gentle', desc: 'Soft & nurturing' },
                      { value: 'energetic', label: 'Energetic', desc: 'Dynamic & enthusiastic' },
                    ].map(opt => (
                      <button
                        key={opt.value}
                        onClick={() => setAvatar({ ...avatar, appearance: opt.value })}
                        className={`p-4 rounded-lg border-2 text-left transition-all ${
                          avatar.appearance === opt.value
                            ? 'border-teal-400 bg-teal-50'
                            : 'border-slate-200 bg-white hover:border-teal-200'
                        }`}
                      >
                        <div className="font-semibold text-slate-800">{opt.label}</div>
                        <div className="text-xs text-slate-600">{opt.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Expression */}
                <div>
                  <Label className="text-slate-700 mb-3 block font-semibold">Expression Style</Label>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { value: 'warm', label: 'Warm', desc: 'Comforting' },
                      { value: 'hopeful', label: 'Hopeful', desc: 'Optimistic' },
                      { value: 'peaceful', label: 'Peaceful', desc: 'Calm & serene' },
                      { value: 'joyful', label: 'Joyful', desc: 'Bright & uplifting' },
                    ].map(opt => (
                      <button
                        key={opt.value}
                        onClick={() => setAvatar({ ...avatar, expression: opt.value })}
                        className={`p-4 rounded-lg border-2 text-left transition-all ${
                          avatar.expression === opt.value
                            ? 'border-teal-400 bg-teal-50'
                            : 'border-slate-200 bg-white hover:border-teal-200'
                        }`}
                      >
                        <div className="font-semibold text-slate-800">{opt.label}</div>
                        <div className="text-xs text-slate-600">{opt.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tone */}
                <div>
                  <Label className="text-slate-700 mb-3 block font-semibold">Communication Tone</Label>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { value: 'encouraging', label: 'Encouraging', desc: 'Supportive' },
                      { value: 'gentle', label: 'Gentle', desc: 'Soft & patient' },
                      { value: 'inspiring', label: 'Inspiring', desc: 'Empowering' },
                      { value: 'celebratory', label: 'Celebratory', desc: 'Enthusiastic' },
                    ].map(opt => (
                      <button
                        key={opt.value}
                        onClick={() => setAvatar({ ...avatar, tone: opt.value })}
                        className={`p-4 rounded-lg border-2 text-left transition-all ${
                          avatar.tone === opt.value
                            ? 'border-teal-400 bg-teal-50'
                            : 'border-slate-200 bg-white hover:border-teal-200'
                        }`}
                      >
                        <div className="font-semibold text-slate-800">{opt.label}</div>
                        <div className="text-xs text-slate-600">{opt.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </Card>

              <div className="flex gap-3">
                <Button
                  onClick={() => setStep(1)}
                  variant="outline"
                  className="flex-1"
                >
                  Back
                </Button>
                <Button
                  onClick={() => setStep(3)}
                  className="flex-1 bg-gradient-to-r from-teal-400 to-cyan-400"
                >
                  Next <ChevronRight className="ml-2 w-4 h-4" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* Step 3: Treatment Plan */}
          {step === 3 && (
            <motion.div
              key="step-3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="text-center">
                <h2 className="text-3xl font-bold text-slate-800">Your Treatment Plan</h2>
                <p className="text-slate-600 mt-2">Tell us about your journey</p>
              </div>

              <Card className="p-6 bg-white/60 backdrop-blur-sm border-teal-100 space-y-4">
                <div>
                  <Label>Diagnosis (optional)</Label>
                  <Input
                    value={treatment.diagnosis}
                    onChange={(e) => setTreatment({ ...treatment, diagnosis: e.target.value })}
                    placeholder="e.g., Cancer, Chronic illness..."
                  />
                </div>

                <div>
                  <Label>Treatment Type (optional)</Label>
                  <Input
                    value={treatment.treatment_type}
                    onChange={(e) => setTreatment({ ...treatment, treatment_type: e.target.value })}
                    placeholder="e.g., Chemotherapy, Physical therapy..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Doctor Name (optional)</Label>
                    <Input
                      value={treatment.doctor_name}
                      onChange={(e) => setTreatment({ ...treatment, doctor_name: e.target.value })}
                      placeholder="Dr. Smith..."
                    />
                  </div>
                  <div>
                    <Label>Hospital/Clinic (optional)</Label>
                    <Input
                      value={treatment.hospital}
                      onChange={(e) => setTreatment({ ...treatment, hospital: e.target.value })}
                      placeholder="Hospital name..."
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Start Date *</Label>
                    <Input
                      type="date"
                      value={treatment.start_date}
                      onChange={(e) => setTreatment({ ...treatment, start_date: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label>Duration (weeks) *</Label>
                    <Input
                      type="number"
                      value={treatment.duration_weeks}
                      onChange={(e) => setTreatment({ ...treatment, duration_weeks: e.target.value })}
                      min="1"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label>Notes (optional)</Label>
                  <textarea
                    value={treatment.notes}
                    onChange={(e) => setTreatment({ ...treatment, notes: e.target.value })}
                    placeholder="Any additional information..."
                    className="w-full p-2 border rounded-lg text-sm"
                    rows={3}
                  />
                </div>
              </Card>

              <div className="flex gap-3">
                <Button
                  onClick={() => setStep(2)}
                  variant="outline"
                  className="flex-1"
                >
                  Back
                </Button>
                <Button
                  onClick={() => setStep(4)}
                  disabled={!treatment.start_date}
                  className="flex-1 bg-gradient-to-r from-teal-400 to-cyan-400"
                >
                  Next <ChevronRight className="ml-2 w-4 h-4" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* Step 4: Add Medications */}
          {step === 4 && (
            <motion.div
              key="step-4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="text-center">
                <h2 className="text-3xl font-bold text-slate-800">Add Your Medications</h2>
                <p className="text-slate-600 mt-2">Create daily tasks for your treatment</p>
              </div>

              <Card className="p-6 bg-white/60 backdrop-blur-sm border-teal-100 space-y-4">
                <div>
                  <Label>Medication Name *</Label>
                  <Input
                    value={newTask.title}
                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                    placeholder="e.g., Medication A, Vitamin D..."
                    required
                  />
                </div>

                <div>
                  <Label>Description (optional)</Label>
                  <Input
                    value={newTask.description}
                    onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                    placeholder="Details about this medication..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Frequency *</Label>
                    <select
                      value={newTask.frequency}
                      onChange={(e) => setNewTask({ ...newTask, frequency: e.target.value })}
                      className="w-full p-2 border rounded-lg"
                    >
                      <option value="daily">Every day</option>
                      <option value="every-2-days">Every 2 days</option>
                      <option value="every-3-days">Every 3 days</option>
                      <option value="weekly">Every week</option>
                      <option value="twice-weekly">Twice a week</option>
                      <option value="twice-daily">Twice a day</option>
                      <option value="three-times-daily">Three times a day</option>
                    </select>
                  </div>
                  <div>
                    <Label>Timing *</Label>
                    <select
                      value={newTask.timing}
                      onChange={(e) => setNewTask({ ...newTask, timing: e.target.value })}
                      className="w-full p-2 border rounded-lg"
                    >
                      <option value="morning">Morning</option>
                      <option value="afternoon">Afternoon</option>
                      <option value="evening">Evening</option>
                      <option value="night">Night</option>
                      <option value="anytime">Anytime</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Dosage (optional)</Label>
                    <Input
                      value={newTask.dosage}
                      onChange={(e) => setNewTask({ ...newTask, dosage: e.target.value })}
                      placeholder="e.g., 500mg..."
                    />
                  </div>
                  <div>
                    <Label>Quantity (optional)</Label>
                    <Input
                      value={newTask.quantity}
                      onChange={(e) => setNewTask({ ...newTask, quantity: e.target.value })}
                      placeholder="e.g., 1 tablet..."
                    />
                  </div>
                </div>

                <label className="flex items-center gap-3 p-3 bg-teal-50 rounded-lg cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newTask.is_important}
                    onChange={(e) => setNewTask({ ...newTask, is_important: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span className="text-sm font-medium text-slate-700">Mark as important</span>
                </label>

                <Button
                  onClick={addTask}
                  className="w-full bg-teal-500 hover:bg-teal-600"
                >
                  <Plus className="w-4 h-4 mr-2" /> Add Medication
                </Button>
              </Card>

              {/* Task List */}
              {tasks.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-semibold text-slate-800">Your Medications ({tasks.length})</h3>
                  {tasks.map((task, idx) => (
                    <Card key={idx} className="p-4 bg-white border-slate-200">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-slate-800">{task.title}</h4>
                          <p className="text-sm text-slate-600">{task.frequency} • {task.timing}</p>
                          {task.dosage && <p className="text-xs text-slate-500">{task.dosage} {task.quantity}</p>}
                        </div>
                        <button
                          onClick={() => removeTask(idx)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}

              <div className="flex gap-3">
                <Button
                  onClick={() => setStep(3)}
                  variant="outline"
                  className="flex-1"
                >
                  Back
                </Button>
                <Button
                  onClick={() => setStep(5)}
                  className="flex-1 bg-gradient-to-r from-teal-400 to-cyan-400"
                >
                  Review <ChevronRight className="ml-2 w-4 h-4" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* Step 5: Review & Confirm */}
          {step === 5 && (
            <motion.div
              key="step-5"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="text-center">
                <h2 className="text-3xl font-bold text-slate-800">Ready to Begin?</h2>
                <p className="text-slate-600 mt-2">Review your setup</p>
              </div>

              <Card className="p-6 bg-white/60 backdrop-blur-sm border-teal-100 space-y-4">
                {/* Avatar Summary */}
                <div className="p-4 bg-teal-50 rounded-lg">
                  <h3 className="font-semibold text-slate-800 mb-2">Your Companion: {avatarName || 'My Future Self'}</h3>
                  <p className="text-sm text-slate-600">{avatar.appearance} • {avatar.expression} • {avatar.tone}</p>
                </div>

                {/* Treatment Summary */}
                <div className="p-4 bg-cyan-50 rounded-lg">
                  <h3 className="font-semibold text-slate-800 mb-2">Your Treatment</h3>
                  <p className="text-sm text-slate-600">
                    {treatment.duration_weeks} weeks starting {new Date(treatment.start_date).toLocaleDateString()}
                  </p>
                  {treatment.diagnosis && <p className="text-xs text-slate-500">{treatment.diagnosis}</p>}
                </div>

                {/* Tasks Summary */}
                <div className="p-4 bg-emerald-50 rounded-lg">
                  <h3 className="font-semibold text-slate-800 mb-2">Your Medications ({tasks.length})</h3>
                  {tasks.map((task, idx) => (
                    <p key={idx} className="text-sm text-slate-600">{task.title} - {task.frequency}</p>
                  ))}
                </div>
              </Card>

              <div className="flex gap-3">
                <Button
                  onClick={() => setStep(4)}
                  variant="outline"
                  className="flex-1"
                >
                  Back
                </Button>
                <Button
                  onClick={handleComplete}
                  disabled={isLoading}
                  className="flex-1 bg-gradient-to-r from-teal-400 to-cyan-400 text-white font-semibold"
                >
                  {isLoading ? 'Setting up...' : 'Start VIO Journey'} ✨
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}