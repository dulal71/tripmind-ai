'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FiStar, FiMapPin, FiDollarSign } from 'react-icons/fi';
import FavoriteButton from '@/components/ui/FavoriteButton';

interface Destination {
  _id: string;
  name: string;
  country: string;
  continent: string;
  shortDescription: string;
  imageUrl: string;
  rating: number;
  reviewCount: number;
  categories: string[];
  averageCostPerDay: number;
  isFeatured: boolean;
}

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

export default function DestinationCard({ destination }: { destination: Destination }) {
  return (
    <motion.div
      whileHover={{ y: -6, scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/60 backdrop-blur-sm hover:border-zinc-700 hover:shadow-2xl hover:shadow-blue-500/5 transition-colors duration-300"
    >
      <Link href={`/explore/${destination._id}`} className="flex flex-col flex-1">
        {/* Image */}
        <div className="relative h-52 w-full overflow-hidden">
          <Image
            src={destination.imageUrl}
            alt={destination.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-110"
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-transparent to-transparent" />

          {/* Featured badge */}
          {destination.isFeatured && (
            <div className="absolute top-3 left-3 flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-3 py-1 text-xs font-bold text-white shadow-lg shadow-amber-500/30">
              <FiStar className="h-3 w-3" />
              Featured
            </div>
          )}

          {/* Continent pill */}
          <div className="absolute top-3 right-3 rounded-full bg-zinc-950/60 backdrop-blur-md border border-zinc-700/50 px-3 py-1 text-xs font-medium text-zinc-300">
            {destination.continent}
          </div>

          {/* Favorite button */}
          <div className="absolute bottom-3 right-3 z-10">
            <FavoriteButton destinationId={destination._id} size="sm" />
          </div>

          {/* Location overlay */}
          <div className="absolute bottom-3 left-3 flex items-center gap-1 text-white">
            <FiMapPin className="h-3.5 w-3.5 text-blue-400" />
            <span className="text-xs font-medium text-zinc-300">{destination.country}</span>
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-1 flex-col gap-2.5 p-5">
          <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors line-clamp-1">
            {destination.name}
          </h3>

          <p className="text-sm text-zinc-400 line-clamp-2 leading-relaxed">
            {destination.shortDescription}
          </p>

          {/* Rating + Cost */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-1.5">
              <div className="flex items-center gap-0.5 rounded-md bg-amber-500/10 px-2 py-0.5">
                <FiStar className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
                <span className="text-sm font-bold text-amber-400">{destination.rating}</span>
              </div>
              <span className="text-xs text-zinc-500">({destination.reviewCount.toLocaleString()})</span>
            </div>
            <div className="flex items-center gap-1 text-zinc-400">
              <FiDollarSign className="h-3.5 w-3.5" />
              <span className="text-sm font-semibold">${destination.averageCostPerDay}</span>
              <span className="text-xs text-zinc-500">/day</span>
            </div>
          </div>

          {/* Category Tags */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            {destination.categories.slice(0, 3).map((cat) => (
              <span
                key={cat}
                className={`rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize ${
                  categoryColors[cat] || 'bg-zinc-800 text-zinc-400 border-zinc-700'
                }`}
              >
                {cat}
              </span>
            ))}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
