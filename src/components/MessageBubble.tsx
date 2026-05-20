import { Message } from '../lib/types';
import { formatTime } from '../lib/utils';
import { Check, CheckCheck } from 'lucide-react';
import ProductContextCard from './ProductContextCard';

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  showAvatar?: boolean;
  senderFallback?: { username: string; avatar?: string };
}

export default function MessageBubble({
  message,
  isOwn,
  showAvatar = true,
  senderFallback,
}: MessageBubbleProps) {
  const isRead = message.status === 'read';

  return (
    <div
      className={`flex w-full items-end gap-2 ${
        isOwn ? 'justify-end' : 'justify-start'
      }`}
    >
      {!isOwn && (
        <div className="w-8 flex-shrink-0">
          {showAvatar && senderFallback && (
            <img
              src={
                senderFallback.avatar ||
                `https://api.dicebear.com/7.x/bottts/svg?seed=${senderFallback.username}`
              }
              alt={senderFallback.username}
              className="mb-1 h-8 w-8 rounded-full object-cover border border-slate-100"
            />
          )}
        </div>
      )}

      <div
        className={`flex max-w-[75%] flex-col ${
          isOwn ? 'items-end' : 'items-start'
        }`}
      >
        {!isOwn && showAvatar && senderFallback && (
          <span className="mb-1 ml-1 text-xs font-medium text-slate-500">
            {senderFallback.username}
          </span>
        )}

        <div className="space-y-1">
          {message.metadata?.productContext && (
            <ProductContextCard context={message.metadata.productContext} />
          )}

          {message.type === 'image' && message.attachmentUrl ? (
            <div className={`overflow-hidden rounded-md border text-sm ${isOwn ? 'border-bg-accent bg-bg-accent/5' : 'border-gray-200 bg-white'}`}>
              <img
                src={message.attachmentUrl}
                alt="Attachment"
                className="max-h-64 max-w-full rounded-t-md object-cover"
              />
              {message.content && (
                <div className="p-3">
                  <p className="text-slate-900">{message.content}</p>
                </div>
              )}
            </div>
          ) : (
            <div
              className={`rounded-md px-4 py-2.5 text-sm ${
                isOwn
                  ? 'bg-bg-accent text-white'
                  : 'border border-gray-200 bg-white text-slate-900'
              }`}
            >
              <p className="whitespace-pre-wrap break-words">{message.content}</p>
            </div>
          )}
        </div>

        <div
          className={`mt-1 flex items-center gap-1 ${
            isOwn ? 'justify-end' : 'justify-start'
          }`}
        >
          <span className="text-[11px] text-slate-400">
            {formatTime(message.createdAt)}
          </span>
          {isOwn && (
            <span className="text-slate-400">
              {isRead ? (
                <CheckCheck className="h-[14px] w-[14px] text-blue-500" />
              ) : (
                <Check className="h-[14px] w-[14px]" />
              )}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
