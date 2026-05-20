'use client';

import { useState, useRef, useEffect } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { Conversation, Message } from '../lib/types';
import * as api from '../lib/api';
import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';
import { Send, Phone, Video, MoreVertical, Image as ImageIcon, Paperclip, Trash2 } from 'lucide-react';
import RoleBadge from './RoleBadge';
import ProductContextCard from './ProductContextCard';

interface ChatPanelProps {
  conversation: Conversation;
  messages: Message[];
  onMessagesChange: Dispatch<SetStateAction<Message[]>>;
  onConversationActivity: (conversationId: string, message: Message) => void;
  onConversationRead: (conversationId: string, readerId: string) => void;
  onDeleteConversation: (conversationId: string) => Promise<void>;
  isDeletingConversation?: boolean;
}

export default function ChatPanel({
  conversation,
  messages,
  onMessagesChange,
  onConversationActivity,
  onConversationRead,
  onDeleteConversation,
  isDeletingConversation = false,
}: ChatPanelProps) {
  const { user, token } = useAuth();
  const { socket, onlineUsers, typingUsers } = useSocket();
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [showActionsMenu, setShowActionsMenu] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const actionsMenuRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const otherParticipant = conversation.participants.find(
    (p) => p._id !== user?._id
  );

  const isOnline = otherParticipant ? onlineUsers.has(otherParticipant._id) : false;
  const isTyping = typingUsers.has(conversation._id);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  useEffect(() => {
    if (!showActionsMenu) return;

    const handleOutsideClick = (event: MouseEvent) => {
      if (actionsMenuRef.current && !actionsMenuRef.current.contains(event.target as Node)) {
        setShowActionsMenu(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [showActionsMenu]);

  useEffect(() => {
    if (!socket || !user || !otherParticipant) return;

    if ((conversation.unreadCount?.[user._id] || 0) > 0) {
      api.markAsRead(token!, conversation._id)
        .then(() => onConversationRead(conversation._id, user._id))
        .catch((err) => {
          console.error('Failed to mark messages as read:', err);
        });
    }

    const handleNewMessage = (msg: Message) => {
      if (msg.conversationId === conversation._id) {
        onMessagesChange((prev) => (prev.some((item) => item._id === msg._id) ? prev : [...prev, msg]));
        onConversationActivity(conversation._id, msg);
        if (msg.sender._id !== user._id) {
          api.markAsRead(token!, conversation._id)
            .then(() => onConversationRead(conversation._id, user._id))
            .catch((err) => {
              console.error('Failed to mark messages as read:', err);
            });
        }
      }
    };

    const handleMessagesRead = ({ conversationId, readerId }: { conversationId: string; readerId: string }) => {
      if (conversationId !== conversation._id) return;
      if (readerId === user._id) return;

      onMessagesChange((prev) =>
        prev.map((msg) => {
          if (msg.sender._id === user._id && !msg.isRead) {
            return { ...msg, isRead: true };
          }
          return msg;
        })
      );
      onConversationRead(conversationId, readerId);
    };

    socket.on('messageReceived', handleNewMessage);
    socket.on('messagesRead', handleMessagesRead);

    return () => {
      socket.off('messageReceived', handleNewMessage);
      socket.off('messagesRead', handleMessagesRead);
    };
  }, [socket, conversation._id, user, token, otherParticipant, onMessagesChange, onConversationActivity, onConversationRead]);

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);

    if (socket && user) {
      socket.emit('typing', { conversationId: conversation._id, userId: user._id });

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      typingTimeoutRef.current = setTimeout(() => {
        socket.emit('stopTyping', {
          conversationId: conversation._id,
          userId: user._id,
        });
      }, 2000);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user || !token) return;

    const content = newMessage.trim();
    setNewMessage('');
    setIsSending(true);

    if (socket && typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      socket.emit('stopTyping', {
        conversationId: conversation._id,
        userId: user._id,
      });
    }

    try {
      const msg = await api.sendMessage(token, { conversationId: conversation._id, content });
      onMessagesChange((prev) => (prev.some((item) => item._id === msg._id) ? prev : [...prev, msg]));
      onConversationActivity(conversation._id, msg);
    } catch (err) {
      console.error('Failed to send message:', err);
      // Optional: Handle error by reverting UI or showing toast
    } finally {
      setIsSending(false);
    }
  };

  const handleDeleteChat = async () => {
    setShowActionsMenu(false);
    if (!window.confirm('Delete this chat? This cannot be undone.')) {
      return;
    }
    await onDeleteConversation(conversation._id);
  };

  if (!otherParticipant) return null;

  return (
    <div className="flex h-full flex-col bg-white">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 bg-white/95 backdrop-blur supports-backdrop-filter:bg-white/60">
        <div className="flex items-center gap-4">
          <div className="relative shrink-0">
            <img
              src={
                otherParticipant.avatar ||
                `https://api.dicebear.com/7.x/bottts/svg?seed=${otherParticipant.username}`
              }
              alt={otherParticipant.username}
              className="h-10 w-10 rounded-full object-cover border border-slate-100"
            />
            {isOnline && (
              <span className="absolute -bottom-0.5 -right-0.5 block h-3 w-3 rounded-full border-2 border-white bg-green-500" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-semibold text-slate-900">
                {otherParticipant.username}
              </h2>
              {otherParticipant.role !== 'customer' && (
                <RoleBadge role={otherParticipant.role} />
              )}
            </div>
            <p className="text-sm text-slate-500">
              {isOnline ? 'Online' : 'Offline'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button className="flex h-9 w-9 items-center justify-center rounded-md text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-colors">
            <Phone className="h-4.5 w-4.5" />
          </button>
          <button className="flex h-9 w-9 items-center justify-center rounded-md text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-colors">
            <Video className="h-4.5 w-4.5" />
          </button>
          <div className="relative" ref={actionsMenuRef}>
            <button
              type="button"
              onClick={() => setShowActionsMenu((prev) => !prev)}
              className="flex h-9 w-9 items-center justify-center rounded-md text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-colors"
              aria-label="Conversation actions"
              aria-expanded={showActionsMenu}
            >
              <MoreVertical className="h-4.5 w-4.5" />
            </button>

            {showActionsMenu && (
              <div className="absolute right-0 top-11 z-30 w-44 rounded-md border border-gray-200 bg-white p-1.5 shadow-sm">
                <button
                  type="button"
                  onClick={handleDeleteChat}
                  disabled={isDeletingConversation}
                  className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-sm text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Trash2 className="h-4 w-4" />
                  {isDeletingConversation ? 'Deleting...' : 'Delete chat'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-6 pb-2 md:pb-6 space-y-6 bg-slate-50/50">
        <ProductContextCard context={conversation.context} />
        {messages.map((msg, idx) => {
          const showAvatar =
            idx === messages.length - 1 ||
            messages[idx + 1].sender._id !== msg.sender._id;

          return (
            <MessageBubble
              key={msg._id}
              message={msg}
              isOwn={msg.sender._id === user?._id}
              showAvatar={showAvatar}
              senderFallback={
                msg.sender._id === otherParticipant._id
                  ? otherParticipant
                  : undefined
              }
            />
          );
        })}
        {isTyping && <TypingIndicator usernames={typingUsers.get(conversation._id) || []} />}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-white border-t border-gray-100">
        <form
          onSubmit={handleSend}
          className="flex items-end gap-3 rounded-md border border-gray-200 bg-white p-2 shadow-sm focus-within:border-bg-accent focus-within:ring-1 focus-within:ring-bg-accent/20 transition-all"
        >
          <button
            type="button"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-colors"
          >
            <Paperclip className="h-5 w-5" />
          </button>
          <button
            type="button"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-colors"
          >
            <ImageIcon className="h-5 w-5" />
          </button>
          <input
            type="text"
            value={newMessage}
            onChange={handleTyping}
            placeholder="Type your message..."
            className="h-10 flex-1 bg-transparent px-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || isSending}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-bg-accent text-white transition-colors hover:bg-bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
