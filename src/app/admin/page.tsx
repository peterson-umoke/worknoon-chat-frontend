'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { User } from '../../lib/types';
import * as api from '../../lib/api';
import RoleBadge from '../../components/RoleBadge';
import Sidebar from '../../components/Sidebar';
import { Users, Activity, Shield, X } from 'lucide-react';

export default function AdminPage() {
  const { user, token, isLoading } = useAuth();
  const { onlineUsers } = useSocket();
  const router = useRouter();

  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedRole, setSelectedRole] = useState<User['role']>('customer');
  const [savingRole, setSavingRole] = useState(false);

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

  const handleOpenUserSettings = (targetUser: User) => {
    if (!user || targetUser._id === user._id) return;
    setSelectedUser(targetUser);
    setSelectedRole(targetUser.role);
  };

  const handleSaveRole = async () => {
    if (!token || !selectedUser) return;
    setSavingRole(true);
    try {
      const updated = await api.updateUserRole(token, selectedUser._id, selectedRole);
      setAllUsers((prev) => prev.map((u) => (u._id === updated._id ? updated : u)));
      setSelectedUser(updated);
    } catch (err) {
      console.error('Failed to update user role:', err);
    } finally {
      setSavingRole(false);
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
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className="w-full max-w-lg rounded-lg border border-gray-200 bg-white shadow-lg">
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
              <h2 className="text-base font-semibold text-slate-900">User Profile Settings</h2>
              <button
                onClick={() => setSelectedUser(null)}
                className="rounded-md p-1 text-slate-400 transition-colors hover:bg-slate-50 hover:text-slate-600"
                aria-label="Close user profile settings"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-5 px-5 py-5">
              <div className="flex items-center gap-3">
                <img
                  src={selectedUser.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${selectedUser.username}`}
                  alt={selectedUser.username}
                  className="h-12 w-12 rounded-full border border-gray-200 object-cover"
                />
                <div>
                  <p className="text-sm font-semibold text-slate-900">{selectedUser.username}</p>
                  <p className="text-sm text-slate-500">{selectedUser.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Status</p>
                  <p className={`mt-1 text-sm font-medium ${onlineUsers.has(selectedUser._id) ? 'text-green-600' : 'text-slate-500'}`}>
                    {onlineUsers.has(selectedUser._id) ? 'Online' : 'Offline'}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Last Active</p>
                  <p className="mt-1 text-sm text-slate-700">
                    {selectedUser.lastActive ? new Date(selectedUser.lastActive).toLocaleString() : 'Unknown'}
                  </p>
                </div>
              </div>

              <div>
                <label htmlFor="role-select" className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Role
                </label>
                <select
                  id="role-select"
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value as User['role'])}
                  className="mt-2 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-bg-accent/20"
                >
                  <option value="admin">admin</option>
                  <option value="agent">agent</option>
                  <option value="customer">customer</option>
                  <option value="designer">designer</option>
                  <option value="merchant">merchant</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-gray-100 px-5 py-4">
              <button
                onClick={() => setSelectedUser(null)}
                className="rounded-md border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveRole}
                disabled={savingRole || selectedRole === selectedUser.role}
                className="rounded-md bg-bg-accent px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-bg-accent-hover disabled:cursor-not-allowed disabled:opacity-60"
              >
                {savingRole ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

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
                    const isSelf = u._id === user._id;
                    return (
                      <div
                        key={u._id}
                        className={`flex items-center gap-4 px-6 py-4 transition-colors ${isSelf ? 'hover:bg-slate-50' : 'cursor-pointer hover:bg-slate-50'}`}
                        role={isSelf ? undefined : 'button'}
                        tabIndex={isSelf ? -1 : 0}
                        onClick={() => handleOpenUserSettings(u)}
                        onKeyDown={(e) => {
                          if (isSelf) return;
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            handleOpenUserSettings(u);
                          }
                        }}
                      >
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
                          {!isSelf && (
                            <p className="mt-1 text-[11px] text-slate-400">View settings</p>
                          )}
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
