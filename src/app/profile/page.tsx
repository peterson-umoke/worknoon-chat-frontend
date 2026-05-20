'use client';

import { useState, FormEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { Role } from '../../lib/types';
import Sidebar from '../../components/Sidebar';
import { Loader2 } from 'lucide-react';

export default function ProfilePage() {
  const { user, updateProfile, isLoading } = useAuth();
  const router = useRouter();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [avatar, setAvatar] = useState('');
  const [role, setRole] = useState<Role>('customer');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/login');
      return;
    }
    if (user) {
      setUsername(user.username);
      setEmail(user.email);
      setAvatar(user.avatar);
      setRole(user.role);
    }
  }, [user, isLoading, router]);

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsSaving(true);

    try {
      const data: Record<string, string> = { username, email, avatar, role };
      if (newPassword) {
        data.password = newPassword;
      }
      await updateProfile(data);
      setSuccess('Profile updated successfully');
      setNewPassword('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading || !user) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-bg-accent" />
      </div>
    );
  }

  const roles: { value: Role; label: string }[] = [
    { value: 'customer', label: 'Customer' },
    { value: 'merchant', label: 'Merchant' },
    { value: 'designer', label: 'Designer' },
    { value: 'agent', label: 'Agent' },
    { value: 'admin', label: 'Admin' },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <div className="flex w-full h-full">
        <Sidebar />

        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-2xl px-8 py-12">
            <h1 className="mb-8 text-2xl font-semibold text-slate-900">Profile Settings</h1>

            <div className="rounded-lg border border-gray-200 bg-white p-8 shadow-sm">
              <div className="mb-8 flex items-center gap-5">
                <img
                  src={avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${username}`}
                  alt={username}
                  className="h-20 w-20 rounded-md border border-gray-200 object-cover"
                />
                <div>
                  <p className="text-lg font-medium text-slate-900">{username}</p>
                  <p className="text-sm text-slate-500">{email}</p>
                </div>
              </div>

              <form onSubmit={handleSave} className="flex flex-col gap-5">
                {error && (
                  <div className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-600 border border-red-100">{error}</div>
                )}
                {success && (
                  <div className="rounded-md bg-green-50 px-4 py-3 text-sm text-green-600 border border-green-100">{success}</div>
                )}

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="avatarUrl" className="text-sm font-medium text-slate-700">Avatar URL</label>
                  <input
                    id="avatarUrl"
                    type="text"
                    value={avatar}
                    onChange={(e) => setAvatar(e.target.value)}
                    placeholder="https://example.com/avatar.jpg"
                    className="h-10 w-full rounded-md border border-gray-200 bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-bg-accent focus:outline-none focus:ring-1 focus:ring-bg-accent/20"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="profileUsername" className="text-sm font-medium text-slate-700">Username</label>
                  <input
                    id="profileUsername"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="h-10 w-full rounded-md border border-gray-200 bg-white px-3 text-sm text-slate-900 focus:border-bg-accent focus:outline-none focus:ring-1 focus:ring-bg-accent/20"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="profileEmail" className="text-sm font-medium text-slate-700">Email</label>
                  <input
                    id="profileEmail"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-10 w-full rounded-md border border-gray-200 bg-white px-3 text-sm text-slate-900 focus:border-bg-accent focus:outline-none focus:ring-1 focus:ring-bg-accent/20"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="profileRole" className="text-sm font-medium text-slate-700">
                    Role <span className="font-normal text-slate-400">(test perspectives)</span>
                  </label>
                  <select
                    id="profileRole"
                    value={role}
                    onChange={(e) => setRole(e.target.value as Role)}
                    className="h-10 w-full rounded-md border border-gray-200 bg-white px-3 text-sm text-slate-900 focus:border-bg-accent focus:outline-none focus:ring-1 focus:ring-bg-accent/20"
                  >
                    {roles.map((r) => (
                      <option key={r.value} value={r.value}>
                        {r.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="newPassword" className="text-sm font-medium text-slate-700">
                    New Password <span className="font-normal text-slate-400">(leave blank to keep current)</span>
                  </label>
                  <input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    className="h-10 w-full rounded-md border border-gray-200 bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-bg-accent focus:outline-none focus:ring-1 focus:ring-bg-accent/20"
                  />
                </div>

                <div className="mt-4 flex justify-end">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="flex h-10 w-full sm:w-auto items-center justify-center gap-2 rounded-md bg-bg-accent px-6 text-sm font-medium text-white transition-colors hover:bg-bg-accent-hover disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      'Save Changes'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
