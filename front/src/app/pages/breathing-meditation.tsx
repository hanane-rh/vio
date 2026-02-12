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

  const animationFrameRef = useRef<number>();
  const lastUpdateRef = useRef<number>(Date.now());

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

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-sky-400 to-blue-400 mb-2">
          <Wind className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-4xl font-bold text-slate-800">Guided Breathing & Meditation</h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          Find calm in the moment. Let this gentle breathing guide support your wellbeing and reduce treatment stress.
        </p>
      </motion.div>

      {/* Main Breathing Interface */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl mx-auto"
      >
        <Card className="p-8 bg-gradient-to-br from-sky-50 via-blue-50 to-teal-50 border-sky-100">
          {/* Breathing Orb */}
          <div className="relative h-96 flex items-center justify-center mb-8">
            {/* Background glow */}
            <motion.div
              animate={{
                scale: getBubbleScale(),
                opacity: isActive ? 0.3 : 0.2,
              }}
              transition={{
                duration: phase === 'inhale' 
                  ? BREATHING_PATTERNS[pattern].inhale
                  : phase === 'hold'
                  ? BREATHING_PATTERNS[pattern].hold
                  : phase === 'exhale'
                  ? BREATHING_PATTERNS[pattern].exhale
                  : 1,
                ease: 'easeInOut',
              }}
              className={`absolute w-64 h-64 rounded-full bg-gradient-to-br ${getPhaseColor()} blur-3xl`}
            />

            {/* Main Orb */}
            <motion.div
              animate={{
                scale: getBubbleScale(),
              }}
              transition={{
                duration: phase === 'inhale' 
                  ? BREATHING_PATTERNS[pattern].inhale
                  : phase === 'hold'
                  ? BREATHING_PATTERNS[pattern].hold
                  : phase === 'exhale'
                  ? BREATHING_PATTERNS[pattern].exhale
                  : 1,
                ease: 'easeInOut',
              }}
              className={`relative w-64 h-64 rounded-full bg-gradient-to-br ${getPhaseColor()} shadow-2xl flex items-center justify-center`}
            >
              {/* Inner circle with phase text */}
              <div className="text-center text-white">
                <motion.div
                  key={phase}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-2xl font-semibold mb-2"
                >
                  {getPhaseText()}
                </motion.div>
                {isActive && (
                  <div className="text-sm opacity-80">
                    {Math.ceil(
                      (phase === 'inhale' ? BREATHING_PATTERNS[pattern].inhale :
                       phase === 'hold' ? BREATHING_PATTERNS[pattern].hold :
                       phase === 'exhale' ? BREATHING_PATTERNS[pattern].exhale : 1) - phaseProgress
                    )}s
                  </div>
                )}
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
                    className="absolute inset-0 rounded-full border-4 border-white"
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
                    className="absolute inset-0 rounded-full border-4 border-white"
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
              className="text-center mb-8"
            >
              <p className="text-xl text-slate-700 italic font-light">
                "{currentMessage}"
              </p>
            </motion.div>
          </AnimatePresence>

          {/* Progress Bar */}
          {isActive && (
            <div className="mb-6">
              <div className="flex justify-between text-sm text-slate-600 mb-2">
                <span>Session Progress</span>
                <span>{remainingMinutes}:{remainingSeconds.toString().padStart(2, '0')} remaining</span>
              </div>
              <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-sky-400 to-teal-400"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>
          )}

          {/* Controls */}
          <div className="flex justify-center gap-3 mb-6">
            {!isActive ? (
              <Button
                onClick={startBreathing}
                size="lg"
                className="bg-gradient-to-r from-sky-400 to-blue-400 hover:from-sky-500 hover:to-blue-500 text-white px-8"
              >
                <Play className="w-5 h-5 mr-2" />
                Start Session
              </Button>
            ) : (
              <>
                <Button
                  onClick={pauseBreathing}
                  size="lg"
                  variant="outline"
                >
                  <Pause className="w-5 h-5 mr-2" />
                  Pause
                </Button>
                <Button
                  onClick={resetBreathing}
                  size="lg"
                  variant="outline"
                >
                  <RotateCcw className="w-5 h-5 mr-2" />
                  Reset
                </Button>
              </>
            )}
          </div>

          {/* Stats */}
          {isActive && (
            <div className="text-center">
              <Badge variant="outline" className="text-slate-600">
                {completedCycles} breathing cycles completed
              </Badge>
            </div>
          )}
        </Card>
      </motion.div>

      {/* Settings */}
      {!isActive && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto"
        >
          <Card className="p-6 bg-white/60 backdrop-blur-sm border-slate-200">
            <h2 className="text-xl font-semibold text-slate-800 mb-4">Customize Your Session</h2>
            
            <div className="grid sm:grid-cols-2 gap-4">
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

            {/* Sound Toggle */}
            <div className="mt-4 pt-4 border-t border-slate-200">
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-800 transition-colors"
              >
                {soundEnabled ? (
                  <Volume2 className="w-4 h-4" />
                ) : (
                  <VolumeX className="w-4 h-4" />
                )}
                <span>
                  {soundEnabled ? 'Ambient sounds enabled' : 'Silent mode'}
                </span>
              </button>
              <p className="text-xs text-slate-500 mt-1 ml-6">
                Optional calming soundscape (coming soon)
              </p>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Benefits Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="max-w-2xl mx-auto"
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
