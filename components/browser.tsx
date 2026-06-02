"use client"

import type React from "react"

import { useCallback, useEffect, useRef, useState } from "react"
import {
  ArrowLeft,
  ArrowRight,
  RotateCw,
  Home,
  Search,
  Lock,
  Star,
  ShieldCheck,
  Menu,
  X,
} from "lucide-react"
import {
  type HistoryEntry,
  hostFromUrl,
  makeId,
  parseInput,
} from "@/lib/browser-utils"
import { HomeScreen } from "@/components/home-screen"
import { SearchResults } from "@/components/search-results"
import { PageView, type PageState } from "@/components/page-view"
import { PrivacyPanel } from "@/components/privacy-panel"

const HOME_ENTRY: HistoryEntry = {
  id: "home",
  kind: "home",
  address: "ryu://home",
  title: "Ryu — New Tab",
}

export function Browser({ logoVisible }: { logoVisible: boolean }) {
  const [history, setHistory] = useState<HistoryEntry[]>([HOME_ENTRY])
  const [index, setIndex] = useState(0)
  const [loading, setLoading] = useState(false)
  const [pageState, setPageState] = useState<PageState>({ status: "loading" })
  const [address, setAddress] = useState("")
  const [editing, setEditing] = useState(false)
  const [bookmarks, setBookmarks] = useState<string[]>([])
  const [visited, setVisited] = useState<HistoryEntry[]>([])
  const [panelOpen, setPanelOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  const reqToken = useRef(0)
  const current = history[index]
  const canBack = index > 0
  const canForward = index < history.length - 1

  // Keep the address bar in sync with the active entry (unless user is typing).
  useEffect(() => {
    if (!editing) {
      setAddress(current.kind === "search" ? (current.query ?? "") : current.kind === "home" ? "" : (current.url ?? ""))
    }
  }, [current, editing])

  const loadPage = useCallback(async (url: string) => {
    const token = ++reqToken.current
    setPageState({ status: "loading" })
    setLoading(true)
    try {
      const res = await fetch(`/api/proxy?url=${encodeURIComponent(url)}`)
      const data = await res.json()
      if (token !== reqToken.current) return // stale request
      if (data.ok) {
        setPageState({ status: "ok", html: data.html, finalUrl: data.finalUrl })
      } else {
        setPageState({
          status: "blocked",
          url,
          reason: data.reason ?? "fetch-failed",
          message: data.message,
        })
      }
    } catch (err) {
      if (token !== reqToken.current) return
      setPageState({
        status: "blocked",
        url,
        reason: "fetch-failed",
        message: err instanceof Error ? err.message : undefined,
      })
    } finally {
      if (token === reqToken.current) setLoading(false)
    }
  }, [])

  const simulateLoad = useCallback(() => {
    const token = ++reqToken.current
    setLoading(true)
    setTimeout(() => {
      if (token === reqToken.current) setLoading(false)
    }, 650)
  }, [])

  const logVisit = useCallback((entry: HistoryEntry) => {
    setVisited((prev) => {
      if (prev[0]?.address === entry.address) return prev
      return [entry, ...prev].slice(0, 50)
    })
  }, [])

  // Push a brand-new entry, truncating any forward history.
  const pushEntry = useCallback(
    (entry: HistoryEntry) => {
      setHistory((prev) => {
        const next = prev.slice(0, index + 1)
        next.push(entry)
        return next
      })
      setIndex((i) => i + 1)
      logVisit(entry)
    },
    [index, logVisit],
  )

  const openUrl = useCallback(
    (rawUrl: string) => {
      const url = rawUrl.startsWith("http") ? rawUrl : `https://${rawUrl}`
      const entry: HistoryEntry = {
        id: makeId(),
        kind: "page",
        url,
        address: url,
        title: hostFromUrl(url),
      }
      pushEntry(entry)
      loadPage(url)
      setMenuOpen(false)
    },
    [pushEntry, loadPage],
  )

  const openSearch = useCallback(
    (query: string) => {
      const entry: HistoryEntry = {
        id: makeId(),
        kind: "search",
        query,
        address: query,
        title: `${query} — Ryu Search`,
      }
      pushEntry(entry)
      simulateLoad()
      setMenuOpen(false)
    },
    [pushEntry, simulateLoad],
  )

  const handleInput = useCallback(
    (raw: string) => {
      const parsed = parseInput(raw)
      if (!parsed.value) return
      if (parsed.kind === "url") openUrl(parsed.value)
      else openSearch(parsed.value)
    },
    [openUrl, openSearch],
  )

  // Re-run the loader for whatever the current entry is.
  const reactivate = useCallback(
    (entry: HistoryEntry) => {
      if (entry.kind === "page" && entry.url) loadPage(entry.url)
      else if (entry.kind === "search") simulateLoad()
    },
    [loadPage, simulateLoad],
  )

  const goBack = useCallback(() => {
    if (!canBack) return
    const target = history[index - 1]
    setIndex(index - 1)
    reactivate(target)
  }, [canBack, history, index, reactivate])

  const goForward = useCallback(() => {
    if (!canForward) return
    const target = history[index + 1]
    setIndex(index + 1)
    reactivate(target)
  }, [canForward, history, index, reactivate])

  const goHome = useCallback(() => {
    if (current.kind === "home") return
    pushEntry({ ...HOME_ENTRY, id: makeId() })
  }, [current.kind, pushEntry])

  const reload = useCallback(() => {
    reactivate(current)
  }, [current, reactivate])

  // Navigation from inside proxied pages (links post a message to the shell).
  useEffect(() => {
    function onMessage(e: MessageEvent) {
      if (e.data?.type === "ryu-navigate" && typeof e.data.url === "string") {
        openUrl(e.data.url)
      }
    }
    window.addEventListener("message", onMessage)
    return () => window.removeEventListener("message", onMessage)
  }, [openUrl])

  const isBookmarked = current.kind !== "home" && bookmarks.includes(current.address)
  const toggleBookmark = () => {
    if (current.kind === "home") return
    setBookmarks((prev) =>
      prev.includes(current.address) ? prev.filter((b) => b !== current.address) : [...prev, current.address],
    )
  }

  function onAddressSubmit(e: React.FormEvent) {
    e.preventDefault()
    setEditing(false)
    handleInput(address)
    ;(document.activeElement as HTMLElement)?.blur()
  }

  return (
    <div className="flex h-[100dvh] flex-col bg-zinc-950">
      {/* ===== Top chrome ===== */}
      <header className="flex flex-col border-b border-zinc-900 bg-zinc-950">
        {/* Row 1: brand + nav controls + actions */}
        <div className="flex items-center gap-1.5 px-3 pt-3 sm:gap-2 sm:px-4">
          {/* Logo lands here from the splash */}
          <div
            className={`mr-1 hidden shrink-0 items-center transition-opacity duration-700 sm:flex ${
              logoVisible ? "opacity-100" : "opacity-0"
            }`}
          >
            <span className="pixel-font glitch text-sm font-bold" data-text="Ryu">
              Ryu
            </span>
          </div>

          <NavButton onClick={goBack} disabled={!canBack} label="Back">
            <ArrowLeft className="h-5 w-5" />
          </NavButton>
          <NavButton onClick={goForward} disabled={!canForward} label="Forward">
            <ArrowRight className="h-5 w-5" />
          </NavButton>
          <NavButton onClick={reload} label="Reload" spinning={loading}>
            <RotateCw className="h-5 w-5" />
          </NavButton>
          <NavButton onClick={goHome} label="Home" className="hidden sm:flex">
            <Home className="h-5 w-5" />
          </NavButton>

          {/* Address bar */}
          <form onSubmit={onAddressSubmit} className="min-w-0 flex-1">
            <div className="flex min-h-[42px] items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900 px-3 transition-colors focus-within:border-zinc-600">
              {current.kind === "search" ? (
                <Search className="h-4 w-4 shrink-0 text-zinc-500" />
              ) : (
                <Lock className="h-4 w-4 shrink-0 text-emerald-400" />
              )}
              <input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                onFocus={(e) => {
                  setEditing(true)
                  e.target.select()
                }}
                onBlur={() => setEditing(false)}
                placeholder="Search or type a URL"
                className="min-h-[40px] w-full bg-transparent text-sm text-zinc-100 outline-none placeholder:text-zinc-600"
                aria-label="Address and search bar"
                inputMode="url"
              />
              <button
                type="button"
                onClick={toggleBookmark}
                disabled={current.kind === "home"}
                aria-label={isBookmarked ? "Remove bookmark" : "Add bookmark"}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-zinc-500 transition-colors hover:bg-zinc-800 hover:text-zinc-200 disabled:opacity-30"
              >
                <Star className={`h-4 w-4 ${isBookmarked ? "fill-amber-400 text-amber-400" : ""}`} />
              </button>
            </div>
          </form>

          <NavButton onClick={() => setPanelOpen(true)} label="Privacy & history" className="shrink-0">
            <ShieldCheck className="h-5 w-5 text-emerald-400" />
          </NavButton>
          <NavButton
            onClick={() => setMenuOpen((v) => !v)}
            label="Menu"
            className="shrink-0 sm:hidden"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </NavButton>
        </div>

        {/* Row 2: status strip + bookmarks */}
        <div className="flex items-center gap-3 px-4 pb-2 pt-2 text-[11px] text-zinc-500">
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            0 Trackers
          </span>
          <span className="hidden items-center gap-1.5 sm:flex">
            <Lock className="h-3 w-3 text-emerald-400" />
            Connection encrypted
          </span>
          {bookmarks.length > 0 && (
            <div className="ml-auto flex min-w-0 items-center gap-2 overflow-x-auto">
              {bookmarks.slice(0, 6).map((b) => (
                <button
                  key={b}
                  onClick={() => (b.startsWith("http") ? openUrl(b) : handleInput(b))}
                  className="flex shrink-0 items-center gap-1 rounded-md bg-zinc-900 px-2 py-1 text-zinc-400 transition-colors hover:text-zinc-100"
                >
                  <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                  <span className="max-w-[120px] truncate">{hostFromUrl(b)}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Mobile slide-down menu */}
        {menuOpen && (
          <div className="grid grid-cols-2 gap-2 border-t border-zinc-900 px-4 py-3 sm:hidden">
            <MenuItem onClick={goHome}>
              <Home className="h-4 w-4" /> Home
            </MenuItem>
            <MenuItem onClick={() => { setPanelOpen(true); setMenuOpen(false) }}>
              <ShieldCheck className="h-4 w-4 text-emerald-400" /> Privacy
            </MenuItem>
          </div>
        )}
      </header>

      {/* ===== Viewport ===== */}
      <main className="relative flex-1 overflow-y-auto bg-zinc-950">
        {current.kind === "home" && <HomeScreen onSubmit={handleInput} onOpenUrl={openUrl} />}
        {current.kind === "search" && (
          <SearchResults query={current.query ?? ""} loading={loading} onOpenUrl={openUrl} />
        )}
        {current.kind === "page" && <PageView state={pageState} url={current.url ?? ""} />}
      </main>

      <PrivacyPanel
        open={panelOpen}
        onClose={() => setPanelOpen(false)}
        visited={visited}
        onOpenEntry={(entry) => {
          setPanelOpen(false)
          if (entry.kind === "page" && entry.url) openUrl(entry.url)
          else if (entry.kind === "search" && entry.query) openSearch(entry.query)
          else goHome()
        }}
        onClearHistory={() => setVisited([])}
      />
    </div>
  )
}

function NavButton({
  children,
  onClick,
  disabled,
  label,
  spinning,
  className = "",
}: {
  children: React.ReactNode
  onClick: () => void
  disabled?: boolean
  label: string
  spinning?: boolean
  className?: string
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={`flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-xl text-zinc-400 transition-colors hover:bg-zinc-900 hover:text-zinc-100 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent ${className}`}
    >
      <span className={spinning ? "animate-spin" : ""}>{children}</span>
    </button>
  )
}

function MenuItem({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900/50 text-sm text-zinc-300 transition-colors hover:bg-zinc-900"
    >
      {children}
    </button>
  )
}
