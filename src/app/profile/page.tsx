'use client';

import { useState, FormEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { Role } from '../../lib/types';
import { Loader2, LogOut, ArrowLeft } from 'lucide-react';

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
      <div className="flex items-center justify-between border-b border-border px-8 py-5">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/inbox')}
            className="flex h-10 w-10 items-center justify-center rounded-xl text-text-muted transition-colors hover:bg-bg-secondary hover:text-text-primary"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-xl font-semibold text-text-primary">Profile</h1>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm text-text-muted transition-colors hover:bg-bg-secondary hover:text-danger"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>

      <div className="mx-auto max-w-2xl px-8 py-12">
        <div className="rounded-2xl border border-border-glass bg-bg-glass p-10 shadow-glass backdrop-blur-xl">
          <div className="mb-10 flex flex-col items-center gap-5">
            <img
              src={avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${username}`}
              alt={username}
              className="h-28 w-28 rounded-2xl object-cover shadow-md"
            />
            <div className="text-center">
              <p className="text-lg font-semibold text-text-primary">{username}</p>
              <p className="text-text-secondary text-sm">{email}</p>
            </div>
          </div>

          <form onSubmit={handleSave} className="flex flex-col gap-6">
            {error && (
              <div className="rounded-lg bg-danger/10 px-4 py-3 text-sm text-danger">{error}</div>
            )}
            {success && (
              <div className="rounded-lg bg-success/10 px-4 py-3 text-sm text-success">{success}</div>
            )}

            <div className="flex flex-col gap-2.5">
              <label htmlFor="avatarUrl" className="text-sm font-medium text-text-secondary">Avatar URL</label>
              <input
                id="avatarUrl"
                type="text"
                value={avatar}
                onChange={(e) => setAvatar(e.target.value)}
                placeholder="https://example.com/avatar.jpg"
                className="h-12 rounded-xl border border-border bg-bg-primary px-4 text-text-primary text-sm placeholder:text-text-muted focus:border-bg-accent focus:outline-none focus:ring-2 focus:ring-bg-accent/20"
              />
            </div>

            <div className="flex flex-col gap-2.5">
              <label htmlFor="profileUsername" className="text-sm font-medium text-text-secondary">Username</label>
              <input
                id="profileUsername"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="h-12 rounded-xl border border-border bg-bg-primary px-4 text-text-primary text-sm focus:border-bg-accent focus:outline-none focus:ring-2 focus:ring-bg-accent/20"
              />
            </div>

            <div className="flex flex-col gap-2.5">
              <label htmlFor="profileEmail" className="text-sm font-medium text-text-secondary">Email</label>
              <input
                id="profileEmail"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 rounded-xl border border-border bg-bg-primary px-4 text-text-primary text-sm focus:border-bg-accent focus:outline-none focus:ring-2 focus:ring-bg-accent/20"
              />
            </div>

            <div className="flex flex-col gap-2.5">
              <label htmlFor="profileRole" className="text-sm font-medium text-text-secondary">
                Role <span className="text-text-muted">(switch to test different perspectives)</span>
              </label>
              <select
                id="profileRole"
                value={role}
                onChange={(e) => setRole(e.target.value as Role)}
                className="h-12 rounded-xl border border-border bg-bg-primary px-4 text-text-primary text-sm focus:border-bg-accent focus:outline-none focus:ring-2 focus:ring-bg-accent/20"
              >
                {roles.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-2.5">
              <label htmlFor="newPassword" className="text-sm font-medium text-text-secondary">
                New Password <span className="text-text-muted">(leave blank to keep current)</span>
              </label>
              <input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                className="h-12 rounded-xl border border-border bg-bg-primary px-4 text-text-primary text-sm placeholder:text-text-muted focus:border-bg-accent focus:outline-none focus:ring-2 focus:ring-bg-accent/20"
              />
            </div>

            <button
              type="submit"
              disabled={isSaving}
              className="mt-2 flex h-12 items-center justify-center gap-2 rounded-xl bg-bg-accent text-text-on-accent font-medium transition-colors hover:bg-bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed"
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
