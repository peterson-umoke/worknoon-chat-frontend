'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import ChatList from '../../components/ChatList';
import ChatPanel from '../../components/ChatPanel';
import { Conversation, Message, User } from '../../lib/types';
import * as api from '../../lib/api';
import { Search, LogOut, MessageCircle, Menu, X, Users } from 'lucide-react';

export default function InboxPage() {
  const { user, token, logout, isLoading } = useAuth();
  const { socket, onlineUsers } = useSocket();
  const router = useRouter();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadConversations = useCallback(async () => {
    if (!token) return;
    try {
      const convs = await api.getConversations(token);
      setConversations(convs);
    } catch (err) {
      console.error('Failed to load conversations:', err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/login');
      return;
    }
    if (token && !isLoading) {
      loadConversations();
    }
  }, [token, user, isLoading, loadConversations, router]);

  useEffect(() => {
    if (!socket) return;

    const handleConversationUpdated = ({ conversationId }: { conversationId: string }) => {
      loadConversations();
      if (activeConversation?._id === conversationId) {
        api.getMessages(token!, conversationId).then(setMessages);
      }
    };

    socket.on('conversationUpdated', handleConversationUpdated);
    return () => {
      socket.off('conversationUpdated', handleConversationUpdated);
    };
  }, [socket, token, activeConversation, loadConversations]);

  const handleSelectConversation = async (id: string) => {
    const conv = conversations.find((c) => c._id === id);
    if (!conv) return;
    setActiveConversation(conv);
    setMobileSidebarOpen(false);
  };

  const handleLogout = () => {
    logout();
    router.replace('/login');
  };

  if (isLoading || !user) {
    return (
      <div className="flex h-screen items-center justify-center bg-bg-primary">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-border border-t-bg-accent" />
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-bg-primary">
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-80 flex-col border-r border-border bg-bg-secondary transition-transform lg:relative lg:translate-x-0 ${
          mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } ${sidebarOpen ? 'lg:w-80' : 'lg:w-0 lg:overflow-hidden lg:border-0'}`}
      >
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-bg-accent">
              <MessageCircle className="h-5 w-5 text-text-on-accent" />
            </div>
            <span className="font-semibold text-text-primary">Inbox</span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setMobileSidebarOpen(false)}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-text-muted hover:bg-bg-primary lg:hidden"
            >
              <X className="h-4 w-4" />
            </button>
            <button
              onClick={handleLogout}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-text-muted hover:bg-bg-primary hover:text-danger"
              title="Logout"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="px-4 py-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search conversations..."
              className="w-full rounded-xl border border-border bg-bg-primary py-2.5 pl-10 pr-4 text-sm text-text-primary placeholder:text-text-muted focus:border-bg-accent focus:outline-none focus:ring-2 focus:ring-bg-accent/20"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="h-6 w-6 animate-spin rounded-full border-3 border-border border-t-bg-accent" />
            </div>
          ) : (
            <ChatList
              conversations={conversations}
              currentUser={user}
              onlineUsers={onlineUsers}
              activeId={activeConversation?._id || null}
              onSelect={handleSelectConversation}
              searchQuery={searchQuery}
            />
          )}
        </div>

        <div className="flex items-center gap-3 border-t border-border px-4 py-3">
          <img
            src={user.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.username}`}
            alt={user.username}
            className="h-9 w-9 rounded-full object-cover"
          />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-text-primary">{user.username}</p>
            <p className="text-text-muted text-xs">{user.role}</p>
          </div>
        </div>
      </aside>

      <main className="flex min-w-0 flex-1 flex-col">
        {activeConversation ? (
          <ChatPanel
            conversation={activeConversation}
            messages={messages}
            onMessagesChange={setMessages}
          />
        ) : (
          <div className="flex flex-1 items-center justify-center">
            <div className="flex flex-col items-center gap-4 text-text-muted">
              <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-bg-secondary">
                <Users className="h-10 w-10 opacity-40" />
              </div>
              <div className="text-center">
                <p className="font-medium text-text-primary">Select a conversation</p>
                <p className="text-sm">Choose from your conversations on the left</p>
              </div>
              <button
                onClick={() => setMobileSidebarOpen(true)}
                className="mt-2 flex h-10 items-center gap-2 rounded-xl bg-bg-accent px-5 text-text-on-accent text-sm font-medium transition-colors hover:bg-bg-accent-hover lg:hidden"
              >
                <Menu className="h-4 w-4" />
                Open Inbox
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
