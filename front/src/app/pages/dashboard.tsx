
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
  { id: 'avatar1', name: 'Princess', image: '👸', unlocked: true, requiredPoints: 0 },
  { id: 'avatar2', name: 'Hero', image: '🧑', unlocked: false, requiredPoints: 50 },
  { id: 'avatar3', name: 'Warrior', image: '⚔️', unlocked: false, requiredPoints: 100 },
  { id: 'avatar4', name: 'Mage', image: '🧙', unlocked: false, requiredPoints: 150 },
  { id: 'avatar5', name: 'Knight', image: '🛡️', unlocked: false, requiredPoints: 200 },
  { id: 'avatar6', name: 'Elder', image: '👵', unlocked: false, requiredPoints: 250 },
  { id: 'avatar7', name: 'Sage', image: '🧓', unlocked: false, requiredPoints: 300 },
  { id: 'avatar8', name: 'Queen', image: '👑', unlocked: false, requiredPoints: 350 },
  { id: 'avatar9', name: 'Healer', image: '⚕️', unlocked: false, requiredPoints: 400 },
  { id: 'avatar10', name: 'Champion', image: '🏆', unlocked: false, requiredPoints: 450 },
  { id: 'avatar11', name: 'Guardian', image: '🛡️', unlocked: false, requiredPoints: 500 },
  { id: 'avatar12', name: 'Master', image: '🎖️', unlocked: false, requiredPoints: 600 },
  { id: 'avatar13', name: 'Legend', image: '🌟', unlocked: false, requiredPoints: 750 },
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
  const [points, setPoints] = useState(5); // User points
  const [dayStreak, setDayStreak] = useState(0);

  // Initialize today's tasks from backend
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
      // Fallback to local state
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
        // Award points for completing task
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

    // Check if avatar is unlocked
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
  const totalCompleted = todayTasks.filter(t => t.completed).length;

  const dailyProgress = dailyTasks.length > 0 ? (dailyCompleted / dailyTasks.length) * 100 : 0;

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const currentAvatar = AVATAR_CHARACTERS.find(a => a.id === selectedAvatar) || AVATAR_CHARACTERS[0];

  const TaskCard = ({ task }: { task: Task }) => (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
    >
      <Card
        className={`p-4 cursor-pointer transition-all duration-300 ${
          task.completed
            ? 'bg-gradient-to-r from-teal-50 to-emerald-50 border-teal-200'
            : 'bg-white/60 backdrop-blur-sm border-slate-200 hover:border-teal-200'
        }`}
        onClick={() => toggleTask(task.id)}
      >
        <div className="flex items-start gap-3">
          <div
            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
              task.completed
                ? 'bg-gradient-to-br from-teal-400 to-emerald-400 border-transparent'
                : 'border-slate-300 bg-white'
            }`}
          >
            {task.completed && <CheckCircle className="w-4 h-4 text-white" fill="currentColor" />}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h3 className={`font-semibold ${task.completed ? 'text-slate-600' : 'text-slate-800'}`}>
                {task.title}
              </h3>
              {task.priority === 'high' && !task.completed && (
                <Badge variant="outline" className="text-xs bg-rose-50 text-rose-600 border-rose-200">
                  Important
                </Badge>
              )}
            </div>
            <p className="text-sm text-slate-600 mt-1">{task.description}</p>
          </div>
        </div>
      </Card>
    </motion.div>
  );

  if (!profile) return null;

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex items-start justify-between">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-4xl font-bold text-slate-800 mb-2">
            {getGreeting()}!
          </h1>
          <p className="text-lg text-slate-600">
            I believe in you. Let's make today count.
          </p>
        </motion.div>

        {/* Avatar & Points Button */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center gap-3"
        >
          {/* Points Badge */}
          <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-100 to-amber-100 border-2 border-yellow-300 rounded-full">
            <Trophy className="w-5 h-5 text-yellow-600" />
            <span className="font-bold text-yellow-800 text-lg">{points}</span>
          </div>

          {/* Avatar Button */}
          <button
            onClick={() => setShowAvatarModal(true)}
            className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-400 to-cyan-400 flex items-center justify-center text-3xl hover:scale-105 transition-transform shadow-lg border-2 border-white"
          >
            {currentAvatar.image}
          </button>
        </motion.div>
      </div>

      {/* Progress Cards & Avatar Message */}
      <div className="grid lg:grid-cols-[1fr,400px] gap-6">
        {/* Left: Progress Cards */}
        <div className="grid sm:grid-cols-3 gap-4">
          <Card className="p-4 bg-gradient-to-br from-teal-50 to-emerald-50 border-teal-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-400 to-emerald-400 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-800">{dailyCompleted}/{dailyTasks.length}</div>
                <div className="text-xs text-slate-600">Treatment actions</div>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-gradient-to-br from-violet-50 to-purple-50 border-violet-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-400 to-purple-400 flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-800">{challengeCompleted}/{challengeTasks.length}</div>
                <div className="text-xs text-slate-600">Routines</div>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-100">
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
        <Card className="p-6 bg-gradient-to-br from-pink-50 to-purple-50 border-pink-100">
          <div className="flex flex-col items-center text-center space-y-4">
            {/* Avatar */}
            <div className="text-6xl">{currentAvatar.image}</div>
            
            {/* Speech Bubble */}
            <div className="relative bg-white px-6 py-4 rounded-2xl shadow-sm border border-pink-200">
              <p className="text-sm text-slate-700 leading-relaxed">
                Welcome! check your today's treatment actions, you can do it.
              </p>
              {/* Triangle pointer */}
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-white border-r border-b border-pink-200 rotate-45"></div>
            </div>

            <p className="text-sm font-medium text-slate-600">Your future self</p>
          </div>
        </Card>
      </div>

      {/* Daily Progress */}
      <Card className="p-4 bg-white/60 backdrop-blur-sm border-slate-200">
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
      <Card className="p-4 bg-gradient-to-r from-orange-50 to-red-50 border-orange-100">
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
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-800 text-lg mb-1">Treatment Memory Constellation</h3>
                <p className="text-sm text-slate-600">Create a visual map of your resilience journey Now</p>
              </div>
              <div className="flex gap-1">
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
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-800 text-lg mb-1">Treatment Routine Builder</h3>
                <p className="text-sm text-slate-600">Organize your healing journey with gentle, supportive routines</p>
              </div>
              <div className="text-3xl">💊</div>
            </div>
          </Card>
        </Link>
      </div>

      {/* Tasks Sections */}
      <div className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-800">Today's Tasks</h2>
        {isLoading ? (
          <Card className="p-4 bg-white/60">
            <p className="text-slate-600 text-center">Loading tasks...</p>
          </Card>
        ) : (
          <>
            {dailyTasks.map(task => (
              <TaskCard key={task.id} task={task} />
            ))}
            {challengeTasks.map(task => (
              <TaskCard key={task.id} task={task} />
            ))}
          </>
        )}
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
                      {/* Selected Checkmark */}
                      {isSelected && (
                        <div className="absolute -top-2 -right-2 w-6 h-6 bg-teal-400 rounded-full flex items-center justify-center">
                          <CheckCircle className="w-4 h-4 text-white" fill="currentColor" />
                        </div>
                      )}

                      {/* Avatar */}
                      <div className="text-5xl mb-2 text-center">{avatar.image}</div>

                      {/* Get/Unlock Button */}
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
  );
}
