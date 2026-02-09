import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, MessageCircle, CheckCircle, Calendar } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Progress } from '../components/ui/progress';
import { toast } from 'sonner';
import { AvatarDisplay } from '../components/avatar-display';
import { useUser } from '../context/user-context';

interface TreatmentAction {
  id: string;
  title: string;
  completed: boolean;
  date?: string;
}

interface FutureSelfMessage {
  id: number;
  type: 'letter' | 'voice' | 'advice';
  content: string;
  unlockProgress: number;
}

const FUTURE_SELF_MESSAGES: FutureSelfMessage[] = [
  {
    id: 1,
    type: 'letter',
    content: "Hey... it's me. Well, it's you — from a place where things are better. I can't see you clearly yet, but I can feel you trying. Keep going.",
    unlockProgress: 10,
  },
  {
    id: 2,
    type: 'advice',
    content: "I remember how hard today was. But you made it through. That strength? It's still here with me. You're building something permanent.",
    unlockProgress: 20,
  },
  {
    id: 3,
    type: 'letter',
    content: "I'm becoming clearer now. I can see the moments that shaped me — shaped us. Every treatment you complete is a conversation we have. You're not alone in this.",
    unlockProgress: 35,
  },
  {
    id: 4,
    type: 'voice',
    content: "The pain you're feeling? It teaches us something. Not that suffering is noble, but that persistence is powerful. I'm grateful you didn't give up.",
    unlockProgress: 50,
  },
  {
    id: 5,
    type: 'letter',
    content: "I can see you now — your face, your determination. I want to tell you about the morning I woke up and realized the hardest part was behind us. You're almost there.",
    unlockProgress: 65,
  },
  {
    id: 6,
    type: 'advice',
    content: "There's a day coming when treatment won't define your schedule. When you'll plan trips, adventures, normal life. I'm living that day. Thank you for getting us here.",
    unlockProgress: 80,
  },
  {
    id: 7,
    type: 'letter',
    content: "I am you — fully realized, healthy, hopeful. The journey that felt impossible? We made it. And now I get to live the life you fought for. You are becoming me, one brave day at a time.",
    unlockProgress: 100,
  },
];

export function FutureSelfDialogue() {
  const { profile } = useUser();
  const [actions, setActions] = useState<TreatmentAction[]>(() => {
    const saved = localStorage.getItem('carepath-actions');
    return saved ? JSON.parse(saved) : [
      { id: '1', title: 'Morning medication', completed: false },
      { id: '2', title: 'Physical therapy exercises', completed: false },
      { id: '3', title: 'Evening medication', completed: false },
      { id: '4', title: 'Meditation session', completed: false },
      { id: '5', title: 'Health journal entry', completed: false },
    ];
  });

  const [unlockedMessages, setUnlockedMessages] = useState<number[]>(() => {
    const saved = localStorage.getItem('carepath-unlocked-messages');
    return saved ? JSON.parse(saved) : [];
  });

  const completedCount = actions.filter(a => a.completed).length;
  const progress = (completedCount / actions.length) * 100;
  const overallProgress = Math.min(progress * 2, 100); // Scale up for demo

  useEffect(() => {
    localStorage.setItem('carepath-actions', JSON.stringify(actions));
  }, [actions]);

  useEffect(() => {
    localStorage.setItem('carepath-unlocked-messages', JSON.stringify(unlockedMessages));
  }, [unlockedMessages]);

  useEffect(() => {
    // Check for newly unlocked messages
    FUTURE_SELF_MESSAGES.forEach(message => {
      if (overallProgress >= message.unlockProgress && !unlockedMessages.includes(message.id)) {
        setUnlockedMessages(prev => [...prev, message.id]);
      }
    });
  }, [overallProgress, unlockedMessages]);

  const toggleAction = (id: string) => {
    const action = actions.find(a => a.id === id);
    const wasCompleted = action?.completed;
    
    setActions(prev =>
      prev.map(action =>
        action.id === id
          ? { ...action, completed: !action.completed, date: !action.completed ? new Date().toISOString() : undefined }
          : action
      )
    );

    // Show encouraging toast when completing an action
    if (!wasCompleted) {
      const encouragements = [
        "Beautiful! Your future self is smiling.",
        "You're doing it! Another step closer.",
        "Wonderful progress. Keep going!",
        "Your dedication is inspiring. ✨",
        "Amazing work! You're becoming stronger.",
      ];
      toast.success(encouragements[Math.floor(Math.random() * encouragements.length)]);
    }
  };

  const silhouetteOpacity = Math.min(overallProgress / 100, 1);
  const silhouetteClarity = overallProgress > 50 ? 'grayscale-0' : 'grayscale';

  return (
    <div className="space-y-8">
      {/* Header with Avatar */}
      <div className="grid lg:grid-cols-[1fr,auto] gap-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center lg:text-left space-y-4"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-400 to-purple-400 mb-2">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-slate-800">Future Self Dialogue</h1>
          <p className="text-lg text-slate-600 max-w-2xl">
            Your future self is waiting to connect with you. Complete your treatment actions to strengthen the bond.
          </p>
        </motion.div>

        {/* Avatar Display */}
        {profile && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="p-6 bg-white/60 backdrop-blur-sm border-violet-100">
              <AvatarDisplay
                config={profile.avatar}
                size="large"
                showName
              />
            </Card>
          </motion.div>
        )}
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Treatment Actions */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="p-6 bg-white/60 backdrop-blur-sm border-violet-100">
            <h2 className="text-2xl font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <CheckCircle className="w-6 h-6 text-violet-500" />
              Today's Treatment Actions
            </h2>
            
            <div className="space-y-3 mb-6">
              {actions.map((action, index) => (
                <motion.div
                  key={action.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`p-4 rounded-xl border transition-all duration-300 cursor-pointer ${
                    action.completed
                      ? 'bg-gradient-to-r from-violet-50 to-purple-50 border-violet-200'
                      : 'bg-white border-slate-200 hover:border-violet-200'
                  }`}
                  onClick={() => toggleAction(action.id)}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                        action.completed
                          ? 'bg-violet-500 border-violet-500'
                          : 'border-slate-300'
                      }`}
                    >
                      {action.completed && <CheckCircle className="w-4 h-4 text-white" fill="currentColor" />}
                    </div>
                    <span className={`flex-1 ${action.completed ? 'text-slate-600' : 'text-slate-800'}`}>
                      {action.title}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm text-slate-600">
                <span>Your Progress</span>
                <span className="font-semibold">{Math.round(overallProgress)}%</span>
              </div>
              <Progress value={overallProgress} className="h-3" />
            </div>
          </Card>
        </motion.div>

        {/* Future Self Visualization */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="p-6 bg-gradient-to-br from-violet-50 to-purple-50 border-violet-100 min-h-[400px] flex flex-col">
            <h2 className="text-2xl font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-violet-500" />
              Your Future Self
            </h2>

            {/* Avatar Silhouette */}
            <div className="flex-1 flex items-center justify-center mb-6">
              <motion.div
                animate={{ opacity: silhouetteOpacity }}
                transition={{ duration: 1 }}
                className="relative"
              >
                <div className={`w-48 h-48 rounded-full bg-gradient-to-br from-violet-300 to-purple-300 flex items-center justify-center shadow-lg ${silhouetteClarity} transition-all duration-1000`}>
                  <Sparkles className="w-24 h-24 text-white" strokeWidth={1.5} />
                </div>
                {overallProgress >= 50 && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-2 -right-2 w-12 h-12 bg-gradient-to-br from-yellow-300 to-amber-300 rounded-full flex items-center justify-center shadow-md"
                  >
                    <Sparkles className="w-6 h-6 text-white" fill="currentColor" />
                  </motion.div>
                )}
              </motion.div>
            </div>

            <div className="text-center">
              <p className="text-sm text-slate-600 italic">
                {overallProgress < 20 && "A soft silhouette begins to form..."}
                {overallProgress >= 20 && overallProgress < 50 && "Your future self is becoming clearer..."}
                {overallProgress >= 50 && overallProgress < 80 && "They're almost fully present now..."}
                {overallProgress >= 80 && "Your future self is here with you."}
              </p>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Messages from Future Self */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h2 className="text-2xl font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <MessageCircle className="w-6 h-6 text-violet-500" />
          Messages from Your Future Self
        </h2>

        <div className="space-y-4">
          <AnimatePresence>
            {FUTURE_SELF_MESSAGES.map((message) => {
              const isUnlocked = unlockedMessages.includes(message.id);
              const canUnlock = overallProgress >= message.unlockProgress;

              return (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <Card
                    className={`p-6 transition-all duration-300 ${
                      isUnlocked
                        ? 'bg-gradient-to-r from-violet-50 to-purple-50 border-violet-200'
                        : 'bg-slate-50 border-slate-200 opacity-50'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          isUnlocked
                            ? 'bg-gradient-to-br from-violet-400 to-purple-400'
                            : 'bg-slate-300'
                        }`}
                      >
                        {isUnlocked ? (
                          <MessageCircle className="w-5 h-5 text-white" />
                        ) : (
                          <span className="text-white text-xs">🔒</span>
                        )}
                      </div>
                      <div className="flex-1">
                        {isUnlocked ? (
                          <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-slate-700 leading-relaxed italic"
                          >
                            "{message.content}"
                          </motion.p>
                        ) : (
                          <p className="text-slate-500">
                            {canUnlock
                              ? 'Unlocking...'
                              : `Unlocks at ${message.unlockProgress}% progress`}
                          </p>
                        )}
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}