import FitnessTracker from "@/components/FitnessTracker"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gray-900 text-white">
      <h1 className="text-4xl font-bold mb-8">Fitness NFT Tracker</h1>
      <FitnessTracker />
    </main>
  )
}

