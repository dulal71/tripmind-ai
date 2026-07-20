'use client';

import { motion } from 'framer-motion';
import { FiCompass } from 'react-icons/fi';

export default function ExploreDetailLoading() {
  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <div className="relative mx-auto mb-6">
          <div className="h-16 w-16 animate-spin rounded-full border-4 border-blue-500/20 border-t-blue-500" />
          <FiCompass className="absolute left-1/2 top-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2 text-blue-400" />
        </div>
        <h2 className="text-xl font-semibold text-white mb-2">Loading Destination</h2>
        <p className="text-sm text-zinc-400">Fetching destination details...</p>
      </motion.div>
    </div>
  );
}
