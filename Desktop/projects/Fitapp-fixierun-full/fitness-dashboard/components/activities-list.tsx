"use client"

import type React from "react"

interface Activity {
  start_time: string
  end_time: string
  activity_type: string
  distance_km: number
  start_lat: number
  start_lon: number
  end_lat: number
  end_lon: number
  confidence: number
}

interface ActivitiesListProps {
  activities: Activity[]
}

const ActivitiesList: React.FC<ActivitiesListProps> = ({ activities }) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
          <tr>
            <th scope="col" className="px-6 py-3">
              Start Time
            </th>
            <th scope="col" className="px-6 py-3">
              End Time
            </th>
            <th scope="col" className="px-6 py-3">
              Activity Type
            </th>
            <th scope="col" className="px-6 py-3">
              Distance (km)
            </th>
            <th scope="col" className="px-6 py-3">
              Confidence
            </th>
          </tr>
        </thead>
        <tbody>
          {activities.map((activity, index) => (
            <tr
              key={index}
              className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
            >
              <td className="px-6 py-4">{activity.start_time}</td>
              <td className="px-6 py-4">{activity.end_time}</td>
              <td className="px-6 py-4">{activity.activity_type}</td>
              <td className="px-6 py-4">{activity.distance_km.toFixed(2)}</td>
              <td className="px-6 py-4">{activity.confidence.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default ActivitiesList
