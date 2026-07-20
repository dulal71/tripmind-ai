'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  FiMap,
  FiStar,
  FiTrendingUp,
  FiClock,
  FiCalendar,
  FiDollarSign,
  FiUsers,
  FiArrowRight,
  FiCompass,
  FiHeart,
  FiMessageCircle,
} from 'react-icons/fi';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useTrips } from '@/hooks/useTrips';
import { useFavorites } from '@/hooks/useFavorites';
import { authClient } from '@/lib/auth-client';

const statusColors: Record<string, string> = {
  planning: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
  upcoming: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  completed: 'bg-green-500/15 text-green-400 border-green-500/30',
  cancelled: 'bg-red-500/15 text-red-400 border-red-500/30',
};

const budgetLabels: Record<string, string> = {
  economy: 'Economy',
  budget: 'Budget',
  moderate: 'Moderate',
  luxury: 'Luxury',
};

const PIE_COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444'];

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function DashboardPage() {
  const { data: session } = authClient.useSession();
  const { data: trips, isLoading: tripsLoading } = useTrips();
  const { data: favorites } = useFavorites();

  if (!session?.user) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center px-4">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-8 text-center max-w-md">
          <FiMap className="mx-auto h-12 w-12 text-zinc-600 mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">Sign in required</h2>
          <p className="text-sm text-zinc-400 mb-6">You need to be signed in to view your dashboard.</p>
          <Link href="/login" className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-violet-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 transition-all">
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  const totalTrips = trips?.length || 0;
  const completedTrips = trips?.filter((t) => t.status === 'completed').length || 0;
  const upcomingTrips = trips?.filter((t) => t.status === 'upcoming' || t.status === 'planning').length || 0;
  const totalFavorites = favorites?.length || 0;

  const budgetDistribution = trips?.reduce((acc, t) => {
    acc[t.budget] = (acc[t.budget] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};
  const pieData = Object.entries(budgetDistribution).map(([name, value]) => ({
    name: budgetLabels[name] || name,
    value,
  }));

  const recentTrips = trips?.slice(0, 5) || [];

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Hero Section */}
      <div className="relative overflow-hidden border-b border-zinc-800/60">
        <div className="absolute top-[-40%] left-[-20%] w-[60%] h-[80%] rounded-full bg-blue-500/8 blur-[100px]" />
        <div className="absolute bottom-[-30%] right-[-15%] w-[50%] h-[70%] rounded-full bg-violet-500/8 blur-[100px]" />

        <div className="relative mx-auto max-w-7xl px-4 pb-8 pt-12 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 shadow-lg shadow-blue-500/25">
              <FiTrendingUp className="h-7 w-7 text-white" />
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              Welcome back, <span className="bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">{session.user.name || 'Traveler'}</span>
            </h1>
            <p className="mt-3 text-base text-zinc-400 sm:text-lg">
              Here&apos;s an overview of your travel activity.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Stat Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="grid grid-cols-2 gap-4 sm:grid-cols-4"
        >
          {[
            { icon: FiMap, label: 'Total Trips', value: totalTrips, color: 'text-blue-400', bg: 'from-blue-500/15 to-blue-600/5' },
            { icon: FiClock, label: 'Upcoming', value: upcomingTrips, color: 'text-violet-400', bg: 'from-violet-500/15 to-violet-600/5' },
            { icon: FiStar, label: 'Completed', value: completedTrips, color: 'text-emerald-400', bg: 'from-emerald-500/15 to-emerald-600/5' },
            { icon: FiHeart, label: 'Favorites', value: totalFavorites, color: 'text-rose-400', bg: 'from-rose-500/15 to-rose-600/5' },
          ].map((stat) => (
            <div key={stat.label} className={`rounded-2xl border border-zinc-800 bg-gradient-to-br ${stat.bg} p-5 backdrop-blur-sm`}>
              <stat.icon className={`h-5 w-5 ${stat.color} mb-3`} />
              <p className="text-2xl font-bold text-white">{stat.value}</p>
              <p className="text-xs text-zinc-500 font-medium mt-1">{stat.label}</p>
            </div>
          ))}
        </motion.div>

        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Budget Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 backdrop-blur-sm"
          >
            <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <FiDollarSign className="h-4 w-4 text-blue-400" />
              Budget Distribution
            </h3>
            {tripsLoading ? (
              <div className="h-48 animate-pulse rounded-xl bg-zinc-800" />
            ) : pieData.length > 0 ? (
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={4} dataKey="value">
                      {pieData.map((_, index) => (
                        <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ background: '#18181b', border: '1px solid #27272a', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-48 flex items-center justify-center text-sm text-zinc-500">No trip data yet</div>
            )}
            {pieData.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-3">
                {pieData.map((entry, i) => (
                  <div key={entry.name} className="flex items-center gap-1.5 text-xs text-zinc-400">
                    <div className="h-2.5 w-2.5 rounded-full" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                    {entry.name} ({entry.value})
                  </div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 backdrop-blur-sm"
          >
            <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <FiCompass className="h-4 w-4 text-violet-400" />
              Quick Actions
            </h3>
            <div className="space-y-3">
              {[
                { href: '/planner', icon: FiStar, label: 'AI Planner', description: 'Generate a new itinerary', gradient: 'from-blue-500 to-violet-600' },
                { href: '/trips/new', icon: FiMap, label: 'Create Trip', description: 'Plan a new adventure', gradient: 'from-emerald-500 to-teal-600' },
                { href: '/recommendations', icon: FiTrendingUp, label: 'Get Recommendations', description: 'Find your next destination', gradient: 'from-amber-500 to-orange-600' },
                { href: '/chat', icon: FiMessageCircle, label: 'AI Chat', description: 'Ask travel questions', gradient: 'from-pink-500 to-rose-600' },
                { href: '/explore', icon: FiCompass, label: 'Explore', description: 'Browse destinations', gradient: 'from-cyan-500 to-blue-600' },
              ].map((action) => (
                <Link
                  key={action.href}
                  href={action.href}
                  className="flex items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-800/40 px-4 py-3 hover:border-zinc-700 hover:bg-zinc-800/60 transition-colors group"
                >
                  <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${action.gradient} shadow-md`}>
                    <action.icon className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white group-hover:text-blue-400 transition-colors">{action.label}</p>
                    <p className="text-xs text-zinc-500 truncate">{action.description}</p>
                  </div>
                  <FiArrowRight className="h-4 w-4 text-zinc-600 group-hover:text-zinc-400 transition-colors shrink-0" />
                </Link>
              ))}
            </div>
          </motion.div>

          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
            className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 backdrop-blur-sm"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <FiClock className="h-4 w-4 text-emerald-400" />
                Recent Trips
              </h3>
              {totalTrips > 0 && (
                <Link href="/trips" className="text-xs text-blue-400 hover:text-blue-300 transition-colors">
                  View all
                </Link>
              )}
            </div>
            {tripsLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-16 animate-pulse rounded-xl bg-zinc-800" />
                ))}
              </div>
            ) : recentTrips.length > 0 ? (
              <div className="space-y-3">
                {recentTrips.map((trip) => (
                  <Link
                    key={trip._id}
                    href={`/trips/${trip._id}`}
                    className="flex items-center gap-3 rounded-xl border border-zinc-800/60 bg-zinc-800/30 p-3 hover:border-zinc-700 hover:bg-zinc-800/50 transition-colors"
                  >
                    {trip.destinationImage ? (
                      <img src={trip.destinationImage} alt={trip.destinationName} className="h-10 w-10 rounded-lg object-cover shrink-0" />
                    ) : (
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-zinc-800">
                        <FiMap className="h-4 w-4 text-zinc-600" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{trip.destinationName || 'Unknown'}</p>
                      <div className="flex items-center gap-2 text-xs text-zinc-500">
                        <FiCalendar className="h-3 w-3" />
                        {formatDate(trip.startDate)}
                      </div>
                    </div>
                    <span className={`shrink-0 inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium capitalize ${statusColors[trip.status]}`}>
                      {trip.status}
                    </span>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <FiMap className="h-10 w-10 text-zinc-700 mb-3" />
                <p className="text-sm text-zinc-400">No trips yet</p>
                <Link href="/trips/new" className="mt-3 text-xs text-blue-400 hover:text-blue-300 transition-colors">
                  Create your first trip
                </Link>
              </div>
            )}
          </motion.div>
        </div>

        {/* Favorite Destinations */}
        {totalFavorites > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.5 }}
            className="mt-8 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 backdrop-blur-sm"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <FiHeart className="h-4 w-4 text-rose-400" />
                Favorite Destinations
              </h3>
              <Link href="/favorites" className="text-xs text-blue-400 hover:text-blue-300 transition-colors">
                View all
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              {favorites!.slice(0, 5).map((fav) => (
                <Link
                  key={fav._id}
                  href={`/explore/${fav.destinationId}`}
                  className="group overflow-hidden rounded-xl border border-zinc-800 bg-zinc-800/30 hover:border-zinc-700 transition-colors"
                >
                  {fav.destinationImage ? (
                    <div className="relative h-24 w-full overflow-hidden">
                      <img src={fav.destinationImage} alt={fav.destinationName} className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    </div>
                  ) : (
                    <div className="flex h-24 items-center justify-center bg-zinc-800">
                      <FiMap className="h-6 w-6 text-zinc-600" />
                    </div>
                  )}
                  <p className="px-3 py-2 text-xs font-medium text-zinc-300 truncate group-hover:text-blue-400 transition-colors">
                    {fav.destinationName}
                  </p>
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
