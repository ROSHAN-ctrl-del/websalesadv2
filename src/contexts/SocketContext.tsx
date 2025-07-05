import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success' | 'task_assigned' | 'task_updated';
  timestamp: Date;
  read: boolean;
  data?: any;
}

interface SocketContextType {
  socket: Socket | null;
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;
  isConnected: boolean;
}

// Create context with a default value
const SocketContext = createContext<SocketContextType>({
  socket: null,
  notifications: [],
  unreadCount: 0,
  markAsRead: () => {},
  markAllAsRead: () => {},
  deleteNotification: () => {},
  isConnected: false,
});

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, token } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);

  // Load notifications from API
  const loadNotifications = async () => {
    if (!token) return;
    
    try {
      const response = await fetch('/api/notifications', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  useEffect(() => {
    if (user && token) {
      // Load initial notifications
      loadNotifications();

      // Connect to socket
      const newSocket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000', {
        auth: {
          token,
        },
        transports: ['websocket', 'polling']
      });

      newSocket.on('connect', () => {
        console.log('Connected to socket server');
        setIsConnected(true);
        
        // Join user-specific room
        newSocket.emit('join_room', `user_${user.id}`);
      });

      newSocket.on('disconnect', () => {
        console.log('Disconnected from socket server');
        setIsConnected(false);
      });

      newSocket.on('notification', (notification: Notification) => {
        setNotifications(prev => [notification, ...prev]);
        setUnreadCount(prev => prev + 1);
        
        // Show toast notification
        switch (notification.type) {
          case 'success':
            toast.success(notification.message);
            break;
          case 'error':
            toast.error(notification.message);
            break;
          case 'warning':
            toast(notification.message, { icon: '⚠️' });
            break;
          case 'task_assigned':
            toast.success(notification.message, { icon: '📋' });
            break;
          case 'task_updated':
            toast(notification.message, { icon: '🔄' });
            break;
          default:
            toast(notification.message);
        }
      });

      newSocket.on('task_assigned', (data) => {
        console.log('New task assigned:', data);
        // You can add additional handling here
      });

      newSocket.on('task_update', (data) => {
        console.log('Task updated:', data);
        // You can add additional handling here
      });

      newSocket.on('connect_error', (err) => {
        console.error('Socket connection error:', err);
        setIsConnected(false);
      });

      setSocket(newSocket);

      return () => {
        newSocket.off('connect');
        newSocket.off('disconnect');
        newSocket.off('notification');
        newSocket.off('task_assigned');
        newSocket.off('task_update');
        newSocket.off('connect_error');
        newSocket.close();
      };
    }
  }, [user, token]);

  const markAsRead = async (id: string) => {
    if (!token) return;

    try {
      const response = await fetch(`/api/notifications/${id}/read`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setNotifications(prev =>
          prev.map(notification =>
            notification.id === id ? { ...notification, read: true } : notification
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    if (!token) return;

    try {
      const response = await fetch('/api/notifications/mark-all-read', {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setNotifications(prev =>
          prev.map(notification => ({ ...notification, read: true }))
        );
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const deleteNotification = async (id: string) => {
    if (!token) return;

    try {
      const response = await fetch(`/api/notifications/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setNotifications(prev => prev.filter(notification => notification.id !== id));
        setUnreadCount(prev => {
          const notification = notifications.find(n => n.id === id);
          return notification && !notification.read ? Math.max(0, prev - 1) : prev;
        });
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const value = {
    socket,
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    isConnected,
  };

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
};

export const useSocket = (): SocketContextType => {
  const context = useContext(SocketContext);
  return context;
};