"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"

interface OptimizedBlockchainTitleProps {
  className?: string
}

export function OptimizedBlockchainTitle({ className = "" }: OptimizedBlockchainTitleProps) {
  const [mounted, setMounted] = useState(false)
  const [glitchIndex, setGlitchIndex] = useState(-1)

  const words = ["Ride", "Earn", "Evolve"]

  useEffect(() => {
    setMounted(true)

    // Simple glitch effect - much lighter than particle system
    const interval = setInterval(() => {
      if (Math.random() > 0.7) {
        const randomWord = Math.floor(Math.random() * words.length)
        setGlitchIndex(randomWord)
        setTimeout(() => setGlitchIndex(-1), 150)
      }
    }, 2000)

    return () => clearInterval(interval)
  }, [words.length])

  if (!mounted) {
    return <h1 className={`text-4xl md:text-6xl lg:text-7xl font-bold ${className}`}>Ride. Earn. Evolve.</h1>
  }

  return (
    <motion.h1
      className={`text-4xl md:text-6xl lg:text-7xl font-bold ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      {words.map((word, index) => (
        <motion.span
          key={word}
          className={`inline-block mx-2 px-3 py-1 rounded-lg border border-primary/20 bg-background/50 backdrop-blur-sm transition-all duration-300 hover:border-primary/40 hover:shadow-lg ${
            glitchIndex === index ? "animate-pulse text-primary" : ""
          }`}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            duration: 0.5,
            delay: index * 0.2,
            type: "spring",
            stiffness: 100,
          }}
          whileHover={{
            scale: 1.05,
            transition: { duration: 0.2 },
          }}
        >
          {word}
          {index < words.length - 1 && <span className="text-primary">.</span>}
        </motion.span>
      ))}
    </motion.h1>
  )
}

export default OptimizedBlockchainTitle
