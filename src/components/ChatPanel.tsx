'use client';

import { useState, useRef, useEffect, useCallback, FormEvent } from 'react';
import { Conversation, User, Message } from '../lib/types';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import MessageBubble from './MessageBubble';
import ProductContextCard from './ProductContextCard';
import TypingIndicator from './TypingIndicator';
import { Send, Paperclip, Loader2 } from 'lucide-react';
import * as api from '../lib/api';

interface ChatPanelProps {
  conversation: Conversation;
  messages: Message[];
  onMessagesChange: (msgs: Message[]) => void;
}

export default function ChatPanel({ conversation, messages, onMessagesChange }: ChatPanelProps) {
  const { user, token } = useAuth();
  const { socket, sendMessage, joinRoom, leaveRoom, startTyping, stopTyping, typingUsers, isConnected } = useSocket();
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimerRef = useRef<NodeJS.Timeout | null>(null);

  const otherParticipants = conversation.participants.filter((p) => p._id !== user?._id);
  const currentTyping = typingUsers.get(conversation._id) || [];

  useEffect(() => {
    joinRoom(conversation._id);
    return () => leaveRoom(conversation._id);
  }, [conversation._id, joinRoom, leaveRoom]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadMessages = useCallback(async () => {
    if (!token) return;
    try {
      const msgs = await api.getMessages(token, conversation._id);
      onMessagesChange(msgs);
      await api.markAsRead(token, conversation._id);
    } catch (err) {
      console.error('Failed to load messages:', err);
    }
  }, [token, conversation._id, onMessagesChange]);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  useEffect(() => {
    if (!socket || !token) return;

    const handleMessage = (msg: Message) => {
      if (msg.conversationId === conversation._id) {
        onMessagesChange([...messages, msg]);
      }
    };

    socket.on('messageReceived', handleMessage);
    return () => {
      socket.off('messageReceived', handleMessage);
    };
  }, [socket, token, conversation._id, onMessagesChange]);

  const handleSend = async (e?: FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || !token || isSending) return;

    setIsSending(true);
    const content = input.trim();
    setInput('');

    try {
      await api.sendMessage(token, { conversationId: conversation._id, content });
      stopTyping(conversation._id);
    } catch (err) {
      console.error('Failed to send message:', err);
    } finally {
      setIsSending(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !token) return;

    setUploadingFile(true);
    try {
      const result = await api.uploadFile(token, file);
      await api.sendMessage(token, {
        conversationId: conversation._id,
        content: result.url,
        fileType: result.fileType,
      });
    } catch (err) {
      console.error('Failed to upload file:', err);
    } finally {
      setUploadingFile(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);

    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    startTyping(conversation._id);

    typingTimerRef.current = setTimeout(() => {
      stopTyping(conversation._id);
    }, 2000);
  };

  return (
    <div className="flex h-full flex-col bg-bg-primary">
      <div className="flex items-center gap-4 border-b border-border px-6 py-4">
        {otherParticipants.map((p) => (
          <div key={p._id} className="flex items-center gap-3 flex-1 min-w-0">
            <div className="relative flex-shrink-0">
              <img
                src={p.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${p.username}`}
                alt={p.username}
                className="h-11 w-11 rounded-full object-cover"
              />
              {isConnected && (
                <span className="absolute bottom-0 right-0 block h-3 w-3 rounded-full border-2 border-bg-primary bg-online" />
              )}
            </div>
            <div className="min-w-0">
              <p className="truncate font-medium text-text-primary">{p.username}</p>
              <p className="text-text-muted text-sm">
                {isConnected ? 'Online' : 'Offline'}
              </p>
            </div>
          </div>
        ))}
        <ProductContextCard context={conversation.context} />
      </div>

      <div className="chat-scroll-container flex-1 overflow-y-auto px-6 py-5">
        <div className="flex flex-col gap-4">
          {messages.map((msg) => (
            <MessageBubble key={msg._id} message={msg} isOwn={msg.sender._id === user?._id} />
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <TypingIndicator usernames={currentTyping} />

      <form onSubmit={handleSend} className="flex items-center gap-3 border-t border-border px-6 py-4">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/gif,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
          onChange={handleFileUpload}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploadingFile}
          className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl text-text-muted transition-colors hover:bg-bg-secondary hover:text-text-primary disabled:opacity-50"
        >
          {uploadingFile ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Paperclip className="h-5 w-5" />
          )}
        </button>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={handleInputChange}
          placeholder="Type a message..."
          className="flex-1 h-11 rounded-xl border border-border bg-bg-secondary px-4 text-text-primary text-sm placeholder:text-text-muted focus:border-bg-accent focus:outline-none focus:ring-2 focus:ring-bg-accent/20"
        />
        <button
          type="submit"
          disabled={!input.trim() || isSending}
          className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-bg-accent text-text-on-accent transition-colors hover:bg-bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSending ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Send className="h-5 w-5" />
          )}
        </button>
      </form>
    </div>
  );
}
