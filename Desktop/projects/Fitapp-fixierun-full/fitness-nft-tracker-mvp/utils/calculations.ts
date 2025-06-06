export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371 // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1)
  const dLon = deg2rad(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const d = R * c // Distance in km
  return d
}

function deg2rad(deg: number): number {
  return deg * (Math.PI / 180)
}

export function calculateReward(distance: number): number {
  // Base reward: 0.1 crypto per km
  const baseReward = distance * 0.1

  // Bonus for longer distances
  let bonus = 0
  if (distance > 5) bonus += 0.5
  if (distance > 10) bonus += 1

  // Random factor (80% to 120% of base reward + bonus)
  const randomFactor = 0.8 + Math.random() * 0.4

  return Number((baseReward + bonus) * randomFactor).toFixed(2)
}

