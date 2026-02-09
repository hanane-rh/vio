import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Zap, Heart, Waves, Flame, CheckCircle, TrendingUp } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Slider } from '../components/ui/slider';
import { Badge } from '../components/ui/badge';
import { toast } from 'sonner';
import { AvatarDisplay } from '../components/avatar-display';
import { useUser } from '../context/user-context';

type ChallengeMode = 'comfort' | 'flow' | 'momentum';

interface Challenge {
  id: string;
  mode: ChallengeMode;
  title: string;
  description: string;
  completed: boolean;
  date?: string;
}

interface UserState {
  fatigueLevel: number; // 0-100
  consistencyScore: number; // 0-100
  moodLevel: number; // 0-100
}

const MODE_CONFIG = {
  comfort: {
    icon: Heart,
    color: 'from-rose-400 to-pink-400',
    bgColor: 'from-rose-50 to-pink-50',
    label: 'Comfort Mode',
    description: 'Activated when you need extra support. Tasks are smaller, gentler, and focus on resilience.',
  },
  flow: {
    icon: Waves,
    color: 'from-blue-400 to-cyan-400',
    bgColor: 'from-blue-50 to-cyan-50',
    label: 'Flow Mode',
    description: 'You\'re in balance. Tasks progress smoothly at your natural pace.',
  },
  momentum: {
    icon: Flame,
    color: 'from-amber-400 to-orange-400',
    bgColor: 'from-amber-50 to-orange-50',
    label: 'Momentum Mode',
    description: 'You\'re thriving! Optional challenges and exploration opportunities await.',
  },
};

const CHALLENGES_BY_MODE = {
  comfort: [
    { id: 'c1', title: 'Take your medication', description: 'One small step at a time' },
    { id: 'c2', title: '5-minute gentle stretch', description: 'Just move a little, that\'s enough' },
    { id: 'c3', title: 'Drink a glass of water', description: 'Hydration is self-care' },
    { id: 'c4', title: 'Write one sentence in your journal', description: 'Your feelings matter' },
    { id: 'c5', title: 'Take three deep breaths', description: 'You\'re doing your best' },
  ],
  flow: [
    { id: 'f1', title: 'Complete morning medication routine', description: 'Maintain your steady rhythm' },
    { id: 'f2', title: '15-minute exercise session', description: 'Build on your progress' },
    { id: 'f3', title: 'Prepare a healthy meal', description: 'Nourish yourself well' },
    { id: 'f4', title: 'Evening reflection journal', description: 'Process today\'s experiences' },
    { id: 'f5', title: 'Connect with a loved one', description: 'Strengthen your support network' },
  ],
  momentum: [
    { id: 'm1', title: 'Full treatment protocol + bonus activity', description: 'Push your boundaries positively' },
    { id: 'm2', title: '30-minute advanced exercise', description: 'Challenge yourself physically' },
    { id: 'm3', title: 'Learn about your condition (10 min)', description: 'Knowledge empowers healing' },
    { id: 'm4', title: 'Plan a future wellness goal', description: 'Dream beyond treatment' },
    { id: 'm5', title: 'Share your story with someone', description: 'Inspire others with your journey' },
  ],
};

export function AdaptiveChallenges() {
  const { profile } = useUser();
  const [userState, setUserState] = useState<UserState>(() => {
    const saved = localStorage.getItem('carepath-user-state');
    return saved ? JSON.parse(saved) : { fatigueLevel: 50, consistencyScore: 50, moodLevel: 50 };
  });

  const [challenges, setChallenges] = useState<Challenge[]>(() => {
    const saved = localStorage.getItem('carepath-challenges');
    return saved ? JSON.parse(saved) : [];
  });

  const [showStateAdjustment, setShowStateAdjustment] = useState(false);

  useEffect(() => {
    localStorage.setItem('carepath-user-state', JSON.stringify(userState));
  }, [userState]);

  useEffect(() => {
    localStorage.setItem('carepath-challenges', JSON.stringify(challenges));
  }, [challenges]);

  // Calculate current mode based on user state
  const getCurrentMode = (): ChallengeMode => {
    const { fatigueLevel, consistencyScore, moodLevel } = userState;
    
    // High fatigue or low mood = comfort mode
    if (fatigueLevel > 70 || moodLevel < 40) {
      return 'comfort';
    }
    
    // High consistency and good mood = momentum mode
    if (consistencyScore > 70 && moodLevel > 70 && fatigueLevel < 40) {
      return 'momentum';
    }
    
    // Everything else = flow mode
    return 'flow';
  };

  const currentMode = getCurrentMode();
  const modeConfig = MODE_CONFIG[currentMode];
  const Icon = modeConfig.icon;

  // Generate today's challenges based on mode
  useEffect(() => {
    const today = new Date().toDateString();
    const hasToday = challenges.some(c => {
      const challengeDate = c.date ? new Date(c.date).toDateString() : null;
      return challengeDate === today;
    });

    if (!hasToday) {
      const todayChallenges = CHALLENGES_BY_MODE[currentMode].map(c => ({
        ...c,
        mode: currentMode,
        completed: false,
        date: new Date().toISOString(),
      }));
      setChallenges(prev => [...prev, ...todayChallenges]);
    }
  }, [currentMode]);

  const toggleChallenge = (id: string) => {
    const challenge = challenges.find(c => c.id === id);
    const wasCompleted = challenge?.completed;
    
    setChallenges(prev =>
      prev.map(c =>
        c.id === id ? { ...c, completed: !c.completed } : c
      )
    );

    // Adjust user state when completing challenges
    if (!wasCompleted) {
      setUserState(prev => ({
        ...prev,
        consistencyScore: Math.min(prev.consistencyScore + 2, 100),
        moodLevel: Math.min(prev.moodLevel + 1, 100),
        fatigueLevel: Math.max(prev.fatigueLevel - 1, 0),
      }));

      // Celebration toast based on mode
      const modeMessages = {
        comfort: [
          "You showed up. That's everything. 💙",
          "Gentle progress is still progress.",
          "You're honoring where you are today.",
        ],
        flow: [
          "Beautiful rhythm! Keep flowing. 🌊",
          "You're in your groove. Well done!",
          "This is what sustainable progress looks like.",
        ],
        momentum: [
          "Incredible! You're on fire! 🔥",
          "Your energy is inspiring. Keep soaring!",
          "Look at you go! This is amazing!",
        ],
      };
      
      const messages = modeMessages[currentMode];
      toast.success(messages[Math.floor(Math.random() * messages.length)]);
    }
  };

  const todayChallenges = challenges.filter(c => {
    const challengeDate = c.date ? new Date(c.date).toDateString() : null;
    return challengeDate === new Date().toDateString();
  });

  const completedToday = todayChallenges.filter(c => c.completed).length;
  const progressToday = todayChallenges.length > 0 ? (completedToday / todayChallenges.length) * 100 : 0;

  return (
    <div className="space-y-8">
      {/* Header with Avatar */}
      <div className="grid lg:grid-cols-[1fr,auto] gap-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center lg:text-left space-y-4"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-400 mb-2">
            <Zap className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-slate-800">Adaptive Challenges</h1>
          <p className="text-lg text-slate-600 max-w-2xl">
            Your challenges adapt to how you're feeling. We meet you exactly where you are, every single day.
          </p>
        </motion.div>

        {/* Avatar Display */}
        {profile && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="p-6 bg-white/60 backdrop-blur-sm border-emerald-100">
              <AvatarDisplay
                config={profile.avatar}
                size="large"
                showName
              />
            </Card>
          </motion.div>
        )}
      </div>

      {/* Current Mode Display */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
      >
        <Card className={`p-8 bg-gradient-to-br ${modeConfig.bgColor} border-2 ${currentMode === 'comfort' ? 'border-rose-200' : currentMode === 'flow' ? 'border-blue-200' : 'border-amber-200'}`}>
          <div className="flex items-start gap-6">
            <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${modeConfig.color} flex items-center justify-center flex-shrink-0 shadow-lg`}>
              <Icon className="w-10 h-10 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-3xl font-bold text-slate-800 mb-2">{modeConfig.label}</h2>
              <p className="text-lg text-slate-600 leading-relaxed">{modeConfig.description}</p>
              
              <div className="mt-4 flex gap-2">
                <Badge variant="outline" className="text-slate-600">
                  Today: {completedToday} / {todayChallenges.length} completed
                </Badge>
                <Badge variant="outline" className={`${progressToday === 100 ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'text-slate-600'}`}>
                  {Math.round(progressToday)}% progress
                </Badge>
              </div>
            </div>

            <Button
              variant="outline"
              onClick={() => setShowStateAdjustment(!showStateAdjustment)}
              className="flex-shrink-0"
            >
              Adjust Settings
            </Button>
          </div>
        </Card>
      </motion.div>

      {/* User State Adjustment */}
      <AnimatePresence>
        {showStateAdjustment && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Card className="p-6 bg-white/60 backdrop-blur-sm border-slate-200">
              <h3 className="text-xl font-semibold text-slate-800 mb-4">Tell Us How You're Feeling</h3>
              <p className="text-sm text-slate-600 mb-6">
                Your challenges adapt based on these factors. Adjust them to reflect how you're really doing today.
              </p>

              <div className="space-y-6">
                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-sm font-medium text-slate-700">Fatigue Level</label>
                    <span className="text-sm text-slate-600">{userState.fatigueLevel}%</span>
                  </div>
                  <Slider
                    value={[userState.fatigueLevel]}
                    onValueChange={([value]) => setUserState(prev => ({ ...prev, fatigueLevel: value }))}
                    max={100}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between mt-1 text-xs text-slate-500">
                    <span>Energized</span>
                    <span>Exhausted</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-sm font-medium text-slate-700">Consistency Score</label>
                    <span className="text-sm text-slate-600">{userState.consistencyScore}%</span>
                  </div>
                  <Slider
                    value={[userState.consistencyScore]}
                    onValueChange={([value]) => setUserState(prev => ({ ...prev, consistencyScore: value }))}
                    max={100}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between mt-1 text-xs text-slate-500">
                    <span>Just starting</span>
                    <span>Very consistent</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-sm font-medium text-slate-700">Mood Level</label>
                    <span className="text-sm text-slate-600">{userState.moodLevel}%</span>
                  </div>
                  <Slider
                    value={[userState.moodLevel]}
                    onValueChange={([value]) => setUserState(prev => ({ ...prev, moodLevel: value }))}
                    max={100}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between mt-1 text-xs text-slate-500">
                    <span>Struggling</span>
                    <span>Great</span>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Today's Challenges */}
      <div>
        <h2 className="text-2xl font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <CheckCircle className="w-6 h-6 text-emerald-500" />
          Today's Challenges
        </h2>

        <div className="space-y-3">
          <AnimatePresence>
            {todayChallenges.map((challenge, index) => (
              <motion.div
                key={challenge.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card
                  className={`p-6 cursor-pointer transition-all duration-300 ${
                    challenge.completed
                      ? `bg-gradient-to-r ${modeConfig.bgColor} border-2 ${currentMode === 'comfort' ? 'border-rose-200' : currentMode === 'flow' ? 'border-blue-200' : 'border-amber-200'}`
                      : 'bg-white/60 backdrop-blur-sm border-slate-200 hover:border-slate-300'
                  }`}
                  onClick={() => toggleChallenge(challenge.id)}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`w-8 h-8 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                        challenge.completed
                          ? `bg-gradient-to-br ${modeConfig.color} border-transparent`
                          : 'border-slate-300 bg-white'
                      }`}
                    >
                      {challenge.completed && <CheckCircle className="w-5 h-5 text-white" fill="currentColor" />}
                    </div>
                    <div className="flex-1">
                      <h3 className={`text-lg font-semibold mb-1 ${challenge.completed ? 'text-slate-600' : 'text-slate-800'}`}>
                        {challenge.title}
                      </h3>
                      <p className="text-sm text-slate-600 italic">{challenge.description}</p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Progress Insights */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="p-6 bg-gradient-to-r from-teal-50 to-emerald-50 border-teal-200">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-400 to-emerald-400 flex items-center justify-center flex-shrink-0">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-slate-800 mb-2">Your Adaptive Journey</h3>
              <p className="text-slate-700 leading-relaxed">
                {currentMode === 'comfort' && "Right now, you need gentleness. These smaller tasks honor where you are. Every single one counts as courage."}
                {currentMode === 'flow' && "You're in your rhythm. This is the sweet spot where growth feels natural. Keep this beautiful pace."}
                {currentMode === 'momentum' && "You're soaring! This energy is remarkable. These challenges will help you channel it into lasting progress."}
              </p>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}