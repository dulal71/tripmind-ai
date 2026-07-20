'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import {
  FiMap,
  FiCalendar,
  FiDollarSign,
  FiUsers,
  FiArrowLeft,
  FiArrowRight,
  FiCheck,
  FiSearch,
} from 'react-icons/fi';
import { useTrip, useUpdateTrip } from '@/hooks/useTrips';
import { BUDGET_OPTIONS, STYLE_OPTIONS, INTEREST_OPTIONS } from '@/types/trip';
import { authClient } from '@/lib/auth-client';
import api from '@/lib/api';
import toast from 'react-hot-toast';

interface DestinationListItem {
  _id: string;
  name: string;
  country: string;
  imageUrl: string;
}

const tripSchema = z.object({
  destinationId: z.string().min(1, { message: 'Please select a destination' }),
  startDate: z.string().min(1, { message: 'Start date is required' }),
  endDate: z.string().min(1, { message: 'End date is required' }),
  budget: z.enum(['economy', 'budget', 'moderate', 'luxury']),
  travelStyle: z.enum(['adventure', 'cultural', 'relaxation', 'family', 'romantic', 'solo']),
  travelerCount: z.number().min(1).max(20),
  interests: z.array(z.string()).min(1, { message: 'Select at least one interest' }),
  status: z.enum(['planning', 'upcoming', 'completed', 'cancelled']),
});

type TripFormValues = z.infer<typeof tripSchema>;

export default function EditTripPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { data: session } = authClient.useSession();
  const { data: trip, isLoading: tripLoading } = useTrip(id);
  const updateTrip = useUpdateTrip();
  const [step, setStep] = useState(1);
  const [destSearch, setDestSearch] = useState('');

  const { data: destinations } = useQuery({
    queryKey: ['destinations-list'],
    queryFn: async () => {
      const { data } = await api.get<{ data: DestinationListItem[] }>('/api/destinations', { params: { limit: '100' } });
      return data.data;
    },
  });

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<TripFormValues>({
    resolver: zodResolver(tripSchema),
    defaultValues: {
      destinationId: '',
      startDate: '',
      endDate: '',
      budget: 'moderate',
      travelStyle: 'cultural',
      travelerCount: 1,
      interests: [],
      status: 'planning',
    },
  });

  useEffect(() => {
    if (trip) {
      reset({
        destinationId: trip.destinationId,
        startDate: trip.startDate.split('T')[0],
        endDate: trip.endDate.split('T')[0],
        budget: trip.budget,
        travelStyle: trip.travelStyle,
        travelerCount: trip.travelerCount,
        interests: trip.interests,
        status: trip.status,
      });
    }
  }, [trip, reset]);

  const selectedDestId = watch('destinationId');
  const selectedInterests = watch('interests');
  const startDate = watch('startDate');

  if (!session?.user) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center px-4">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-8 text-center max-w-md">
          <FiMap className="mx-auto h-12 w-12 text-zinc-600 mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">Sign in required</h2>
          <p className="text-sm text-zinc-400 mb-6">You need to be signed in to edit trips.</p>
          <Link href="/login" className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-violet-600 px-6 py-2.5 text-sm font-semibold text-white">
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  if (tripLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center px-4">
        <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-8 text-center">
          <p className="text-lg font-semibold text-red-400">Trip not found</p>
          <Link href="/trips" className="mt-4 inline-block text-sm text-blue-400 hover:text-blue-300">Back to My Trips</Link>
        </div>
      </div>
    );
  }

  const filteredDests = (destinations || []).filter((dest) =>
    dest.name.toLowerCase().includes(destSearch.toLowerCase()) ||
    dest.country.toLowerCase().includes(destSearch.toLowerCase())
  );

  const toggleInterest = (interest: string) => {
    const current = selectedInterests || [];
    if (current.includes(interest)) {
      setValue('interests', current.filter((i) => i !== interest), { shouldValidate: true });
    } else {
      setValue('interests', [...current, interest], { shouldValidate: true });
    }
  };

  const onSubmit = async (data: TripFormValues) => {
    try {
      await updateTrip.mutateAsync({ id, input: data });
      toast.success('Trip updated successfully!');
      router.push(`/trips/${id}`);
    } catch {
      toast.error('Failed to update trip');
    }
  };

  const totalSteps = 3;

  return (
    <div className="min-h-screen bg-zinc-950">
      <div className="relative overflow-hidden border-b border-zinc-800/60">
        <div className="absolute top-[-40%] left-[-20%] w-[60%] h-[80%] rounded-full bg-blue-500/8 blur-[100px]" />
        <div className="absolute bottom-[-30%] right-[-15%] w-[50%] h-[70%] rounded-full bg-violet-500/8 blur-[100px]" />

        <div className="relative mx-auto max-w-3xl px-4 pb-8 pt-12 sm:px-6">
          <Link href={`/trips/${id}`} className="inline-flex items-center gap-1.5 text-sm text-zinc-400 hover:text-white transition-colors mb-6">
            <FiArrowLeft className="h-4 w-4" />
            Back to Trip
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 shadow-lg shadow-blue-500/25">
              <FiMap className="h-7 w-7 text-white" />
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white">
              Edit <span className="bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">Trip</span>
            </h1>
            <p className="mt-3 text-base text-zinc-400">Update your trip to {trip.destinationName}.</p>
          </motion.div>

          {/* Step indicator */}
          <div className="mt-8 flex items-center justify-center gap-2">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                  step > i + 1
                    ? 'bg-green-500 text-white'
                    : step === i + 1
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25'
                    : 'bg-zinc-800 text-zinc-500'
                }`}>
                  {step > i + 1 ? <FiCheck className="h-4 w-4" /> : i + 1}
                </div>
                {i < totalSteps - 1 && (
                  <div className={`w-12 h-0.5 rounded-full ${step > i + 1 ? 'bg-green-500' : 'bg-zinc-800'}`} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Step 1: Destination */}
          {step === 1 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Choose Destination</h2>

              <div className="relative mb-4">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                <input
                  type="text"
                  value={destSearch}
                  onChange={(e) => setDestSearch(e.target.value)}
                  placeholder="Search destinations..."
                  className="w-full rounded-lg border border-zinc-800 bg-zinc-950/80 py-2.5 pl-10 pr-4 text-sm text-white placeholder-zinc-500 focus:border-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-80 overflow-y-auto pr-1">
                {filteredDests.map((dest) => (
                  <button
                    key={dest._id}
                    type="button"
                    onClick={() => setValue('destinationId', dest._id, { shouldValidate: true })}
                    className={`flex items-center gap-3 rounded-xl border p-3 text-left transition-all ${
                      selectedDestId === dest._id
                        ? 'border-blue-500/50 bg-blue-500/10'
                        : 'border-zinc-800 bg-zinc-950/50 hover:border-zinc-700 hover:bg-zinc-800/50'
                    }`}
                  >
                    <img src={dest.imageUrl} alt={dest.name} className="h-10 w-10 rounded-lg object-cover" />
                    <div>
                      <p className="text-sm font-medium text-white">{dest.name}</p>
                      <p className="text-xs text-zinc-400">{dest.country}</p>
                    </div>
                  </button>
                ))}
                {filteredDests.length === 0 && (
                  <p className="col-span-full py-4 text-center text-sm text-zinc-500">No destinations found</p>
                )}
              </div>

              {errors.destinationId && (
                <p className="mt-2 text-xs text-red-500 font-semibold">{errors.destinationId.message}</p>
              )}
            </motion.div>
          )}

          {/* Step 2: Dates & Budget */}
          {step === 2 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 space-y-6">
              <h2 className="text-lg font-semibold text-white">Dates & Budget</h2>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">Start Date</label>
                  <div className="relative">
                    <FiCalendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                    <input type="date" {...register('startDate')} className="w-full rounded-lg border border-zinc-800 bg-zinc-950/80 py-2.5 pl-10 pr-4 text-sm text-white focus:border-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all" />
                  </div>
                  {errors.startDate && <p className="text-xs text-red-500 font-semibold">{errors.startDate.message}</p>}
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">End Date</label>
                  <div className="relative">
                    <FiCalendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                    <input type="date" {...register('endDate')} min={startDate || ''} className="w-full rounded-lg border border-zinc-800 bg-zinc-950/80 py-2.5 pl-10 pr-4 text-sm text-white focus:border-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all" />
                  </div>
                  {errors.endDate && <p className="text-xs text-red-500 font-semibold">{errors.endDate.message}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">Budget Tier</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {BUDGET_OPTIONS.map((opt) => (
                    <button key={opt.value} type="button" onClick={() => setValue('budget', opt.value)}
                      className={`rounded-xl border p-3 text-center text-sm font-medium transition-all ${watch('budget') === opt.value ? 'border-blue-500/50 bg-blue-500/10 text-blue-400' : 'border-zinc-800 bg-zinc-950/50 text-zinc-400 hover:border-zinc-700'}`}>
                      <FiDollarSign className="mx-auto mb-1 h-4 w-4" />
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">Travel Style</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {STYLE_OPTIONS.map((opt) => (
                    <button key={opt.value} type="button" onClick={() => setValue('travelStyle', opt.value)}
                      className={`rounded-xl border p-3 text-center text-sm font-medium capitalize transition-all ${watch('travelStyle') === opt.value ? 'border-blue-500/50 bg-blue-500/10 text-blue-400' : 'border-zinc-800 bg-zinc-950/50 text-zinc-400 hover:border-zinc-700'}`}>
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">Travelers</label>
                  <div className="relative">
                    <FiUsers className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                    <input type="number" min={1} max={20} {...register('travelerCount', { valueAsNumber: true })}
                      className="w-full rounded-lg border border-zinc-800 bg-zinc-950/80 py-2.5 pl-10 pr-4 text-sm text-white focus:border-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all" />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">Status</label>
                  <select {...register('status')}
                    className="w-full rounded-lg border border-zinc-800 bg-zinc-950/80 py-2.5 px-4 text-sm text-white focus:border-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all">
                    <option value="planning">Planning</option>
                    <option value="upcoming">Upcoming</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 3: Interests */}
          {step === 3 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6">
              <h2 className="text-lg font-semibold text-white mb-2">Interests</h2>
              <p className="text-sm text-zinc-400 mb-4">Select at least one to personalize your trip.</p>

              <div className="flex flex-wrap gap-2">
                {INTEREST_OPTIONS.map((interest) => {
                  const active = selectedInterests?.includes(interest);
                  return (
                    <button key={interest} type="button" onClick={() => toggleInterest(interest)}
                      className={`rounded-full border px-4 py-2 text-sm font-medium transition-all ${active ? 'border-blue-500/50 bg-blue-500/15 text-blue-400' : 'border-zinc-800 bg-zinc-950/50 text-zinc-400 hover:border-zinc-700 hover:text-zinc-300'}`}>
                      {interest}
                    </button>
                  );
                })}
              </div>

              {errors.interests && (
                <p className="mt-3 text-xs text-red-500 font-semibold">{errors.interests.message}</p>
              )}
            </motion.div>
          )}

          {/* Navigation */}
          <div className="mt-6 flex items-center justify-between">
            {step > 1 ? (
              <button type="button" onClick={() => setStep(step - 1)}
                className="flex items-center gap-1.5 rounded-lg border border-zinc-800 px-5 py-2.5 text-sm font-medium text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors">
                <FiArrowLeft className="h-4 w-4" />
                Back
              </button>
            ) : <div />}

            {step < totalSteps ? (
              <button type="button" onClick={() => setStep(step + 1)}
                className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-500 transition-colors">
                Next
                <FiArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <button type="submit" disabled={updateTrip.isPending}
                className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-violet-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 disabled:opacity-50 transition-all cursor-pointer">
                {updateTrip.isPending ? 'Saving...' : 'Save Changes'}
                {!updateTrip.isPending && <FiCheck className="h-4 w-4" />}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
