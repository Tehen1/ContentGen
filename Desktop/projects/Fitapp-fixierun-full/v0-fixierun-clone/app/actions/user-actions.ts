"use server"

import { neon } from "@neondatabase/serverless"

// Safely access environment variables
const getDatabaseUrl = () => {
  const url = process.env.DATABASE_URL
  if (!url) {
    console.error("DATABASE_URL environment variable is not set")
    return null
  }
  return url
}

export async function getUserProfile(userId: string) {
  try {
    const dbUrl = getDatabaseUrl()
    if (!dbUrl) {
      return { success: false, error: "Database configuration error" }
    }

    const sql = neon(dbUrl)

    const user = await sql`
      SELECT 
        u.id, 
        u.name, 
        u.email, 
        u.level, 
        u.experience, 
        u.experience_to_next_level, 
        u.token_balance, 
        u.streak_days, 
        u.weekly_distance, 
        u.weekly_calories,
        u.avatar_url,
        (
          SELECT COUNT(*) 
          FROM activities 
          WHERE user_id = u.id
        ) as total_activities,
        (
          SELECT COALESCE(SUM(distance), 0) 
          FROM activities 
          WHERE user_id = u.id
        ) as total_distance,
        (
          SELECT COALESCE(SUM(duration), 0) 
          FROM activities 
          WHERE user_id = u.id
        ) as total_duration,
        (
          SELECT COALESCE(SUM(calories), 0) 
          FROM activities 
          WHERE user_id = u.id
        ) as total_calories
      FROM users u
      WHERE u.id = ${userId}
    `

    if (user && user.length > 0) {
      return { success: true, data: user[0] }
    }

    return { success: false, error: "User not found" }
  } catch (error) {
    console.error("Error fetching user profile:", error)
    return { success: false, error: "Failed to fetch user profile" }
  }
}

export async function getUserNFTs(userId: string) {
  try {
    const dbUrl = getDatabaseUrl()
    if (!dbUrl) {
      return { success: false, error: "Database configuration error" }
    }

    const sql = neon(dbUrl)

    const nfts = await sql`
      SELECT 
        id, 
        name, 
        image_url, 
        rarity, 
        level, 
        boost_type, 
        boost_amount
      FROM nfts
      WHERE user_id = ${userId}
    `

    return { success: true, data: nfts }
  } catch (error) {
    console.error("Error fetching user NFTs:", error)
    return { success: false, error: "Failed to fetch user NFTs" }
  }
}

export async function getUserActivities(userId: string, limit = 10) {
  try {
    const dbUrl = getDatabaseUrl()
    if (!dbUrl) {
      return { success: false, error: "Database configuration error" }
    }

    const sql = neon(dbUrl)

    const activities = await sql`
      SELECT 
        a.id, 
        a.activity_type, 
        a.distance, 
        a.duration, 
        a.calories, 
        a.tokens_earned, 
        a.start_time, 
        a.end_time
      FROM activities a
      WHERE a.user_id = ${userId}
      ORDER BY a.start_time DESC
      LIMIT ${limit}
    `

    return { success: true, data: activities }
  } catch (error) {
    console.error("Error fetching user activities:", error)
    return { success: false, error: "Failed to fetch user activities" }
  }
}

export async function getUserChallenges(userId: string) {
  try {
    const dbUrl = getDatabaseUrl()
    if (!dbUrl) {
      return { success: false, error: "Database configuration error" }
    }

    const sql = neon(dbUrl)

    const challenges = await sql`
      SELECT 
        c.id,
        c.name,
        c.description,
        c.type,
        c.target_value,
        c.reward_tokens,
        c.start_date,
        c.end_date,
        cp.current_value,
        cp.completed
      FROM challenges c
      JOIN challenge_participants cp ON c.id = cp.challenge_id
      WHERE cp.user_id = ${userId}
      ORDER BY c.end_date ASC
    `

    return { success: true, data: challenges }
  } catch (error) {
    console.error("Error fetching user challenges:", error)
    return { success: false, error: "Failed to fetch user challenges" }
  }
}
