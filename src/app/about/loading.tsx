export default function AboutLoading() {
  return (
    <div className="min-h-screen bg-zinc-950">
      <div className="relative overflow-hidden border-b border-zinc-800/60">
        <div className="relative mx-auto max-w-7xl px-4 pb-16 pt-16 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center animate-pulse">
            <div className="h-14 w-14 rounded-2xl bg-zinc-800 mb-4" />
            <div className="h-10 w-80 max-w-full rounded-lg bg-zinc-800 mb-3" />
            <div className="h-5 w-96 max-w-full rounded bg-zinc-800" />
          </div>
        </div>
      </div>
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 space-y-8">
        <div className="h-48 rounded-2xl bg-zinc-800 animate-pulse" />
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-40 rounded-2xl bg-zinc-800 animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  );
}
