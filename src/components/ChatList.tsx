'use client';

import { Conversation, User } from '../lib/types';
import RoleBadge from './RoleBadge';

function getLastMessagePreview(conv: Conversation): string {
  if (!conv.lastMessage) return 'No messages yet';
  const sender = conv.lastMessage.sender?.username || 'Someone';
  const content = conv.lastMessage.content;
  if (conv.lastMessage.fileType === 'image') return `${sender}: Photo`;
  if (conv.lastMessage.fileType === 'document') return `${sender}: Document`;
  return content;
}

function formatRelative(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Now';
  if (diffMins < 60) return `${diffMins}m`;
  if (diffHours < 24) return `${diffHours}h`;
  if (diffDays < 7) return `${diffDays}d`;
  return date.toLocaleDateString();
}

interface ChatListProps {
  conversations: Conversation[];
  currentUser: User;
  onlineUsers: Set<string>;
  activeId: string | null;
  onSelect: (id: string) => void;
  searchQuery: string;
}

export default function ChatList({
  conversations,
  currentUser,
  onlineUsers,
  activeId,
  onSelect,
  searchQuery,
}: ChatListProps) {
  const filtered = conversations.filter((conv) => {
    const other = conv.participants.find((p) => p._id !== currentUser._id);
    if (!other) return false;
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      other.username.toLowerCase().includes(q) ||
      other.role.toLowerCase().includes(q)
    );
  });

  if (filtered.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20 text-text-muted">
        <svg className="h-12 w-12 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
        <p className="text-sm">
          {searchQuery ? 'No conversations match your search' : 'No conversations yet'}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {filtered.map((conv) => {
        const other = conv.participants.find((p) => p._id !== currentUser._id);
        if (!other) return null;
        const isActive = conv._id === activeId;
        const isOnline = onlineUsers.has(other._id);
        const unread = conv.unreadCount[currentUser._id] || 0;

        return (
          <button
            key={conv._id}
            onClick={() => onSelect(conv._id)}
            className={`flex items-center gap-4 px-5 py-4 text-left transition-colors ${
              isActive
                ? 'bg-bg-accent/10 border-r-2 border-bg-accent'
                : 'hover:bg-bg-secondary/50'
            }`}
          >
            <div className="relative flex-shrink-0">
              <img
                src={other.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${other.username}`}
                alt={other.username}
                className="h-14 w-14 rounded-full object-cover"
              />
              {isOnline && (
                <span className="absolute bottom-0 right-0 block h-3.5 w-3.5 rounded-full border-2 border-bg-primary bg-online" />
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <span className="truncate font-medium text-text-primary">
                  {other.username}
                </span>
                <span className="flex-shrink-0 text-text-muted text-xs">
                  {formatRelative(conv.updatedAt)}
                </span>
              </div>
              <div className="mt-1.5 flex items-center justify-between gap-2">
                <p className="truncate text-text-secondary text-sm">
                  {getLastMessagePreview(conv)}
                </p>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <RoleBadge role={other.role} />
                  {unread > 0 && (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-bg-accent text-text-on-accent text-[10px] font-bold">
                      {unread}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
