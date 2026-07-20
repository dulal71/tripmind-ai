export default function FavoritesLoading() {
  return (
    <div className="min-h-screen bg-zinc-950">
      <div className="relative overflow-hidden border-b border-zinc-800/60">
        <div className="relative mx-auto max-w-7xl px-4 pb-8 pt-12 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-14 w-14 rounded-2xl bg-zinc-800 mb-4" />
            <div className="h-10 w-56 rounded-lg bg-zinc-800 mb-3" />
            <div className="h-5 w-80 rounded bg-zinc-800" />
          </div>
        </div>
      </div>
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-zinc-800 bg-zinc-900/60 overflow-hidden animate-pulse">
              <div className="h-48 bg-zinc-800" />
              <div className="p-5 flex items-center justify-between">
                <div className="h-5 w-3/4 rounded bg-zinc-800" />
                <div className="h-9 w-9 rounded-full bg-zinc-800" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
