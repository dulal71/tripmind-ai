'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { FiHeart, FiMap, FiArrowRight, FiStar, FiDollarSign } from 'react-icons/fi';
import { useFavorites, useRemoveFavorite } from '@/hooks/useFavorites';
import { authClient } from '@/lib/auth-client';
import toast from 'react-hot-toast';

export default function FavoritesPage() {
  const { data: session } = authClient.useSession();
  const { data: favorites, isLoading } = useFavorites();
  const removeFavorite = useRemoveFavorite();

  if (!session?.user) {
    return (
      <div className="min-h-screen bg-white dark:bg-zinc-950 flex flex-col items-center justify-center px-4">
        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 p-8 text-center max-w-md">
          <FiHeart className="mx-auto h-12 w-12 text-zinc-300 dark:text-zinc-600 mb-4" />
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-white mb-2">Sign in required</h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">You need to be signed in to view your favorites.</p>
          <Link href="/login" className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-violet-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 transition-all">
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  const handleRemove = async (destinationId: string, name: string) => {
    try {
      await removeFavorite.mutateAsync(destinationId);
      toast.success(`Removed ${name} from favorites`);
    } catch {
      toast.error('Failed to remove favorite');
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950">
      <div className="relative overflow-hidden border-b border-zinc-200 dark:border-zinc-800/60">
        <div className="absolute top-[-40%] left-[-20%] w-[60%] h-[80%] rounded-full bg-blue-500/8 blur-[100px]" />
        <div className="absolute bottom-[-30%] right-[-15%] w-[50%] h-[70%] rounded-full bg-violet-500/8 blur-[100px]" />

        <div className="relative mx-auto max-w-7xl px-4 pb-8 pt-12 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500 to-pink-600 shadow-lg shadow-rose-500/25">
              <FiHeart className="h-7 w-7 text-white" />
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white sm:text-4xl">
              My <span className="bg-gradient-to-r from-rose-400 to-pink-400 bg-clip-text text-transparent">Favorites</span>
            </h1>
            <p className="mt-3 text-base text-zinc-500 dark:text-zinc-400 sm:text-lg">Destinations you&apos;ve saved for your future adventures.</p>
          </motion.div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {isLoading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 p-6 animate-pulse">
                <div className="h-48 rounded-xl bg-zinc-200 dark:bg-zinc-800 mb-4" />
                <div className="h-5 w-3/4 rounded bg-zinc-200 dark:bg-zinc-800 mb-2" />
                <div className="h-4 w-1/2 rounded bg-zinc-200 dark:bg-zinc-800" />
              </div>
            ))}
          </div>
        ) : !favorites || favorites.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 p-8 text-center max-w-md">
              <FiHeart className="mx-auto h-12 w-12 text-zinc-300 dark:text-zinc-600 mb-4" />
              <p className="text-lg font-semibold text-zinc-700 dark:text-zinc-300">No favorites yet</p>
              <p className="mt-2 text-sm text-zinc-500">Start exploring and save destinations you love!</p>
              <Link href="/explore" className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 transition-colors">
                <FiArrowRight className="h-4 w-4" />
                Explore Destinations
              </Link>
            </div>
          </div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {favorites.map((fav, i) => (
              <motion.div
                key={fav._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: i * 0.05 }}
                className="group rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 overflow-hidden hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors"
              >
                <Link href={`/explore/${fav.destinationId}`}>
                  {fav.destinationImage ? (
                    <div className="relative h-48 overflow-hidden">
                      <img src={fav.destinationImage} alt={fav.destinationName} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    </div>
                  ) : (
                    <div className="flex h-48 items-center justify-center bg-zinc-100 dark:bg-zinc-800">
                      <FiMap className="h-12 w-12 text-zinc-300 dark:text-zinc-600" />
                    </div>
                  )}
                </Link>
                <div className="p-5 flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <Link href={`/explore/${fav.destinationId}`}>
                      <h3 className="text-lg font-semibold text-zinc-900 dark:text-white truncate group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors">
                        {fav.destinationName || 'Unknown Destination'}
                      </h3>
                    </Link>
                    {fav.destinationCountry && (
                      <p className="text-xs text-zinc-400 dark:text-zinc-500 flex items-center gap-1 mt-1">
                        <FiMap className="h-3 w-3" />
                        {fav.destinationCountry}
                      </p>
                    )}
                    <div className="flex items-center gap-3 mt-2">
                      {fav.destinationRating > 0 && (
                        <span className="flex items-center gap-1 text-xs text-zinc-500 dark:text-zinc-400">
                          <FiStar className="h-3 w-3 text-yellow-400" />
                          {fav.destinationRating}
                        </span>
                      )}
                      {fav.destinationCostPerDay > 0 && (
                        <span className="flex items-center gap-1 text-xs text-zinc-500 dark:text-zinc-400">
                          <FiDollarSign className="h-3 w-3 text-green-400" />
                          ${fav.destinationCostPerDay}/day
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemove(fav.destinationId, fav.destinationName)}
                    disabled={removeFavorite.isPending}
                    className="ml-3 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors disabled:opacity-50 cursor-pointer"
                    title="Remove from favorites"
                  >
                    <FiHeart className="h-4 w-4 fill-red-400" />
                  </button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
