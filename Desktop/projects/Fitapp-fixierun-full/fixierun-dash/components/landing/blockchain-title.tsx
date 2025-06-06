"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"

interface BlockchainTitleProps {
  text: string[]
  className?: string
}

export function BlockchainTitle({ text, className = "" }: BlockchainTitleProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Animation variants for the container
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
        delayChildren: 0.2,
      },
    },
  }

  // Animation variants for each word block
  const wordVariants = {
    hidden: {
      opacity: 0,
      y: 20,
      scale: 0.8,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        damping: 12,
        stiffness: 200,
      },
    },
  }

  // Don't render animation until client-side hydration is complete
  if (!mounted) {
    return (
      <h1 className={`text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none ${className}`}>
        {text.join(" ")}
      </h1>
    )
  }

  return (
    <motion.h1
      className={`text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none ${className}`}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      aria-label={text.join(" ")}
    >
      {text.map((word, index) => (
        <motion.span
          key={`${word}-${index}`}
          className="relative inline-block mx-1 blockchain-title-word"
          variants={wordVariants}
        >
          <span className="relative z-10">{word}</span>
          <span
            className="absolute inset-0 bg-background border border-primary/30 rounded-md -m-1 z-0 opacity-70"
            style={{
              boxShadow: "0 0 8px rgba(var(--primary), 0.3)",
            }}
          />
        </motion.span>
      ))}
    </motion.h1>
  )
}

export default BlockchainTitle
