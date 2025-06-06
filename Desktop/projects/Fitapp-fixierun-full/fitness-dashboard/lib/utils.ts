import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDistance(distance: number): string {
  if (distance < 1) {
    return `${(distance * 1000).toFixed(0)} m`
  }
  return `${distance.toFixed(1)} km`
}

export function formatDuration(minutes: number): string {
  if (minutes === 0) {
    return "0 min"
  }

  if (minutes < 1) {
    return `${Math.round(minutes * 60)} sec`
  }

  if (minutes < 60) {
    return `${Math.floor(minutes)} min`
  }

  const hours = Math.floor(minutes / 60)
  const remainingMinutes = Math.floor(minutes % 60)

  if (remainingMinutes === 0) {
    return `${hours} h`
  }

  return `${hours} h ${remainingMinutes} min`
}

export function formatPace(distanceKm: number, minutes: number): string {
  if (distanceKm === 0 || minutes === 0) {
    return "N/A"
  }

  const paceMinPerKm = minutes / distanceKm
  const paceMin = Math.floor(paceMinPerKm)
  const paceSec = Math.round((paceMinPerKm - paceMin) * 60)

  return `${paceMin}:${paceSec.toString().padStart(2, "0")} /km`
}

export function formatDate(date: Date | string): string {
  if (typeof date === "string") {
    date = new Date(date)
  }

  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}
