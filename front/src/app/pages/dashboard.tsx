// src/pages/dashboard.tsx - AVEC SCORE RÉEL DU BACKEND

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

// ✅ IMPORTER LE HOOK POUR LE SCORE RÉEL
import { useUserScore } from '../../hooks/useRoutines';

// Avatar characters with unlock requirements
const AVATAR_CHARACTERS = [
  { id: 'avatar1', name: 'Boy', image: '/assert/avatar1.png', requiredPoints: 0 },
  { id: 'avatar2', name: 'Girl', image: '/assert/avatar2.png', requiredPoints: 0 },
  { id: 'avatar3', name: 'Girl2', image: '/assert/avatar3.png', requiredPoints: 100 },
  { id: 'avatar4', name: 'Boy2', image: '/assert/avatar4.png', requiredPoints: 150 },
  { id: 'avatar5', name: 'Mario', image: '/assert/avatar5.png', requiredPoints: 200 },
  { id: 'avatar6', name: 'Cat', image: '/assert/avatar6.png', requiredPoints: 250 },
  { id: 'avatar7', name: 'Hijabi', image: '/assert/avatar7.png', requiredPoints: 300 },
  { id: 'avatar8', name: 'Dog', image: '/assert/avatar8.png', requiredPoints: 350 },
  { id: 'avatar9', name: 'BoyDog', image: '/assert/avatar9.png', requiredPoints: 400 },
  { id: 'avatar10', name: 'HatBoy', image: '/assert/avatar10.png', requiredPoints: 250 },
  { id: 'avatar11', name: 'Boy3', image: '/assert/avatar11.png', requiredPoints: 300 },
  { id: 'avatar12', name: 'BabyBoy', image: '/assert/avatar12.png', requiredPoints: 350 },
  { id: 'avatar13', name: 'GirlCat', image: '/assert/avatar13.png', requiredPoints: 400 },
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
  
  // ✅ UTILISER LE HOOK POUR OBTENIR LE SCORE RÉEL
  const { score, loading: scoreLoading, reload: reloadScore } = useUserScore();
  
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState('avatar1');
  const [avatarName, setAvatarName] = useState('your future self');

  // Initialize today's tasks from backend
  useEffect(() => {
    initializeTasks();
    const savedName = localStorage.getItem('vio-onboarding-avatar-name');
    if (savedName) {
      setAvatarName(savedName);
    }
    
    // Load selected avatar
    const savedAvatar = localStorage.getItem('vio-selected-avatar');
    if (savedAvatar) setSelectedAvatar(savedAvatar);
  }, []);

  // ✅ Load tasks from backend
  const initializeTasks = async () => {
    try {
      setIsLoading(true);
      const response = await apiService.initializeTodayTasks();
      setTasks(response.data.tasks || []);
      console.log('✅ Loaded tasks from backend:', response.data.tasks?.length);
    } catch (error: any) {
      console.error('❌ Error loading tasks:', error);
      toast.error('Failed to load tasks');
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ Toggle task on backend
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
        
        // ✅ Recharger le score depuis le backend
        await reloadScore();

        toast.success(`+${taskPoints} points!`, {
          description: '✨ Great job completing this task!'
        });
      }
    } catch (error: any) {
      console.error('❌ Error toggling task:', error);
      toast.error('Failed to update task');
    }
  };


  // ✅ Avatar selection avec le score réel
  const handleAvatarSelect = (avatarId: string) => {
    const avatar = AVATAR_CHARACTERS.find(a => a.id === avatarId);
    if (!avatar) return;

    // ✅ Utiliser le score réel du backend
    const currentPoints = score?.total_score || 0;
    const isUnlocked = avatar.requiredPoints === 0 || currentPoints >= avatar.requiredPoints;
    
    if (isUnlocked) {
      setSelectedAvatar(avatarId);
      localStorage.setItem('vio-selected-avatar', avatarId);
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
            {task.completed && <CheckCircle className="w-4 h-4 text-white" />}
          </div>
          <div className="flex-1">
            <h3 className={`font-semibold ${task.completed ? 'text-slate-500 line-through' : 'text-slate-800'}`}>
              {task.title}
            </h3>
            <p className="text-sm text-slate-600 mt-1">{task.description}</p>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant={task.task_type === 'daily' ? 'default' : 'secondary'} className="text-xs">
                {task.task_type === 'daily' ? '📅 Daily' : '🎯 Challenge'}
              </Badge>
              {task.priority === 'high' && (
                <Badge variant="destructive" className="text-xs">
                  High Priority
                </Badge>
              )}
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );

  return (
    <div className="space-y-6">
      {/* Header Section avec Score Badge */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">{getGreeting()}, {profile?.first_name || 'Friend'}! 👋</h1>
          <p className="text-slate-600 mt-1">
            Let's check in on your healing journey today
          </p>
        </div>
        
        {/* Score Badge et Avatar en haut à droite */}
        <div className="flex items-center gap-3">
          {/* Badge de Score Réel */}
          <div className="bg-yellow-100 border-2 border-yellow-300 rounded-2xl px-4 py-2 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-600" />
            <span className="text-xl font-bold text-yellow-700">
              {scoreLoading ? '...' : (score?.total_score || 0)}
            </span>
          </div>
          
          {/* Avatar Cliquable */}
          <div 
            className="bg-teal-400 rounded-2xl p-2 cursor-pointer hover:bg-teal-500 transition-colors"
            onClick={() => setShowAvatarModal(true)}
          >
            <img
              src={currentAvatar.image}
              alt={currentAvatar.name}
              className="w-12 h-12 object-contain"
              style={{ imageRendering: 'pixelated' }}
            />
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-3 gap-4">
        {/* Left: Stats Cards */}
        <div className="md:col-span-2 space-y-4">
          {/* Mini Stats Cards Row */}
          <div className="grid grid-cols-3 gap-4">
            {/* Treatment Actions */}
            <Card className="p-4 bg-gradient-to-br from-teal-50 to-emerald-50 border-teal-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-400 to-emerald-400 flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-slate-800">
                    5/5
                  </div>
                  <div className="text-xs text-slate-600">Treatment actions</div>
                </div>
              </div>
            </Card>

            {/* Routines */}
            <Card className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 border-purple-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-slate-800">
                    3/4
                  </div>
                  <div className="text-xs text-slate-600">Routines</div>
                </div>
              </div>
            </Card>

            {/* Today's Progress */}
            <Card className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-400 to-cyan-400 flex items-center justify-center">
                  <StarIcon className="w-6 h-6 text-white" fill="currentColor" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-slate-800">
                    75%
                  </div>
                  <div className="text-xs text-slate-600">Today's progress</div>
                </div>
              </div>
            </Card>
          </div>

          {/* Today's Progress Card - Déplacée sous les mini cartes */}
          <Card className="p-6 bg-white/60 backdrop-blur-sm border-teal-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-teal-500" />
                <h3 className="font-semibold text-slate-800">Detailed Progress</h3>
              </div>
              <span className="text-2xl font-bold text-teal-500">{totalCompleted}/{todayTasks.length}</span>
            </div>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-600">Daily Tasks</span>
                  <span className="font-medium">{dailyCompleted}/{dailyTasks.length}</span>
                </div>
                <Progress value={(dailyCompleted / dailyTasks.length) * 100} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-600">Challenges</span>
                  <span className="font-medium">{challengeCompleted}/{challengeTasks.length}</span>
                </div>
                <Progress value={(challengeCompleted / challengeTasks.length) * 100} className="h-2 bg-purple-100" />
              </div>
            </div>
          </Card>
        </div>

        {/* Right: Avatar Message Card */}
        <Card className="p-6 bg-gradient-to-br from-gray-50 to-gray-50 border-green-200 border-3">
          <div className="flex flex-col items-center text-center space-y-4">
            {/* Speech Bubble */}
            <div className="relative bg-white px-6 py-4 rounded-2xl shadow-sm border border-pink-200">
              <p className="text-sm text-slate-700 leading-relaxed italic">
                "Welcome! check your today's treatment actions, you can do it."
              </p>
              {/* Triangle pointer */}
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-white border-r border-b border-pink-200 rotate-45"></div>
            </div>
            {/* Avatar */}
            <div className="w-29 h-29">
              <img
                src={currentAvatar.image}
                alt={currentAvatar.name}
                className="w-full h-full object-contain cursor-pointer hover:scale-105 transition-transform"
                style={{ imageRendering: 'pixelated' }}
                onClick={() => setShowAvatarModal(true)}
              />
            </div>

            <p className="text-sm font-medium text-slate-600">
              {avatarName}
            </p>
          </div>
        </Card>
      </div>

      {/* Daily Progress */}
      <Card className="p-4 bg-white/60 backdrop-blur-sm border-green-200 border-2">
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
      {score && (
        <Card className="p-4 bg-gradient-to-r from-orange-50 to-red-50 border-orange-100 border-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-400 to-red-400 flex items-center justify-center">
              <Flame className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-800">{score.current_streak}</div>
              <div className="text-xs text-slate-600">Day Streak</div>
            </div>
          </div>
        </Card>
      )}

      {/* Quick Action Cards */}
      <div className="grid sm:grid-cols-2 gap-4">
        <Link to="/constellation">
          <Card className="p-6 bg-gradient-to-br from-blue-100 to-purple-100 border-blue-200 hover:shadow-lg transition-all cursor-pointer group border-2">
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
          <Card className="p-6 bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200 hover:shadow-lg transition-all cursor-pointer group border-2">
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
                <div>
                  <h2 className="text-2xl font-bold text-slate-800">select your future self character</h2>
                  {score && (
                    <p className="text-sm text-slate-600 mt-1">You have {score.total_score} points</p>
                  )}
                </div>
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
                  const currentPoints = score?.total_score || 0;
                  const isUnlocked = avatar.requiredPoints === 0 || currentPoints >= avatar.requiredPoints;
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
                      <div className="w-20 h-20 mx-auto mb-2">
                        <img
                          src={avatar.image}
                          alt={avatar.name}
                          className="w-full h-full object-contain"
                          style={{ imageRendering: 'pixelated' }}
                        />
                      </div>

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