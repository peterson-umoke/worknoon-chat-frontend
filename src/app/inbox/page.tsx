'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import ChatList from '../../components/ChatList';
import ChatPanel from '../../components/ChatPanel';
import Sidebar from '../../components/Sidebar';
import { Conversation, Message } from '../../lib/types';
import * as api from '../../lib/api';
import { Search, Menu, X, MessageSquare, Edit } from 'lucide-react';

export default function InboxPage() {
  const { user, token, isLoading } = useAuth();
  const { socket, onlineUsers } = useSocket();
  const router = useRouter();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
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

  if (isLoading || !user) {
    return (
      <div className="flex h-screen items-center justify-center bg-white">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-100 border-t-bg-accent" />
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-white">
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Main Container */}
      <div className="flex w-full h-full">
        <Sidebar />

        {/* Chat List Column */}
        <aside
          className={`fixed inset-y-0 left-0 z-50 flex w-85 flex-col border-r border-gray-100 bg-white transition-transform lg:relative lg:z-20 lg:translate-x-0 ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
            } lg:w-85`}
        >
          <div className="flex items-center justify-between px-6 pt-7 pb-5">
            <div className="flex items-center gap-3">
              <h1 className="text-[22px] font-semibold text-slate-900 tracking-tight">Messages</h1>
              <span className="flex h-5 items-center rounded-full bg-slate-100 px-2 text-xs font-semibold text-slate-600">
                12
              </span>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setMobileSidebarOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 lg:hidden"
              >
                <X className="h-5 w-5" />
              </button>
              <button
                onClick={() => router.push('/profile')}
                className="flex h-9 w-9 items-center justify-center rounded-full text-slate-600 hover:bg-slate-100 transition-colors bg-slate-50 border border-slate-200"
                title="New Chat"
              >
                <Edit className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="px-6 pb-4">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search messages"
                className="w-full rounded-lg border-none bg-slate-100/80 py-2.5 pl-10 pr-4 text-[15px] font-medium text-slate-900 placeholder:font-normal placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-bg-accent/20"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-3">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-200 border-t-bg-accent" />
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
        </aside>

        {/* Chat Panel Column */}
        <main className="flex min-w-0 flex-1 flex-col bg-white">
          {activeConversation ? (
            <ChatPanel
              conversation={activeConversation}
              messages={messages}
              onMessagesChange={setMessages}
            />
          ) : (
            <div className="flex flex-1 items-center justify-center bg-white border-l border-gray-100">
              <div className="flex flex-col items-center gap-4 text-slate-400 max-w-sm text-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-slate-50 border border-slate-100 mb-2">
                  <MessageSquare className="h-7 w-7 text-slate-300" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 tracking-tight">Your messages</h3>
                  <p className="text-[15px] text-slate-500 mt-1">Select a conversation from the left to start sending messages.</p>
                </div>
                <div className="flex gap-3 mt-4">
                  <button
                    onClick={() => setMobileSidebarOpen(true)}
                    className="flex h-10 items-center gap-2 rounded-lg bg-bg-accent px-5 text-white text-[15px] font-medium transition-colors hover:bg-bg-accent-hover lg:hidden"
                  >
                    <Menu className="h-4.5 w-4.5" />
                    Open Inbox
                  </button>
                  <button
                    onClick={() => router.push('/profile')}
                    className="flex h-10 items-center gap-2 rounded-lg border border-gray-200 bg-white px-5 text-[15px] font-medium text-slate-700 transition-colors hover:bg-slate-50 hover:text-slate-900 shadow-sm"
                  >
                    <Edit className="h-4.5 w-4.5" />
                    New Message
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
