import { Conversation, User } from '../lib/types';
import { formatTime } from '../lib/utils';
import { Check, CheckCheck } from 'lucide-react';

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
  const filteredConversations = conversations.filter((conv) => {
    const otherParticipant = conv.participants.find((p) => p._id !== currentUser._id);
    if (!otherParticipant) return false;
    return (
      otherParticipant.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      otherParticipant.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  if (filteredConversations.length === 0) {
    return (
      <div className="flex h-40 items-center justify-center">
        <p className="text-sm text-slate-500">No conversations found</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {filteredConversations.map((conv) => {
        const otherParticipant = conv.participants.find((p) => p._id !== currentUser._id);
        if (!otherParticipant) return null;

        const isOnline = onlineUsers.has(otherParticipant._id);
        const isActive = conv._id === activeId;
        const unreadCount = conv.unreadCount?.[currentUser._id] || 0;
        const isFromMe = conv.lastMessage?.sender?._id === currentUser._id;
        const isRead = isFromMe && conv.lastMessage?.isRead;

        return (
          <button
            key={conv._id}
            onClick={() => onSelect(conv._id)}
            className={`group relative flex items-center gap-3 px-5 py-3 transition-colors ${
              isActive ? 'bg-white' : 'hover:bg-white/60'
            }`}
          >
            {/* Active Indicator Bar */}
            {isActive && (
              <span className="absolute inset-y-0 left-0 w-1 bg-bg-accent" />
            )}

            <div className="relative shrink-0">
              <img
                src={
                  otherParticipant.avatar ||
                  `https://api.dicebear.com/7.x/bottts/svg?seed=${otherParticipant.username}`
                }
                alt={otherParticipant.username}
                className="h-10 w-10 rounded-full object-cover border border-slate-100 bg-white"
              />
              {isOnline && (
                <span className="absolute -bottom-0.5 -right-0.5 block h-3 w-3 rounded-full border-2 border-white bg-green-500" />
              )}
            </div>

            <div className="min-w-0 flex-1 text-left">
              <div className="flex items-center justify-between mb-0.5">
                <p className="truncate text-sm font-medium text-slate-900 group-hover:text-bg-accent transition-colors">
                  {otherParticipant.username}
                </p>
                {conv.lastMessage && (
                  <span className="shrink-0 text-xs text-slate-400">
                    {formatTime(conv.lastMessage.createdAt)}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1.5">
                {conv.lastMessage ? (
                  <>
                    {isFromMe && (
                      <span className="shrink-0 text-slate-400">
                        {isRead ? (
                          <CheckCheck className="h-3.5 w-3.5 text-blue-500" />
                        ) : (
                          <Check className="h-3.5 w-3.5" />
                        )}
                      </span>
                    )}
                    <p
                      className={`truncate text-sm ${
                        unreadCount > 0 && !isFromMe
                          ? 'font-medium text-slate-900'
                          : 'text-slate-500'
                      }`}
                    >
                      {conv.lastMessage.content}
                    </p>
                  </>
                ) : (
                  <p className="text-sm italic text-slate-400">No messages yet</p>
                )}
              </div>
            </div>

            {unreadCount > 0 && !isFromMe && (
              <div className="shrink-0">
                <div className="flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-bg-accent px-1.5">
                  <span className="text-[10px] font-bold text-white">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                </div>
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}
