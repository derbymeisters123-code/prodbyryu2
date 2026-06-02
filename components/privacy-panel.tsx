"use client"

import { ShieldCheck, Lock, EyeOff, Clock, X, Trash2 } from "lucide-react"
import type { HistoryEntry } from "@/lib/browser-utils"

export function PrivacyPanel({
  open,
  onClose,
  visited,
  onOpenEntry,
  onClearHistory,
}: {
  open: boolean
  onClose: () => void
  visited: HistoryEntry[]
  onOpenEntry: (entry: HistoryEntry) => void
  onClearHistory: () => void
}) {
  return (
    <>
      {open && <div className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm" onClick={onClose} aria-hidden />}
      <aside
        className={`fixed right-0 top-0 z-40 flex h-full w-[88%] max-w-sm flex-col border-l border-zinc-800 bg-zinc-950 transition-transform duration-300 ease-out ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
        aria-hidden={!open}
      >
        <div className="flex items-center justify-between border-b border-zinc-900 px-5 py-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-emerald-400" />
            <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-200">Privacy</h2>
          </div>
          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-zinc-500 transition-colors hover:bg-zinc-900 hover:text-zinc-200"
            aria-label="Close privacy panel"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-3 border-b border-zinc-900 p-5">
          <Stat icon={<EyeOff className="h-4 w-4 text-sky-300" />} label="Trackers detected" value="0" />
          <Stat icon={<Lock className="h-4 w-4 text-emerald-400" />} label="Connection" value="Encrypted" />
          <Stat icon={<ShieldCheck className="h-4 w-4 text-emerald-400" />} label="Ad profiles" value="Blocked" />
        </div>

        <div className="flex items-center justify-between px-5 pb-2 pt-4">
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-wider text-zinc-500">
            <Clock className="h-3.5 w-3.5" />
            Session history
          </div>
          {visited.length > 0 && (
            <button
              onClick={onClearHistory}
              className="flex items-center gap-1 text-[11px] text-zinc-500 transition-colors hover:text-red-400"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Clear
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto px-3 pb-6">
          {visited.length === 0 ? (
            <p className="px-2 py-6 text-center text-sm text-zinc-600">No history in this session.</p>
          ) : (
            <ul className="space-y-1">
              {visited.map((entry, i) => (
                <li key={`${entry.id}-${i}`}>
                  <button
                    onClick={() => onOpenEntry(entry)}
                    className="flex w-full flex-col items-start rounded-lg px-2 py-2 text-left transition-colors hover:bg-zinc-900"
                  >
                    <span className="line-clamp-1 text-sm text-zinc-200">{entry.title}</span>
                    <span className="line-clamp-1 text-[11px] text-zinc-600">{entry.address}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </aside>
    </>
  )
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900/40 px-4 py-3">
      <span className="flex items-center gap-2 text-sm text-zinc-400">
        {icon}
        {label}
      </span>
      <span className="text-sm font-medium text-zinc-100">{value}</span>
    </div>
  )
}
