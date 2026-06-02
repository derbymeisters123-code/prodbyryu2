"use client"

import type React from "react"

import { useState } from "react"
import { Search, Shield, ArrowUpRight, Lock } from "lucide-react"
import { QUICK_LINKS } from "@/lib/browser-utils"

export function HomeScreen({
  onSubmit,
  onOpenUrl,
}: {
  onSubmit: (value: string) => void
  onOpenUrl: (url: string) => void
}) {
  const [value, setValue] = useState("")

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (value.trim()) onSubmit(value)
  }

  return (
    <div className="mx-auto flex min-h-full w-full max-w-2xl flex-col items-center justify-center px-5 py-16 text-center">
      <div className="mb-8 flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/60 px-3 py-1.5 text-[11px] uppercase tracking-[0.3em] text-zinc-500">
        <Lock className="h-3 w-3 text-emerald-400" />
        Private session active
      </div>

      <h2 className="pixel-font mb-2 text-3xl font-bold text-zinc-100 sm:text-4xl">RYU SEARCH</h2>
      <p className="mb-9 max-w-md text-pretty text-sm leading-relaxed text-zinc-500">
        A clean, encrypted search experience. No profiles, no ad tracking, no noise — just answers.
      </p>

      <form onSubmit={handleSubmit} className="w-full">
        <div className="group flex items-center gap-2 rounded-2xl border border-zinc-800 bg-zinc-900/70 px-4 py-3 transition-colors focus-within:border-zinc-600">
          <Search className="h-5 w-5 shrink-0 text-zinc-500" />
          <input
            autoFocus
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Search privately or enter a URL"
            className="min-h-[28px] w-full bg-transparent text-base text-zinc-100 outline-none placeholder:text-zinc-600"
            aria-label="Search or enter address"
          />
          <button
            type="submit"
            className="hidden shrink-0 rounded-lg bg-zinc-100 px-3 py-1.5 text-sm font-medium text-zinc-900 transition-colors hover:bg-white sm:block"
          >
            Search
          </button>
        </div>
      </form>

      <div className="mt-10 w-full">
        <div className="mb-3 flex items-center gap-2 text-[11px] uppercase tracking-[0.25em] text-zinc-600">
          <Shield className="h-3.5 w-3.5" />
          Quick destinations
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {QUICK_LINKS.map((link) => (
            <button
              key={link.url}
              onClick={() => onOpenUrl(link.url)}
              className="group flex min-h-[64px] flex-col items-start justify-between rounded-xl border border-zinc-800 bg-zinc-900/50 p-3 text-left transition-colors hover:border-zinc-700 hover:bg-zinc-900"
            >
              <ArrowUpRight className="h-4 w-4 text-zinc-600 transition-colors group-hover:text-zinc-300" />
              <div>
                <div className="text-sm font-medium text-zinc-200">{link.label}</div>
                <div className="truncate text-[11px] text-zinc-600">{link.host}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
