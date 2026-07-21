'use client';

import { motion } from 'framer-motion';
import { FiMap, FiSearch, FiTrash2, FiPlus, FiX } from 'react-icons/fi';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import toast from 'react-hot-toast';

interface AdminDestination {
  _id: string;
  name: string;
  country: string;
  continent: string;
  description?: string;
  rating?: number;
  averageCostPerDay?: number;
  image?: string;
  createdAt: string;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function AdminDestinationsPage() {
  const [destinations, setDestinations] = useState<AdminDestination[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newDest, setNewDest] = useState({ name: '', country: '', continent: '', description: '' });

  const fetchDestinations = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: '15' });
      if (search) params.set('search', search);

      const { data } = await api.get<{ status: string; data: AdminDestination[]; pagination: { totalPages: number; totalCount: number } }>(
        `/api/admin/destinations?${params.toString()}`
      );
      setDestinations(data.data);
      setTotalPages(data.pagination.totalPages);
      setTotalCount(data.pagination.totalCount);
    } catch {
      toast.error('Failed to load destinations');
    } finally {
      setLoading(false);
    }
  };

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    fetchDestinations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchDestinations();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this destination?')) return;
    try {
      await api.delete(`/api/admin/destinations/${id}`);
      setDestinations((prev) => prev.filter((d) => d._id !== id));
      setTotalCount((prev) => prev - 1);
      toast.success('Destination deleted');
    } catch {
      toast.error('Failed to delete');
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDest.name || !newDest.country) {
      toast.error('Name and country are required');
      return;
    }
    setCreating(true);
    try {
      const { data } = await api.post<{ status: string; data: AdminDestination }>('/api/admin/destinations', newDest);
      setDestinations((prev) => [data.data, ...prev]);
      setTotalCount((prev) => prev + 1);
      setNewDest({ name: '', country: '', continent: '', description: '' });
      setShowCreate(false);
      toast.success('Destination created');
    } catch {
      toast.error('Failed to create');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="flex items-center gap-3 mb-2">
          <FiMap className="h-6 w-6 text-violet-500" />
          <h1 className="text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-white">Manage Destinations</h1>
        </div>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">{totalCount} total destinations</p>
      </motion.div>

      <div className="flex flex-col sm:flex-row gap-3">
        <form onSubmit={handleSearch} className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <input
              type="text"
              placeholder="Search destinations..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
          </div>
          <button type="submit" className="px-4 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-500 transition-colors">
            Search
          </button>
        </form>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-violet-600 text-white text-sm font-medium hover:bg-violet-500 transition-colors"
        >
          {showCreate ? <FiX className="h-4 w-4" /> : <FiPlus className="h-4 w-4" />}
          {showCreate ? 'Cancel' : 'Add Destination'}
        </button>
      </div>

      {showCreate && (
        <motion.form
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          onSubmit={handleCreate}
          className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 p-6 space-y-4"
        >
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">New Destination</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Name *"
              value={newDest.name}
              onChange={(e) => setNewDest((p) => ({ ...p, name: e.target.value }))}
              className="px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-800/50 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              required
            />
            <input
              type="text"
              placeholder="Country *"
              value={newDest.country}
              onChange={(e) => setNewDest((p) => ({ ...p, country: e.target.value }))}
              className="px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-800/50 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              required
            />
            <input
              type="text"
              placeholder="Continent"
              value={newDest.continent}
              onChange={(e) => setNewDest((p) => ({ ...p, continent: e.target.value }))}
              className="px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-800/50 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
            <input
              type="text"
              placeholder="Description"
              value={newDest.description}
              onChange={(e) => setNewDest((p) => ({ ...p, description: e.target.value }))}
              className="px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-800/50 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
          </div>
          <button
            type="submit"
            disabled={creating}
            className="px-6 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-500 disabled:opacity-50 transition-colors"
          >
            {creating ? 'Creating...' : 'Create Destination'}
          </button>
        </motion.form>
      )}

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }} className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-16 animate-pulse rounded-xl bg-zinc-200 dark:bg-zinc-800" />
            ))}
          </div>
        ) : destinations.length === 0 ? (
          <div className="p-12 text-center text-sm text-zinc-500">No destinations found</div>
        ) : (
          <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {destinations.map((dest) => (
              <div key={dest._id} className="flex items-center gap-4 px-6 py-4 hover:bg-zinc-100 dark:hover:bg-zinc-800/30 transition-colors">
                {dest.image ? (
                  <img src={dest.image} alt="" className="h-10 w-10 rounded-lg object-cover" />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800">
                    <FiMap className="h-4 w-4 text-zinc-400" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-zinc-900 dark:text-white truncate">{dest.name}</p>
                  <p className="text-xs text-zinc-500">{dest.country}{dest.continent ? ` - ${dest.continent}` : ''}</p>
                </div>
                {dest.rating && (
                  <span className="text-xs text-amber-500 font-medium hidden sm:block">{dest.rating.toFixed(1)} ★</span>
                )}
                {dest.averageCostPerDay && (
                  <span className="text-xs text-emerald-500 font-medium hidden sm:block">${dest.averageCostPerDay}/day</span>
                )}
                <span className="text-xs text-zinc-400 hidden sm:block">{formatDate(dest.createdAt)}</span>
                <button
                  onClick={() => handleDelete(dest._id)}
                  className="p-2 rounded-lg text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                  title="Delete destination"
                >
                  <FiTrash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1.5 rounded-lg text-sm font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-white disabled:opacity-40 transition-colors"
          >
            Previous
          </button>
          <span className="text-sm text-zinc-500">Page {page} of {totalPages}</span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-3 py-1.5 rounded-lg text-sm font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-white disabled:opacity-40 transition-colors"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
