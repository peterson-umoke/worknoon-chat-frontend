'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { User } from '../../lib/types';
import * as api from '../../lib/api';
import RoleBadge from '../../components/RoleBadge';
import Sidebar from '../../components/Sidebar';
import { Users, Activity, Shield } from 'lucide-react';

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
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-bg-accent" />
      </div>
    );
  }

  if (user.role !== 'admin') {
    return null;
  }

  const onlineCount = allUsers.filter((u) => onlineUsers.has(u._id)).length + 1;

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <div className="flex w-full h-full">
        <Sidebar />

        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-5xl px-8 py-12">
            <h1 className="mb-8 text-2xl font-semibold text-slate-900">Admin Dashboard</h1>

            <div className="mb-10 grid grid-cols-1 gap-6 sm:grid-cols-3">
              <div className="flex items-center gap-5 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                <div className="flex h-12 w-12 items-center justify-center rounded-md bg-blue-50 text-blue-600">
                  <Users className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">Total Users</p>
                  <p className="text-2xl font-semibold text-slate-900">{allUsers.length + 1}</p>
                </div>
              </div>

              <div className="flex items-center gap-5 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                <div className="flex h-12 w-12 items-center justify-center rounded-md bg-green-50 text-green-600">
                  <Activity className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">Online Now</p>
                  <p className="text-2xl font-semibold text-slate-900">{onlineCount}</p>
                </div>
              </div>

              <div className="flex items-center gap-5 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                <div className="flex h-12 w-12 items-center justify-center rounded-md bg-amber-50 text-amber-600">
                  <Shield className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">System Status</p>
                  <p className="mt-1 text-sm font-medium text-slate-900">Operational</p>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden">
              <div className="border-b border-gray-200 px-6 py-4 bg-slate-50/50">
                <h2 className="text-sm font-semibold text-slate-900">User Directory</h2>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-20">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-200 border-t-bg-accent" />
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {[user, ...allUsers].map((u) => {
                    const isOnline = onlineUsers.has(u._id);
                    return (
                      <div key={u._id} className="flex items-center gap-4 px-6 py-4 transition-colors hover:bg-slate-50">
                        <div className="relative shrink-0">
                          <img
                            src={u.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${u.username}`}
                            alt={u.username}
                            className="h-10 w-10 rounded-full border border-gray-200 object-cover"
                          />
                          {isOnline && (
                            <span className="absolute -bottom-0.5 -right-0.5 block h-3 w-3 rounded-full border-2 border-white bg-green-500" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <p className="truncate text-sm font-medium text-slate-900">{u.username}</p>
                            <RoleBadge role={u.role} />
                          </div>
                          <p className="text-sm text-slate-500">{u.email}</p>
                        </div>
                        <div className="shrink-0 text-right">
                          <span className={`text-xs font-medium ${isOnline ? 'text-green-600' : 'text-slate-400'}`}>
                            {isOnline ? 'Online' : 'Offline'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
