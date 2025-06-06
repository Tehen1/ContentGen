import { Bike, Watch, Footprints } from "lucide-react";

export type ActivityType = "biking" | "running" | "walking";

export const ACTIVITY_ICONS = {
  biking: Bike,
  running: Watch,
  walking: Footprints,
};

export const ACTIVITY_COLORS = {
  biking: "#9c5cff", // accent
  running: "#ff2a6d", // tertiary
  walking: "#39ff14", // neon green
};

export const ACTIVITY_METRICS = {
  biking: [
    { key: "distance", label: "Distance", unit: "km" },
    { key: "speed", label: "Avg. Speed", unit: "km/h" },
    { key: "elevation", label: "Elevation", unit: "m" },
  ],
  running: [
    { key: "distance", label: "Distance", unit: "km" },
    { key: "pace", label: "Pace", unit: "min/km" },
    { key: "heart_rate", label: "Heart Rate", unit: "bpm" },
  ],
  walking: [
    { key: "steps", label: "Steps", unit: "" },
    { key: "distance", label: "Distance", unit: "km" },
    { key: "calories", label: "Calories", unit: "kcal" },
  ],
};

export const ACTIVITY_SAMPLE_DATA = {
  biking: {
    week: [5.2, 0, 12.4, 8.7, 0, 15.3, 9.8],
    month: [42, 38, 45, 52],
    year: [120, 145, 210, 180, 230, 310, 280, 320, 290, 340, 280, 310],
  },
  running: {
    week: [3.1, 0, 5.2, 4.5, 0, 8.3, 6.2],
    month: [28, 25, 32, 36],
    year: [85, 92, 110, 105, 125, 140, 132, 145, 138, 152, 135, 148],
  },
  walking: {
    week: [2.5, 1.8, 3.2, 2.7, 1.5, 4.1, 3.6],
    month: [35, 32, 38, 42],
    year: [95, 105, 120, 115, 130, 145, 140, 155, 145, 160, 150, 165],
  },
};

export const ACTIVITY_STATS = {
  biking: {
    week: {
      distance: "87.5",
      rides: "12",
      duration: "8h 24m",
      calories: "4,250",
    },
    month: {
      distance: "342.8",
      rides: "45",
      duration: "32h 15m",
      calories: "16,750",
    },
    year: {
      distance: "3,845.2",
      rides: "520",
      duration: "378h 42m",
      calories: "187,500",
    },
    all: {
      distance: "5,234.7",
      rides: "684",
      duration: "512h 18m",
      calories: "254,800",
    },
  },
  running: {
    week: {
      distance: "42.3",
      sessions: "8",
      duration: "5h 12m",
      calories: "3,450",
    },
    month: {
      distance: "168.5",
      sessions: "32",
      duration: "21h 45m",
      calories: "13,800",
    },
    year: {
      distance: "1,845.2",
      sessions: "380",
      duration: "245h 30m",
      calories: "147,600",
    },
    all: {
      distance: "2,542.3",
      sessions: "512",
      duration: "328h 42m",
      calories: "203,400",
    },
  },
  walking: {
    week: {
      distance: "35.2",
      steps: "46,250",
      duration: "7h 15m",
      calories: "2,800",
    },
    month: {
      distance: "142.8",
      steps: "187,650",
      duration: "29h 30m",
      calories: "11,450",
    },
    year: {
      distance: "1,645.2",
      steps: "2,156,500",
      duration: "342h 15m",
      calories: "132,540",
    },
    all: {
      distance: "2,245.7",
      steps: "2,945,800",
      duration: "468h 24m",
      calories: "180,240",
    },
  },
};

