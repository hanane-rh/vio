import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Clock, Plus, Edit2, Trash2, Calendar, CheckCircle } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Badge } from '../components/ui/badge';
import { toast } from 'sonner';
import { RoutineTask, ROUTINE_ICONS, REMINDER_MESSAGES } from '../types/routine';

export function RoutineBuilder() {
  const [routines, setRoutines] = useState<RoutineTask[]>(() => {
    const saved = localStorage.getItem('carepath-routines');
    return saved ? JSON.parse(saved) : [];
  });

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRoutine, setEditingRoutine] = useState<RoutineTask | null>(null);
  
  // Form state
  const [title, setTitle] = useState('');
  const [time, setTime] = useState('09:00');
  const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'custom'>('daily');
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [notes, setNotes] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('pill');

  useEffect(() => {
    localStorage.setItem('carepath-routines', JSON.stringify(routines));
  }, [routines]);

  // Check for upcoming routines and send notifications
  useEffect(() => {
    const checkRoutines = () => {
      const now = new Date();
      const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      const currentDay = now.getDay();
      const today = now.toISOString().split('T')[0];

      routines.forEach(routine => {
        if (routine.isPaused) return;

        let shouldRunToday = false;
        if (routine.frequency === 'daily') {
          shouldRunToday = true;
        } else if (routine.frequency === 'weekly' && routine.customDays?.includes(currentDay)) {
          shouldRunToday = true;
        }

        if (shouldRunToday && routine.time === currentTime) {
          const completedToday = routine.completionDates?.includes(today);
          
          if (!completedToday) {
            const message = REMINDER_MESSAGES[Math.floor(Math.random() * REMINDER_MESSAGES.length)];
            toast.message(`🌿 ${routine.title}`, {
              description: message,
              duration: 8000,
              action: {
                label: 'Mark Complete',
                onClick: () => completeRoutine(routine.id),
              },
            });
          }
        }
      });
    };

    const interval = setInterval(checkRoutines, 60000);
    checkRoutines();

    return () => clearInterval(interval);
  }, [routines]);

  const openDialog = (routine?: RoutineTask) => {
    if (routine) {
      setEditingRoutine(routine);
      setTitle(routine.title);
      setTime(routine.time);
      setFrequency(routine.frequency);
      setSelectedDays(routine.customDays || []);
      setNotes(routine.notes || '');
      setSelectedIcon(routine.icon || 'pill');
    } else {
      setEditingRoutine(null);
      setTitle('');
      setTime('09:00');
      setFrequency('daily');
      setSelectedDays([]);
      setNotes('');
      setSelectedIcon('pill');
    }
    setIsDialogOpen(true);
  };

  const saveRoutine = () => {
    if (!title.trim()) {
      toast.error('Please enter a task name');
      return;
    }

    const routineData: RoutineTask = {
      id: editingRoutine?.id || Date.now().toString(),
      title: title.trim(),
      time,
      frequency,
      customDays: frequency === 'weekly' ? selectedDays : undefined,
      notes: notes.trim() || undefined,
      icon: selectedIcon,
      isPaused: editingRoutine?.isPaused || false,
      createdAt: editingRoutine?.createdAt || new Date().toISOString(),
      completionDates: editingRoutine?.completionDates || [],
    };

    if (editingRoutine) {
      setRoutines(prev => prev.map(r => r.id === editingRoutine.id ? routineData : r));
      toast.success('Routine updated successfully');
    } else {
      setRoutines(prev => [...prev, routineData]);
      toast.success('Routine created successfully', {
        description: 'You will receive gentle reminders when it is time.',
      });
    }

    setIsDialogOpen(false);
  };

  const completeRoutine = (id: string) => {
    const today = new Date().toISOString().split('T')[0];
    setRoutines(prev =>
      prev.map(r => {
        if (r.id === id) {
          const completionDates = r.completionDates || [];
          if (!completionDates.includes(today)) {
            return {
              ...r,
              lastCompleted: new Date().toISOString(),
              completionDates: [...completionDates, today],
            };
          }
        }
        return r;
      })
    );

    toast.success('Beautiful! Routine completed', {
      description: 'Every small step supports your healing journey.',
    });
  };

  const deleteRoutine = (id: string) => {
    setRoutines(prev => prev.filter(r => r.id !== id));
    toast.success('Routine removed');
  };

  // Get today's routines
  const today = new Date();
  const todayDay = today.getDay();
  const todayStr = today.toISOString().split('T')[0];

  const todaysRoutines = routines
    .filter(r => {
      if (r.isPaused) return false;
      if (r.frequency === 'daily') return true;
      if (r.frequency === 'weekly' && r.customDays?.includes(todayDay)) return true;
      return false;
    })
    .sort((a, b) => a.time.localeCompare(b.time));

  const getRoutineStatus = (routine: RoutineTask) => {
    const completedToday = routine.completionDates?.includes(todayStr);
    const currentTime = `${today.getHours().toString().padStart(2, '0')}:${today.getMinutes().toString().padStart(2, '0')}`;
    
    if (completedToday) return 'completed';
    if (routine.time > currentTime) return 'upcoming';
    return 'pending';
  };

  const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50/20">
      <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
        {/* Header Section */}
        <div className="grid lg:grid-cols-[1fr,auto] gap-8 items-start">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 mb-2">Treatment Routine Builder</h1>
            <p className="text-slate-600 mb-6">
              Organize your healing journey with gentle, supportive routines. Set your own pace — we are here to guide, not pressure.
            </p>
            
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  onClick={() => openDialog()}
                  className="bg-gradient-to-r from-teal-400 to-cyan-400 hover:from-teal-500 hover:to-cyan-500 text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create New Routine
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>{editingRoutine ? 'Edit' : 'Create'} Routine</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  {/* Task Name */}
                  <div>
                    <Label htmlFor="title">Task Name</Label>
                    <Input
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g., Take morning medication"
                      className="mt-1"
                    />
                  </div>

                  {/* Icon Selection */}
                  <div>
                    <Label>Icon</Label>
                    <div className="grid grid-cols-6 gap-2 mt-2">
                      {ROUTINE_ICONS.map((icon) => (
                        <button
                          key={icon.value}
                          type="button"
                          onClick={() => setSelectedIcon(icon.value)}
                          className={`p-3 rounded-lg border-2 transition-all text-2xl ${
                            selectedIcon === icon.value
                              ? 'border-teal-400 bg-teal-50'
                              : 'border-slate-200 hover:border-teal-200'
                          }`}
                        >
                          {icon.emoji}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Time */}
                  <div>
                    <Label htmlFor="time">Time</Label>
                    <Input
                      id="time"
                      type="time"
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      className="mt-1"
                    />
                  </div>

                  {/* Frequency */}
                  <div>
                    <Label htmlFor="frequency">Frequency</Label>
                    <Select value={frequency} onValueChange={(v: any) => setFrequency(v)}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Specific Days</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Days Selection */}
                  {frequency === 'weekly' && (
                    <div>
                      <Label>Select Days</Label>
                      <div className="grid grid-cols-7 gap-2 mt-2">
                        {DAYS.map((day, index) => (
                          <button
                            key={index}
                            type="button"
                            onClick={() => {
                              setSelectedDays(prev =>
                                prev.includes(index)
                                  ? prev.filter(d => d !== index)
                                  : [...prev, index]
                              );
                            }}
                            className={`py-2 rounded-lg text-xs font-medium transition-all ${
                              selectedDays.includes(index)
                                ? 'bg-teal-400 text-white'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            {day}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Notes */}
                  <div>
                    <Label htmlFor="notes">Supportive Notes (Optional)</Label>
                    <Textarea
                      id="notes"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Add personal motivation or reminders..."
                      className="mt-1 resize-none"
                      rows={3}
                    />
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-4">
                    <Button
                      variant="outline"
                      onClick={() => setIsDialogOpen(false)}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={saveRoutine}
                      className="flex-1 bg-gradient-to-r from-teal-400 to-emerald-400 hover:from-teal-500 hover:to-emerald-500"
                    >
                      {editingRoutine ? 'Update' : 'Create'} Routine
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Avatar with Message */}
          <Card className="p-6 bg-gradient-to-br from-teal-50/40 to-emerald-50/40 border-teal-100 max-w-sm">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="relative bg-white px-6 py-4 rounded-2xl shadow-sm border border-slate-200">
                <p className="text-sm text-slate-700 leading-relaxed">
                  "Check your routines, they are important for your treatment progress!"
                </p>
                <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-white border-r border-b border-slate-200 rotate-45"></div>
              </div>
            <img src="/assert/avatar1.png" alt="Avatar" className="w-20 h-20 object-contain" />
            </div>
          </Card>
        </div>

       {/* Today's Schedule */}
        <div>
          <h2 className="text-xl font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-teal-500" />
            Today's Schedule
          </h2>

          {todaysRoutines.length === 0 ? (
            <Card className="p-8 bg-white/60 border-slate-200 text-center">
              <p className="text-slate-600">
                No routines scheduled for today. Create your first routine to get started.
              </p>
            </Card>
          ) : (
            <div className="space-y-3">
              {todaysRoutines.map((routine, index) => {
                const status = getRoutineStatus(routine);
                const icon = ROUTINE_ICONS.find(i => i.value === routine.icon);

                return (
                  <motion.div
                    key={routine.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className="p-4 bg-white/80 border-slate-200 hover:shadow-md transition-all">
                      <div className="flex items-center gap-4">
                        {/* Icon */}
                        <div className="text-3xl w-12 h-12 flex items-center justify-center">
                          {icon?.emoji || '✓'}
                        </div>

                        {/* Time */}
                        <div className="flex flex-col items-center min-w-[60px]">
                          <Badge variant="outline" className="text-xs bg-yellow-50 border-yellow-200 text-yellow-700">
                            {routine.time}
                          </Badge>
                          <span className="text-xs text-slate-500 mt-1">{frequency === 'daily' ? 'Daily' : 'Weekly'}</span>
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-slate-800">
                            {routine.title}
                          </h3>
                        </div>

                        {/* Status Badges */}
                        <div className="flex items-center gap-2">
                          {status === 'completed' ? (
                            <>
                              <Badge className="bg-gradient-to-r from-teal-400 to-cyan-400 text-white">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Completed
                              </Badge>
                              <Badge className="bg-gradient-to-r from-teal-400 to-cyan-400 text-white">
                                +5pts
                              </Badge>
                            </>
                          ) : (
                            <>
                              <Button
                                size="sm"
                                onClick={() => completeRoutine(routine.id)}
                                className="bg-gradient-to-r from-teal-400 to-cyan-400 hover:from-teal-500 hover:to-cyan-500 text-white"
                              >
                                Mark Complete
                              </Button>
                              <Badge className="bg-gradient-to-r from-teal-400 to-cyan-400 text-white">
                                +5pts
                              </Badge>
                            </>
                          )}
                        </div>

                        {/* Edit Button */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openDialog(routine)}
                          className="text-slate-400 hover:text-slate-600"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
        {/* All Routines */}
        {routines.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold text-slate-800 mb-4">All Routines</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {routines.map((routine) => {
                const icon = ROUTINE_ICONS.find(i => i.value === routine.icon);
                return (
                  <Card
                    key={routine.id}
                    className="p-4 bg-white/80 border-slate-200"
                  >
                    <div className="flex items-start gap-3">
                      <div className="text-2xl">{icon?.emoji || '✓'}</div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-slate-800">{routine.title}</h3>
                        <p className="text-sm text-slate-600 mt-1">
                          {routine.time} · {routine.frequency === 'daily' ? 'Daily' : 
                            routine.customDays?.map(d => DAYS[d]).join(', ')}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteRoutine(routine.id)}
                        className="text-rose-500 hover:text-rose-600 hover:bg-rose-50"
                      >
                        Remove
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* Footer Message */}
        <div className="text-center space-y-1 py-4">
          <p className="text-sm text-slate-600">
            <span className="text-red-500">♥</span> Every step forward is a victory. We're proud of you.
          </p>
          <p className="text-xs text-slate-500">
            VIO — Your compassionate companion on the journey to healing
          </p>
        </div>
      </div>
    </div>
  );
}