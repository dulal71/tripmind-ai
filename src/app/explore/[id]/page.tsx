'use client';

import { useQuery } from '@tanstack/react-query';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import api from '@/lib/api';
import {
  FiArrowLeft,
  FiStar,
  FiMapPin,
  FiDollarSign,
  FiClock,
  FiGlobe,
  FiMap,
  FiCalendar,
  FiCheckCircle,
} from 'react-icons/fi';

const categoryColors: Record<string, string> = {
  beach: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/20',
  mountain: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
  city: 'bg-amber-500/15 text-amber-400 border-amber-500/20',
  cultural: 'bg-purple-500/15 text-purple-400 border-purple-500/20',
  adventure: 'bg-orange-500/15 text-orange-400 border-orange-500/20',
  nature: 'bg-green-500/15 text-green-400 border-green-500/20',
  island: 'bg-teal-500/15 text-teal-400 border-teal-500/20',
  desert: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/20',
};

function DetailSkeleton() {
  return (
    <div className="min-h-screen bg-zinc-950 animate-pulse">
      <div className="relative h-[50vh] w-full bg-zinc-800" />
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="h-8 w-64 rounded-lg bg-zinc-800 mb-4" />
        <div className="h-4 w-full rounded bg-zinc-800 mb-2" />
        <div className="h-4 w-5/6 rounded bg-zinc-800 mb-2" />
        <div className="h-4 w-3/4 rounded bg-zinc-800 mb-8" />
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-24 rounded-xl bg-zinc-800" />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function DestinationDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const { data, isLoading, isError } = useQuery({
    queryKey: ['destination', id],
    queryFn: async () => {
      const { data } = await api.get(`/api/destinations/${id}`);
      return data.data;
    },
    enabled: !!id,
  });

  if (isLoading) return <DetailSkeleton />;

  if (isError || !data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950">
        <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-8 text-center">
          <p className="text-lg font-semibold text-red-400">Destination not found</p>
          <Link
            href="/explore"
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 transition-colors"
          >
            <FiArrowLeft className="h-4 w-4" />
            Back to Explore
          </Link>
        </div>
      </div>
    );
  }

  const dest = data;

  const infoItems = [
    { icon: FiCalendar, label: 'Best Time', value: dest.bestTimeToVisit, color: 'text-blue-400' },
    { icon: FiDollarSign, label: 'Avg. Cost/Day', value: `$${dest.averageCostPerDay}`, color: 'text-green-400' },
    { icon: FiGlobe, label: 'Currency', value: dest.currency, color: 'text-violet-400' },
    { icon: FiMap, label: 'Language', value: dest.language, color: 'text-amber-400' },
    { icon: FiClock, label: 'Timezone', value: dest.timezone, color: 'text-cyan-400' },
    { icon: FiMapPin, label: 'Coordinates', value: `${dest.coordinates.lat.toFixed(4)}°, ${dest.coordinates.lng.toFixed(4)}°`, color: 'text-pink-400' },
  ];

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Hero Image */}
      <div className="relative h-[50vh] w-full overflow-hidden">
        <Image
          src={dest.imageUrl}
          alt={dest.name}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent" />

        {/* Back button */}
        <Link
          href="/explore"
          className="absolute top-6 left-6 z-10 flex items-center gap-2 rounded-xl bg-zinc-950/60 backdrop-blur-md border border-zinc-700/50 px-4 py-2.5 text-sm font-medium text-white hover:bg-zinc-900/80 transition-colors"
        >
          <FiArrowLeft className="h-4 w-4" />
          Back
        </Link>

        {/* Title overlay */}
        <div className="absolute bottom-0 left-0 right-0 z-10 p-6 sm:p-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="mx-auto max-w-5xl">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                {dest.isFeatured && (
                  <span className="flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-3 py-1 text-xs font-bold text-white shadow-lg shadow-amber-500/30">
                    <FiStar className="h-3 w-3" />
                    Featured
                  </span>
                )}
                <span className="rounded-full border border-zinc-600/50 bg-zinc-900/50 backdrop-blur-sm px-3 py-1 text-xs font-medium text-zinc-300">
                  {dest.continent}
                </span>
              </div>
              <h1 className="text-3xl font-extrabold text-white sm:text-4xl lg:text-5xl">
                {dest.name}
              </h1>
              <div className="mt-2 flex items-center gap-3">
                <div className="flex items-center gap-1 text-zinc-300">
                  <FiMapPin className="h-4 w-4 text-blue-400" />
                  <span className="text-sm">{dest.country}</span>
                </div>
                <div className="flex items-center gap-1">
                  <FiStar className="h-4 w-4 text-amber-400 fill-amber-400" />
                  <span className="text-sm font-bold text-amber-400">{dest.rating}</span>
                  <span className="text-sm text-zinc-500">({dest.reviewCount.toLocaleString()} reviews)</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="space-y-10"
        >
          {/* Category Tags */}
          <div className="flex flex-wrap gap-2">
            {dest.categories.map((cat: string) => (
              <span
                key={cat}
                className={`rounded-full border px-3 py-1 text-sm font-medium capitalize ${
                  categoryColors[cat] || 'bg-zinc-800 text-zinc-400 border-zinc-700'
                }`}
              >
                {cat}
              </span>
            ))}
          </div>

          {/* Description */}
          <div>
            <h2 className="text-xl font-bold text-white mb-3">About</h2>
            <p className="text-zinc-400 leading-relaxed text-base">{dest.description}</p>
          </div>

          {/* Image Gallery */}
          {dest.gallery && dest.gallery.length > 0 && (
            <div>
              <h2 className="text-xl font-bold text-white mb-4">Gallery</h2>
              <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide">
                {dest.gallery.map((img: string, i: number) => (
                  <div
                    key={i}
                    className="relative h-48 w-72 flex-shrink-0 snap-start overflow-hidden rounded-xl border border-zinc-800"
                  >
                    <Image
                      src={img}
                      alt={`${dest.name} gallery ${i + 1}`}
                      fill
                      sizes="288px"
                      className="object-cover hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Info Grid */}
          <div>
            <h2 className="text-xl font-bold text-white mb-4">Quick Info</h2>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
              {infoItems.map((item) => (
                <div
                  key={item.label}
                  className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 backdrop-blur-sm"
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <item.icon className={`h-4 w-4 ${item.color}`} />
                    <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">{item.label}</span>
                  </div>
                  <p className="text-sm font-semibold text-zinc-200">{item.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Highlights */}
          {dest.highlights && dest.highlights.length > 0 && (
            <div>
              <h2 className="text-xl font-bold text-white mb-4">Highlights</h2>
              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                {dest.highlights.map((h: string) => (
                  <div
                    key={h}
                    className="flex items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900/60 px-4 py-3 backdrop-blur-sm"
                  >
                    <FiCheckCircle className="h-5 w-5 flex-shrink-0 text-blue-400" />
                    <span className="text-sm font-medium text-zinc-300">{h}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
