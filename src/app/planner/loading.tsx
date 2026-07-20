export default function PlannerLoading() {
  return (
    <div className="min-h-screen bg-zinc-950">
      <div className="relative overflow-hidden border-b border-zinc-800/60">
        <div className="relative mx-auto max-w-7xl px-4 pb-8 pt-12 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center animate-pulse">
            <div className="h-14 w-14 rounded-2xl bg-zinc-800 mb-4" />
            <div className="h-10 w-64 rounded-lg bg-zinc-800 mb-3" />
            <div className="h-5 w-80 max-w-full rounded bg-zinc-800" />
          </div>
        </div>
      </div>
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="space-y-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-20 rounded-2xl bg-zinc-800 animate-pulse" />
          ))}
          <div className="h-14 w-48 rounded-xl bg-zinc-800 animate-pulse mx-auto" />
        </div>
      </div>
    </div>
  );
}
