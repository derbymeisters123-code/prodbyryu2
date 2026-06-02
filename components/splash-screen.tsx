"use client"

import { useEffect, useState } from "react"

export function SplashScreen({ onDone }: { onDone: () => void }) {
  // phase: "show" -> static glitch logo, "collapse" -> scale into corner + fade
  const [phase, setPhase] = useState<"show" | "collapse">("show")

  useEffect(() => {
    const collapseTimer = setTimeout(() => setPhase("collapse"), 2500)
    const doneTimer = setTimeout(() => onDone(), 3700)
    return () => {
      clearTimeout(collapseTimer)
      clearTimeout(doneTimer)
    }
  }, [onDone])

  return (
    <div
      className={`scanline fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-black transition-opacity duration-[900ms] ease-out ${
        phase === "collapse" ? "opacity-0" : "opacity-100"
      }`}
      aria-hidden={phase === "collapse"}
    >
      {/* subtle grid backdrop */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            "linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      <div
        className={`flex flex-col items-center transition-all duration-[1100ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
          phase === "collapse"
            ? "-translate-x-[42vw] -translate-y-[44vh] scale-[0.18]"
            : "translate-x-0 translate-y-0 scale-100"
        }`}
      >
        <span className="mb-3 text-[10px] uppercase tracking-[0.5em] text-zinc-600">Producer</span>
        <h1
          data-text="Prod. by Ryu"
          className="glitch pixel-font select-none text-4xl font-bold sm:text-6xl"
        >
          Prod. by Ryu
        </h1>
        <div className="mt-6 flex items-center gap-2 text-[11px] uppercase tracking-[0.35em] text-zinc-500">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
          Initializing secure session
        </div>
      </div>
    </div>
  )
}
