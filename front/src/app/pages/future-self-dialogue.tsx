import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { apiService } from '../../services/api';

interface TreatmentAction {
  id: string;
  title: string;
  completed: boolean;
  date?: string;
}

interface FutureSelfMessage {
  id: number;
  message_type: string;
  content: string;
  unlock_progress: number;
  is_unlocked: boolean;
}

export function FutureSelfDialogue() {
  const [actions, setActions] = useState<TreatmentAction[]>([]);
  const [messages, setMessages] = useState<FutureSelfMessage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Load tasks
      const tasksResponse = await apiService.getTodayTasks();
      const tasksData = Array.isArray(tasksResponse.data) 
        ? tasksResponse.data.map((task: any) => ({
            id: task.id.toString(),
            title: task.title,
            completed: task.completed,
            date: task.date,
          }))
        : [];
      setActions(tasksData);

      // Load future self messages
      try {
        const messagesResponse = await apiService.getFutureMessages();
        const messagesData = Array.isArray(messagesResponse.data) 
          ? messagesResponse.data 
          : [];
        setMessages(messagesData);
      } catch (msgError) {
        console.error('Error loading messages:', msgError);
        // Set empty array if messages fail to load
        setMessages([]);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load data');
      setActions([]);
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleAction = async (id: string) => {
    const action = actions.find(a => a.id === id);
    const wasCompleted = action?.completed;

    // Optimistic update
    setActions(prev =>
      prev.map(a =>
        a.id === id ? { ...a, completed: !a.completed } : a
      )
    );

    try {
      await apiService.toggleTaskCompletion(id);

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
    } catch (error) {
      // Revert on error
      setActions(prev =>
        prev.map(a =>
          a.id === id ? { ...a, completed: !a.completed } : a
        )
      );
      toast.error('Failed to update task');
    }
  };

  const deleteAction = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    // TODO: Implement delete functionality
    toast.info('Delete functionality coming soon');
  };

  const completedCount = actions.filter(a => a.completed).length;
  const progress = actions.length > 0 ? (completedCount / actions.length) * 100 : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-slate-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50 p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Future Self Dialogue</h1>
        <p className="text-slate-600">
          Your future self is waiting to connect with you. Complete your treatment actions to strengthen the bond.
        </p>
      </motion.div>

      {/* Main Grid */}
      <div className="grid lg:grid-cols-2 gap-6 max-w-7xl">
        {/* Left Column - Today's Treatment Actions */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/80 backdrop-blur-sm rounded-2xl border border-pink-200 p-6 shadow-sm"
        >
          {/* Header with edit icon */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <input type="checkbox" className="w-5 h-5 rounded border-pink-300" />
              <h2 className="text-xl font-semibold text-slate-800">Today's treatment Actions</h2>
            </div>
            <button className="text-pink-500 hover:text-pink-600">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
            </button>
          </div>

          {/* Task List */}
          <div className="space-y-3">
            {actions.map((action, index) => (
              <motion.div
                key={action.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                  action.completed
                    ? 'bg-pink-50 border-pink-300'
                    : 'bg-white border-slate-200 hover:border-pink-200'
                }`}
                onClick={() => toggleAction(action.id)}
              >
                <div className="flex items-center gap-3 flex-1">
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                      action.completed
                        ? 'bg-pink-500 border-pink-500'
                        : 'border-slate-300'
                    }`}
                  >
                    {action.completed && (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </div>
                  <span className={`text-sm ${action.completed ? 'text-slate-500' : 'text-slate-800'}`}>
                    {action.title}
                  </span>
                </div>
                <button
                  onClick={(e) => deleteAction(action.id, e)}
                  className="text-pink-400 hover:text-pink-600 p-1"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Right Column - Your Future Self */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl border border-purple-200 p-6 shadow-sm"
        >
          {/* Header */}
          <div className="flex items-center gap-2 mb-6">
            <Sparkles className="w-5 h-5 text-purple-600" />
            <h2 className="text-xl font-semibold text-slate-800">Your Future Self</h2>
          </div>

          {/* Speech Bubble */}
          <div className="mb-6">
            <div className="bg-white rounded-2xl rounded-bl-none p-4 shadow-sm relative">
              <p className="text-sm text-slate-700 italic">
                "Yeppp! you did well, keep up like this for your future self"
              </p>
            </div>
          </div>

          {/* Pixel Art Avatar */}
          <div className="flex flex-col items-center justify-center py-8">
            <div className="relative">
              {/* Replace with actual pixel art or image */}
              <div className="w-32 h-40 bg-gradient-to-b from-purple-300 to-purple-400 rounded-lg flex items-center justify-center">
                <img src="/assert/avatar1.png" alt="Avatar" className="w-20 h-20 object-contain" />
              </div>
            </div>
            <p className="text-sm text-slate-600 italic mt-6">
              Your future self is here with you.
            </p>
          </div>
        </motion.div>
      </div>

      {/* Messages from Your Future Self */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-8 max-w-7xl"
      >
        <div className="flex items-center gap-2 mb-4">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 16v-4M12 8h.01" />
          </svg>
          <h2 className="text-xl font-semibold text-slate-800">Messages from Your Future Self</h2>
        </div>

        <div className="space-y-3">
          <AnimatePresence>
            {Array.isArray(messages) && messages.length > 0 ? (
              messages.map((message, index) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`flex items-start gap-3 p-4 rounded-2xl border ${
                    message.is_unlocked
                      ? 'bg-purple-50 border-purple-200'
                      : 'bg-slate-50 border-slate-200 opacity-60'
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                      message.is_unlocked
                        ? 'bg-gradient-to-br from-purple-400 to-pink-400'
                        : 'bg-slate-300'
                    }`}
                  >
                    {message.is_unlocked ? (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" />
                        <path d="M12 16v-4M12 8h.01" />
                      </svg>
                    ) : (
                      <span className="text-white text-sm">🔒</span>
                    )}
                  </div>
                  <div className="flex-1 pt-1">
                    {message.is_unlocked ? (
                      <p className="text-sm text-slate-700 italic leading-relaxed">
                        "{message.content}"
                      </p>
                    ) : (
                      <p className="text-sm text-slate-500">
                        Unlocks at {message.unlock_progress}% progress
                      </p>
                    )}
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-8 text-slate-500">
                <p className="text-sm">No messages yet. Complete tasks to unlock messages from your future self.</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="mt-8 max-w-7xl text-center"
      >
        <div className="flex items-center justify-center gap-2 text-sm text-slate-600">
          <span className="text-pink-500">❤️</span>
          <p>
            Every step forward is victory. We're proud of you.
          </p>
        </div>
        <p className="text-xs text-slate-500 mt-2">
          VIO — your compassionate companion on the journey to healing.
        </p>
      </motion.div>
    </div>
  );
}