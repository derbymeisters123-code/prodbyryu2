"use client"

import { Globe, ShieldCheck, Sparkles } from "lucide-react"
import { generateResults } from "@/lib/browser-utils"

function ResultsSkeleton() {
  return (
    <div className="space-y-7">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="space-y-2">
          <div className="shimmer h-3 w-40 rounded bg-zinc-800/80" />
          <div className="shimmer h-4 w-3/4 rounded bg-zinc-800" />
          <div className="shimmer h-3 w-full rounded bg-zinc-800/60" />
          <div className="shimmer h-3 w-5/6 rounded bg-zinc-800/60" />
        </div>
      ))}
    </div>
  )
}

export function SearchResults({
  query,
  loading,
  onOpenUrl,
}: {
  query: string
  loading: boolean
  onOpenUrl: (url: string) => void
}) {
  const results = generateResults(query)

  return (
    <div className="mx-auto w-full max-w-5xl px-5 py-6">
      <div className="mb-6 flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-zinc-900 pb-4">
        <p className="text-sm text-zinc-500">
          Private results for <span className="text-zinc-200">&ldquo;{query}&rdquo;</span>
        </p>
        <span className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-emerald-400/80">
          <ShieldCheck className="h-3.5 w-3.5" />
          Anonymized
        </span>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_300px]">
        {/* Main results column */}
        <div>
          {loading ? (
            <ResultsSkeleton />
          ) : (
            <div className="space-y-7">
              {results.map((r) => (
                <article key={r.url} className="group max-w-2xl">
                  <button onClick={() => onOpenUrl(r.url)} className="block text-left">
                    <div className="mb-1 flex items-center gap-2 text-[12px] text-zinc-500">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-zinc-800">
                        <Globe className="h-3 w-3 text-zinc-400" />
                      </span>
                      {r.displayUrl}
                    </div>
                    <h3 className="text-lg font-medium leading-snug text-sky-300 group-hover:underline">
                      {r.title}
                    </h3>
                    <p className="mt-1 text-sm leading-relaxed text-zinc-400">{r.snippet}</p>
                  </button>
                </article>
              ))}
            </div>
          )}
        </div>

        {/* Knowledge / privacy side column */}
        <aside className="hidden lg:block">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5">
            <div className="mb-3 flex items-center gap-2 text-zinc-200">
              <Sparkles className="h-4 w-4 text-sky-300" />
              <span className="text-sm font-medium">About this search</span>
            </div>
            {loading ? (
              <div className="space-y-2">
                <div className="shimmer h-3 w-full rounded bg-zinc-800/70" />
                <div className="shimmer h-3 w-4/5 rounded bg-zinc-800/70" />
                <div className="shimmer h-3 w-2/3 rounded bg-zinc-800/70" />
              </div>
            ) : (
              <p className="text-sm leading-relaxed text-zinc-400">
                Your query <span className="text-zinc-200">&ldquo;{query}&rdquo;</span> was processed without
                logging your IP, device fingerprint, or location. Results are de-personalized so everyone sees the
                same unbiased page.
              </p>
            )}
            <div className="mt-4 grid grid-cols-2 gap-2 text-center">
              <div className="rounded-lg bg-zinc-950/60 p-3">
                <div className="text-lg font-semibold text-zinc-100">0</div>
                <div className="text-[10px] uppercase tracking-wide text-zinc-600">Trackers</div>
              </div>
              <div className="rounded-lg bg-zinc-950/60 p-3">
                <div className="text-lg font-semibold text-emerald-400">SSL</div>
                <div className="text-[10px] uppercase tracking-wide text-zinc-600">Encrypted</div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
