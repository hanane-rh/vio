import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Star, Plus, Heart, Calendar, Sparkles } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { toast } from 'sonner';
import { AvatarDisplay } from '../components/avatar-display';
import { useUser } from '../../context/user-context';
import { AVATAR_MESSAGES } from '../types/avatar';
import { apiService } from '../../services/api';


interface ConstellationStar {
  id: string;
  x: number;
  y: number;
  date: string;
  type: 'difficult-day' | 'milestone' | 'return' | 'emotional-challenge';
  mood: string;
  note: string;
  size: number;
}

const STAR_TYPES = {
  'difficult-day': { label: 'Difficult Day', color: 'from-blue-400 to-cyan-400' },
  'milestone': { label: 'Milestone', color: 'from-yellow-300 to-amber-400' },
  'return': { label: 'Return After Pause', color: 'from-purple-400 to-pink-400' },
  'emotional-challenge': { label: 'Emotional Challenge', color: 'from-emerald-400 to-teal-400' },
};

export function Constellation() {
  const { profile } = useUser();
  const [stars, setStars] = useState<ConstellationStar[]>([]);
const [isLoadingStars, setIsLoadingStars] = useState(true);


  const [selectedStar, setSelectedStar] = useState<ConstellationStar | null>(null);
  const [newStarType, setNewStarType] = useState<string>('difficult-day');
  const [newStarMood, setNewStarMood] = useState<string>('');
  const [newStarNote, setNewStarNote] = useState<string>('');
  const [isAddingDialogOpen, setIsAddingDialogOpen] = useState(false);
  const [showAvatarMessage, setShowAvatarMessage] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState('avatar1');
const [avatarName, setAvatarName] = useState('your future self');

useEffect(() => {
  const savedAvatar = localStorage.getItem('vio-selected-avatar');
  const savedName = localStorage.getItem('vio-onboarding-avatar-name');

  if (savedAvatar) setSelectedAvatar(savedAvatar);
  if (savedName) setAvatarName(savedName);
}, []);


  
  // Show avatar message about constellation growth periodically
  useEffect(() => {
    if (stars.length > 0 && stars.length % 5 === 0) {
      const messages = AVATAR_MESSAGES.constellationGrowth;
      const message = messages[Math.floor(Math.random() * messages.length)];
      setShowAvatarMessage(true);
      
      setTimeout(() => {
        toast.message(`✨ || 'Your Future Self'}`, {

          description: message,
          duration: 6000,
        });
      }, 500);

      setTimeout(() => {
        setShowAvatarMessage(false);
      }, 6000);
    }
  }, [stars.length, profile]);


const AVATAR_CHARACTERS = [
  { id: 'avatar1', name: 'Boy', image: '/assert/avatar1.png' },
  { id: 'avatar2', name: 'Girl', image: '/assert/avatar2.png' },
  { id: 'avatar3', name: '/assert/avatar3.png' },
  { id: 'avatar4', name: 'Boy2', image: '/assert/avatar4.png' },
  { id: 'avatar5', name: 'Mario', image: '/assert/avatar5.png' },
  { id: 'avatar6', name: 'Cat', image: '/assert/avatar6.png' },
  { id: 'avatar7', name: 'Hijabi', image: '/assert/avatar7.png' },
  { id: 'avatar8', name: 'Dog', image: '/assert/avatar8.png' },
  { id: 'avatar9', name: 'BoyDog', image: '/assert/avatar9.png' },
  { id: 'avatar10', name: 'HatBoy', image: '/assert/avatar10.png' },
  { id: 'avatar11', name: 'Boy3', image: '/assert/avatar11.png' },
  { id: 'avatar12', name: 'BabyBoy', image: '/assert/avatar12.png' },
  { id: 'avatar13', name: 'GirlCat', image: '/assert/avatar13.png' },
];
const currentAvatar =
  AVATAR_CHARACTERS.find(a => a.id === selectedAvatar) ||
  AVATAR_CHARACTERS[0];

const loadStars = async () => {
  try {
    setIsLoadingStars(true);
    const response = await apiService.getConstellationStars();

    console.log('Stars API response:', response.data);

    const starsData = Array.isArray(response.data)
      ? response.data
      : response.data.results || [];
    const mappedStars = starsData.map((s: any) => ({
  id: s.id?.toString(),
  x: s.x,
  y: s.y,
  date: s.date || s.created_at,
  type: s.star_type, // 🔥 important mapping
  mood: s.mood,
  note: s.note,
  size: s.size || 1,
}));

setStars(mappedStars);
  } catch (error) {
    console.error('Failed to load stars:', error);
    toast.error('Failed to load your constellation');
  } finally {
    setIsLoadingStars(false);
  }
};

useEffect(() => {
  loadStars();
}, []);

  const addStar = async () => {
  if (!newStarNote.trim()) return;

  try {
    const payload = {
  x: Math.random() * 70 + 15,
  y: Math.random() * 70 + 10,
  star_type: newStarType, // 🔥 FIXED
  mood: newStarMood,
  note: newStarNote,
  size: Math.random() * 0.5 + 0.75,
};


    await apiService.createConstellationStar(payload);

    // 🔥 reload from backend (source of truth)
    await loadStars();

    setNewStarNote('');
    setNewStarMood('');
    setIsAddingDialogOpen(false);

    toast.success('✨ Star added to your constellation!', {
      description: 'Your resilience journey grows more beautiful.',
    });
  } catch (error: any) {
  console.error('Failed to create star:', error);
  console.error('Backend response:', error?.response?.data);

  toast.error(
    error?.response?.data?.detail ||
    'Failed to add star'
  );
}

};


  const getConnectionLines = () => {
    const lines: { x1: number; y1: number; x2: number; y2: number }[] = [];
    
    // Sort stars by date
    const sortedStars = [...stars].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    // Connect consecutive stars
    for (let i = 0; i < sortedStars.length - 1; i++) {
      lines.push({
        x1: sortedStars[i].x,
        y1: sortedStars[i].y,
        x2: sortedStars[i + 1].x,
        y2: sortedStars[i + 1].y,
      });
    }

    return lines;
  };

  return (
    <div className="space-y-8">
      {/* Header with Avatar */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center lg:text-left space-y-4"
      >
        <div className="text-center lg:text-left space-y-4">
          <h1 className="text-4xl font-bold text-slate-800">Treatment Memory Constellation</h1>
          <p className="text-lg text-slate-600 max-w-2xl">
            Every treatment moment becomes a star in your personal constellation of healing. Create a visual map of your resilience journey.
          </p>
        </div>
        

      </motion.div>

      {/* Stats + Avatar Section */}
<div className="grid lg:grid-cols-[1fr_520px] gap-6 items-start">

  {/* LEFT — Stat Cards */}
  <div className="grid grid-cols-2 gap-4">
    {Object.entries(STAR_TYPES).map(([type, config]) => {
      const count = stars.filter(s => s.type === type).length;
      return (
        <Card
          key={type}
          className="p-3 bg-white/60 backdrop-blur-sm border-purple-200 border-2"
        >
          <div className={`w-7 h-7 rounded-full bg-gradient-to-br ${config.color} flex items-center justify-center mb-2`}>
            <Star className="w-4 h-5 text-white" fill="currentColor" />
          </div>
          <div className="text-xl font-bold text-slate-800">{count}</div>
          <div className="text-sm text-slate-600">{config.label}</div>
        </Card>
      );
    })}
  </div>

  {/* RIGHT — Avatar Card */}
  <Card className="p-12 bg-gradient-to-br from-gray-50 to-gray-50 border-green-200 border-3">
    <div className="flex flex-col items-center text-center space-y-4">

      {/* Speech Bubble */}
      <div className="relative bg-white px-6 py-4 rounded-2xl shadow-sm border border-pink-200">
        <p className="text-sm text-slate-700 leading-relaxed italic">
          "Let’s see how was your day, every moment is a precious star"
        </p>

        {/* Triangle pointer */}
        <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-white border-r border-b border-pink-200 rotate-45"></div>
      </div>

      {/* Avatar */}
      <div className="w-28 h-28">
        <img
          src={currentAvatar.image}
          alt={currentAvatar.name}
          className="w-full h-full object-contain"
          style={{ imageRendering: 'pixelated' }}
        />
      </div>

      {/* Avatar Name */}
      <p className="text-sm font-medium text-slate-600">
        {avatarName}
      </p>
    </div>
  </Card>

</div>


      {/* Constellation Canvas */}
      <Card className="p-8 bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 border-slate-700 min-h-[600px] relative overflow-hidden">
        {/* Background stars effect */}
        <div className="absolute inset-0 opacity-30">
          {Array.from({ length: 50 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 2}s`,
              }}
            />
          ))}
        </div>

        {/* Connection lines */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          {getConnectionLines().map((line, i) => (
            <motion.line
              key={i}
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 0.3 }}
              transition={{ duration: 1, delay: i * 0.1 }}
              x1={`${line.x1}%`}
              y1={`${line.y1}%`}
              x2={`${line.x2}%`}
              y2={`${line.y2}%`}
              stroke="rgba(255, 255, 255, 0.3)"
              strokeWidth="1"
              strokeDasharray="4 4"
            />
          ))}
        </svg>

        {/* Stars */}
        <AnimatePresence>
          {stars.map((star, index) => {
            const config = STAR_TYPES[star.type];
            return (
              <motion.div
                key={star.id}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: star.size, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ delay: index * 0.1 }}
                className="absolute cursor-pointer group"
                style={{ left: `${star.x}%`, top: `${star.y}%` }}
                onClick={() => setSelectedStar(star)}
              >
                <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${config.color} flex items-center justify-center shadow-lg group-hover:scale-125 transition-transform duration-300`}>
                  <Star className="w-6 h-6 text-white" fill="currentColor" />
                </div>
                
                {/* Glow effect */}
                <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${config.color} blur-xl opacity-50 group-hover:opacity-75 transition-opacity duration-300`} />
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* Empty state */}
        {stars.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center space-y-4">
              <Sparkles className="w-16 h-16 text-blue-300 mx-auto opacity-50" />
              <p className="text-blue-200 text-lg">Your constellation is waiting to be born</p>
              <p className="text-blue-300 text-sm">Add your first star to begin mapping your journey</p>
            </div>
          </div>
        )}

        {/* Add Star Button */}
        <Dialog open={isAddingDialogOpen} onOpenChange={setIsAddingDialogOpen}>
          <DialogTrigger asChild>
            <Button
              className="absolute bottom-4 right-4 rounded-full w-14 h-14 bg-gradient-to-br from-blue-400 to-cyan-400 hover:from-blue-500 hover:to-cyan-500 shadow-lg"
              size="icon"
            >
              <Plus className="w-6 h-6" />
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-white/95 backdrop-blur-sm">
            <DialogHeader>
              <DialogTitle className="text-2xl text-slate-800">Add a Star to Your Constellation</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">Type of Moment</label>
                <Select value={newStarType} onValueChange={setNewStarType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(STAR_TYPES).map(([type, config]) => (
                      <SelectItem key={type} value={type}>
                        {config.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">How are you feeling?</label>
                <Select value={newStarMood} onValueChange={setNewStarMood}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your mood" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hopeful">🌟 Hopeful</SelectItem>
                    <SelectItem value="tired">😌 Tired but resilient</SelectItem>
                    <SelectItem value="proud">🎉 Proud</SelectItem>
                    <SelectItem value="struggling">💙 Struggling</SelectItem>
                    <SelectItem value="grateful">🙏 Grateful</SelectItem>
                    <SelectItem value="determined">💪 Determined</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">Your Reflection</label>
                <Textarea
                  value={newStarNote}
                  onChange={(e) => setNewStarNote(e.target.value)}
                  placeholder="What made this moment significant? What do you want to remember?"
                  className="min-h-[120px] resize-none"
                />
              </div>

              <Button
                onClick={addStar}
                disabled={!newStarNote.trim()}
                className="w-full bg-gradient-to-r from-blue-400 to-cyan-400 hover:from-blue-500 hover:to-cyan-500"
              >
                <Star className="w-4 h-4 mr-2" />
                Add Star
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </Card>

      {/* Star Detail Dialog */}
      <Dialog open={!!selectedStar} onOpenChange={() => setSelectedStar(null)}>
        <DialogContent className="bg-white/95 backdrop-blur-sm">
          {selectedStar && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl text-slate-800 flex items-center gap-2">
                  <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${STAR_TYPES[selectedStar.type].color} flex items-center justify-center`}>
                    <Star className="w-5 h-5 text-white" fill="currentColor" />
                  </div>
                  {STAR_TYPES[selectedStar.type].label}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="flex items-center gap-2 text-slate-600">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm">
                    {new Date(selectedStar.date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                </div>

                {selectedStar.mood && (
                  <div className="p-3 bg-blue-50 rounded-xl">
                    <span className="text-sm font-medium text-slate-700">Mood: </span>
                    <span className="text-sm text-slate-600">{selectedStar.mood}</span>
                  </div>
                )}

                <div>
                  <p className="text-slate-700 leading-relaxed italic">"{selectedStar.note}"</p>
                </div>

                <div className="pt-4 border-t border-slate-200">
                  <p className="text-sm text-slate-600 text-center">
                    <Heart className="w-4 h-4 inline text-rose-400" fill="currentColor" />
                    {' '}This is a piece of your resilience story
                  </p>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}