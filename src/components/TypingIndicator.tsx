'use client';

export default function TypingIndicator({ usernames }: { usernames: string[] }) {
  if (usernames.length === 0) return null;

  const text = usernames.length === 1
    ? `${usernames[0]} is typing`
    : `${usernames.length} people are typing`;

  return (
    <div className="flex items-center gap-1.5 px-4 py-2 text-text-muted text-xs">
      <span className="typing-dot" />
      <span className="typing-dot" />
      <span className="typing-dot" />
      <span className="ml-1 animate-pulse-slow">{text}</span>
    </div>
  );
}
