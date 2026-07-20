'use client';

import { useQuery } from '@tanstack/react-query';
import { useState, useCallback, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiSearch,
  FiFilter,
  FiChevronDown,
  FiChevronLeft,
  FiChevronRight,
  FiX,
  FiGlobe,
  FiCompass,
} from 'react-icons/fi';
import DestinationCard from '@/components/destinations/DestinationCard';
import DestinationCardSkeleton from '@/components/destinations/DestinationCardSkeleton';
import api from '@/lib/api';

const continents = ['Africa', 'Asia', 'Europe', 'North America', 'South America', 'Oceania'];
const categories = ['beach', 'mountain', 'city', 'cultural', 'adventure', 'nature', 'island', 'desert'];
const seasons = ['Spring', 'Summer', 'Fall', 'Winter', 'Year-round'];
const sortOptions = [
  { value: 'rating-desc', label: 'Top Rated' },
  { value: 'rating-asc', label: 'Lowest Rated' },
  { value: 'cost-asc', label: 'Price: Low → High' },
  { value: 'cost-desc', label: 'Price: High → Low' },
  { value: 'name-asc', label: 'Name: A → Z' },
  { value: 'name-desc', label: 'Name: Z → A' },
];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface PaginatedResponse {
  status: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    limit: number;
  };
}

export default function ExplorePage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [continent, setContinent] = useState(searchParams.get('continent') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [season, setSeason] = useState(searchParams.get('season') || '');
  const [sort, setSort] = useState(searchParams.get('sort') || 'rating-desc');
  const [page, setPage] = useState(parseInt(searchParams.get('page') || '1', 10));
  const [debouncedSearch, setDebouncedSearch] = useState(search);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  // Sync URL params
  const syncParams = useCallback(() => {
    const params = new URLSearchParams();
    if (debouncedSearch) params.set('search', debouncedSearch);
    if (continent) params.set('continent', continent);
    if (category) params.set('category', category);
    if (season) params.set('season', season);
    if (sort !== 'rating-desc') params.set('sort', sort);
    if (page > 1) params.set('page', page.toString());
    const qs = params.toString();
    router.replace(`/explore${qs ? `?${qs}` : ''}`, { scroll: false });
  }, [debouncedSearch, continent, category, season, sort, page, router]);

  useEffect(() => {
    syncParams();
  }, [syncParams]);

  const { data, isLoading, isError } = useQuery<PaginatedResponse>({
    queryKey: ['destinations', debouncedSearch, continent, category, season, sort, page],
    queryFn: async () => {
      const params: Record<string, string> = { page: page.toString(), limit: '12', sort };
      if (debouncedSearch) params.search = debouncedSearch;
      if (continent) params.continent = continent;
      if (category) params.category = category;
      if (season) params.season = season;
      const { data } = await api.get('/api/destinations', { params });
      return data;
    },
  });

  const destinations = data?.data || [];
  const pagination = data?.pagination;
  const hasActiveFilters = continent || category || season || debouncedSearch;

  const clearFilters = () => {
    setSearch('');
    setContinent('');
    setCategory('');
    setSeason('');
    setSort('rating-desc');
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Hero Section */}
      <div className="relative overflow-hidden border-b border-zinc-800/60">
        {/* Background gradients */}
        <div className="absolute top-[-40%] left-[-20%] w-[60%] h-[80%] rounded-full bg-blue-500/8 blur-[100px]" />
        <div className="absolute bottom-[-30%] right-[-15%] w-[50%] h-[70%] rounded-full bg-violet-500/8 blur-[100px]" />

        <div className="relative mx-auto max-w-7xl px-4 pb-8 pt-12 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 shadow-lg shadow-blue-500/25">
              <FiCompass className="h-7 w-7 text-white" />
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl">
              Explore <span className="bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">Destinations</span>
            </h1>
            <p className="mx-auto mt-3 max-w-2xl text-base text-zinc-400 sm:text-lg">
              Discover breathtaking places around the world. Search, filter, and find your next adventure.
            </p>
          </motion.div>

          {/* Search & Filters Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="mt-8 mx-auto max-w-4xl"
          >
            {/* Search Input */}
            <div className="relative">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-500" />
              <input
                id="search-destinations"
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search destinations, countries..."
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900/80 py-3.5 pl-12 pr-10 text-white placeholder-zinc-500 backdrop-blur-sm focus:border-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-zinc-500 hover:text-white hover:bg-zinc-800 transition-colors"
                >
                  <FiX className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Filter Row */}
            <div className="mt-4 flex flex-wrap items-center gap-3">
              {/* Continent filter */}
              <div className="relative">
                <select
                  id="filter-continent"
                  value={continent}
                  onChange={(e) => { setContinent(e.target.value); setPage(1); }}
                  className="appearance-none rounded-lg border border-zinc-800 bg-zinc-900/80 py-2 pl-9 pr-8 text-sm text-zinc-300 backdrop-blur-sm focus:border-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all cursor-pointer"
                >
                  <option value="">All Continents</option>
                  {continents.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                <FiGlobe className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                <FiChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
              </div>

              {/* Category filter */}
              <div className="relative">
                <select
                  id="filter-category"
                  value={category}
                  onChange={(e) => { setCategory(e.target.value); setPage(1); }}
                  className="appearance-none rounded-lg border border-zinc-800 bg-zinc-900/80 py-2 pl-9 pr-8 text-sm text-zinc-300 backdrop-blur-sm focus:border-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all cursor-pointer capitalize"
                >
                  <option value="">All Categories</option>
                  {categories.map((c) => (
                    <option key={c} value={c} className="capitalize">{c}</option>
                  ))}
                </select>
                <FiFilter className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                <FiChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
              </div>

              {/* Season filter */}
              <div className="relative">
                <select
                  id="filter-season"
                  value={season}
                  onChange={(e) => { setSeason(e.target.value); setPage(1); }}
                  className="appearance-none rounded-lg border border-zinc-800 bg-zinc-900/80 py-2 pl-9 pr-8 text-sm text-zinc-300 backdrop-blur-sm focus:border-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all cursor-pointer"
                >
                  <option value="">All Seasons</option>
                  {seasons.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                <FiGlobe className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                <FiChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
              </div>

              {/* Sort */}
              <div className="relative">
                <select
                  id="sort-destinations"
                  value={sort}
                  onChange={(e) => { setSort(e.target.value); setPage(1); }}
                  className="appearance-none rounded-lg border border-zinc-800 bg-zinc-900/80 py-2 pl-3 pr-8 text-sm text-zinc-300 backdrop-blur-sm focus:border-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all cursor-pointer"
                >
                  {sortOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                <FiChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
              </div>

              {/* Clear Filters */}
              {hasActiveFilters && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  onClick={clearFilters}
                  className="flex items-center gap-1.5 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs font-medium text-red-400 hover:bg-red-500/20 transition-colors"
                >
                  <FiX className="h-3.5 w-3.5" />
                  Clear All
                </motion.button>
              )}

              {/* Result count */}
              {pagination && (
                <span className="ml-auto text-sm text-zinc-500">
                  {pagination.totalCount} destination{pagination.totalCount !== 1 ? 's' : ''} found
                </span>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Destinations Grid */}
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {isLoading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 12 }).map((_, i) => (
              <DestinationCardSkeleton key={i} />
            ))}
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-8 text-center">
              <p className="text-lg font-semibold text-red-400">Failed to load destinations</p>
              <p className="mt-2 text-sm text-zinc-500">Make sure the API server is running on port 5000.</p>
            </div>
          </div>
        ) : destinations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-8 text-center">
              <FiSearch className="mx-auto h-12 w-12 text-zinc-600 mb-4" />
              <p className="text-lg font-semibold text-zinc-300">No destinations found</p>
              <p className="mt-2 text-sm text-zinc-500">Try adjusting your search or filters.</p>
              <button
                onClick={clearFilters}
                className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={`${debouncedSearch}-${continent}-${category}-${season}-${sort}-${page}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
            >
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {destinations.map((dest: any, i: number) => (
                <motion.div
                  key={dest._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: i * 0.05 }}
                >
                  <DestinationCard destination={dest} />
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        )}

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="mt-10 flex items-center justify-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="flex items-center gap-1 rounded-lg border border-zinc-800 bg-zinc-900/80 px-4 py-2 text-sm font-medium text-zinc-300 hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <FiChevronLeft className="h-4 w-4" />
              Previous
            </button>

            <div className="flex items-center gap-1">
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                    p === page
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25'
                      : 'border border-zinc-800 bg-zinc-900/80 text-zinc-400 hover:bg-zinc-800 hover:text-white'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>

            <button
              onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
              disabled={page >= pagination.totalPages}
              className="flex items-center gap-1 rounded-lg border border-zinc-800 bg-zinc-900/80 px-4 py-2 text-sm font-medium text-zinc-300 hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Next
              <FiChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
