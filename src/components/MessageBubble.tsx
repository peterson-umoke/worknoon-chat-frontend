'use client';

import { Message, User } from '../lib/types';
import RoleBadge from './RoleBadge';

function formatTime(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function MessageBubble({ message, isOwn }: { message: Message; isOwn: boolean }) {
  return (
    <div className={`flex gap-2.5 ${isOwn ? 'flex-row-reverse' : ''} animate-fade-in`}>
      <img
        src={message.sender.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${message.sender.username}`}
        alt={message.sender.username}
        className="mt-1 h-8 w-8 flex-shrink-0 rounded-full object-cover"
      />
      <div className={`max-w-[70%] ${isOwn ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
        {!isOwn && (
          <div className="flex items-center gap-2 px-1">
            <span className="text-text-secondary text-xs font-medium">{message.sender.username}</span>
            <RoleBadge role={message.sender.role} />
          </div>
        )}
        <div
          className={`rounded-2xl px-4 py-2.5 text-sm ${
            isOwn
              ? 'rounded-br-md bg-bg-accent text-text-on-accent'
              : 'rounded-bl-md border border-border-glass bg-bg-glass text-text-primary'
          }`}
        >
          {message.fileType === 'image' ? (
            <img
              src={message.content}
              alt="Shared image"
              className="max-h-64 max-w-full rounded-lg object-cover"
            />
          ) : message.fileType === 'document' ? (
            <a
              href={message.content}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-bg-accent hover:underline"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
              </svg>
              {message.content.split('/').pop()}
            </a>
          ) : (
            <p className="whitespace-pre-wrap break-words">{message.content}</p>
          )}
        </div>
        <span className="px-1 text-text-muted text-[10px]">{formatTime(message.createdAt)}</span>
      </div>
    </div>
  );
}
