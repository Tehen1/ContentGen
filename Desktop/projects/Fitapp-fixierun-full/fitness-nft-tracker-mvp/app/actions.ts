"use server"

interface RunData {
  distance: number
  time: number
  cryptoEarned: number
}

export async function saveRunData(data: RunData) {
  // In a real application, you would save this data to a database
  console.log("Run data saved:", data)
  // Simulate a delay
  await new Promise((resolve) => setTimeout(resolve, 1000))
  return { success: true }
}

