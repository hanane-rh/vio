import { motion } from 'motion/react';
import { Sparkles } from 'lucide-react';
import { AvatarConfig } from '../types/avatar';

interface AvatarDisplayProps {
  config: AvatarConfig;
  size?: 'small' | 'medium' | 'large';
  showName?: boolean;
  animate?: boolean;
  message?: string;
}

export function AvatarDisplay({ 
  config, 
  size = 'medium', 
  showName = false, 
  animate = false,
  message 
}: AvatarDisplayProps) {
  const getGradient = () => {
    const gradients = {
      youthful: 'from-violet-400 to-purple-400',
      mature: 'from-blue-400 to-cyan-400',
      gentle: 'from-teal-400 to-emerald-400',
      energetic: 'from-amber-400 to-orange-400',
    };
    return gradients[config.appearance];
  };

  const getSizes = () => {
    const sizes = {
      small: { container: 'w-12 h-12', icon: 'w-6 h-6', rounded: 'rounded-xl' },
      medium: { container: 'w-16 h-16', icon: 'w-8 h-8', rounded: 'rounded-2xl' },
      large: { container: 'w-24 h-24', icon: 'w-12 h-12', rounded: 'rounded-3xl' },
    };
    return sizes[size];
  };

  const sizeClasses = getSizes();

  return (
    <div className="flex flex-col items-center gap-3">
      <motion.div
        animate={animate ? {
          scale: [1, 1.1, 1],
          rotate: [0, 5, -5, 0],
        } : {}}
        transition={{ duration: 0.6, ease: 'easeInOut' }}
        className={`${sizeClasses.container} ${sizeClasses.rounded} bg-gradient-to-br ${getGradient()} shadow-lg flex items-center justify-center relative`}
      >
        <Sparkles className={`${sizeClasses.icon} text-white`} strokeWidth={1.5} />
        
        {/* Subtle glow effect */}
        <div className={`absolute inset-0 ${sizeClasses.rounded} bg-gradient-to-br ${getGradient()} blur-md opacity-30`} />
      </motion.div>

      {showName && config.name && (
        <p className="text-sm font-medium text-slate-700">{config.name}</p>
      )}

      {message && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 backdrop-blur-sm rounded-xl px-4 py-3 shadow-sm border border-teal-100 max-w-xs"
        >
          <p className="text-sm text-slate-700 leading-relaxed italic">
            "{message}"
          </p>
        </motion.div>
      )}
    </div>
  );
}
