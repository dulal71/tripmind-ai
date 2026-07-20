'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  FiArrowLeft,
  FiCalendar,
  FiClock,
  FiUsers,
  FiDollarSign,
  FiEdit3,
  FiTrash2,
  FiMap,
  FiCompass,
  FiStar,
  FiCheckCircle,
  FiPackage,
  FiThermometer,
  FiLoader,
  FiAlertCircle,
} from 'react-icons/fi';
import { useTrip, useDeleteTrip } from '@/hooks/useTrips';
import { useGenerateTripItinerary } from '@/hooks/useAI';
import { authClient } from '@/lib/auth-client';
import toast from 'react-hot-toast';
import { Itinerary } from '@/types/ai';

const statusColors: Record<string, string> = {
  planning: 'bg-yellow-500/15 text-yellow-400 border border-yellow-500/30',
  upcoming: 'bg-blue-500/15 text-blue-400 border border-blue-500/30',
  completed: 'bg-green-500/15 text-green-400 border border-green-500/30',
  cancelled: 'bg-red-500/15 text-red-400 border border-red-500/30',
};

const budgetLabels: Record<string, string> = {
  economy: 'Economy',
  budget: 'Budget',
  moderate: 'Moderate',
  luxury: 'Luxury',
};

const styleLabels: Record<string, string> = {
  adventure: 'Adventure',
  cultural: 'Cultural',
  relaxation: 'Relaxation',
  family: 'Family',
  romantic: 'Romantic',
  solo: 'Solo',
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatDateShort(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

function ItineraryDisplay({ itinerary }: { itinerary: Itinerary }) {
  return (
    <div className="space-y-6">
      {/* Budget Analysis */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <FiDollarSign className="h-5 w-5 text-yellow-400" />
          Budget Estimate
        </h3>
        <div className="text-3xl font-bold text-white mb-4">
          {itinerary.budgetAnalysis.currency} {itinerary.budgetAnalysis.totalEstimatedCost.toLocaleString()}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {itinerary.budgetAnalysis.breakdown.map((item) => (
            <div key={item.category} className="rounded-lg bg-zinc-800/50 p-3">
              <p className="text-xs text-zinc-500 uppercase tracking-wider">{item.category}</p>
              <p className="text-sm font-semibold text-white mt-1">
                {itinerary.budgetAnalysis.currency} {item.amount}
              </p>
              <div className="mt-2 h-1.5 rounded-full bg-zinc-700">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-blue-500 to-violet-500"
                  style={{ width: `${item.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Day-by-Day Itinerary */}
      {itinerary.days.map((day) => (
        <div key={day.dayNumber} className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/20 to-violet-500/20">
              <FiCalendar className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Day {day.dayNumber}</h3>
              <p className="text-sm text-zinc-400">{day.theme}</p>
            </div>
          </div>
          <div className="space-y-3">
            {day.activities.map((activity, idx) => (
              <div key={idx} className="flex gap-3 rounded-lg bg-zinc-800/30 p-3">
                <div className="flex items-center gap-1.5 text-xs text-zinc-500 whitespace-nowrap min-w-[70px]">
                  <FiClock className="h-3 w-3" />
                  {activity.time}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-white">{activity.title}</p>
                  <p className="text-xs text-zinc-400 mt-0.5">{activity.description}</p>
                  {activity.location && (
                    <p className="text-xs text-zinc-500 mt-1 flex items-center gap-1">
                      <FiMap className="h-3 w-3" /> {activity.location}
                    </p>
                  )}
                </div>
                {activity.cost !== undefined && (
                  <span className="text-xs font-medium text-yellow-400 whitespace-nowrap">
                    ${activity.cost}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Packing List & Tips */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <FiPackage className="h-5 w-5 text-green-400" />
            Packing List
          </h3>
          <ul className="space-y-2">
            {itinerary.packingList.map((item, idx) => (
              <li key={idx} className="flex items-center gap-2 text-sm text-zinc-300">
                <FiCheckCircle className="h-4 w-4 text-green-400 shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <FiThermometer className="h-5 w-5 text-orange-400" />
            AI Travel Tips
          </h3>
          <ul className="space-y-2">
            {itinerary.aiTips.map((tip, idx) => (
              <li key={idx} className="text-sm text-zinc-300 leading-relaxed">
                {tip}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default function TripDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { data: session } = authClient.useSession();
  const { data: trip, isLoading, isError } = useTrip(id);
  const deleteTrip = useDeleteTrip();
  const generateTripItinerary = useGenerateTripItinerary();

  if (!session?.user) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center px-4">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-8 text-center max-w-md">
          <FiMap className="mx-auto h-12 w-12 text-zinc-600 mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">Sign in required</h2>
          <p className="text-sm text-zinc-400 mb-6">You need to be signed in to view trip details.</p>
          <Link href="/login" className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-violet-600 px-6 py-2.5 text-sm font-semibold text-white">
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
      </div>
    );
  }

  if (isError || !trip) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center px-4">
        <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-8 text-center">
          <p className="text-lg font-semibold text-red-400">Trip not found</p>
          <Link href="/trips" className="mt-4 inline-block text-sm text-blue-400 hover:text-blue-300">
            Back to My Trips
          </Link>
        </div>
      </div>
    );
  }

  const handleDelete = async () => {
    if (!confirm('Delete this trip?')) return;
    try {
      await deleteTrip.mutateAsync(id);
      toast.success('Trip deleted');
      router.push('/trips');
    } catch {
      toast.error('Failed to delete trip');
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Hero */}
      <div className="relative h-64 sm:h-80 overflow-hidden">
        {trip.destinationImage ? (
          <img
            src={trip.destinationImage}
            alt={trip.destinationName}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-zinc-800">
            <FiMap className="h-16 w-16 text-zinc-600" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-transparent" />

        <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10">
          <div className="mx-auto max-w-4xl">
            <Link href="/trips" className="inline-flex items-center gap-1.5 text-sm text-zinc-400 hover:text-white transition-colors mb-4">
              <FiArrowLeft className="h-4 w-4" />
              My Trips
            </Link>

            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
              <div>
                <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                  {trip.destinationName || 'Unknown Destination'}
                </h1>
                <div className="mt-2 flex items-center gap-3">
                  <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold capitalize ${statusColors[trip.status]}`}>
                    {trip.status}
                  </span>
                  <span className="text-sm text-zinc-400">
                    {formatDateShort(trip.startDate)} – {formatDateShort(trip.endDate)}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  href={`/trips/${id}/edit`}
                  className="flex items-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-800/80 px-4 py-2 text-sm font-medium text-zinc-300 hover:text-white hover:border-zinc-600 transition-colors"
                >
                  <FiEdit3 className="h-4 w-4" />
                  Edit
                </Link>
                <button
                  onClick={handleDelete}
                  disabled={deleteTrip.isPending}
                  className="flex items-center gap-1.5 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm font-medium text-red-400 hover:bg-red-500/20 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  <FiTrash2 className="h-4 w-4" />
                  {deleteTrip.isPending ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        {/* Quick Info Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-4"
        >
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
            <FiCalendar className="h-5 w-5 text-blue-400 mb-2" />
            <p className="text-xs text-zinc-500 uppercase tracking-wider">Dates</p>
            <p className="text-sm font-medium text-white mt-1">{formatDate(trip.startDate)}</p>
            <p className="text-xs text-zinc-400">to {formatDate(trip.endDate)}</p>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
            <FiClock className="h-5 w-5 text-violet-400 mb-2" />
            <p className="text-xs text-zinc-500 uppercase tracking-wider">Duration</p>
            <p className="text-sm font-medium text-white mt-1">{trip.duration} days</p>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
            <FiUsers className="h-5 w-5 text-green-400 mb-2" />
            <p className="text-xs text-zinc-500 uppercase tracking-wider">Travelers</p>
            <p className="text-sm font-medium text-white mt-1">{trip.travelerCount}</p>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
            <FiDollarSign className="h-5 w-5 text-yellow-400 mb-2" />
            <p className="text-xs text-zinc-500 uppercase tracking-wider">Budget</p>
            <p className="text-sm font-medium text-white mt-1">{budgetLabels[trip.budget]}</p>
          </div>
        </motion.div>

        {/* Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-6"
        >
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6">
            <h3 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider mb-3">Travel Style</h3>
            <div className="flex items-center gap-2">
              <FiCompass className="h-5 w-5 text-blue-400" />
              <span className="text-lg font-medium text-white capitalize">{styleLabels[trip.travelStyle]}</span>
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6">
            <h3 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider mb-3">Interests</h3>
            <div className="flex flex-wrap gap-1.5">
              {trip.interests.length > 0 ? (
                trip.interests.map((interest) => (
                  <span key={interest} className="rounded-full bg-zinc-800 px-3 py-1 text-xs font-medium text-zinc-300">
                    {interest}
                  </span>
                ))
              ) : (
                <span className="text-sm text-zinc-500">No interests selected</span>
              )}
            </div>
          </div>
        </motion.div>

        {/* AI Itinerary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-8"
        >
          {trip.aiItinerary ? (
            <ItineraryDisplay itinerary={trip.aiItinerary} />
          ) : (
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-8">
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/20 to-violet-500/20">
                  <FiStar className="h-6 w-6 text-blue-400" />
                </div>
                <h3 className="text-lg font-semibold text-white">AI Itinerary</h3>
                <p className="mt-2 text-sm text-zinc-400 max-w-md mx-auto">
                  Generate a personalized day-by-day itinerary with activities, budget analysis, packing lists, and travel tips.
                </p>
                <button
                  onClick={async () => {
                    try {
                      await generateTripItinerary.mutateAsync(id);
                      toast.success('Itinerary generated!');
                    } catch {
                      toast.error('Failed to generate itinerary');
                    }
                  }}
                  disabled={generateTripItinerary.isPending}
                  className="mt-6 inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-violet-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 disabled:opacity-50 transition-all cursor-pointer"
                >
                  {generateTripItinerary.isPending ? (
                    <>
                      <FiLoader className="h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <FiStar className="h-4 w-4" />
                      Generate AI Itinerary
                    </>
                  )}
                </button>
                {generateTripItinerary.isError && (
                  <p className="mt-3 text-xs text-red-400 flex items-center justify-center gap-1">
                    <FiAlertCircle className="h-3 w-3" />
                    Failed. Ensure OPENAI_API_KEY is set in server .env.
                  </p>
                )}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
