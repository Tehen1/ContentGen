"use client"

import { useEffect, useState, useRef } from "react"
import { BlockchainParticles } from "./blockchain-particles"

interface DisappearingBlockchainTitleProps {
  className?: string
}

export function DisappearingBlockchainTitle({ className = "" }: DisappearingBlockchainTitleProps) {
  const [visibleLetters, setVisibleLetters] = useState<boolean[]>([])
  const [wordPositions, setWordPositions] = useState<
    Array<{ left: number; top: number; width: number; height: number }>
  >([])
  const containerRef = useRef<HTMLDivElement>(null)
  const wordsRef = useRef<(HTMLSpanElement | null)[]>([])

  const words = ["Ride", "Earn", "Evolve"]
  const fullText = words.join(".")

  // Initialize visible letters
  useEffect(() => {
    const totalLetters = fullText.length
    setVisibleLetters(new Array(totalLetters).fill(true))

    // Start the disappearing effect after a short delay
    const timer = setTimeout(() => {
      const interval = setInterval(() => {
        setVisibleLetters((prev) => {
          const newVisible = [...prev]
          const visibleIndices = newVisible.map((visible, index) => (visible ? index : -1)).filter((i) => i !== -1)

          if (visibleIndices.length > 0) {
            const randomIndex = visibleIndices[Math.floor(Math.random() * visibleIndices.length)]
            newVisible[randomIndex] = false

            // Make the letter reappear after a random delay
            setTimeout(
              () => {
                setVisibleLetters((current) => {
                  const updated = [...current]
                  updated[randomIndex] = true
                  return updated
                })
              },
              Math.random() * 2000 + 500,
            )
          }

          return newVisible
        })
      }, 200)

      return () => clearInterval(interval)
    }, 1000)

    return () => clearTimeout(timer)
  }, [fullText])

  // Update word positions for particles
  useEffect(() => {
    const updatePositions = () => {
      if (!containerRef.current) return

      const containerRect = containerRef.current.getBoundingClientRect()
      const positions = wordsRef.current.map((wordRef) => {
        if (!wordRef) return { left: 0, top: 0, width: 0, height: 0 }

        const rect = wordRef.getBoundingClientRect()
        return {
          left: rect.left - containerRect.left,
          top: rect.top - containerRect.top,
          width: rect.width,
          height: rect.height,
        }
      })

      setWordPositions(positions)
    }

    // Update positions after a short delay to ensure elements are rendered
    const timer = setTimeout(updatePositions, 100)

    window.addEventListener("resize", updatePositions)

    return () => {
      clearTimeout(timer)
      window.removeEventListener("resize", updatePositions)
    }
  }, [])

  let letterIndex = 0

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div className="relative z-10 flex flex-wrap items-center justify-center gap-4 text-4xl md:text-6xl lg:text-7xl font-bold">
        {words.map((word, wordIdx) => (
          <span key={wordIdx} className="relative">
            <span
              ref={(el) => (wordsRef.current[wordIdx] = el)}
              className="inline-block px-4 py-2 border border-primary/20 rounded-lg bg-background/50 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              {word.split("").map((letter, letterIdx) => {
                const currentIndex = letterIndex++
                return (
                  <span
                    key={letterIdx}
                    className={`inline-block transition-all duration-300 ${
                      visibleLetters[currentIndex]
                        ? "opacity-100 transform translate-y-0"
                        : "opacity-0 transform translate-y-2"
                    }`}
                    style={{
                      textShadow: "0 0 10px currentColor",
                    }}
                  >
                    {letter}
                  </span>
                )
              })}
            </span>
            {wordIdx < words.length - 1 && <span className="text-primary mx-2">.</span>}
          </span>
        ))}
      </div>

      {/* Particles effect */}
      <BlockchainParticles wordPositions={wordPositions} />

      {/* Binary rain effect */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="absolute text-xs text-primary/20 animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${2 + Math.random() * 2}s`,
            }}
          >
            {Math.random() > 0.5 ? "1" : "0"}
          </div>
        ))}
      </div>
    </div>
  )
}

export default DisappearingBlockchainTitle
