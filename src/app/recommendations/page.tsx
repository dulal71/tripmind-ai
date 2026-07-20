'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiStar,
  FiDollarSign,
  FiCompass,
  FiMap,
  FiLoader,
  FiAlertCircle,
  FiTrendingUp,
} from 'react-icons/fi';
import { authClient } from '@/lib/auth-client';
import { useGetRecommendations } from '@/hooks/useAI';
import { RecommendDestination, BUDGET_OPTIONS, STYLE_OPTIONS, INTEREST_OPTIONS } from '@/types/ai';
import Link from 'next/link';

export default function RecommendationsPage() {
  const { data: session } = authClient.useSession();
  const [budget, setBudget] = useState('moderate');
  const [travelStyle, setTravelStyle] = useState('cultural');
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [duration, setDuration] = useState(7);
  const [recommendations, setRecommendations] = useState<RecommendDestination[] | null>(null);

  const getRecommendations = useGetRecommendations();

  const toggleInterest = (interest: string) => {
    setSelectedInterests((prev) =>
      prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest]
    );
  };

  const handleGetRecommendations = async () => {
    if (selectedInterests.length === 0) return;
    try {
      const result = await getRecommendations.mutateAsync({
        budget,
        travelStyle,
        interests: selectedInterests,
        duration,
      });
      setRecommendations(result.recommendations);
    } catch {
      // Error handled by mutation
    }
  };

  const getMatchColor = (score: number) => {
    if (score >= 90) return 'text-green-400 bg-green-500/15 border-green-500/30';
    if (score >= 75) return 'text-blue-400 bg-blue-500/15 border-blue-500/30';
    if (score >= 60) return 'text-yellow-400 bg-yellow-500/15 border-yellow-500/30';
    return 'text-zinc-400 bg-zinc-500/15 border-zinc-500/30';
  };

  if (!session?.user) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center px-4">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-8 text-center max-w-md">
          <FiStar className="mx-auto h-12 w-12 text-zinc-600 mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">Sign in required</h2>
          <p className="text-sm text-zinc-400 mb-6">You need to be signed in to get AI recommendations.</p>
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
              <FiTrendingUp className="h-7 w-7 text-white" />
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl">
              AI <span className="bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">Recommendations</span>
            </h1>
            <p className="mx-auto mt-3 max-w-2xl text-base text-zinc-400 sm:text-lg">
              Get personalized destination recommendations based on your preferences and travel style.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Preferences Panel */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1"
          >
            <div className="sticky top-24 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6">
              <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                <FiCompass className="h-5 w-5 text-blue-400" />
                Your Preferences
              </h2>

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

              {/* Duration */}
              <div className="mb-5">
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Trip Duration: {duration} days
                </label>
                <input
                  id="recommend-duration"
                  type="range"
                  min="1"
                  max="30"
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  className="w-full accent-blue-500"
                />
                <div className="flex justify-between text-xs text-zinc-500 mt-1">
                  <span>1 day</span>
                  <span>30 days</span>
                </div>
              </div>

              {/* Interests */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Interests {selectedInterests.length === 0 && <span className="text-red-400">*</span>}
                </label>
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
                {selectedInterests.length === 0 && (
                  <p className="text-xs text-zinc-500 mt-2">Select at least one interest</p>
                )}
              </div>

              <button
                onClick={handleGetRecommendations}
                disabled={selectedInterests.length === 0 || getRecommendations.isPending}
                className="w-full flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-violet-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
              >
                {getRecommendations.isPending ? (
                  <>
                    <FiLoader className="h-4 w-4 animate-spin" />
                    Finding Destinations...
                  </>
                ) : (
                  <>
                    <FiStar className="h-4 w-4" />
                    Get Recommendations
                  </>
                )}
              </button>

              {getRecommendations.isError && (
                <div className="mt-3 rounded-lg border border-red-500/30 bg-red-500/10 p-3 flex items-start gap-2">
                  <FiAlertCircle className="h-4 w-4 text-red-400 mt-0.5 shrink-0" />
                  <p className="text-xs text-red-400">Failed to get recommendations. Make sure OPENAI_API_KEY is configured.</p>
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
              {getRecommendations.isPending ? (
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
                  <p className="mt-6 text-lg font-medium text-white">AI is finding perfect destinations...</p>
                  <p className="mt-2 text-sm text-zinc-400">Analyzing your preferences to find the best matches.</p>
                </motion.div>
              ) : recommendations ? (
                <motion.div
                  key="results"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  <h2 className="text-lg font-semibold text-white mb-4">
                    Recommended Destinations ({recommendations.length})
                  </h2>

                  {recommendations.map((rec, idx) => (
                    <motion.div
                      key={rec.name}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 hover:border-zinc-700 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-xl font-bold text-white">{rec.name}</h3>
                          <p className="text-sm text-zinc-400 flex items-center gap-1">
                            <FiMap className="h-3 w-3" />
                            {rec.country}, {rec.continent}
                          </p>
                        </div>
                        <span className={`inline-flex items-center rounded-full border px-3 py-1 text-sm font-bold ${getMatchColor(rec.matchScore)}`}>
                          {rec.matchScore}% Match
                        </span>
                      </div>

                      <p className="text-sm text-zinc-300 leading-relaxed mb-4">
                        {rec.shortDescription}
                      </p>

                      <div className="flex items-center gap-4 mb-3">
                        <div className="flex items-center gap-1.5 text-sm text-zinc-400">
                          <FiDollarSign className="h-4 w-4 text-yellow-400" />
                          ~${rec.estimatedDailyBudget}/day
                        </div>
                        <div className="flex items-center gap-1.5 text-sm text-zinc-400">
                          <FiStar className="h-4 w-4 text-violet-400" />
                          {rec.highlight}
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1.5">
                        {rec.bestFor.map((tag) => (
                          <span key={tag} className="rounded-full bg-zinc-800 px-2.5 py-0.5 text-xs font-medium text-zinc-300">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center py-20"
                >
                  <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-8 text-center max-w-md">
                    <FiTrendingUp className="mx-auto h-12 w-12 text-zinc-600 mb-4" />
                    <h3 className="text-lg font-semibold text-zinc-300">Discover Your Next Adventure</h3>
                    <p className="mt-2 text-sm text-zinc-500">
                      Set your preferences and interests on the left, then click Get Recommendations to receive personalized destination suggestions.
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
