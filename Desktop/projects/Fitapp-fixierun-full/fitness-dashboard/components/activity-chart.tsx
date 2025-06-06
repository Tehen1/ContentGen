"use client"

import type React from "react"

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

interface ActivityChartProps {
  data: {
    date: string
    distance: number
  }[]
}

const ActivityChart: React.FC<ActivityChartProps> = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="distance" fill="#34D399" />
      </BarChart>
    </ResponsiveContainer>
  )
}

export default ActivityChart
