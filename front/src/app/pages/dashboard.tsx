import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle, Calendar, Zap, Star as StarIcon, Trophy, Clock, X, Flame } from 'lucide-react';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { useUser } from '../../context/user-context';
import { toast } from 'sonner';
import { Link } from 'react-router';
import { apiService } from '../../services/api';

// Avatar characters with unlock requirements
const AVATAR_CHARACTERS = [
  { id: 'avatar1', name: 'Princess', image: '/assert/avatar1.png', unlocked: true, requiredPoints: 0 },
  { id: 'avatar2', name: 'Hero', image: '/assert/avatar2.png', unlocked: true, requiredPoints: 0 },
  { id: 'avatar3', name: 'Warrior', image: '/assert/avatar3.png', unlocked: false, requiredPoints: 100 },
  { id: 'avatar4', name: 'Mage', image: '/assert/avatar4.png', unlocked: false, requiredPoints: 150 },
  { id: 'avatar5', name: 'Knight', image: '/assert/avatar5.png', unlocked: false, requiredPoints: 200 },
  { id: 'avatar6', name: 'Elder', image: '/assert/avatar6.png', unlocked: false, requiredPoints: 250 },
  { id: 'avatar7', name: 'Sage', image: '/assert/avatar7.png', unlocked: false, requiredPoints: 300 },
  { id: 'avatar8', name: 'Queen', image: '/assert/avatar8.png', unlocked: false, requiredPoints: 350 },
  { id: 'avatar9', name: 'Healer', image: '/assert/avatar9.png', unlocked: false, requiredPoints: 400 },
  { id: 'avatar10', name: 'Champion', image: '/assert/avatar10.png', unlocked: false, requiredPoints: 450 },
  { id: 'avatar11', name: 'Guardian', image: '/assert/avatar11.png', unlocked: false, requiredPoints: 500 },
  { id: 'avatar12', name: 'Master', image: '/assert/avatar12.png', unlocked: false, requiredPoints: 600 },
  { id: 'avatar13', name: 'Legend', image: '/assert/avatar13.png', unlocked: false, requiredPoints: 750 },
];

interface Task {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  task_type: 'daily' | 'challenge';
  priority?: 'high' | 'normal';
}

export function Dashboard() {
  const { profile } = useUser();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState('avatar1');
  const [points, setPoints] = useState(5);
  const [dayStreak, setDayStreak] = useState(0);

  useEffect(() => {
    initializeTasks();
    loadUserProgress();
  }, []);

  const initializeTasks = async () => {
    try {
      setIsLoading(true);
      const response = await apiService.initializeTodayTasks();
      setTasks(response.data.tasks || []);
    } catch (error: any) {
      console.error('Error initializing tasks:', error);
      const saved = localStorage.getItem('carepath-daily-tasks');
      if (saved) {
        setTasks(JSON.parse(saved));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const loadUserProgress = () => {
    const savedPoints = localStorage.getItem('vio-user-points');
    const savedAvatar = localStorage.getItem('vio-selected-avatar');
    const savedStreak = localStorage.getItem('vio-day-streak');
    
    if (savedPoints) setPoints(parseInt(savedPoints));
    if (savedAvatar) setSelectedAvatar(savedAvatar);
    if (savedStreak) setDayStreak(parseInt(savedStreak));
  };

  const saveUserProgress = (newPoints: number, newAvatar?: string) => {
    localStorage.setItem('vio-user-points', newPoints.toString());
    if (newAvatar) {
      localStorage.setItem('vio-selected-avatar', newAvatar);
    }
  };

  const toggleTask = async (id: string) => {
    try {
      const response = await apiService.toggleTaskCompletion(id);
      
      setTasks(prev =>
        prev.map(t =>
          t.id === id ? response.data : t
        )
      );

      const task = tasks.find(t => t.id === id);
      if (task && !task.completed) {
        const taskPoints = task.task_type === 'daily' ? 5 : 10;
        const newPoints = points + taskPoints;
        setPoints(newPoints);
        saveUserProgress(newPoints);

        toast.success(`+${taskPoints} points!`, {
          description: '✨ Great job completing this task!'
        });
      }
    } catch (error: any) {
      console.error('Error toggling task:', error);
      toast.error('Failed to update task');
    }
  };

  const handleAvatarSelect = (avatarId: string) => {
    const avatar = AVATAR_CHARACTERS.find(a => a.id === avatarId);
    if (!avatar) return;

    const isUnlocked = avatar.requiredPoints === 0 || points >= avatar.requiredPoints;
    
    if (isUnlocked) {
      setSelectedAvatar(avatarId);
      saveUserProgress(points, avatarId);
      setShowAvatarModal(false);
      toast.success(`Avatar changed to ${avatar.name}! 🎉`);
    } else {
      toast.error(`Need ${avatar.requiredPoints} points to unlock this avatar`);
    }
  };

  const todayTasks = tasks;
  const dailyTasks = todayTasks.filter(t => t.task_type === 'daily');
  const challengeTasks = todayTasks.filter(t => t.task_type === 'challenge');

  const dailyCompleted = dailyTasks.filter(t => t.completed).length;
  const challengeCompleted = challengeTasks.filter(t => t.completed).length;

  const dailyProgress = dailyTasks.length > 0 ? (dailyCompleted / dailyTasks.length) * 100 : 0;

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const currentAvatar = AVATAR_CHARACTERS.find(a => a.id === selectedAvatar) || AVATAR_CHARACTERS[0];

  if (!profile) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50/20">
      <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">{getGreeting()}!</h1>
            <p className="text-slate-600">I believe in you, Let's make today count.</p>
          </div>
          <div className="flex items-center gap-3">
            {/* Points Badge */}
            <div className="bg-gradient-to-r from-yellow-100 to-amber-100 border-2 border-yellow-300 rounded-2xl px-4 py-2 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-600" />
              <span className="font-bold text-slate-800">{points}</span>
            </div>
            
            {/* Avatar Button */}
            <button
              onClick={() => setShowAvatarModal(true)}
              className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-100 to-purple-100 border-2 border-blue-200 flex items-center justify-center hover:scale-105 transition-transform text-3xl overflow-hidden"
            >
              {(() => {
                const img = currentAvatar.image;
                const isImage = typeof img === 'string' && /\.(png|jpe?g|svg|webp)$|^\//i.test(img);
                return isImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={img} alt={currentAvatar.name} className="w-full h-full object-contain" />
                ) : (
                  img
                );
              })()}
            </button>
          </div>
        </div>

        {/* 2-column grid: Stats + Avatar Message */}
        <div className="grid lg:grid-cols-2 gap-4">
          {/* Left: Stats Cards */}
          <div className="space-y-4">
            {/* Treatment Actions Card */}
            <Card className="p-4 bg-gradient-to-r from-teal-50 to-cyan-50 border-teal-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-400 to-cyan-400 flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-slate-800">{dailyCompleted}/{dailyTasks.length}</div>
                  <div className="text-xs text-slate-600">Treatment actions</div>
                </div>
              </div>
            </Card>

            {/* Readings Card */}
            <Card className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-slate-800">{challengeCompleted}/{challengeTasks.length}</div>
                  <div className="text-xs text-slate-600">Readings</div>
                </div>
              </div>
            </Card>

            {/* Progress Card */}
            <Card className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400 to-cyan-400 flex items-center justify-center">
                  <StarIcon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-slate-800">{Math.round(dailyProgress)}%</div>
                  <div className="text-xs text-slate-600">Today's progress</div>
                </div>
              </div>
            </Card>
          </div>

          {/* Right: Avatar Message Card */}
          <Card className="p-6 bg-gradient-to-br from-teal-50/40 to-emerald-50/40 border-teal-100">
            <div className="flex flex-col items-center text-center space-y-4 h-full justify-center">
              {/* Speech Bubble */}
              <div className="relative bg-white px-6 py-4 rounded-2xl shadow-sm border border-slate-200 max-w-xs">
                <p className="text-sm text-slate-700 leading-relaxed">
                  Welcome! check your today's treatment actions, you can do it.
                </p>
                {/* Triangle pointer */}
                <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-white border-r border-b border-slate-200 rotate-45"></div>
              </div>

              {/* Avatar - pixel art style */}
              <div className="relative">
                <div className="w-20 h-28 mx-auto flex items-center justify-center">
                  {(() => {
                    const img = currentAvatar.image;
                    const isImage = typeof img === 'string' && /\.(png|jpe?g|svg|webp)$|^\//i.test(img);
                    return isImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={img} alt={currentAvatar.name} className="w-20 h-28 object-contain" />
                    ) : (
                      <div className="text-6xl">{img}</div>
                    );
                  })()}
                </div>
              </div>

              <p className="text-sm font-medium text-slate-600">Your future self</p>
            </div>
          </Card>
        </div>

        {/* Daily Progress */}
        <Card className="p-4 bg-white/80 backdrop-blur-sm border-slate-200">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-teal-500" />
              <h3 className="font-semibold text-slate-800">Daily Progress</h3>
            </div>
            <span className="text-sm font-semibold text-slate-600">{Math.round(dailyProgress)}%</span>
          </div>
          <Progress value={dailyProgress} className="h-3" />
        </Card>

        {/* Day Streak Card */}
        <Card className="p-4 bg-white/80 backdrop-blur-sm border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-400 to-red-400 flex items-center justify-center">
              <Flame className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-800">{dayStreak}</div>
              <div className="text-xs text-slate-600">Day Streak</div>
            </div>
          </div>
        </Card>

        {/* Quick Action Cards */}
        <div className="grid sm:grid-cols-2 gap-4">
          <Link to="/constellation">
            <Card className="p-6 bg-gradient-to-br from-blue-100 to-purple-100 border-blue-200 hover:shadow-lg transition-all cursor-pointer group">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-bold text-slate-800 text-lg mb-1">Treatment Memory Constellation</h3>
                  <p className="text-sm text-slate-600">Create a visual map of your resilience journey Now</p>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <StarIcon className="w-5 h-5 text-blue-400" fill="currentColor" />
                  <StarIcon className="w-5 h-5 text-pink-400" fill="currentColor" />
                  <StarIcon className="w-5 h-5 text-yellow-400" fill="currentColor" />
                  <StarIcon className="w-5 h-5 text-green-400" fill="currentColor" />
                </div>
              </div>
            </Card>
          </Link>

          <Link to="/routines">
            <Card className="p-6 bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200 hover:shadow-lg transition-all cursor-pointer group">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-bold text-slate-800 text-lg mb-1">Treatment Routine Builder</h3>
                  <p className="text-sm text-slate-600">Organize your healing journey with gentle, supportive routines</p>
                </div>
                <div className="text-3xl flex-shrink-0">💊</div>
              </div>
            </Card>
          </Link>
        </div>

        {/* Footer Message */}
        <div className="text-center space-y-1 py-4">
          <p className="text-sm text-slate-600">
            <span className="text-red-500">♥</span> Every step forward is a victory. We're proud of you.
          </p>
          <p className="text-xs text-slate-500">
            VIO — Your compassionate companion on the journey to healing
          </p>
        </div>

        {/* Avatar Selection Modal */}
        <AnimatePresence>
          {showAvatarModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setShowAvatarModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-3xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              >
                {/* Modal Header */}
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-slate-800">select your future self character</h2>
                  <button
                    onClick={() => setShowAvatarModal(false)}
                    className="w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
                  >
                    <X className="w-5 h-5 text-slate-600" />
                  </button>
                </div>

                {/* Avatar Grid */}
                <div className="grid grid-cols-5 gap-4">
                  {AVATAR_CHARACTERS.map((avatar) => {
                    const isUnlocked = avatar.requiredPoints === 0 || points >= avatar.requiredPoints;
                    const isSelected = avatar.id === selectedAvatar;

                    return (
                      <div
                        key={avatar.id}
                        className={`relative p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                          isSelected
                            ? 'border-teal-400 bg-teal-50'
                            : isUnlocked
                            ? 'border-slate-200 bg-white hover:border-teal-200'
                            : 'border-slate-100 bg-slate-50 opacity-60'
                        }`}
                        onClick={() => handleAvatarSelect(avatar.id)}
                      >
                        {isSelected && (
                          <div className="absolute -top-2 -right-2 w-6 h-6 bg-teal-400 rounded-full flex items-center justify-center">
                            <CheckCircle className="w-4 h-4 text-white" fill="currentColor" />
                          </div>
                        )}

                        <div className="mb-2 text-center">
                          {(() => {
                            const img = avatar.image;
                            const isImage = typeof img === 'string' && /\.(png|jpe?g|svg|webp)$|^\//i.test(img);
                            return isImage ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={img} alt={avatar.name} className="mx-auto w-14 h-14 object-contain" />
                            ) : (
                              <div className="text-5xl">{img}</div>
                            );
                          })()}
                        </div>

                        <button
                          className={`w-full py-2 rounded-xl text-xs font-semibold transition-colors ${
                            isUnlocked
                              ? 'bg-gradient-to-r from-teal-400 to-cyan-400 text-white'
                              : 'bg-gradient-to-r from-yellow-300 to-amber-300 text-slate-800'
                          }`}
                        >
                          {isUnlocked ? 'Get' : `${avatar.requiredPoints}pts`}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}