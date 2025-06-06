"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Shield, Zap, Lock, Layers, X } from "lucide-react"

export default function ZkEvmStats() {
  const [particles, setParticles] = useState<{ id: number; x: number; y: number; size: number; speed: number }[]>([])
  const [isVisible, setIsVisible] = useState(false)
  const [showModal, setShowModal] = useState(false)

  // Generate random particles
  useEffect(() => {
    const newParticles = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      speed: Math.random() * 3 + 1,
    }))
    setParticles(newParticles)
  }, [])

  // Intersection observer to trigger animation when in view
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.1 },
    )

    const element = document.getElementById("zkevm-stats")
    if (element) {
      observer.observe(element)
    }

    return () => {
      if (element) {
        observer.unobserve(element)
      }
    }
  }, [])

  return (
    <>
      <div id="zkevm-stats" className="flex flex-wrap justify-center mt-12 gap-4 md:gap-16">
        <AnimatePresence>
          {isVisible && (
            <>
              <motion.div
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <div className="text-3xl md:text-4xl font-cyber font-bold themed-stat mb-2">10K+</div>
                <div className="text-sm text-gray-300">Active Riders</div>
              </motion.div>

              <motion.div
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <div className="text-3xl md:text-4xl font-cyber font-bold themed-stat mb-2">1.2M</div>
                <div className="text-sm text-gray-300">Miles Tracked</div>
              </motion.div>

              <motion.div
                className="text-center zkevm-container"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                whileHover={{ scale: 1.05 }}
                onClick={() => setShowModal(true)}
                role="button"
                aria-label="Learn more about zkEVM"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    setShowModal(true)
                  }
                }}
              >
                <div className="zkevm-particles">
                  {particles.map((particle) => (
                    <motion.div
                      key={particle.id}
                      className="zkevm-particle"
                      style={{
                        left: `${particle.x}%`,
                        top: `${particle.y}%`,
                        width: `${particle.size}px`,
                        height: `${particle.size}px`,
                      }}
                      animate={{
                        y: [-20, -100],
                        x: [0, (Math.random() - 0.5) * 50],
                        opacity: [0, 0.8, 0],
                      }}
                      transition={{
                        duration: particle.speed,
                        repeat: Number.POSITIVE_INFINITY,
                        repeatType: "loop",
                        ease: "linear",
                        delay: Math.random() * 2,
                      }}
                    />
                  ))}
                </div>

                <div className="relative z-10 flex flex-col items-center">
                  <motion.div
                    className="zkevm-icon"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                  >
                    <Shield className="w-5 h-5" />
                  </motion.div>
                  <div className="text-3xl md:text-4xl font-cyber font-bold zkevm-text mb-2">zkEVM</div>
                  <div className="text-sm text-gray-300 text-center">Powered by</div>
                </div>
              </motion.div>

              <motion.div
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <div className="text-3xl md:text-4xl font-cyber font-bold themed-stat mb-2">$FIX</div>
                <div className="text-sm text-gray-300">Token Rewards</div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>

      {/* zkEVM Information Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
              onClick={() => setShowModal(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
            <motion.div
              className="relative w-full max-w-2xl rounded-sm themed-card p-6 z-10 border border-accent/30"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 20 }}
            >
              <button
                onClick={() => setShowModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-white"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center mb-6">
                <div className="zkevm-icon mr-4">
                  <Shield className="w-5 h-5" />
                </div>
                <h3 className="text-2xl font-cyber font-bold zkevm-text">zkEVM Technology</h3>
              </div>

              <p className="mb-6 text-gray-300">
                Fixie.Run is built on Polygon zkEVM, a cutting-edge Layer 2 scaling solution that uses zero-knowledge
                proofs to provide fast, low-cost transactions with the security of Ethereum.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="flex items-start">
                  <div className="bg-accent/10 p-2 rounded-sm mr-3">
                    <Zap className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <h4 className="font-cyber font-bold mb-1">High Performance</h4>
                    <p className="text-sm text-gray-300">
                      Process thousands of transactions per second with near-instant finality.
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="bg-accent/10 p-2 rounded-sm mr-3">
                    <Lock className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <h4 className="font-cyber font-bold mb-1">Enhanced Security</h4>
                    <p className="text-sm text-gray-300">
                      Zero-knowledge proofs ensure transaction validity without revealing sensitive data.
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="bg-accent/10 p-2 rounded-sm mr-3">
                    <Layers className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <h4 className="font-cyber font-bold mb-1">Ethereum Compatible</h4>
                    <p className="text-sm text-gray-300">
                      Fully compatible with Ethereum smart contracts and developer tools.
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="bg-accent/10 p-2 rounded-sm mr-3">
                    <Shield className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <h4 className="font-cyber font-bold mb-1">Privacy Preserving</h4>
                    <p className="text-sm text-gray-300">
                      Verify activity data without exposing personal information or location details.
                    </p>
                  </div>
                </div>
              </div>

              <div className="border-t border-accent/20 pt-6">
                <h4 className="font-cyber font-bold mb-3">How zkEVM Powers Fixie.Run</h4>
                <p className="text-sm text-gray-300 mb-4">
                  The zkEVM blockchain enables Fixie.Run to verify cycling activities cryptographically while
                  maintaining user privacy. This ensures that rewards are distributed fairly based on actual physical
                  activity, preventing fraud while keeping your personal data secure.
                </p>
                <button onClick={() => setShowModal(false)} className="cyber-button px-6 py-2 text-sm font-bold">
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
