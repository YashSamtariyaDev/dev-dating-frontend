'use client';

import { useAppSelector, useAppDispatch } from '@/store';
import { Notification } from '@/types';
import { removeNotification, markNotificationAsRead } from '@/store/slices/uiSlice';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEffect } from 'react';

const notificationIcons = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

const notificationStyles = {
  success: 'bg-green-50 border-green-200 text-green-800',
  error: 'bg-red-50 border-red-200 text-red-800',
  warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
  info: 'bg-blue-50 border-blue-200 text-blue-800',
};

export function Toaster() {
  const notifications = useAppSelector((state) => state.ui.notifications);
  const dispatch = useAppDispatch();

  useEffect(() => {
    const timer = setTimeout(() => {
      notifications.forEach((notification) => {
        if (!notification.read) {
          dispatch(markNotificationAsRead(notification.id));
        }
      });
    }, 100);

    return () => clearTimeout(timer);
  }, [notifications, dispatch]);

  const handleRemove = (id: string) => {
    dispatch(removeNotification(id));
  };

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {notifications.map((notification) => {
        const Icon = notificationIcons[notification.type];
        
        return (
          <div
            key={notification.id}
            className={cn(
              'flex items-center gap-3 p-4 rounded-lg border shadow-lg max-w-sm animate-in slide-in-from-right-full',
              notificationStyles[notification.type]
            )}
          >
            <Icon className="h-5 w-5 flex-shrink-0" />
            
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm">{notification.title}</p>
              <p className="text-sm opacity-90 mt-1">{notification.message}</p>
            </div>
            
            <button
              onClick={() => handleRemove(notification.id)}
              className="flex-shrink-0 p-1 rounded-md hover:bg-black/5 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
