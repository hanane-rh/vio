// src/components/NotificationPanel.tsx

import React, { useEffect, useState } from 'react';
import { X, Bell, Trash2 } from 'lucide-react';
import { apiService } from '../../services/api';

interface Notification {
  id: number;
  title: string;
  message: string;
  notification_type: 'reminder' | 'breathing' | 'challenge' | 'achievement';
  icon: string;
  scheduled_time: string;
  created_at: string;
  shown_at: string | null;
}

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationPanel: React.FC<NotificationPanelProps> = ({ isOpen, onClose }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);

  // Charger toutes les notifications du jour
  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const response = await apiService.getTodayNotifications();
      setNotifications(response.data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  // Supprimer une notification
  const handleDelete = async (id: number) => {
    try {
      await apiService.dismissNotification(id);
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  // Supprimer toutes les notifications
  const handleDeleteAll = async () => {
    try {
      await apiService.dismissAllNotifications();
      setNotifications([]);
    } catch (error) {
      console.error('Error deleting all notifications:', error);
    }
  };

  // Charger les notifications quand le panel s'ouvre
  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/20 z-40"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed top-0 right-0 h-full w-full sm:w-96 bg-white shadow-2xl z-50 flex flex-col animate-slide-in-right">
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-400 to-emerald-400 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            <h2 className="text-lg font-semibold">Notifications</h2>
            <span className="bg-white/30 text-xs px-2 py-1 rounded-full">
              {notifications.length}
            </span>
          </div>
          <button 
            onClick={onClose}
            className="hover:bg-white/20 rounded-lg p-1 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Actions */}
        {notifications.length > 0 && (
          <div className="p-3 border-b border-gray-200">
            <button
              onClick={handleDeleteAll}
              className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1 transition-colors"
            >
              <Trash2 className="w-3 h-3" />
              Supprimer tout
            </button>
          </div>
        )}

        {/* Notification List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-gray-400">Chargement...</div>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 px-4">
              <Bell className="w-16 h-16 mb-4 text-gray-300" />
              <p className="text-center">Aucune notification pour le moment</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {notifications.map((notif) => (
                <div 
                  key={notif.id}
                  className="p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    {/* Icon */}
                    <div className="flex-shrink-0 text-3xl">
                      {notif.icon}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h3 className="font-semibold text-sm text-gray-900">
                          {notif.notification_type === 'breathing' && 'ðŸŒ¿ '}
                          {notif.title}
                        </h3>
                        <button
                          onClick={() => handleDelete(notif.id)}
                          className="text-gray-400 hover:text-red-500 transition-colors flex-shrink-0"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      <p className="text-xs text-gray-600 leading-relaxed mb-2">
                        {notif.message}
                      </p>

                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <span>{notif.scheduled_time}</span>
                        {notif.shown_at && (
                          <>
                            <span>â€¢</span>
                            <span>Vue</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes slide-in-right {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }

        .animate-slide-in-right {
          animation: slide-in-right 0.3s ease-out forwards;
        }
      `}</style>
    </>
  );
};