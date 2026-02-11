import { useEffect } from 'react';
import { toast } from 'sonner';
import { useUser } from '../../context/user-context';

const ENCOURAGEMENT_MESSAGES = [
  "You're doing amazing. Every small step counts.",
  "Your commitment to your health is inspiring.",
  "Remember to be gentle with yourself today.",
  "Progress isn't always linear, and that's okay.",
  "You're stronger than you know.",
  "Taking care of yourself is an act of courage.",
  "Your journey matters. You matter.",
  "Rest when you need to. You're still moving forward.",
];

export function EncouragementSystem() {
  const { profile } = useUser();

  useEffect(() => {
    if (!profile) return;

    // Show a gentle encouragement message every 15 minutes
    const showEncouragement = () => {
      const randomMessage = ENCOURAGEMENT_MESSAGES[Math.floor(Math.random() * ENCOURAGEMENT_MESSAGES.length)];
      toast.message(`💙 ${profile.avatar.name || 'Your Future Self'}`, {
        description: randomMessage,
        duration: 5000,
      });
    };

    // Show first message after 5 minutes
    const initialTimer = setTimeout(showEncouragement, 5 * 60 * 1000);

    // Then show every 15 minutes
    const interval = setInterval(showEncouragement, 15 * 60 * 1000);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
    };
  }, [profile]);

  return null;
}