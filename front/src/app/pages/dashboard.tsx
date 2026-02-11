// src/pages/dashboard.tsx (VERSION UPDATED - Key changes marked with // API:)
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle, Calendar, Zap, Star as StarIcon, Trophy, Clock } from 'lucide-react';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { AvatarDisplay } from '../components/avatar-display';
import { useUser } from '../../context/user-context';
import { Task } from '../types/avatar';
import { AVATAR_MESSAGES } from '../types/avatar';
import { toast } from 'sonner';
import { Link } from 'react-router';
import { apiService } from '../../services/api'; // API: Added

export function Dashboard() {
  const { profile } = useUser();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(false); // API: Added

  const [showAvatarMessage, setShowAvatarMessage] = useState(false);
  const [avatarMessage, setAvatarMessage] = useState('');
  const [lastCompletedTask, setLastCompletedTask] = useState<string | null>(null);

  // API: Initialize today's tasks from backend
  useEffect(() => {
    initializeTasks();
  }, []);

  const initializeTasks = async () => {
    try {
      setIsLoading(true);
      const response = await apiService.initializeTodayTasks();
      setTasks(response.data.tasks);
    } catch (error: any) {
      console.error('Error initializing tasks:', error);
      // Fallback to local state if backend fails
      const saved = localStorage.getItem('carepath-daily-tasks');
      if (saved) {
        setTasks(JSON.parse(saved));
      }
    } finally {
      setIsLoading(false);
    }
  };

  // API: Save tasks to backend when updated
  useEffect(() => {
    localStorage.setItem('carepath-daily-tasks', JSON.stringify(tasks));
  }, [tasks]);

  const toggleTask = async (id: string) => {
    try {
      // API: Update on backend
      const response = await apiService.toggleTaskCompletion(id);
      
      // Update local state
      setTasks(prev =>
        prev.map(t =>
          t.id === id ? response.data : t
        )
      );

      const task = tasks.find(t => t.id === id);
      if (task && !task.completed && profile) {
        // Show avatar celebration
        const messages = AVATAR_MESSAGES.taskComplete[profile.avatar.tone];
        const message = messages[Math.floor(Math.random() * messages.length)];
        
        setAvatarMessage(message);
        setShowAvatarMessage(true);
        setLastCompletedTask(id);

        // Hide message after 5 seconds
        setTimeout(() => {
          setShowAvatarMessage(false);
        }, 5000);

        // Show toast
        toast.success(message, {
          description: '✨ A new star has been added to your constellation!'
        });
      }
    } catch (error: any) {
      console.error('Error toggling task:', error);
      toast.error('Failed to update task');
    }
  };

  const todayTasks = tasks;
  const dailyTasks = todayTasks.filter(t => t.task_type === 'daily');
  const challengeTasks = todayTasks.filter(t => t.task_type === 'challenge');

  const dailyCompleted = dailyTasks.filter(t => t.completed).length;
  const challengeCompleted = challengeTasks.filter(t => t.completed).length;
  const totalCompleted = todayTasks.filter(t => t.completed).length;

  const dailyProgress = dailyTasks.length > 0 ? (dailyCompleted / dailyTasks.length) * 100 : 0;
  const overallProgress = todayTasks.length > 0 ? (totalCompleted / todayTasks.length) * 100 : 0;

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const greetingMessages = profile ? AVATAR_MESSAGES.dailyGreeting[profile.avatar.tone] : [];
  const dailyGreeting = greetingMessages[Math.floor(Math.random() * greetingMessages.length)];

  const TaskCard = ({ task }: { task: Task }) => (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className={`relative overflow-hidden ${lastCompletedTask === task.id ? 'animate-pulse' : ''}`}
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
    <div className="space-y-8">
      {/* Header with Avatar */}
      <div className="grid lg:grid-cols-[1fr,auto] gap-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div>
            <h1 className="text-4xl font-bold text-slate-800 mb-2">
              {getGreeting()}!
            </h1>
            <p className="text-lg text-slate-600">{dailyGreeting}</p>
          </div>

          {/* Progress Overview */}
          <div className="grid sm:grid-cols-3 gap-4">
            <Card className="p-4 bg-gradient-to-br from-teal-50 to-emerald-50 border-teal-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-400 to-emerald-400 flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-slate-800">{dailyCompleted}/{dailyTasks.length}</div>
                  <div className="text-xs text-slate-600">Daily Tasks</div>
                </div>
              </div>
            </Card>

            <Card className="p-4 bg-gradient-to-br from-violet-50 to-purple-50 border-violet-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-400 to-purple-400 flex items-center justify-center">
                  <Trophy className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-slate-800">{challengeCompleted}/{challengeTasks.length}</div>
                  <div className="text-xs text-slate-600">Challenges</div>
                </div>
              </div>
            </Card>

            <Card className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400 to-cyan-400 flex items-center justify-center">
                  <StarIcon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-slate-800">{Math.round(overallProgress)}%</div>
                  <div className="text-xs text-slate-600">Today's Progress</div>
                </div>
              </div>
            </Card>
          </div>
        </motion.div>

        {/* Avatar Display */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="p-6 bg-white/60 backdrop-blur-sm border-teal-100">
            <AvatarDisplay
              config={profile.avatar}
              size="large"
              showName
              animate={showAvatarMessage}
              message={showAvatarMessage ? avatarMessage : undefined}
            />
          </Card>
        </motion.div>
      </div>

      {/* Daily Tasks Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-6 h-6 text-teal-500" />
            <h2 className="text-2xl font-semibold text-slate-800">Daily Tasks</h2>
          </div>
          <Badge variant="outline" className="text-slate-600">
            Essential for your routine
          </Badge>
        </div>

        <div className="mb-4">
          <div className="flex justify-between text-sm text-slate-600 mb-2">
            <span>Daily Progress</span>
            <span className="font-semibold">{Math.round(dailyProgress)}%</span>
          </div>
          <Progress value={dailyProgress} className="h-3" />
        </div>

        <div className="space-y-3">
          {isLoading ? (
            <Card className="p-4 bg-white/60">
              <p className="text-slate-600 text-center">Loading tasks...</p>
            </Card>
          ) : (
            dailyTasks.map(task => (
              <TaskCard key={task.id} task={task} />
            ))
          )}
        </div>
      </div>

      {/* Challenges Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Zap className="w-6 h-6 text-violet-500" />
            <h2 className="text-2xl font-semibold text-slate-800">Optional Challenges</h2>
          </div>
          <Badge variant="outline" className="text-slate-600">
            Go beyond the basics
          </Badge>
        </div>

        <Card className="p-4 bg-gradient-to-r from-violet-50 to-purple-50 border-violet-100 mb-4">
          <p className="text-sm text-slate-700 leading-relaxed">
            <Zap className="w-4 h-4 inline text-violet-500 mr-1" />
            These are optional activities to enhance your journey. Complete them when you feel ready — there's no pressure!
          </p>
        </Card>

        <div className="space-y-3">
          {challengeTasks.map(task => (
            <TaskCard key={task.id} task={task} />
          ))}
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid sm:grid-cols-2 gap-4">
        <Link to="/constellation">
          <Card className="p-6 bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-100 hover:shadow-lg transition-all cursor-pointer group">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-400 to-cyan-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <StarIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-800">View Your Constellation</h3>
                <p className="text-sm text-slate-600">See your journey mapped in the stars</p>
              </div>
            </div>
          </Card>
        </Link>

        <Link to="/future-self">
          <Card className="p-6 bg-gradient-to-br from-violet-50 to-purple-50 border-violet-100 hover:shadow-lg transition-all cursor-pointer group">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-400 to-purple-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-800">Connect with Future Self</h3>
                <p className="text-sm text-slate-600">Unlock more messages and dialogue</p>
              </div>
            </div>
          </Card>
        </Link>
      </div>
    </div>
  );
}