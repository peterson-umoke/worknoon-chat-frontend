'use client';

export default function TypingIndicator({ usernames = [] }: { usernames?: string[] }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex h-10 w-16 items-center justify-center gap-1 rounded-2xl bg-gray-100 px-4 py-2 text-gray-500 rounded-bl-sm">
        <span className="block h-1.5 w-1.5 animate-bounce rounded-full bg-current [animation-delay:-0.3s]"></span>
        <span className="block h-1.5 w-1.5 animate-bounce rounded-full bg-current [animation-delay:-0.15s]"></span>
        <span className="block h-1.5 w-1.5 animate-bounce rounded-full bg-current"></span>
      </div>
      {usernames.length > 0 && (
        <span className="text-xs text-slate-400">
          {usernames.join(', ')} {usernames.length === 1 ? 'is' : 'are'} typing...
        </span>
      )}
    </div>
  );
}
