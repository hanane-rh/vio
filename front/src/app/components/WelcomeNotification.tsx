// src/components/WelcomeNotification.tsx

import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { apiService } from '../../services/api';

export const WelcomeNotification: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [notificationId, setNotificationId] = useState<number | null>(null);

  useEffect(() => {
    // Check if welcome notification was already shown today
    const lastShown = localStorage.getItem('vio-welcome-notification-shown');
    const today = new Date().toDateString();

    // If not shown today, show it after 2 minutes
    if (lastShown !== today) {
      const timer = setTimeout(async () => {
        // Create notification in backend
        try {
          const response = await apiService.createWelcomeNotification();
          setNotificationId(response.data.id);
          setIsVisible(true);
          localStorage.setItem('vio-welcome-notification-shown', today);
        } catch (error) {
          console.error('Error creating welcome notification:', error);
        }
      }, 30 * 1000); // 2 minutes = 120,000ms

      return () => clearTimeout(timer);
    }
  }, []);

  const handleDismiss = async () => {
    setIsVisible(false);
    // Dismiss notification in backend
    if (notificationId) {
      try {
        await apiService.dismissNotification(notificationId);
      } catch (error) {
        console.error('Error dismissing notification:', error);
      }
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed top-4 right-4 z-[60] animate-slide-in-right">
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-96 border-2 border-teal-400">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-lg text-gray-900">
            Reminder!
          </h3>
          <button
            onClick={handleDismiss}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <div className="flex-shrink-0 text-5xl">
            ðŸ‘¤
          </div>

          {/* Message */}
          <div className="flex-1">
            <p className="text-sm text-gray-600 leading-relaxed">
              "Hey, don't forget to check your routines before midnight, continue on your progress you can do it"
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4 h-1 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-teal-400 to-emerald-400 animate-progress"
            style={{ animationDuration: '5s' }}
          />
        </div>
      </div>

      <style>{`
        @keyframes slide-in-right {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        @keyframes progress {
          from {
            width: 0%;
          }
          to {
            width: 100%;
          }
        }

        .animate-slide-in-right {
          animation: slide-in-right 0.4s ease-out forwards;
        }

        .animate-progress {
          animation: progress 5s linear forwards;
        }
      `}</style>
    </div>
  );
};