export interface AvatarConfig {
  appearance: 'youthful' | 'mature' | 'gentle' | 'energetic';
  expression: 'warm' | 'hopeful' | 'peaceful' | 'joyful';
  tone: 'encouraging' | 'gentle' | 'inspiring' | 'celebratory';
  name?: string;
}

export interface UserProfile {
  hasCompletedOnboarding: boolean;
  avatar: AvatarConfig;
  startDate: string;
}

export interface Task {
  task_type: string;
  id: string;
  title: string;
  description: string;
  type: 'daily' | 'challenge';
  completed: boolean;
  date?: string;
  priority?: 'high' | 'medium' | 'low';
}

export const AVATAR_OPTIONS = {
  appearance: [
    { value: 'youthful', label: 'Youthful', description: 'Vibrant and energetic presence' },
    { value: 'mature', label: 'Mature', description: 'Wise and grounded presence' },
    { value: 'gentle', label: 'Gentle', description: 'Soft and nurturing presence' },
    { value: 'energetic', label: 'Energetic', description: 'Dynamic and enthusiastic presence' },
  ],
  expression: [
    { value: 'warm', label: 'Warm', description: 'Comforting and understanding' },
    { value: 'hopeful', label: 'Hopeful', description: 'Optimistic and forward-looking' },
    { value: 'peaceful', label: 'Peaceful', description: 'Calm and serene' },
    { value: 'joyful', label: 'Joyful', description: 'Bright and uplifting' },
  ],
  tone: [
    { value: 'encouraging', label: 'Encouraging', description: 'Supportive and motivating' },
    { value: 'gentle', label: 'Gentle', description: 'Soft and patient' },
    { value: 'inspiring', label: 'Inspiring', description: 'Uplifting and empowering' },
    { value: 'celebratory', label: 'Celebratory', description: 'Enthusiastic and affirming' },
  ],
};

export const AVATAR_MESSAGES = {
  taskComplete: {
    encouraging: [
      "Thank you for being consistent!",
      "You're making real progress — I'm so proud!",
      "Every step counts, and you're taking them beautifully.",
      "Your dedication is building a healthier future for us.",
    ],
    gentle: [
      "Thank you for taking care of us today.",
      "You showed up, and that's what matters.",
      "Gentle progress is still progress. Well done.",
      "I see your effort, and it means everything.",
    ],
    inspiring: [
      "Because you completed this, I am healthier and thriving!",
      "You're making a real difference for your recovery — well done!",
      "Look at what we're accomplishing together!",
      "Your persistence is creating lasting change.",
    ],
    celebratory: [
      "Yes! Another step forward — amazing!",
      "You did it! This is fantastic progress!",
      "Incredible! You're building something beautiful!",
      "Wonderful work! Keep this momentum going!",
    ],
  },
  constellationGrowth: [
    "Look at your constellation! Each star shows the effort you've put in — you're doing amazing.",
    "Your constellation is growing more beautiful with each step you take.",
    "Every star represents a moment of courage. Look how many you've collected!",
    "This constellation is the map of your resilience journey. It's breathtaking.",
  ],
  dailyGreeting: {
    encouraging: [
      "Ready to take on today together?",
      "I believe in you. Let's make today count.",
      "Another day, another opportunity to grow stronger.",
    ],
    gentle: [
      "Take your time today. I'm here with you.",
      "Let's move at your pace. No pressure.",
      "However today goes, you're doing your best.",
    ],
    inspiring: [
      "Today is a chance to become even stronger!",
      "Let's create something meaningful today!",
      "Your future self is cheering you on!",
    ],
    celebratory: [
      "Good morning! Let's make today wonderful!",
      "Another day to shine! You've got this!",
      "Let's celebrate every moment today!",
    ],
  },
};
