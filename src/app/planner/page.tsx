'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiMap,
  FiCalendar,
  FiDollarSign,
  FiCompass,
  FiStar,
  FiClock,
  FiCheckCircle,
  FiLoader,
  FiAlertCircle,
  FiChevronDown,
  FiPackage,
  FiThermometer,
  FiSave,
} from 'react-icons/fi';
import { authClient } from '@/lib/auth-client';
import { useGenerateItinerary } from '@/hooks/useAI';
import { Itinerary, BUDGET_OPTIONS, STYLE_OPTIONS, INTEREST_OPTIONS } from '@/types/ai';
import api from '@/lib/api';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

interface Destination {
  _id: string;
  name: string;
  country: string;
  continent: string;
  imageUrl: string;
}

export default function PlannerPage() {
  const { data: session } = authClient.useSession();
  const router = useRouter();
  const [destinationId, setDestinationId] = useState('');
  const [duration, setDuration] = useState(5);
  const [budget, setBudget] = useState('moderate');
  const [travelStyle, setTravelStyle] = useState('cultural');
  const [travelerCount, setTravelerCount] = useState(1);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [itinerary, setItinerary] = useState<Itinerary | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const generateItinerary = useGenerateItinerary();

  const { data: destinationsData } = useQuery({
    queryKey: ['destinations-list'],
    queryFn: async () => {
      const { data } = await api.get<{ status: string; data: Destination[] }>('/api/destinations', {
        params: { limit: 100, sort: 'name-asc' },
      });
      return data.data;
    },
  });

  const toggleInterest = (interest: string) => {
    setSelectedInterests((prev) =>
      prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest]
    );
  };

  const handleGenerate = async () => {
    if (!destinationId) return;
    try {
      const result = await generateItinerary.mutateAsync({
        destinationId,
        duration,
        budget,
        travelStyle,
        travelerCount,
        interests: selectedInterests,
      });
      setItinerary(result);
    } catch {
      // Error handled by mutation
    }
  };

  const handleSaveToTrip = async () => {
    if (!destinationId || !itinerary) return;
    setIsSaving(true);
    try {
      // Create a trip with the generated itinerary
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(startDate.getDate() + duration);

      const { data } = await api.post('/api/trips', {
        destinationId,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        budget,
        travelStyle,
        travelerCount,
        interests: selectedInterests,
      });

      // Save the itinerary to the trip
      const tripId = data.data._id;
      await api.post(`/api/ai/trip/${tripId}/itinerary`);

      toast.success('Itinerary saved to your trips!');
      router.push(`/trips/${tripId}`);
    } catch {
      toast.error('Failed to save itinerary. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (!session?.user) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center px-4">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-8 text-center max-w-md">
          <FiMap className="mx-auto h-12 w-12 text-zinc-600 mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">Sign in required</h2>
          <p className="text-sm text-zinc-400 mb-6">You need to be signed in to use the AI Planner.</p>
          <Link href="/login" className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-violet-600 px-6 py-2.5 text-sm font-semibold text-white">
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Hero */}
      <div className="relative overflow-hidden border-b border-zinc-800/60">
        <div className="absolute top-[-40%] left-[-20%] w-[60%] h-[80%] rounded-full bg-blue-500/8 blur-[100px]" />
        <div className="absolute bottom-[-30%] right-[-15%] w-[50%] h-[70%] rounded-full bg-violet-500/8 blur-[100px]" />
        <div className="relative mx-auto max-w-7xl px-4 pb-8 pt-12 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 shadow-lg shadow-blue-500/25">
              <FiStar className="h-7 w-7 text-white" />
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl">
              AI Travel <span className="bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">Planner</span>
            </h1>
            <p className="mx-auto mt-3 max-w-2xl text-base text-zinc-400 sm:text-lg">
              Let AI create a personalized day-by-day itinerary tailored to your preferences.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form Panel */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1"
          >
            <div className="sticky top-24 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6">
              <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                <FiCompass className="h-5 w-5 text-blue-400" />
                Trip Details
              </h2>

              {/* Destination */}
              <div className="mb-5">
                <label className="block text-sm font-medium text-zinc-300 mb-2">Destination</label>
                <div className="relative">
                  <select
                    id="planner-destination"
                    value={destinationId}
                    onChange={(e) => setDestinationId(e.target.value)}
                    className="w-full appearance-none rounded-lg border border-zinc-800 bg-zinc-800/50 py-2.5 pl-3 pr-10 text-sm text-white focus:border-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                    style={{ colorScheme: 'dark' }}
                  >
                    <option value="" className="bg-zinc-900 text-zinc-300">Select a destination</option>
                    {destinationsData?.map((d) => (
                      <option key={d._id} value={d._id} className="bg-zinc-900 text-zinc-300">{d.name}, {d.country}</option>
                    ))}
                  </select>
                  <FiChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                </div>
                {!destinationsData && (
                  <p className="text-xs text-zinc-500 mt-1.5">Loading destinations...</p>
                )}
              </div>

              {/* Duration */}
              <div className="mb-5">
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Duration: {duration} days
                </label>
                <input
                  id="planner-duration"
                  type="range"
                  min="1"
                  max="21"
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  className="w-full accent-blue-500"
                />
                <div className="flex justify-between text-xs text-zinc-500 mt-1">
                  <span>1 day</span>
                  <span>21 days</span>
                </div>
              </div>

              {/* Budget */}
              <div className="mb-5">
                <label className="block text-sm font-medium text-zinc-300 mb-2">Budget Level</label>
                <div className="grid grid-cols-2 gap-2">
                  {BUDGET_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setBudget(opt.value)}
                      className={`rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                        budget === opt.value
                          ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25'
                          : 'border border-zinc-800 bg-zinc-800/50 text-zinc-400 hover:text-white hover:border-zinc-700'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Travel Style */}
              <div className="mb-5">
                <label className="block text-sm font-medium text-zinc-300 mb-2">Travel Style</label>
                <div className="grid grid-cols-2 gap-2">
                  {STYLE_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setTravelStyle(opt.value)}
                      className={`rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                        travelStyle === opt.value
                          ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/25'
                          : 'border border-zinc-800 bg-zinc-800/50 text-zinc-400 hover:text-white hover:border-zinc-700'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Travelers */}
              <div className="mb-5">
                <label className="block text-sm font-medium text-zinc-300 mb-2">Travelers</label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setTravelerCount(Math.max(1, travelerCount - 1))}
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-800/50 text-zinc-400 hover:text-white hover:border-zinc-700 transition-colors"
                  >
                    -
                  </button>
                  <span className="text-lg font-semibold text-white w-8 text-center">{travelerCount}</span>
                  <button
                    onClick={() => setTravelerCount(Math.min(10, travelerCount + 1))}
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-800/50 text-zinc-400 hover:text-white hover:border-zinc-700 transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Interests */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-zinc-300 mb-2">Interests</label>
                <div className="flex flex-wrap gap-1.5">
                  {INTEREST_OPTIONS.map((interest) => (
                    <button
                      key={interest}
                      onClick={() => toggleInterest(interest)}
                      className={`rounded-full px-3 py-1 text-xs font-medium transition-all ${
                        selectedInterests.includes(interest)
                          ? 'bg-blue-600 text-white'
                          : 'border border-zinc-800 bg-zinc-800/50 text-zinc-400 hover:text-white hover:border-zinc-700'
                      }`}
                    >
                      {interest}
                    </button>
                  ))}
                </div>
              </div>

              {/* Generate Button */}
              <button
                onClick={handleGenerate}
                disabled={!destinationId || generateItinerary.isPending}
                className="w-full flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-violet-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
              >
                {generateItinerary.isPending ? (
                  <>
                    <FiLoader className="h-4 w-4 animate-spin" />
                    Generating Itinerary...
                  </>
                ) : (
                  <>
                    <FiStar className="h-4 w-4" />
                    Generate AI Itinerary
                  </>
                )}
              </button>

              {generateItinerary.isError && (
                <div className="mt-3 rounded-lg border border-red-500/30 bg-red-500/10 p-3 flex items-start gap-2">
                  <FiAlertCircle className="h-4 w-4 text-red-400 mt-0.5 shrink-0" />
                  <p className="text-xs text-red-400">Failed to generate itinerary. Make sure OPENAI_API_KEY is configured in the server.</p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Results Panel */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2"
          >
            <AnimatePresence mode="wait">
              {generateItinerary.isPending ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center py-20"
                >
                  <div className="relative">
                    <div className="h-16 w-16 animate-spin rounded-full border-4 border-blue-500/20 border-t-blue-500" />
                    <FiStar className="absolute left-1/2 top-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2 text-blue-400" />
                  </div>
                  <p className="mt-6 text-lg font-medium text-white">AI is crafting your itinerary...</p>
                  <p className="mt-2 text-sm text-zinc-400">This may take a moment. Creating a personalized plan just for you.</p>
                </motion.div>
              ) : itinerary ? (
                <motion.div
                  key="results"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
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

                  {/* Save to Trip Button */}
                  <div className="flex justify-center">
                    <button
                      onClick={handleSaveToTrip}
                      disabled={isSaving}
                      className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 hover:from-emerald-500 hover:to-teal-500 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSaving ? (
                        <>
                          <FiLoader className="h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <FiSave className="h-4 w-4" />
                          Save to My Trips
                        </>
                      )}
                    </button>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center py-20"
                >
                  <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-8 text-center max-w-md">
                    <FiStar className="mx-auto h-12 w-12 text-zinc-600 mb-4" />
                    <h3 className="text-lg font-semibold text-zinc-300">Your AI Itinerary</h3>
                    <p className="mt-2 text-sm text-zinc-500">
                      Select a destination and preferences on the left, then click Generate to create your personalized travel plan.
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
