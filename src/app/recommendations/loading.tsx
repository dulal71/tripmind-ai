'use client';

import { motion } from 'framer-motion';
import { FiTrendingUp } from 'react-icons/fi';

export default function RecommendationsLoading() {
  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <div className="relative mx-auto mb-6">
          <div className="h-16 w-16 animate-spin rounded-full border-4 border-blue-500/20 border-t-blue-500" />
          <FiTrendingUp className="absolute left-1/2 top-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2 text-blue-400" />
        </div>
        <h2 className="text-xl font-semibold text-white mb-2">Loading Recommendations</h2>
        <p className="text-sm text-zinc-400">Finding perfect destinations for you...</p>
      </motion.div>
    </div>
  );
}
