'use client';

import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlus, FiMap, FiCalendar, FiUsers, FiTrash2, FiEdit3, FiClock } from 'react-icons/fi';
import { useTrips, useDeleteTrip } from '@/hooks/useTrips';
import { authClient } from '@/lib/auth-client';
import { Trip } from '@/types/trip';
import toast from 'react-hot-toast';

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

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function TripCardSkeleton() {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 animate-pulse">
      <div className="h-40 rounded-xl bg-zinc-800 mb-4" />
      <div className="h-5 w-3/4 rounded bg-zinc-800 mb-2" />
      <div className="h-4 w-1/2 rounded bg-zinc-800 mb-4" />
      <div className="flex gap-2">
        <div className="h-6 w-16 rounded-full bg-zinc-800" />
        <div className="h-6 w-20 rounded-full bg-zinc-800" />
      </div>
    </div>
  );
}

export default function TripsPage() {
  const { data: session } = authClient.useSession();
  const { data: trips, isLoading, isError } = useTrips();
  const deleteTrip = useDeleteTrip();

  if (!session?.user) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center px-4">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-8 text-center max-w-md">
          <FiMap className="mx-auto h-12 w-12 text-zinc-600 mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">Sign in required</h2>
          <p className="text-sm text-zinc-400 mb-6">You need to be signed in to view your trips.</p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-violet-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 transition-all"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete trip to ${name}?`)) return;
    try {
      await deleteTrip.mutateAsync(id);
      toast.success('Trip deleted');
    } catch {
      toast.error('Failed to delete trip');
    }
  };

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
            className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
          >
            <div>
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 shadow-lg shadow-blue-500/25">
                <FiMap className="h-7 w-7 text-white" />
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                My <span className="bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">Trips</span>
              </h1>
              <p className="mt-3 text-base text-zinc-400 sm:text-lg">
                Manage and view all your travel plans in one place.
              </p>
            </div>
            <Link
              href="/trips/new"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 hover:from-blue-500 hover:to-violet-500 active:scale-[0.98] transition-all self-start"
            >
              <FiPlus className="h-4 w-4" />
              Create Trip
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Trips Grid */}
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {isLoading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <TripCardSkeleton key={i} />
            ))}
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-8 text-center">
              <p className="text-lg font-semibold text-red-400">Failed to load trips</p>
              <p className="mt-2 text-sm text-zinc-500">Make sure the API server is running on port 5000.</p>
            </div>
          </div>
        ) : !trips || trips.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-8 text-center max-w-md">
              <FiMap className="mx-auto h-12 w-12 text-zinc-600 mb-4" />
              <p className="text-lg font-semibold text-zinc-300">No trips yet</p>
              <p className="mt-2 text-sm text-zinc-500">Start planning your next adventure!</p>
              <Link
                href="/trips/new"
                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 transition-colors"
              >
                <FiPlus className="h-4 w-4" />
                Create Your First Trip
              </Link>
            </div>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key="trips-grid"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
            >
              {trips.map((trip: Trip, i: number) => (
                <motion.div
                  key={trip._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: i * 0.05 }}
                >
                  <div className="group rounded-2xl border border-zinc-800 bg-zinc-900/60 overflow-hidden hover:border-zinc-700 transition-colors">
                    {/* Image */}
                    <div className="relative h-48 overflow-hidden">
                      {trip.destinationImage ? (
                        <img
                          src={trip.destinationImage}
                          alt={trip.destinationName}
                          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-zinc-800">
                          <FiMap className="h-12 w-12 text-zinc-600" />
                        </div>
                      )}
                      <div className="absolute top-3 right-3">
                        <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize ${statusColors[trip.status]}`}>
                          {trip.status}
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-5">
                      <h3 className="text-lg font-semibold text-white truncate">{trip.destinationName || 'Unknown Destination'}</h3>

                      <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-zinc-400">
                        <span className="flex items-center gap-1">
                          <FiCalendar className="h-3.5 w-3.5" />
                          {formatDate(trip.startDate)} – {formatDate(trip.endDate)}
                        </span>
                        <span className="flex items-center gap-1">
                          <FiClock className="h-3.5 w-3.5" />
                          {trip.duration} days
                        </span>
                        <span className="flex items-center gap-1">
                          <FiUsers className="h-3.5 w-3.5" />
                          {trip.travelerCount} traveler{trip.travelerCount > 1 ? 's' : ''}
                        </span>
                      </div>

                      <div className="mt-3 flex flex-wrap gap-1.5">
                        <span className="rounded-full bg-zinc-800 px-2.5 py-0.5 text-xs font-medium text-zinc-300 capitalize">
                          {budgetLabels[trip.budget]}
                        </span>
                        <span className="rounded-full bg-zinc-800 px-2.5 py-0.5 text-xs font-medium text-zinc-300 capitalize">
                          {trip.travelStyle}
                        </span>
                      </div>

                      {/* Actions */}
                      <div className="mt-4 flex items-center gap-2 border-t border-zinc-800 pt-4">
                        <Link
                          href={`/trips/${trip._id}`}
                          className="flex-1 rounded-lg bg-zinc-800 px-3 py-2 text-center text-xs font-medium text-zinc-300 hover:bg-zinc-700 hover:text-white transition-colors"
                        >
                          View
                        </Link>
                        <Link
                          href={`/trips/${trip._id}/edit`}
                          className="flex items-center justify-center rounded-lg border border-zinc-800 px-3 py-2 text-zinc-400 hover:text-blue-400 hover:border-blue-500/30 hover:bg-blue-500/10 transition-colors"
                        >
                          <FiEdit3 className="h-3.5 w-3.5" />
                        </Link>
                        <button
                          onClick={() => handleDelete(trip._id, trip.destinationName)}
                          disabled={deleteTrip.isPending}
                          className="flex items-center justify-center rounded-lg border border-zinc-800 px-3 py-2 text-zinc-400 hover:text-red-400 hover:border-red-500/30 hover:bg-red-500/10 transition-colors disabled:opacity-50 cursor-pointer"
                        >
                          <FiTrash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
