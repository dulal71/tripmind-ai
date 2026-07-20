export default function ProfileLoading() {
  return (
    <div className="min-h-screen bg-zinc-950">
      <div className="relative overflow-hidden border-b border-zinc-800/60">
        <div className="relative mx-auto max-w-7xl px-4 pb-12 pt-16 sm:px-6 lg:px-8">
          <div className="flex items-center gap-6 animate-pulse">
            <div className="h-24 w-24 rounded-2xl bg-zinc-800" />
            <div>
              <div className="h-8 w-48 rounded bg-zinc-800 mb-2" />
              <div className="h-4 w-64 rounded bg-zinc-800" />
            </div>
          </div>
        </div>
      </div>
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid grid-cols-3 gap-4 mb-8">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-28 rounded-2xl bg-zinc-800 animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-24 rounded-2xl bg-zinc-800 animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  );
}
