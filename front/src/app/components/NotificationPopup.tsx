// src/components/NotificationPopup.tsx

import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { apiService } from '../../services/api';

interface Notification {
  id: number;
  title: string;
  message: string;
  notification_type: 'reminder' | 'breathing' | 'challenge' | 'achievement';
  icon: string;
  scheduled_time: string;
}

export const NotificationPopup: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // RÃ©cupÃ©rer les notifications en attente
  const fetchPendingNotifications = async () => {
    try {
      const response = await apiService.getPendingNotifications();
      setNotifications(response.data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  // Supprimer une notification
  const dismissNotification = async (id: number) => {
    try {
      await apiService.dismissNotification(id);
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (error) {
      console.error('Error dismissing notification:', error);
    }
  };

  // VÃ©rifier les nouvelles notifications toutes les 30 secondes
  useEffect(() => {
    fetchPendingNotifications();
    const interval = setInterval(fetchPendingNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-3">
      {notifications.map((notif, index) => (
        <div
          key={notif.id}
          className="bg-white rounded-lg shadow-2xl p-4 w-80 animate-slide-in-right"
          style={{
            animationDelay: `${index * 100}ms`,
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              {notif.notification_type === 'breathing' && (
                <span className="text-sm">ðŸŒ¿</span>
              )}
              {notif.title}
            </h3>
            <button
              onClick={() => dismissNotification(notif.id)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="flex items-start gap-3">
            {/* Icon */}
            <div className="flex-shrink-0 text-3xl">
              {notif.icon}
            </div>

            {/* Message */}
            <p className="text-sm text-gray-600 leading-relaxed">
              {notif.message}
            </p>
          </div>
        </div>
      ))}

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

        .animate-slide-in-right {
          animation: slide-in-right 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};