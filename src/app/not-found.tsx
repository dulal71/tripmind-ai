'use client';

import { motion } from 'framer-motion';
import { FiMapPin, FiHome, FiArrowLeft } from 'react-icons/fi';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-8 text-center max-w-md"
      >
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500/20 to-violet-500/20 border border-blue-500/20">
          <FiMapPin className="h-8 w-8 text-blue-400" />
        </div>
        <h1 className="text-4xl font-extrabold text-white mb-2">404</h1>
        <h2 className="text-xl font-semibold text-zinc-300 mb-2">Page Not Found</h2>
        <p className="text-sm text-zinc-400 mb-6">
          Looks like this destination doesn&apos;t exist. Let&apos;s get you back on track.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-zinc-800 bg-zinc-800/50 px-5 py-2.5 text-sm font-medium text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <FiArrowLeft className="h-4 w-4" />
            Go Back
          </button>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-500 transition-colors"
          >
            <FiHome className="h-4 w-4" />
            Go Home
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
