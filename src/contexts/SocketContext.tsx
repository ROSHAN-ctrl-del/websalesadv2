import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  timestamp: Date;
  read: boolean;
}

interface SocketContextType {
  socket: Socket | null;
  notifications: Notification[];
  markAsRead: (id: string) => void;
}

// Create context with a default value
const SocketContext = createContext<SocketContextType>({
  socket: null,
  notifications: [],
  markAsRead: () => {},
});

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, token } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    if (user && token) {
      // Only connect to socket in production or when explicitly enabled in development
      if (import.meta.env.PROD || import.meta.env.VITE_ENABLE_SOCKET === 'true') {
        const newSocket = io(import.meta.env.VITE_API_URL || 'http://localhost:3002', {
        auth: {
          token,
        },
      });

      newSocket.on('connect', () => {
        console.log('Connected to server');
      });

      newSocket.on('notification', (notification: Notification) => {
        setNotifications(prev => [notification, ...prev]);
        
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
          default:
            toast(notification.message);
        }
        });

        newSocket.on('connect', () => {
          console.log('Connected to socket server');
        });

        newSocket.on('connect_error', (err) => {
          console.error('Socket connection error:', err);
        });

        setSocket(newSocket);

        return () => {
          newSocket.off('connect');
          newSocket.off('connect_error');
          newSocket.close();
        };
      }
    }
  }, [user, token]);

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  const value = {
    socket,
    notifications,
    markAsRead,
  };

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
};

export const useSocket = (): SocketContextType => {
  const context = useContext(SocketContext);
  return context;
};