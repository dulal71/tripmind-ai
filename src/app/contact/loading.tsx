export default function ContactLoading() {
  return (
    <div className="min-h-screen bg-zinc-950">
      <div className="relative overflow-hidden border-b border-zinc-800/60">
        <div className="relative mx-auto max-w-7xl px-4 pb-16 pt-16 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center animate-pulse">
            <div className="h-14 w-14 rounded-2xl bg-zinc-800 mb-4" />
            <div className="h-10 w-64 max-w-full rounded-lg bg-zinc-800 mb-3" />
            <div className="h-5 w-80 max-w-full rounded bg-zinc-800" />
          </div>
        </div>
      </div>
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
          <div className="space-y-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-28 rounded-2xl bg-zinc-800 animate-pulse" />
            ))}
          </div>
          <div className="lg:col-span-2 h-96 rounded-2xl bg-zinc-800 animate-pulse" />
        </div>
      </div>
    </div>
  );
}
