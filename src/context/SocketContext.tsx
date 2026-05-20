'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { Message, Conversation } from '../lib/types';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  onlineUsers: Set<string>;
  typingUsers: Map<string, string[]>;
  sendMessage: (conversationId: string, content: string, fileType?: string) => void;
  joinRoom: (conversationId: string) => void;
  leaveRoom: (conversationId: string) => void;
  startTyping: (conversationId: string) => void;
  stopTyping: (conversationId: string) => void;
}

const SocketContext = createContext<SocketContextType | null>(null);

export function useSocket(): SocketContextType {
  const ctx = useContext(SocketContext);
  if (!ctx) throw new Error('useSocket must be used within SocketProvider');
  return ctx;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const { token, user } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const [typingUsers, setTypingUsers] = useState<Map<string, string[]>>(new Map());
  const typingTimeoutRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

  useEffect(() => {
    if (!token || !user) {
      setSocket(null);
      setIsConnected(false);
      return;
    }

    const newSocket = io(API_BASE, {
      auth: { token },
      transports: ['websocket', 'polling'],
    });

    newSocket.on('connect', () => {
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
    });

    newSocket.on('userPresence', ({ userId, isOnline }: { userId: string; isOnline: boolean }) => {
      setOnlineUsers((prev) => {
        const next = new Set(prev);
        if (isOnline) {
          next.add(userId);
        } else {
          next.delete(userId);
        }
        return next;
      });
    });

    newSocket.on('messageReceived', (_message: Message) => {
      // Messages are handled at the component level via additional listeners
    });

    newSocket.on('conversationUpdated', (_data: { conversationId: string; lastMessage: Message }) => {
      // Conversation updates handled at component level
    });

    newSocket.on('typingIndicator', ({ conversationId, username }: { conversationId: string; username: string }) => {
      setTypingUsers((prev) => {
        const next = new Map(prev);
        const list = next.get(conversationId) || [];
        if (!list.includes(username)) {
          next.set(conversationId, [...list, username]);
        }
        return next;
      });
    });

    newSocket.on('stopTypingIndicator', ({ conversationId, userId }: { conversationId: string; userId: string }) => {
      setTypingUsers((prev) => {
        const next = new Map(prev);
        const list = next.get(conversationId) || [];
        const filtered = list.filter((_, i) => i !== list.indexOf(userId));
        if (filtered.length === 0) {
          next.delete(conversationId);
        } else {
          next.set(conversationId, filtered);
        }
        return next;
      });
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [token, user]);

  const sendMessage = useCallback((conversationId: string, content: string, fileType?: string) => {
    socket?.emit('sendMessage', { conversationId, content, fileType: fileType || 'text' });
  }, [socket]);

  const joinRoom = useCallback((conversationId: string) => {
    socket?.emit('joinRoom', conversationId);
  }, [socket]);

  const leaveRoom = useCallback((conversationId: string) => {
    socket?.emit('leaveRoom', conversationId);
  }, [socket]);

  const startTyping = useCallback((conversationId: string) => {
    socket?.emit('typing', { conversationId });
  }, [socket]);

  const stopTyping = useCallback((conversationId: string) => {
    socket?.emit('stopTyping', { conversationId });
  }, [socket]);

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected,
        onlineUsers,
        typingUsers,
        sendMessage,
        joinRoom,
        leaveRoom,
        startTyping,
        stopTyping,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
}
