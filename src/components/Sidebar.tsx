'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { LogOut, MessageCircle, MessageSquare, UserCircle2, LayoutDashboard } from 'lucide-react';

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuth();

  if (!user) return null;

  const handleLogout = () => {
    logout();
    router.replace('/login');
  };

  const isActive = (path: string) => pathname?.startsWith(path);

  const getIconClassName = (path: string) => {
    const active = isActive(path);
    return `group relative flex w-full cursor-pointer items-center justify-center py-3 transition-colors ${active
        ? 'text-bg-accent before:absolute before:left-0 before:top-1/2 before:h-6 before:w-[3px] before:-translate-y-1/2 before:rounded-r before:bg-bg-accent'
        : 'text-slate-400 hover:text-slate-600'
      }`;
  };

  return (
    <aside className="hidden md:flex w-17.5 shrink-0 flex-col items-center gap-2 border-r border-gray-100 bg-white py-6 z-30">
      <div className="mb-6 flex h-10 w-10 items-center justify-center">
        <MessageCircle className="h-7 w-7 text-bg-accent" />
      </div>

      <button
        onClick={() => router.push('/inbox')}
        className={getIconClassName('/inbox')}
        title="Inbox"
      >
        <MessageSquare className="h-5 w-5" fill={isActive('/inbox') ? 'currentColor' : 'none'} opacity={isActive('/inbox') ? 0.2 : 1} />
        {isActive('/inbox') && <MessageSquare className="absolute h-5 w-5" />}
        <span className="pointer-events-none absolute left-full z-40 ml-2 rounded-md bg-slate-900 px-2 py-1 text-xs font-medium text-white opacity-0 shadow-sm transition-opacity group-hover:opacity-100">
          Inbox
        </span>
      </button>

      <button
        onClick={() => router.push('/profile')}
        className={getIconClassName('/profile')}
        title="Profile"
      >
        <UserCircle2 className="h-5 w-5" fill={isActive('/profile') ? 'currentColor' : 'none'} opacity={isActive('/profile') ? 0.2 : 1} />
        {isActive('/profile') && <UserCircle2 className="absolute h-5 w-5" />}
        <span className="pointer-events-none absolute left-full z-40 ml-2 rounded-md bg-slate-900 px-2 py-1 text-xs font-medium text-white opacity-0 shadow-sm transition-opacity group-hover:opacity-100">
          Profile
        </span>
      </button>

      <button
        onClick={() => router.push('/admin')}
        disabled={user.role !== 'admin'}
        className={`${getIconClassName('/admin')} disabled:cursor-not-allowed disabled:opacity-40`}
        title="Admin Dashboard"
      >
        <LayoutDashboard className="h-5 w-5" fill={isActive('/admin') ? 'currentColor' : 'none'} opacity={isActive('/admin') ? 0.2 : 1} />
        {isActive('/admin') && <LayoutDashboard className="absolute h-5 w-5" />}
        <span className="pointer-events-none absolute left-full z-40 ml-2 rounded-md bg-slate-900 px-2 py-1 text-xs font-medium text-white opacity-0 shadow-sm transition-opacity group-hover:opacity-100 whitespace-nowrap">
          Admin
        </span>
      </button>

      <div className="mt-auto flex w-full flex-col items-center gap-6">
        <button
          onClick={handleLogout}
          className="group relative text-slate-400 transition-colors hover:text-red-500"
          title="Logout"
        >
          <LogOut className="h-5 w-5" />
          <span className="pointer-events-none absolute top-1/2 left-full z-40 ml-2 -translate-y-1/2 rounded-md bg-slate-900 px-2 py-1 text-xs font-medium text-white opacity-0 shadow-sm transition-opacity group-hover:opacity-100">
            Logout
          </span>
        </button>
        <button
          onClick={() => router.push('/profile')}
          className="relative h-9 w-9 cursor-pointer overflow-hidden rounded-full border border-gray-200 hover:ring-2 hover:ring-bg-accent/50 transition-all border-none"
        >
          <img
            src={user.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.username}`}
            alt={user.username}
            className="h-full w-full object-cover"
          />
        </button>
      </div>
    </aside>
  );
}
