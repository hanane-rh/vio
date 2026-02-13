// src/pages/routine-builder.tsx - VERSION SANS LA LIGNE VERTE

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Clock, Plus, Edit, Pause, Play, Calendar, CheckCircle, Circle } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Badge } from '../components/ui/badge';

// ✅ USE HOOKS INSTEAD OF LOCALSTORAGE
import { useRoutines, useUserScore } from '../../hooks/useRoutines';
import { ROUTINE_ICONS, DAYS } from '../../types/routine';
import type { Routine } from '../../types/routine';

export function RoutineBuilder() {
  // ✅ USE HOOKS
  const { 
    routines, 
    loading, 
    createRoutine, 
    updateRoutine, 
    deleteRoutine, 
    completeRoutine, 
    togglePause 
  } = useRoutines();
  
  const { score, reload: reloadScore } = useUserScore();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRoutine, setEditingRoutine] = useState<Routine | null>(null);
  
  // Form state
  const [title, setTitle] = useState('');
  const [time, setTime] = useState('09:00');
  const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'custom'>('daily');
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [notes, setNotes] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('pill');
  const [avatarName, setAvatarName] = useState('your future self');
  const [selectedAvatarImage, setSelectedAvatarImage] = useState('/assert/avatar1.png');

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

  const openDialog = (routine?: Routine) => {
    if (routine) {
      setEditingRoutine(routine);
      setTitle(routine.title);
      setTime(routine.time.slice(0, 5)); // Remove seconds
      setFrequency(routine.frequency);
      setSelectedDays(routine.custom_days || []);
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

  const saveRoutine = async () => {
    if (!title.trim()) {
      return;
    }

    const routineData = {
      title: title.trim(),
      time: time + ':00', // Add seconds
      frequency,
      custom_days: frequency === 'weekly' ? selectedDays : null,
      notes: notes.trim() || '',
      icon: selectedIcon,
    };

    try {
      if (editingRoutine) {
        await updateRoutine(editingRoutine.id, routineData);
      } else {
        await createRoutine(routineData);
      }
      setIsDialogOpen(false);
    } catch (error) {
      // Error handled by hook
    }
  };

  const handleComplete = async (id: number) => {
    try {
      await completeRoutine(id);
      reloadScore(); // Refresh score display
    } catch (error) {
      // Error handled by hook
    }
  };

  const handleTogglePause = async (id: number) => {
    try {
      await togglePause(id);
    } catch (error) {
      // Error handled by hook
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteRoutine(id);
    } catch (error) {
      // Error handled by hook
    }
  };

  // Filter today's routines
  const todaysRoutines = routines.filter(routine => {
    if (routine.is_paused) return false;
    
    if (routine.frequency === 'daily') return true;
    
    if (routine.frequency === 'weekly' && routine.custom_days) {
      const today = new Date().getDay();
      return routine.custom_days.includes(today);
    }
    
    return false;
  });

  // Get routine status
  const getRoutineStatus = (routine: Routine): 'completed' | 'ready' | 'upcoming' => {
    const today = new Date().toISOString().split('T')[0];
    if (routine.completion_dates.includes(today)) {
      return 'completed';
    }
    
    const now = new Date();
    const routineTime = new Date();
    const [hours, minutes] = routine.time.split(':');
    routineTime.setHours(parseInt(hours), parseInt(minutes), 0);
    
    return now >= routineTime ? 'ready' : 'upcoming';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading routines...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative space-y-8">
      {/* Floating Avatar Guide */}
      <div className="hidden lg:flex absolute top-0 right-20 flex-col items-center text-center z-10">
        {/* Speech Bubble */}
        <div className="relative bg-white px-5 py-3 rounded-2xl shadow-sm border border-pink-200 max-w-[220px]">
          <p className="text-sm text-slate-700 leading-relaxed italic">
            "Check your routines, they are important for your treatment progress!"
          </p>

          {/* Pointer */}
          <div className="absolute -bottom-2 right-45 w-4 h-4 bg-white border-r border-b border-pink-200 rotate-45"></div>
        </div>
      </div>
      <div className="hidden lg:flex absolute top-25 right-50 flex-col items-center text-center z-10">
        {/* Avatar */}
        <div className="w-35 h-35 mt-2">
          <img
            src={selectedAvatarImage}
            alt={avatarName}
            className="w-full h-full object-contain"
            style={{ imageRendering: 'pixelated' }}
          />
        </div>
      </div>

      {/* ❌ LIGNE VERTE SUPPRIMÉE - La section score a été retirée */}

      {/* Header with Create Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="pr-0 lg:pr-56"
      >
        <div className="mb-6">
          <h1 className="text-4xl font-bold text-slate-800">Treatment Routine Builder</h1>
          <p className="text-lg text-slate-600 max-w-2xl mt-2">
            Organize your healing journey with gentle, supportive routines. Set your own pace — we are here to guide, not pressure.
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => openDialog()}
              size="lg"
              className="w-full sm:w-auto bg-gradient-to-r from-teal-400 to-emerald-400 hover:from-teal-500 hover:to-emerald-500 text-white"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create New Routine
            </Button>
          </DialogTrigger>

          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingRoutine ? 'Edit Routine' : 'Create New Routine'}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {/* Title */}
              <div>
                <Label htmlFor="title">Task Name</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Take evening medication"
                  className="mt-1"
                />
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
                    <SelectItem value="daily">Every Day</SelectItem>
                    <SelectItem value="weekly">Specific Days</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Days (for weekly) */}
              {frequency === 'weekly' && (
                <div>
                  <Label>Select Days</Label>
                  <div className="grid grid-cols-7 gap-2 mt-2">
                    {DAYS.map((day, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          if (selectedDays.includes(idx)) {
                            setSelectedDays(selectedDays.filter(d => d !== idx));
                          } else {
                            setSelectedDays([...selectedDays, idx]);
                          }
                        }}
                        className={`p-2 rounded-lg text-sm font-medium transition-all ${
                          selectedDays.includes(idx)
                            ? 'bg-teal-500 text-white'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {day}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Icon */}
              <div>
                <Label>Icon (Optional)</Label>
                <div className="grid grid-cols-5 gap-2 mt-2">
                  {ROUTINE_ICONS.map((icon) => (
                    <button
                      key={icon.value}
                      type="button"
                      onClick={() => setSelectedIcon(icon.value)}
                      className={`p-3 rounded-lg border-2 text-2xl transition-all ${
                        selectedIcon === icon.value
                          ? 'border-teal-400 bg-teal-50'
                          : 'border-slate-200 hover:border-teal-200'
                      }`}
                      title={icon.label}
                    >
                      {icon.emoji}
                    </button>
                  ))}
                </div>
              </div>

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
      </motion.div>

      {/* Today's Routines */}
      <div>
        <h2 className="text-2xl font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <Calendar className="w-6 h-6 text-teal-500" />
          Today's Schedule
        </h2>

        {todaysRoutines.length === 0 ? (
          <Card className="p-8 bg-gradient-to-r from-teal-50 to-emerald-50 border-teal-100 text-center">
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
                  <Card
                    className={`p-5 transition-all duration-300 ${
                      status === 'completed'
                        ? 'bg-gradient-to-r from-teal-50 to-emerald-50 border-teal-200'
                        : status === 'upcoming'
                        ? 'bg-white/60 backdrop-blur-sm border-slate-200'
                        : 'bg-amber-50/50 border-amber-100 border-3'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      {/* Icon & Time */}
                      <div className="flex flex-col items-center gap-2">
                        <div className={`text-3xl w-14 h-14 rounded-xl flex items-center justify-center ${
                          status === 'completed' 
                            ? 'bg-gradient-to-br from-teal-400 to-emerald-400' 
                            : 'bg-slate-100'
                        }`}>
                          {icon?.emoji || '✓'}
                        </div>
                        <Badge variant="outline" className="text-xs whitespace-nowrap">
                          {routine.time.slice(0, 5)}
                        </Badge>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div>
                            <h3 className="font-semibold text-slate-800 text-lg">
                              {routine.title}
                            </h3>
                            {routine.notes && (
                              <p className="text-sm text-slate-600 mt-1 italic">
                                {routine.notes}
                              </p>
                            )}
                          </div>
                          
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openDialog(routine)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleTogglePause(routine.id)}
                            >
                              {routine.is_paused ? (
                                <Play className="w-4 h-4" />
                              ) : (
                                <Pause className="w-4 h-4" />
                              )}
                            </Button>
                          </div>
                        </div>

                        {/* Status Badge & Action */}
                        <div className="flex items-center gap-3">
                          {status === 'completed' ? (
                            <Badge className="bg-gradient-to-r from-teal-400 to-emerald-400 text-white">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Completed
                            </Badge>
                          ) : status === 'upcoming' ? (
                            <Badge variant="outline" className="text-slate-600">
                              <Circle className="w-3 h-3 mr-1" />
                              Upcoming
                            </Badge>
                          ) : (
                            <>
                              <Badge variant="outline" className="text-amber-600 border-amber-300">
                                Ready
                              </Badge>
                              <Button
                                size="sm"
                                onClick={() => handleComplete(routine.id)}
                                className="bg-gradient-to-r from-teal-400 to-emerald-400 hover:from-teal-500 hover:to-emerald-500"
                              >
                                Mark Complete +5pts
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
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
          <h2 className="text-2xl font-semibold text-slate-800 mb-4">All Routines</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {routines.map((routine) => {
              const icon = ROUTINE_ICONS.find(i => i.value === routine.icon);
              return (
                <Card
                  key={routine.id}
                  className={`p-4 ${routine.is_paused ? 'opacity-60' : ''}`}
                >
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">{icon?.emoji || '✓'}</div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-800">{routine.title}</h3>
                      <p className="text-sm text-slate-600 mt-1">
                        {routine.time.slice(0, 5)} · {routine.frequency === 'daily' ? 'Daily' : 
                          routine.custom_days?.map(d => DAYS[d]).join(', ')}
                      </p>
                      {routine.is_paused && (
                        <Badge variant="outline" className="mt-2 text-xs">
                          Paused
                        </Badge>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(routine.id)}
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
    </div>
  );
}