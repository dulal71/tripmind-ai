'use client';

import { motion } from 'framer-motion';
import {
  FiUsers,
  FiMap,
  FiCompass,
  FiHeart,
  FiMail,
  FiShield,
  FiTrendingUp,
  FiClock,
} from 'react-icons/fi';
import { useEffect, useState } from 'react';
import api from '@/lib/api';

interface AdminStats {
  totalUsers: number;
  totalDestinations: number;
  totalTrips: number;
  totalFavorites: number;
  totalContactMessages: number;
  usersByRole: Record<string, number>;
  recentUsers: Array<{ _id: string; name: string; email: string; role: string; createdAt: string }>;
  recentTrips: Array<{ _id: string; destinationName: string; status: string; createdAt: string }>;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function AdminOverviewPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get<{ status: string; data: AdminStats }>('/api/admin/stats');
        setStats(data.data);
      } catch (err) {
        console.error('Failed to load admin stats', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-2xl bg-zinc-200 dark:bg-zinc-800" />
          ))}
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="h-64 animate-pulse rounded-2xl bg-zinc-200 dark:bg-zinc-800" />
          <div className="h-64 animate-pulse rounded-2xl bg-zinc-200 dark:bg-zinc-800" />
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-20 text-zinc-500 dark:text-zinc-400">
        Failed to load admin statistics.
      </div>
    );
  }

  const statCards = [
    { icon: FiUsers, label: 'Total Users', value: stats.totalUsers, color: 'text-blue-500', bg: 'from-blue-500/15 to-blue-600/5' },
    { icon: FiMap, label: 'Destinations', value: stats.totalDestinations, color: 'text-violet-500', bg: 'from-violet-500/15 to-violet-600/5' },
    { icon: FiCompass, label: 'Total Trips', value: stats.totalTrips, color: 'text-emerald-500', bg: 'from-emerald-500/15 to-emerald-600/5' },
    { icon: FiHeart, label: 'Favorites', value: stats.totalFavorites, color: 'text-rose-500', bg: 'from-rose-500/15 to-rose-600/5' },
    { icon: FiMail, label: 'Messages', value: stats.totalContactMessages, color: 'text-amber-500', bg: 'from-amber-500/15 to-amber-600/5' },
  ];

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="flex items-center gap-3 mb-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 shadow-lg shadow-blue-500/25">
            <FiShield className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
              Admin Dashboard
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Manage your platform</p>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {statCards.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 * i }}
            className={`rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-gradient-to-br ${stat.bg} p-5 backdrop-blur-sm`}
          >
            <stat.icon className={`h-5 w-5 ${stat.color} mb-3`} />
            <p className="text-2xl font-bold text-zinc-900 dark:text-white">{stat.value}</p>
            <p className="text-xs text-zinc-500 font-medium mt-1">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {Object.keys(stats.usersByRole).length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.3 }} className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 p-6">
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-white mb-4 flex items-center gap-2">
            <FiUsers className="h-4 w-4 text-blue-500" />
            Users by Role
          </h3>
          <div className="flex gap-4">
            {Object.entries(stats.usersByRole).map(([role, count]) => (
              <div key={role} className="flex items-center gap-2 rounded-lg border border-zinc-200 dark:border-zinc-800 px-4 py-3">
                <span className="text-xs font-medium text-zinc-500 capitalize">{role}</span>
                <span className="text-lg font-bold text-zinc-900 dark:text-white">{count}</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.4 }} className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 p-6">
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-white mb-4 flex items-center gap-2">
            <FiClock className="h-4 w-4 text-emerald-500" />
            Recent Users
          </h3>
          <div className="space-y-3">
            {stats.recentUsers.length > 0 ? stats.recentUsers.map((user) => (
              <div key={user._id} className="flex items-center justify-between rounded-xl border border-zinc-200 dark:border-zinc-800/60 bg-white dark:bg-zinc-800/30 p-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-zinc-900 dark:text-white truncate">{user.name || 'Unnamed'}</p>
                  <p className="text-xs text-zinc-500 truncate">{user.email}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${
                    user.role === 'admin' ? 'bg-violet-500/15 text-violet-400 border border-violet-500/30' : 'bg-blue-500/15 text-blue-400 border border-blue-500/30'
                  }`}>
                    {user.role}
                  </span>
                  <span className="text-xs text-zinc-400">{formatDate(user.createdAt)}</span>
                </div>
              </div>
            )) : (
              <p className="text-sm text-zinc-500 text-center py-4">No users yet</p>
            )}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.5 }} className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 p-6">
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-white mb-4 flex items-center gap-2">
            <FiTrendingUp className="h-4 w-4 text-violet-500" />
            Recent Trips
          </h3>
          <div className="space-y-3">
            {stats.recentTrips.length > 0 ? stats.recentTrips.map((trip) => (
              <div key={trip._id} className="flex items-center justify-between rounded-xl border border-zinc-200 dark:border-zinc-800/60 bg-white dark:bg-zinc-800/30 p-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-zinc-900 dark:text-white truncate">{trip.destinationName || 'Unknown'}</p>
                  <p className="text-xs text-zinc-500">{formatDate(trip.createdAt)}</p>
                </div>
                <span className={`shrink-0 inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium capitalize ${
                  trip.status === 'completed' ? 'bg-green-500/15 text-green-400 border-green-500/30' :
                  trip.status === 'upcoming' ? 'bg-blue-500/15 text-blue-400 border-blue-500/30' :
                  'bg-yellow-500/15 text-yellow-400 border-yellow-500/30'
                }`}>
                  {trip.status}
                </span>
              </div>
            )) : (
              <p className="text-sm text-zinc-500 text-center py-4">No trips yet</p>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
