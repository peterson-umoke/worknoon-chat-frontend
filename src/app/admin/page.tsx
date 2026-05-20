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
  Activity,
  Shield,
} from 'lucide-react';

export default function AdminPage() {
  const { user, token, isLoading } = useAuth();
  const { onlineUsers } = useSocket();
  const router = useRouter();

  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="min-h-screen bg-bg-primary">
      <div className="flex items-center justify-between border-b border-border px-8 py-5">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/inbox')}
            className="flex h-10 w-10 items-center justify-center rounded-xl text-text-muted transition-colors hover:bg-bg-secondary hover:text-text-primary"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-3">
            <Shield className="h-6 w-6 text-bg-accent" />
            <h1 className="text-xl font-semibold text-text-primary">Admin Dashboard</h1>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-8 py-10">
        <div className="mb-10 grid grid-cols-1 gap-6 sm:grid-cols-3">
          <div className="flex items-center gap-5 rounded-2xl border border-border-glass bg-bg-glass px-6 py-5 shadow-glass backdrop-blur-xl">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-role-agent/10">
              <Users className="h-7 w-7 text-role-agent" />
            </div>
            <div>
              <p className="text-text-muted text-sm">Total Users</p>
              <p className="text-2xl font-bold text-text-primary">{allUsers.length + 1}</p>
            </div>
          </div>

          <div className="flex items-center gap-5 rounded-2xl border border-border-glass bg-bg-glass px-6 py-5 shadow-glass backdrop-blur-xl">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-online/10">
              <Activity className="h-7 w-7 text-online" />
            </div>
            <div>
              <p className="text-text-muted text-sm">Online Now</p>
              <p className="text-2xl font-bold text-text-primary">{onlineCount}</p>
            </div>
          </div>

          <div className="flex items-center gap-5 rounded-2xl border border-border-glass bg-bg-glass px-6 py-5 shadow-glass backdrop-blur-xl">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-bg-accent/10">
              <Shield className="h-7 w-7 text-bg-accent" />
            </div>
            <div>
              <p className="text-text-muted text-sm">System Status</p>
              <p className="text-lg font-semibold text-text-primary">All systems operational</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border-glass bg-bg-glass shadow-glass backdrop-blur-xl">
          <div className="flex items-center gap-3 border-b border-border px-6 py-5">
            <Users className="h-5 w-5 text-text-muted" />
            <h2 className="text-lg font-semibold text-text-primary">User Directory</h2>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="h-6 w-6 animate-spin rounded-full border-3 border-border border-t-bg-accent" />
            </div>
          ) : (
            <div className="divide-y divide-border">
              {[user, ...allUsers].map((u) => {
                const isOnline = onlineUsers.has(u._id);
                return (
                  <div
                    key={u._id}
                    className="flex items-center gap-4 px-6 py-5"
                  >
                    <div className="relative flex-shrink-0">
                      <img
                        src={u.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${u.username}`}
                        alt={u.username}
                        className="h-12 w-12 rounded-full object-cover"
                      />
                      {isOnline && (
                        <span className="absolute bottom-0 right-0 block h-3.5 w-3.5 rounded-full border-2 border-bg-primary bg-online" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate font-medium text-text-primary">{u.username}</p>
                        <RoleBadge role={u.role} />
                      </div>
                      <p className="text-text-muted text-sm">{u.email}</p>
                    </div>
                    <span className={`text-sm font-medium ${isOnline ? 'text-online' : 'text-text-muted'}`}>
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
