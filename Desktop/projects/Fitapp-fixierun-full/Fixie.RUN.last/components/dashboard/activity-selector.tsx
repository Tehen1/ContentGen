"use client";

import { Bike, Watch, Footprints } from "lucide-react";
import { motion } from "framer-motion";
import { useActivityType } from "@/context/activity-type-context";
import { ActivityType, ACTIVITY_COLORS } from "@/config/activity-config";

export default function ActivitySelector() {
  const { activityType, setActivityType } = useActivityType();

  const activities: { type: ActivityType; icon: React.ElementType; label: string }[] = [
    { type: "biking", icon: Bike, label: "Biking" },
    { type: "running", icon: Watch, label: "Running" },
    { type: "walking", icon: Footprints, label: "Walking" },
  ];

  return (
    <div className="flex justify-center space-x-3 mb-4">
      {activities.map(({ type, icon: Icon, label }) => {
        const isActive = activityType === type;
        const color = ACTIVITY_COLORS[type];
        
        return (
          <motion.button
            key={type}
            onClick={() => setActivityType(type)}
            className={`p-3 rounded-sm flex flex-col items-center ${
              isActive
                ? "bg-cyberpunk-dark text-white"
                : "bg-cyberpunk-dark/50 text-gray-300 hover:bg-cyberpunk-dark/70"
            }`}
            style={{
              backgroundColor: isActive ? color : undefined,
              borderColor: color,
              borderWidth: "1px",
              borderStyle: "solid",
              opacity: isActive ? 1 : 0.7,
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Icon className="w-5 h-5 mb-1" style={{ color: isActive ? "white" : color }} />
            <span className="text-xs">{label}</span>
          </motion.button>
        );
      })}
    </div>
  );
}

