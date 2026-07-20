'use client';

export default function DestinationCardSkeleton() {
  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/60 backdrop-blur-sm animate-pulse">
      {/* Image skeleton */}
      <div className="relative h-52 w-full bg-zinc-800" />

      {/* Content skeleton */}
      <div className="flex flex-1 flex-col gap-3 p-5">
        {/* Title */}
        <div className="h-5 w-3/4 rounded-md bg-zinc-800" />

        {/* Short description */}
        <div className="space-y-2">
          <div className="h-3 w-full rounded bg-zinc-800" />
          <div className="h-3 w-5/6 rounded bg-zinc-800" />
        </div>

        {/* Rating + cost row */}
        <div className="flex items-center justify-between pt-1">
          <div className="h-4 w-24 rounded bg-zinc-800" />
          <div className="h-4 w-16 rounded bg-zinc-800" />
        </div>

        {/* Tags */}
        <div className="flex gap-2 pt-1">
          <div className="h-6 w-16 rounded-full bg-zinc-800" />
          <div className="h-6 w-14 rounded-full bg-zinc-800" />
          <div className="h-6 w-18 rounded-full bg-zinc-800" />
        </div>
      </div>
    </div>
  );
}
