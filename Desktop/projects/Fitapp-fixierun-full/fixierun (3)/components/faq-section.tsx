"use client"

import { useState } from "react"
import { Plus } from "lucide-react"

type FaqItem = {
  question: string
  answer: string
}

export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const faqItems: FaqItem[] = [
    {
      question: "What is Fixie.Run?",
      answer:
        "Fixie.Run is a blockchain-based Move-to-Earn (M2E) fitness application targeting cyclists. The platform rewards users with crypto tokens for physical activities, featuring NFT bikes that evolve based on usage, and implements a robust reward system verified through zero-knowledge proofs.",
    },
    {
      question: "How do I earn rewards?",
      answer:
        "You earn rewards by cycling with the Fixie.Run app active. Your physical activity is tracked via GPS and verified through our zero-knowledge proof system. The more you ride, the more tokens you earn, and your NFT bike evolves based on your usage patterns.",
    },
    {
      question: "What are NFT bikes?",
      answer:
        "NFT bikes are unique digital assets that represent your virtual bicycle in the Fixie.Run ecosystem. Each bike has different attributes and performance characteristics. As you ride more, your NFT bike evolves, gaining new features, improved aesthetics, and better earning potential.",
    },
    {
      question: "How is my cycling activity verified?",
      answer:
        "Your cycling activity is verified through a combination of GPS tracking, motion sensors, and our proprietary zero-knowledge proof system. This ensures that rewards are distributed fairly and prevents fraudulent activity while maintaining your privacy.",
    },
    {
      question: "What blockchain does Fixie.Run use?",
      answer:
        "Fixie.Run is built on Polygon zkEVM, a layer-2 scaling solution for Ethereum that uses zero-knowledge proofs to provide fast, low-cost transactions with the security of Ethereum. This allows us to process rewards efficiently and minimize gas fees for users.",
    },
    {
      question: "Can I trade my NFT bikes?",
      answer:
        "Yes, NFT bikes can be traded on our in-app marketplace or on compatible third-party NFT marketplaces. The value of each bike is determined by its rarity, level of evolution, and performance characteristics.",
    },
  ]

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <section id="faq" className="py-16 md:py-24 relative overflow-hidden themed-section">
      <div className="absolute inset-0 z-0 themed-bg"></div>
      <div className="absolute inset-0 bg-cyber-grid z-0 opacity-20"></div>

      <div className="container mx-auto px-4 relative z-10">
        <header className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-cyber font-bold mb-4">
            Frequently <span className="cyber-text themed-heading">Asked Questions</span>
          </h2>
          <p className="text-lg text-gray-300 max-w-3xl mx-auto">
            Everything you need to know about Fixie.Run and how it works
          </p>
        </header>

        <div className="max-w-4xl mx-auto space-y-6">
          {faqItems.map((item, index) => (
            <div key={index} className="bg-cyberpunk-darker/70 backdrop-blur-sm rounded-sm shadow-lg cyber-border">
              <button
                className="faq-toggle w-full text-left p-6 focus:outline-none flex justify-between items-center"
                onClick={() => toggleFaq(index)}
                aria-expanded={openIndex === index}
                aria-controls={`faq-content-${index}`}
              >
                <h3 className="text-xl font-cyber font-medium text-white">{item.question}</h3>
                <Plus
                  className={`text-accent transition-transform duration-300 toggle-icon ${openIndex === index ? "rotate-45" : ""}`}
                />
              </button>
              <div
                id={`faq-content-${index}`}
                className={`px-6 pb-6 pt-2 text-gray-300 ${openIndex === index ? "block" : "hidden"}`}
              >
                <p>{item.answer}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
