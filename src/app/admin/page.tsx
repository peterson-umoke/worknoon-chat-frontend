'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { User } from '../../lib/types';
import * as api from '../../lib/api';
import RoleBadge from '../../components/RoleBadge';
import {
  ArrowLeft,
  Users,
  MessageSquare,
  Activity,
  Clock,
  Shield,
} from 'lucide-react';

export default function AdminPage() {
  const { user, token, isLoading } = useAuth();
  const { onlineUsers } = useSocket();
  const router = useRouter();

  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [uptime, setUptime] = useState(0);

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/login');
      return;
    }
    if (user && user.role !== 'admin') {
      router.replace('/inbox');
      return;
    }
    if (token && user?.role === 'admin') {
      loadUsers();
    }
  }, [token, user, isLoading, router]);

  useEffect(() => {
    const interval = setInterval(() => setUptime((prev) => prev + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  const loadUsers = async () => {
    if (!token) return;
    try {
      const users = await api.getUsers(token);
      setAllUsers(users);
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatUptime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (isLoading || !user) {
    return (
      <div className="flex h-screen items-center justify-center bg-bg-primary">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-border border-t-bg-accent" />
      </div>
    );
  }

  if (user.role !== 'admin') {
    return null;
  }

  const onlineCount = allUsers.filter((u) => onlineUsers.has(u._id)).length + 1;

  const stats = [
    {
      label: 'Total Users',
      value: allUsers.length + 1,
      icon: Users,
      color: 'text-role-agent',
      bg: 'bg-role-agent/10',
    },
    {
      label: 'Online Now',
      value: onlineCount,
      icon: Activity,
      color: 'text-online',
      bg: 'bg-online/10',
    },
    {
      label: 'Backend Uptime',
      value: formatUptime(uptime),
      icon: Clock,
      color: 'text-bg-accent',
      bg: 'bg-bg-accent/10',
    },
  ];

  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-6 py-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/inbox')}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-text-muted transition-colors hover:bg-bg-secondary hover:text-text-primary"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-bg-accent" />
            <h1 className="text-lg font-semibold text-text-primary">Admin Dashboard</h1>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-6 py-8">
        {/* Stats grid */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="flex items-center gap-4 rounded-2xl border border-border-glass bg-bg-glass p-6 shadow-glass backdrop-blur-xl"
            >
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${stat.bg}`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
              <div>
                <p className="text-text-muted text-sm">{stat.label}</p>
                <p className="text-2xl font-bold text-text-primary">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* User directory */}
        <div className="rounded-2xl border border-border-glass bg-bg-glass shadow-glass backdrop-blur-xl">
          <div className="flex items-center gap-2 border-b border-border px-6 py-4">
            <Users className="h-5 w-5 text-text-muted" />
            <h2 className="font-semibold text-text-primary">User Directory</h2>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="h-6 w-6 animate-spin rounded-full border-3 border-border border-t-bg-accent" />
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-px bg-border sm:grid-cols-2 lg:grid-cols-3">
              {[user, ...allUsers].map((u) => {
                const isOnline = onlineUsers.has(u._id);
                return (
                  <div
                    key={u._id}
                    className="flex items-center gap-3 bg-bg-primary px-6 py-4"
                  >
                    <div className="relative flex-shrink-0">
                      <img
                        src={u.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${u.username}`}
                        alt={u.username}
                        className="h-10 w-10 rounded-full object-cover"
                      />
                      {isOnline && (
                        <span className="absolute bottom-0 right-0 block h-3 w-3 rounded-full border-2 border-bg-primary bg-online" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate font-medium text-text-primary text-sm">
                          {u.username}
                        </p>
                        <RoleBadge role={u.role} />
                      </div>
                      <p className="truncate text-text-muted text-xs">{u.email}</p>
                    </div>
                    <span className={`text-xs font-medium ${isOnline ? 'text-online' : 'text-text-muted'}`}>
                      {isOnline ? 'Online' : 'Offline'}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
