import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, MessageCircle, CheckCircle, Calendar, Trash2, Edit, X } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Progress } from '../components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { toast } from 'sonner';
import { AvatarDisplay } from '../components/avatar-display';
import { useUser } from '../../context/user-context';
import { apiService } from '../../services/api';

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
  const [actions, setActions] = useState<TreatmentAction[]>([]);
const [isLoading, setIsLoading] = useState(true);

  const [unlockedMessages, setUnlockedMessages] = useState<number[]>(() => {
    const saved = localStorage.getItem('carepath-unlocked-messages');
    return saved ? JSON.parse(saved) : [];
  });
    const [avatarName, setAvatarName] = useState('your future self');
const [selectedAvatarImage, setSelectedAvatarImage] = useState('/assert/avatar1.png');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');

  const completedCount = actions.filter(a => a.completed).length;
  const progress = (completedCount / actions.length) * 100;
  const overallProgress = Math.min(progress, 100); // Scale up for demo

  const getUserId = () => {
    const profileStr = localStorage.getItem('vio-user-profile');
    if (profileStr) {
      try {
        const profile = JSON.parse(profileStr);
        return profile.user_id || profile.id || 'default';
      } catch (e) {
        return 'default';
      }
    }
    return 'default';
  };

// ✅ For unlocked messages (UI state), use user-scoped keys
useEffect(() => {
  const userId = getUserId();
  const saved = localStorage.getItem(`vio-unlocked-messages-${userId}`);
  if (saved) {
    setUnlockedMessages(JSON.parse(saved));
  }
}, []);

useEffect(() => {
  const userId = getUserId();
  localStorage.setItem(`vio-unlocked-messages-${userId}`, JSON.stringify(unlockedMessages));
}, [unlockedMessages]);

  useEffect(() => {
    // Check for newly unlocked messages
    FUTURE_SELF_MESSAGES.forEach(message => {
      if (overallProgress >= message.unlockProgress && !unlockedMessages.includes(message.id)) {
        setUnlockedMessages(prev => [...prev, message.id]);
      }
    });
  }, [overallProgress, unlockedMessages]);

  
    useEffect(() => {
  // Load custom avatar name
  const savedName = localStorage.getItem('vio-onboarding-avatar-name');
  if (savedName) setAvatarName(savedName);

  // Load selected avatar image
  const savedAvatar = localStorage.getItem('vio-selected-avatar');
  if (savedAvatar) {
    setSelectedAvatarImage(`/assert/${savedAvatar}.png`);
  }
}, []);
useEffect(() => {
  loadActionsFromBackend();
}, []);

const loadActionsFromBackend = async () => {
  try {
    setIsLoading(true);
    const response = await apiService.getTodayTasks();

    const mappedActions = response.data.map((task: any) => ({
      id: task.id.toString(),
      title: task.title,
      completed: task.completed,
      date: task.completed_at || undefined,
    }));

    setActions(mappedActions);
  } catch (error) {
    console.error('Error loading actions:', error);
    toast.error('Failed to load tasks');
  } finally {
    setIsLoading(false);
  }
};


  const toggleAction = async (id: string) => {
  try {
    // ✅ Call backend API
    const response = await apiService.toggleTaskCompletion(id);
    
    // Update local state
    setActions(prev =>
      prev.map(a =>
        a.id === id ? {
          ...a,
          completed: response.data.completed,
          date: response.data.completed_at
        } : a
      )
    );

    // Show toast...
  } catch (error) {
    console.error('Error toggling action:', error);
    toast.error('Failed to update task');
  }
};

  const deleteAction = async (id: string) => {
  try {
    await apiService.deleteTask(id);
    setActions(prev => prev.filter(action => action.id !== id));
    toast.success('Task deleted');
  } catch (error) {
    console.error('Error deleting task:', error);
    toast.error('Failed to delete task');
  }
};


  const addTask = async () => {
  if (!newTaskTitle.trim()) {
    toast.error('Please enter a task title');
    return;
  }

  const today = new Date().toISOString().split('T')[0]; // e.g., "2026-02-13"

  try {
    // Call backend to create task
    const response = await apiService.createTask({
      title: newTaskTitle.trim(),
      date: today, // today only
    });

    // Add task to local state
    const newTask: TreatmentAction = {
      id: response.data.id.toString(),
      title: response.data.title,
      completed: response.data.completed,
      date: response.data.date,
    };

    setActions(prev => [...prev, newTask]);
    setNewTaskTitle('');
    setIsEditModalOpen(false);
    toast.success('Task added!');
  } catch (error) {
    console.error('Error adding task:', error);
    toast.error('Failed to add task');
  }
};




  const silhouetteOpacity = Math.min(overallProgress / 100, 1);
  const silhouetteClarity = overallProgress > 50 ? 'grayscale-0' : 'grayscale';

  return (
    <div className="relative space-y-8">
        {/* Floating Avatar Guide */}
<div className="hidden lg:flex absolute top-70 right-10 flex-col items-center text-center z-10">
  
  {/* Speech Bubble */}
  <div className="relative bg-white px-5 py-3 rounded-2xl shadow-sm border border-pink-200 max-w-[250px]">
    <div className="text-center">
              <p className="text-sm text-slate-600 italic">
                {overallProgress < 20 && "Let's check today's tasks, you can do it..."}
                {overallProgress >= 20 && overallProgress <40 && "Good job doing your first task..."}
                {overallProgress >= 40 && overallProgress < 60 && "Your future self is here with you..."}
                {overallProgress >= 60 && overallProgress < 80 && "Checked another one, You are amazing..."}
                {overallProgress >= 80 && overallProgress < 100 && "You are almost there, keep going..."}
                {overallProgress >= 100 && "Yohoo! you finished it all , I'm so proud of you."}
              </p>
            </div>

    {/* Pointer */}
    <div className="absolute -bottom-2 right-45 w-4 h-4 bg-white border-r border-b border-pink-200 rotate-45"></div>
  </div>
</div>
<div className="hidden lg:flex absolute top-90 right-40 flex-col items-center text-center z-10">
  {/* Avatar */}
  <div className="w-60 h-55 mt-2">
    <img
      src={selectedAvatarImage}
      alt={avatarName}
      className="w-full h-full object-contain"
      style={{ imageRendering: 'pixelated' }}
    />
  </div>
</div>

      
      <div className="grid lg:grid-cols-[1fr,auto] gap-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center lg:text-left space-y-4"
        >
          <h1 className="text-4xl font-bold text-slate-800">Future Self Dialogue</h1>
          <p className="text-lg text-slate-600 max-w-2xl">
            Your future self is waiting to connect with you. Complete your treatment actions to strengthen the bond.
          </p>
        </motion.div>

      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Treatment Actions */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="p-6 bg-white/60 backdrop-blur-sm border-violet-100">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-semibold text-slate-800 flex items-center gap-2">
                <CheckCircle className="w-6 h-6 text-violet-500" />
                Today's Treatment Actions
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditModalOpen(true)}
                className="text-violet-600 hover:text-violet-700 hover:bg-violet-50"
              >
                <Edit className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="space-y-3 mb-6">
              {actions.map((action, index) => (
                <motion.div
                  key={action.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`p-4 rounded-xl border transition-all duration-300 ${
                    action.completed
                      ? 'bg-gradient-to-r from-violet-50 to-purple-50 border-violet-200'
                      : 'bg-white border-slate-200 hover:border-violet-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 cursor-pointer ${
                        action.completed
                          ? 'bg-violet-500 border-violet-500'
                          : 'border-slate-300'
                      }`}
                      onClick={() => toggleAction(action.id)}
                    >
                      {action.completed && <CheckCircle className="w-4 h-4 text-white" fill="currentColor" />}
                    </div>
                    <span 
                      className={`flex-1 cursor-pointer ${action.completed ? 'text-slate-600' : 'text-slate-800'}`}
                      onClick={() => toggleAction(action.id)}
                    >
                      {action.title}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteAction(action.id);
                      }}
                      className="text-red-400 hover:text-red-600 transition-colors p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="relative space-y-2">
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
          <Card className="p-6 bg-gradient-to-br from-violet-50 to-purple-50 border-violet-100 min-h-[545px] flex flex-col">
            <h2 className="text-2xl font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-violet-500" />
              Your Future Self
            </h2>

            <div className="text-center">
              <p className="hidden lg:flex absolute top-155 right-35 flex-col items-center text-center z-10 text-sm text-slate-600 italic">
                I'm here with you to complete your tasks
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

      {/* Add Task Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="bg-white/95 backdrop-blur-sm max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl text-slate-800">Add a daily treatment action</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6 pt-4">
            {/* Avatar with Speech Bubble */}
            <div className="flex flex-col items-center space-y-3">
              <div className="relative bg-blue-50 px-4 py-3 rounded-2xl border border-blue-200">
                <p className="text-sm text-slate-700 italic text-center">
                  Add a treatment action you want to do it daily
                </p>
                <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-blue-50 border-r border-b border-blue-200 rotate-45"></div>
              </div>
              
              <div className="w-24 h-24">
                <img
                  src={selectedAvatarImage}
                  alt={avatarName}
                  className="w-full h-full object-contain"
                  style={{ imageRendering: 'pixelated' }}
                />
              </div>
            </div>

            {/* Input Field */}
            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">
                treatment action :
              </label>
              <Input
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                placeholder="......"
                className="w-full"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    addTask();
                  }
                }}
              />
            </div>

            {/* Add Button */}
            <Button
              onClick={addTask}
              className="w-full bg-gradient-to-r from-cyan-400 to-blue-400 hover:from-cyan-500 hover:to-blue-500 text-white"
            >
              Add task
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}