'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { FiUser, FiMail, FiMap, FiStar, FiHeart, FiCalendar, FiArrowRight, FiLogOut, FiEdit2, FiSave, FiX } from 'react-icons/fi';
import { useTrips } from '@/hooks/useTrips';
import { useFavorites } from '@/hooks/useFavorites';
import { authClient } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { data: session } = authClient.useSession();
  const router = useRouter();
  const { data: trips } = useTrips();
  const { data: favorites } = useFavorites();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  if (!session?.user) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center px-4">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-8 text-center max-w-md">
          <FiUser className="mx-auto h-12 w-12 text-zinc-600 mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">Sign in required</h2>
          <p className="text-sm text-zinc-400 mb-6">You need to be signed in to view your profile.</p>
          <Link href="/login" className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-violet-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 transition-all">
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  const user = session.user;
  const totalTrips = trips?.length || 0;
  const completedTrips = trips?.filter((t) => t.status === 'completed').length || 0;
  const totalFavorites = favorites?.length || 0;
  const memberSince = user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'Recently';

  const startEditing = () => {
    setEditName(user.name || '');
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setEditName('');
  };

  const saveProfile = async () => {
    if (!editName.trim()) {
      toast.error('Name cannot be empty');
      return;
    }
    setIsSaving(true);
    try {
      await api.put('/api/users/profile', { name: editName.trim() });
      toast.success('Profile updated successfully');
      setIsEditing(false);
      router.refresh();
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await authClient.signOut();
      router.push('/');
      router.refresh();
    } catch {
      // silent
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Hero */}
      <div className="relative overflow-hidden border-b border-zinc-800/60">
        <div className="absolute top-[-40%] left-[-20%] w-[60%] h-[80%] rounded-full bg-blue-500/8 blur-[100px]" />
        <div className="absolute bottom-[-30%] right-[-15%] w-[50%] h-[70%] rounded-full bg-violet-500/8 blur-[100px]" />

        <div className="relative mx-auto max-w-7xl px-4 pb-12 pt-16 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="flex flex-col sm:flex-row items-center sm:items-end gap-6">
            {/* Avatar */}
            {user.image ? (
              <img src={user.image} alt={user.name || ''} className="h-24 w-24 rounded-2xl object-cover border-2 border-zinc-800 shadow-xl" />
            ) : (
              <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 shadow-xl shadow-blue-500/20">
                <FiUser className="h-10 w-10 text-white" />
              </div>
            )}
            <div className="text-center sm:text-left flex-1">
              {isEditing ? (
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="text-3xl font-extrabold text-white bg-zinc-800/50 border border-zinc-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    placeholder="Your name"
                  />
                  <button
                    onClick={saveProfile}
                    disabled={isSaving}
                    className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-600 text-white hover:bg-green-500 transition-colors disabled:opacity-50"
                  >
                    <FiSave className="h-4 w-4" />
                  </button>
                  <button
                    onClick={cancelEditing}
                    className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-700 text-white hover:bg-zinc-600 transition-colors"
                  >
                    <FiX className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <h1 className="text-3xl font-extrabold text-white">{user.name || 'Traveler'}</h1>
                  <button
                    onClick={startEditing}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-700 bg-zinc-800/50 text-zinc-400 hover:text-white hover:border-zinc-600 transition-colors"
                  >
                    <FiEdit2 className="h-4 w-4" />
                  </button>
                </div>
              )}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mt-2 text-sm text-zinc-400">
                <span className="flex items-center gap-1">
                  <FiMail className="h-3.5 w-3.5" />
                  {user.email}
                </span>
                <span className="flex items-center gap-1">
                  <FiCalendar className="h-3.5 w-3.5" />
                  Member since {memberSince}
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="grid grid-cols-3 gap-4 mb-8"
        >
          {[
            { icon: FiMap, label: 'Total Trips', value: totalTrips, color: 'text-blue-400' },
            { icon: FiStar, label: 'Completed', value: completedTrips, color: 'text-emerald-400' },
            { icon: FiHeart, label: 'Favorites', value: totalFavorites, color: 'text-rose-400' },
          ].map((stat) => (
            <div key={stat.label} className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 text-center backdrop-blur-sm">
              <stat.icon className={`h-5 w-5 ${stat.color} mx-auto mb-2`} />
              <p className="text-2xl font-bold text-white">{stat.value}</p>
              <p className="text-xs text-zinc-500 mt-1">{stat.label}</p>
            </div>
          ))}
        </motion.div>

        {/* Quick Links */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-8"
        >
          {[
            { href: '/trips', icon: FiMap, label: 'My Trips', description: 'View and manage all your travel plans' },
            { href: '/favorites', icon: FiHeart, label: 'Favorites', description: 'Browse your saved destinations' },
            { href: '/planner', icon: FiStar, label: 'AI Planner', description: 'Generate personalized itineraries' },
            { href: '/recommendations', icon: FiArrowRight, label: 'Recommendations', description: 'Discover new destinations' },
            { href: '/chat', icon: FiMail, label: 'AI Chat', description: 'Ask travel questions' },
            { href: '/dashboard', icon: FiArrowRight, label: 'Dashboard', description: 'View your travel overview' },
          ].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex items-center gap-4 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 backdrop-blur-sm hover:border-zinc-700 hover:bg-zinc-800/40 transition-colors group"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/20 to-violet-500/20 border border-blue-500/20">
                <link.icon className="h-5 w-5 text-blue-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white group-hover:text-blue-400 transition-colors">{link.label}</p>
                <p className="text-xs text-zinc-500 truncate">{link.description}</p>
              </div>
              <FiArrowRight className="h-4 w-4 text-zinc-600 group-hover:text-zinc-400 transition-colors shrink-0" />
            </Link>
          ))}
        </motion.div>

        {/* Sign Out */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <button
            onClick={handleSignOut}
            disabled={isSigningOut}
            className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-6 py-3 text-sm font-medium text-red-400 hover:bg-red-500/20 transition-colors disabled:opacity-50 cursor-pointer"
          >
            <FiLogOut className="h-4 w-4" />
            {isSigningOut ? 'Signing out...' : 'Sign Out'}
          </button>
        </motion.div>
      </div>
    </div>
  );
}
