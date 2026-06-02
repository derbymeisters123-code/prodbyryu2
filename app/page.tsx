"use client"

import { useState } from "react"
import { SplashScreen } from "@/components/splash-screen"
import { Browser } from "@/components/browser"

export default function Page() {
  const [showSplash, setShowSplash] = useState(true)
  // The header logo fades in as the splash logo settles into the corner.
  const [logoVisible, setLogoVisible] = useState(false)

  return (
    <>
      {showSplash && (
        <SplashScreen
          onDone={() => {
            setShowSplash(false)
            setLogoVisible(true)
          }}
        />
      )}
      <Browser logoVisible={logoVisible} />
    </>
  )
}
