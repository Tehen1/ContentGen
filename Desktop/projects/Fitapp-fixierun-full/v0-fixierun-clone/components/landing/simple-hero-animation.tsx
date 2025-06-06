"use client"

import { useEffect, useState } from "react"

export function SimpleHeroAnimation() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Simple grid pattern */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `
            linear-gradient(rgba(var(--primary), 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(var(--primary), 0.1) 1px, transparent 1px)
          `,
          backgroundSize: "50px 50px",
        }}
      />

      {/* Subtle floating elements */}
      {[...Array(3)].map((_, i) => (
        <div
          key={i}
          className="absolute w-2 h-2 bg-primary/20 rounded-full animate-pulse"
          style={{
            left: `${20 + i * 30}%`,
            top: `${30 + i * 20}%`,
            animationDelay: `${i * 0.5}s`,
            animationDuration: `${3 + i}s`,
          }}
        />
      ))}
    </div>
  )
}

export default SimpleHeroAnimation
