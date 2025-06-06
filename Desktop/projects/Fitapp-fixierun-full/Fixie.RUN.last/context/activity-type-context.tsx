"use client";

import { createContext, useContext, useState, ReactNode } from "react";

export type ActivityType = "biking" | "running" | "walking";

interface ActivityTypeContextType {
  activityType: ActivityType;
  setActivityType: (type: ActivityType) => void;
}

const ActivityTypeContext = createContext<ActivityTypeContextType | undefined>(undefined);

export function ActivityTypeProvider({ children }: { children: ReactNode }) {
  const [activityType, setActivityType] = useState<ActivityType>("biking");

  return (
    <ActivityTypeContext.Provider value={{ activityType, setActivityType }}>
      {children}
    </ActivityTypeContext.Provider>
  );
}

export function useActivityType() {
  const context = useContext(ActivityTypeContext);
  if (context === undefined) {
    throw new Error("useActivityType must be used within an ActivityTypeProvider");
  }
  return context;
}

