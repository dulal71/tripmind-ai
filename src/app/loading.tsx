export default function Loading() {
  return (
    <div className="min-h-screen bg-zinc-950">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center animate-pulse">
          <div className="h-16 w-16 rounded-2xl bg-zinc-800 mb-6" />
          <div className="h-10 w-96 max-w-full rounded-lg bg-zinc-800 mb-3" />
          <div className="h-5 w-64 max-w-full rounded bg-zinc-800 mb-8" />
          <div className="flex gap-4">
            <div className="h-12 w-40 rounded-xl bg-zinc-800" />
            <div className="h-12 w-40 rounded-xl bg-zinc-800" />
          </div>
        </div>
        <div className="mt-20 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-zinc-800 bg-zinc-900/60 overflow-hidden animate-pulse">
              <div className="h-52 bg-zinc-800" />
              <div className="p-5 space-y-3">
                <div className="h-5 w-3/4 rounded bg-zinc-800" />
                <div className="h-3 w-full rounded bg-zinc-800" />
                <div className="h-3 w-5/6 rounded bg-zinc-800" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
