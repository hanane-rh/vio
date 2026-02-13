import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Wind, Play, Pause, RotateCcw, Volume2, VolumeX } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Badge } from '../components/ui/badge';

const BREATHING_PATTERNS = {
  slow: { inhale: 5, hold: 3, exhale: 6, name: 'Slow & Calming' },
  medium: { inhale: 4, hold: 2, exhale: 5, name: 'Balanced Rhythm' },
  therapeutic: { inhale: 4, hold: 7, exhale: 8, name: 'Therapeutic Deep Breathing' },
};

const DURATIONS = [
  { value: 60, label: '1 minute' },
  { value: 180, label: '3 minutes' },
  { value: 300, label: '5 minutes' },
  { value: 600, label: '10 minutes' },
];

const SUPPORTIVE_MESSAGES = [
  "Take this moment for yourself.",
  "You are safe in this pause.",
  "Healing includes rest.",
  "Everything will be alright.",
  "You are doing enough.",
  "This breath is a gift to yourself.",
  "Let go of what you cannot control.",
  "Peace is found in the present.",
  "You deserve this calm.",
  "Breathe in courage, breathe out fear.",
  "Your wellbeing matters.",
  "Be gentle with yourself.",
  "You are exactly where you need to be.",
  "This moment is yours.",
  "Trust the process of healing.",
];

type BreathingPhase = 'inhale' | 'hold' | 'exhale' | 'rest';

export function BreathingMeditation() {
  const [isActive, setIsActive] = useState(false);
  const [pattern, setPattern] = useState<keyof typeof BREATHING_PATTERNS>('medium');
  const [duration, setDuration] = useState(180);
  const [phase, setPhase] = useState<BreathingPhase>('rest');
  const [phaseProgress, setPhaseProgress] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [currentMessage, setCurrentMessage] = useState(SUPPORTIVE_MESSAGES[0]);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [completedCycles, setCompletedCycles] = useState(0);
  const [selectedAvatar, setSelectedAvatar] = useState('avatar1');
  const [avatarName, setAvatarName] = useState('your future self');

  const animationFrameRef = useRef<number | null>(null);
  const lastUpdateRef = useRef<number>(Date.now());

  // Load avatar from localStorage
  useEffect(() => {
    const savedAvatar = localStorage.getItem('vio-selected-avatar');
    const savedName = localStorage.getItem('vio-onboarding-avatar-name');
    if (savedAvatar) setSelectedAvatar(savedAvatar);
    if (savedName) setAvatarName(savedName);
  }, []);

  useEffect(() => {
    if (!isActive) return;

    const animate = () => {
      const now = Date.now();
      const delta = (now - lastUpdateRef.current) / 1000;
      lastUpdateRef.current = now;

      setElapsedTime(prev => {
        const newElapsed = prev + delta;
        if (newElapsed >= duration) {
          setIsActive(false);
          return duration;
        }
        return newElapsed;
      });

      setPhaseProgress(prev => {
        const currentPattern = BREATHING_PATTERNS[pattern];
        let phaseDuration = 0;

        switch (phase) {
          case 'inhale':
            phaseDuration = currentPattern.inhale;
            break;
          case 'hold':
            phaseDuration = currentPattern.hold;
            break;
          case 'exhale':
            phaseDuration = currentPattern.exhale;
            break;
          case 'rest':
            phaseDuration = 1;
            break;
        }

        const newProgress = prev + delta;

        if (newProgress >= phaseDuration) {
          // Move to next phase
          let nextPhase: BreathingPhase = 'rest';
          if (phase === 'rest' || phase === 'exhale') {
            nextPhase = 'inhale';
            setCompletedCycles(c => c + 1);
            // Change message every cycle
            setCurrentMessage(SUPPORTIVE_MESSAGES[Math.floor(Math.random() * SUPPORTIVE_MESSAGES.length)]);
          } else if (phase === 'inhale') {
            nextPhase = 'hold';
          } else if (phase === 'hold') {
            nextPhase = 'exhale';
          }
          
          setPhase(nextPhase);
          return 0;
        }

        return newProgress;
      });

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isActive, phase, pattern, duration]);

  const startBreathing = () => {
    setIsActive(true);
    setPhase('inhale');
    setPhaseProgress(0);
    setElapsedTime(0);
    lastUpdateRef.current = Date.now();
    setCompletedCycles(0);
  };

  const pauseBreathing = () => {
    setIsActive(false);
  };

  const resetBreathing = () => {
    setIsActive(false);
    setPhase('rest');
    setPhaseProgress(0);
    setElapsedTime(0);
    setCompletedCycles(0);
    setCurrentMessage(SUPPORTIVE_MESSAGES[0]);
  };

  const getPhaseText = () => {
    switch (phase) {
      case 'inhale':
        return 'Breathe In';
      case 'hold':
        return 'Hold';
      case 'exhale':
        return 'Breathe Out';
      case 'rest':
        return 'Rest';
    }
  };

  const getPhaseColor = () => {
    switch (phase) {
      case 'inhale':
        return 'from-sky-400 to-blue-400';
      case 'hold':
        return 'from-violet-400 to-purple-400';
      case 'exhale':
        return 'from-teal-400 to-emerald-400';
      case 'rest':
        return 'from-slate-300 to-slate-400';
    }
  };

  const getBubbleScale = () => {
    const currentPattern = BREATHING_PATTERNS[pattern];
    let phaseDuration = 0;
    let targetScale = 1;

    switch (phase) {
      case 'inhale':
        phaseDuration = currentPattern.inhale;
        targetScale = 1.5;
        break;
      case 'hold':
        phaseDuration = currentPattern.hold;
        targetScale = 1.5;
        break;
      case 'exhale':
        phaseDuration = currentPattern.exhale;
        targetScale = 0.7;
        break;
      case 'rest':
        phaseDuration = 1;
        targetScale = 1;
        break;
    }

    const progress = Math.min(phaseProgress / phaseDuration, 1);
    
    if (phase === 'inhale') {
      return 1 + (targetScale - 1) * progress;
    } else if (phase === 'exhale') {
      return 1.5 - (1.5 - targetScale) * progress;
    }
    
    return targetScale;
  };

  const remainingTime = Math.max(0, duration - elapsedTime);
  const remainingMinutes = Math.floor(remainingTime / 60);
  const remainingSeconds = Math.floor(remainingTime % 60);
  const progressPercentage = (elapsedTime / duration) * 100;

  const AVATAR_CHARACTERS = [
    { id: 'avatar1', name: 'Boy', image: '/assert/avatar1.png' },
    { id: 'avatar2', name: 'Girl', image: '/assert/avatar2.png' },
    { id: 'avatar3', name: 'Girl2', image: '/assert/avatar3.png' },
    { id: 'avatar4', name: 'Boy2', image: '/assert/avatar4.png' },
    { id: 'avatar5', name: 'Mario', image: '/assert/avatar5.png' },
    { id: 'avatar6', name: 'Cat', image: '/assert/avatar6.png' },
    { id: 'avatar7', name: 'Hijabi', image: '/assert/avatar7.png' },
    { id: 'avatar8', name: 'Dog', image: '/assert/avatar8.png' },
    { id: 'avatar9', name: 'BoyDog', image: '/assert/avatar9.png' },
    { id: 'avatar10', name: 'HatBoy', image: '/assert/avatar10.png' },
    { id: 'avatar11', name: 'Boy3', image: '/assert/avatar11.png' },
    { id: 'avatar12', name: 'BabyBoy', image: '/assert/avatar12.png' },
    { id: 'avatar13', name: 'GirlCat', image: '/assert/avatar13.png' },
  ];

  const currentAvatar = AVATAR_CHARACTERS.find(a => a.id === selectedAvatar) || AVATAR_CHARACTERS[0];

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        <h1 className="text-4xl font-bold text-slate-800">Guided Breathing & Meditation</h1>
        <p className="text-slate-600 max-w-2xl">
          Find calm in the moment. Let this gentle breathing guide support your wellbeing and reduce treatment stress.
        </p>
      </motion.div>

      {/* Main Content - Two Column Layout */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid lg:grid-cols-2 gap-6"
      >
        {/* LEFT - Breathing Card */}
        <Card className="p-8 bg-gradient-to-br from-blue-50 to-purple-50 border-purple-200 border-2">
          <div className="flex flex-col items-center space-y-6">
            {/* Breathing Circle */}
            <div className="relative w-full max-w-xs aspect-square flex items-center justify-center">
              <motion.div
                animate={{
                  scale: getBubbleScale(),
                }}
                transition={{
                  duration: 0.3,
                  ease: 'easeInOut',
                }}
                className="relative w-48 h-48 flex items-center justify-center"
              >
                {/* Main circle */}
                <div className={`w-full h-full rounded-full bg-gradient-to-br ${getPhaseColor()} shadow-2xl flex items-center justify-center relative z-10`}>
                  <motion.div
                    key={phase}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center text-white font-semibold text-xl"
                  >
                    {getPhaseText()}
                  </motion.div>
                </div>

                {/* Pulse rings */}
                {isActive && (
                  <>
                    <motion.div
                      animate={{
                        scale: [1, 1.3, 1],
                        opacity: [0.5, 0, 0.5],
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: 'easeInOut',
                      }}
                      className="absolute inset-0 rounded-full border-4 border-blue-300"
                    />
                    <motion.div
                      animate={{
                        scale: [1, 1.3, 1],
                        opacity: [0.5, 0, 0.5],
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: 'easeInOut',
                        delay: 1.5,
                      }}
                      className="absolute inset-0 rounded-full border-4 border-purple-300"
                    />
                  </>
                )}
              </motion.div>
            </div>

            {/* Supportive Message */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentMessage}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-center"
              >
                <p className="text-slate-600 italic text-sm">
                  "{currentMessage}"
                </p>
              </motion.div>
            </AnimatePresence>

            {/* Controls */}
            <div className="flex justify-center gap-3 w-full">
              {!isActive ? (
                <Button
                  onClick={startBreathing}
                  className="bg-gradient-to-r from-cyan-400 to-blue-400 hover:from-cyan-500 hover:to-blue-500 text-white px-6 shadow-lg"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Start Session
                  <span className="ml-2 text-xs">+5pts</span>
                </Button>
              ) : (
                <>
                  <Button
                    onClick={pauseBreathing}
                    variant="outline"
                    size="sm"
                  >
                    <Pause className="w-4 h-4 mr-1" />
                    Pause
                  </Button>
                  <Button
                    onClick={resetBreathing}
                    variant="outline"
                    size="sm"
                  >
                    <RotateCcw className="w-4 h-4 mr-1" />
                    Reset
                  </Button>
                </>
              )}
            </div>

            {/* Progress Bar */}
            {isActive && (
              <div className="w-full space-y-2">
                <div className="flex justify-between text-xs text-slate-600">
                  <span>Progress</span>
                  <span>{remainingMinutes}:{remainingSeconds.toString().padStart(2, '0')}</span>
                </div>
                <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-sky-400 to-teal-400"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
                <div className="text-center">
                  <Badge variant="outline" className="text-xs text-slate-600">
                    {completedCycles} cycles
                  </Badge>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* RIGHT - Avatar & Customize Section */}
        <div className="space-y-4">
          {/* Avatar with Speech Bubble */}
          <div className="flex flex-col items-center space-y-4">
            {/* Speech Bubble */}
            <div className="relative bg-white px-6 py-4 rounded-2xl shadow-sm border border-pink-200">
              <p className="text-sm text-slate-700 leading-relaxed italic">
                "help yourself to breathe well"
              </p>
              {/* Triangle pointer */}
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-white border-r border-b border-pink-200 rotate-45"></div>
            </div>

            {/* Avatar */}
            <div className="w-35 h-35">
              <img
                src={currentAvatar.image}
                alt={currentAvatar.name}
                className="w-full h-full object-contain"
                style={{ imageRendering: 'pixelated' }}
              />
            </div>
          </div>

          {/* Customize Your Session Card */}
          <Card className="p-6 bg-white/80 backdrop-blur-sm border-pink-200 border-2">
            <h2 className="text-xl font-semibold text-slate-800 mb-4">Customize Your Session</h2>
            
            <div className="space-y-4">
              {/* Breathing Pattern */}
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">
                  Breathing Pattern
                </label>
                <Select value={pattern} onValueChange={(v: any) => setPattern(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(BREATHING_PATTERNS).map(([key, value]) => (
                      <SelectItem key={key} value={key}>
                        {value.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-slate-500 mt-1">
                  In {BREATHING_PATTERNS[pattern].inhale}s · Hold {BREATHING_PATTERNS[pattern].hold}s · Out {BREATHING_PATTERNS[pattern].exhale}s
                </p>
              </div>

              {/* Duration */}
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">
                  Session Duration
                </label>
                <Select value={duration.toString()} onValueChange={(v) => setDuration(Number(v))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DURATIONS.map((d) => (
                      <SelectItem key={d.value} value={d.value.toString()}>
                        {d.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>
        </div>
      </motion.div>

      {/* Benefits Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="max-w-4xl"
      >
        <Card className="p-6 bg-gradient-to-r from-teal-50 to-emerald-50 border-teal-100">
          <h3 className="font-semibold text-slate-800 mb-3">Why Breathing Exercises?</h3>
          <ul className="space-y-2 text-sm text-slate-600">
            <li className="flex items-start gap-2">
              <span className="text-teal-500 mt-0.5">✓</span>
              <span>Reduces stress and anxiety related to treatment</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-teal-500 mt-0.5">✓</span>
              <span>Improves focus and emotional regulation</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-teal-500 mt-0.5">✓</span>
              <span>Supports better sleep and recovery</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-teal-500 mt-0.5">✓</span>
              <span>Creates moments of calm in your healing journey</span>
            </li>
          </ul>
        </Card>
      </motion.div>
    </div>
  );
}
