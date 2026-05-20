'use client';

import { useState, FormEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { Role } from '../../lib/types';
import { User as UserIcon, Loader2, LogOut, ArrowLeft } from 'lucide-react';

export default function ProfilePage() {
  const { user, token, logout, updateProfile, isLoading } = useAuth();
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

  const handleLogout = () => {
    logout();
    router.replace('/login');
  };

  if (isLoading || !user) {
    return (
      <div className="flex h-screen items-center justify-center bg-bg-primary">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-border border-t-bg-accent" />
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
          <h1 className="text-lg font-semibold text-text-primary">Profile</h1>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm text-text-muted transition-colors hover:bg-bg-secondary hover:text-danger"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-2xl px-6 py-8">
        <div className="rounded-2xl border border-border-glass bg-bg-glass p-8 shadow-glass backdrop-blur-xl">
          {/* Avatar */}
          <div className="mb-8 flex flex-col items-center gap-4">
            <img
              src={avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${username}`}
              alt={username}
              className="h-24 w-24 rounded-2xl object-cover shadow-md"
            />
            <div className="text-center">
              <p className="font-semibold text-text-primary">{username}</p>
              <p className="text-text-secondary text-sm">{email}</p>
            </div>
          </div>

          <form onSubmit={handleSave} className="flex flex-col gap-5">
            {error && (
              <div className="rounded-lg bg-danger/10 px-4 py-3 text-sm text-danger">{error}</div>
            )}
            {success && (
              <div className="rounded-lg bg-success/10 px-4 py-3 text-sm text-success">{success}</div>
            )}

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-text-secondary">Avatar URL</label>
              <input
                type="text"
                value={avatar}
                onChange={(e) => setAvatar(e.target.value)}
                placeholder="https://example.com/avatar.jpg"
                className="h-11 rounded-xl border border-border bg-bg-primary px-4 text-text-primary text-sm placeholder:text-text-muted focus:border-bg-accent focus:outline-none focus:ring-2 focus:ring-bg-accent/20"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-text-secondary">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="h-11 rounded-xl border border-border bg-bg-primary px-4 text-text-primary text-sm focus:border-bg-accent focus:outline-none focus:ring-2 focus:ring-bg-accent/20"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-text-secondary">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11 rounded-xl border border-border bg-bg-primary px-4 text-text-primary text-sm focus:border-bg-accent focus:outline-none focus:ring-2 focus:ring-bg-accent/20"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-text-secondary">
                Role <span className="text-text-muted">(switch to test different perspectives)</span>
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as Role)}
                className="h-11 rounded-xl border border-border bg-bg-primary px-4 text-text-primary text-sm focus:border-bg-accent focus:outline-none focus:ring-2 focus:ring-bg-accent/20"
              >
                {roles.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-text-secondary">
                New Password <span className="text-text-muted">(leave blank to keep current)</span>
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                className="h-11 rounded-xl border border-border bg-bg-primary px-4 text-text-primary text-sm placeholder:text-text-muted focus:border-bg-accent focus:outline-none focus:ring-2 focus:ring-bg-accent/20"
              />
            </div>

            <button
              type="submit"
              disabled={isSaving}
              className="mt-2 flex h-11 items-center justify-center gap-2 rounded-xl bg-bg-accent text-text-on-accent font-medium text-sm transition-colors hover:bg-bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed"
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
          </form>
        </div>
      </div>
    </div>
  );
}
