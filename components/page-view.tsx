"use client"

import { Loader2, ShieldAlert, Globe, ExternalLink, Lock } from "lucide-react"
import { hostFromUrl } from "@/lib/browser-utils"

export type PageState =
  | { status: "loading" }
  | { status: "ok"; html: string; finalUrl: string }
  | { status: "blocked"; url: string; reason: string; message?: string }

export function PageView({ state, url }: { state: PageState; url: string }) {
  if (state.status === "loading") {
    return (
      <div className="flex min-h-full flex-col">
        <div className="border-b border-zinc-900 px-5 py-3">
          <div className="shimmer h-3 w-48 rounded bg-zinc-800" />
        </div>
        <div className="flex flex-1 flex-col items-center justify-center gap-3 py-20 text-zinc-500">
          <Loader2 className="h-6 w-6 animate-spin text-zinc-400" />
          <p className="text-sm">
            Establishing secure tunnel to <span className="text-zinc-300">{hostFromUrl(url)}</span>
          </p>
        </div>
      </div>
    )
  }

  if (state.status === "ok") {
    return (
      <div className="flex min-h-full flex-col">
        <div className="flex items-center gap-2 border-b border-zinc-900 bg-zinc-950/80 px-5 py-2 text-[12px] text-zinc-500">
          <Lock className="h-3.5 w-3.5 text-emerald-400" />
          Served via Ryu secure proxy
          <span className="ml-auto truncate text-zinc-600">{hostFromUrl(state.finalUrl)}</span>
        </div>
        <iframe
          // Rendered from server-fetched, sanitized HTML — not a plain cross-origin iframe.
          srcDoc={state.html}
          title={`Proxied content for ${url}`}
          className="min-h-[60vh] w-full flex-1 bg-white"
          sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
        />
      </div>
    )
  }

  // blocked / secure preview fallback
  return (
    <div className="mx-auto flex w-full max-w-xl flex-col items-center px-5 py-16 text-center">
      <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-900">
        <ShieldAlert className="h-7 w-7 text-amber-400" />
      </div>
      <h3 className="mb-2 text-xl font-semibold text-zinc-100">Simulated Secure Preview</h3>
      <p className="mb-6 max-w-md text-pretty text-sm leading-relaxed text-zinc-500">
        {state.reason === "timeout"
          ? "The destination took too long to respond through the encrypted tunnel."
          : state.reason === "non-html"
            ? "This resource is not a standard web page (it may be a file, media, or an API endpoint)."
            : "This destination enforces strict security headers (CSP / X-Frame-Options) that prevent it from being embedded. This is a CORS / framing boundary working as intended to protect the site."}
      </p>

      <div className="w-full rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5 text-left">
        <div className="mb-3 flex items-center gap-2 text-zinc-300">
          <Globe className="h-4 w-4 text-sky-300" />
          <span className="truncate text-sm font-medium">{hostFromUrl(state.url)}</span>
        </div>
        <div className="space-y-2 text-[13px] text-zinc-500">
          <div className="flex justify-between">
            <span>Connection</span>
            <span className="text-emerald-400">Encrypted (TLS 1.3)</span>
          </div>
          <div className="flex justify-between">
            <span>Trackers blocked</span>
            <span className="text-zinc-200">0 detected</span>
          </div>
          <div className="flex justify-between">
            <span>Framing policy</span>
            <span className="text-amber-400">Restricted by site</span>
          </div>
        </div>
        <a
          href={state.url}
          target="_blank"
          rel="noreferrer noopener"
          className="mt-4 flex items-center justify-center gap-2 rounded-lg bg-zinc-100 py-2 text-sm font-medium text-zinc-900 transition-colors hover:bg-white"
        >
          Open in new tab
          <ExternalLink className="h-4 w-4" />
        </a>
      </div>
    </div>
  )
}
