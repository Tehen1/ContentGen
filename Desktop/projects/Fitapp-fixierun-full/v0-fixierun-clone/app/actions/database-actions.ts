"use server"

import { neon } from "@neondatabase/serverless"
import { revalidatePath } from "next/cache"

// Fonction utilitaire pour obtenir la connexion SQL
const getSql = () => {
  const databaseUrl = process.env.DATABASE_URL
  if (!databaseUrl) {
    throw new Error("DATABASE_URL n'est pas définie")
  }
  return neon(databaseUrl)
}

// ========== ACTIONS UTILISATEURS ==========

export async function createUser(walletAddress: string, username?: string, email?: string) {
  try {
    const sql = getSql()
    const result = await sql`
      INSERT INTO users (wallet_address, username, email)
      VALUES (${walletAddress}, ${username}, ${email})
      ON CONFLICT (wallet_address) 
      DO UPDATE SET 
        username = COALESCE(${username}, users.username),
        email = COALESCE(${email}, users.email),
        updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `
    return { success: true, data: result[0] }
  } catch (error) {
    console.error("Erreur lors de la création de l'utilisateur:", error)
    return { success: false, error: "Impossible de créer l'utilisateur" }
  }
}

export async function getUserByWallet(walletAddress: string) {
  try {
    const sql = getSql()
    const result = await sql`
      SELECT * FROM users WHERE wallet_address = ${walletAddress}
    `
    return { success: true, data: result[0] || null }
  } catch (error) {
    console.error("Erreur lors de la récupération de l'utilisateur:", error)
    return { success: false, error: "Impossible de récupérer l'utilisateur" }
  }
}

// ========== ACTIONS VÉLOS NFT ==========

export async function createNFTBike(userId: number, tokenId: string, name: string, rarity: string, imageUrl: string) {
  try {
    const sql = getSql()
    const result = await sql`
      INSERT INTO nft_bikes (user_id, token_id, name, rarity, image_url)
      VALUES (${userId}, ${tokenId}, ${name}, ${rarity}, ${imageUrl})
      RETURNING *
    `
    revalidatePath("/collection")
    return { success: true, data: result[0] }
  } catch (error) {
    console.error("Erreur lors de la création du vélo NFT:", error)
    return { success: false, error: "Impossible de créer le vélo NFT" }
  }
}

export async function getUserNFTBikes(userId: number) {
  try {
    const sql = getSql()
    const result = await sql`
      SELECT * FROM nft_bikes 
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
    `
    return { success: true, data: result }
  } catch (error) {
    console.error("Erreur lors de la récupération des vélos NFT:", error)
    return { success: false, error: "Impossible de récupérer les vélos NFT" }
  }
}

export async function updateBikeLevel(bikeId: number, newLevel: number) {
  try {
    const sql = getSql()
    const result = await sql`
      UPDATE nft_bikes 
      SET 
        level = ${newLevel},
        speed = LEAST(99, speed + 2),
        endurance = LEAST(99, endurance + 2),
        earnings_multiplier = LEAST(2.00, earnings_multiplier + 0.05)
      WHERE id = ${bikeId}
      RETURNING *
    `
    revalidatePath("/collection")
    return { success: true, data: result[0] }
  } catch (error) {
    console.error("Erreur lors de la mise à jour du niveau du vélo:", error)
    return { success: false, error: "Impossible de mettre à jour le vélo" }
  }
}

// ========== ACTIONS ACTIVITÉS ==========

export async function createCyclingActivity(
  userId: number,
  bikeId: number,
  distance: number,
  duration: number,
  averageSpeed: number,
  caloriesBurned: number,
  routeData?: any,
) {
  try {
    const sql = getSql()

    // Calculer les tokens FIX gagnés (0.1 FIX par km + bonus du vélo)
    const bikeResult = await sql`
      SELECT earnings_multiplier FROM nft_bikes WHERE id = ${bikeId}
    `
    const multiplier = bikeResult[0]?.earnings_multiplier || 1.0
    const fixTokensEarned = (distance * 0.1 * multiplier).toFixed(4)

    const result = await sql`
      INSERT INTO cycling_activities (
        user_id, bike_id, distance, duration, average_speed, 
        calories_burned, fix_tokens_earned, route_data
      )
      VALUES (
        ${userId}, ${bikeId}, ${distance}, ${duration}, ${averageSpeed},
        ${caloriesBurned}, ${fixTokensEarned}, ${routeData}
      )
      RETURNING *
    `

    // Créer une récompense pour cette activité
    await sql`
      INSERT INTO rewards (user_id, activity_id, reward_type, amount, description)
      VALUES (
        ${userId}, 
        ${result[0].id}, 
        'activity_completion', 
        ${fixTokensEarned},
        ${"Récompense pour " + distance + " km parcourus"}
      )
    `

    revalidatePath("/dashboard")
    return { success: true, data: result[0], tokensEarned: fixTokensEarned }
  } catch (error) {
    console.error("Erreur lors de la création de l'activité:", error)
    return { success: false, error: "Impossible de créer l'activité" }
  }
}

export async function getUserActivities(userId: number, limit = 10) {
  try {
    const sql = getSql()
    const result = await sql`
      SELECT 
        ca.*,
        nb.name as bike_name,
        nb.image_url as bike_image
      FROM cycling_activities ca
      LEFT JOIN nft_bikes nb ON ca.bike_id = nb.id
      WHERE ca.user_id = ${userId}
      ORDER BY ca.created_at DESC
      LIMIT ${limit}
    `
    return { success: true, data: result }
  } catch (error) {
    console.error("Erreur lors de la récupération des activités:", error)
    return { success: false, error: "Impossible de récupérer les activités" }
  }
}

// ========== ACTIONS DÉFIS ==========

export async function getActiveChallenges() {
  try {
    const sql = getSql()
    const result = await sql`
      SELECT * FROM challenges
      WHERE start_date <= CURRENT_DATE 
      AND end_date >= CURRENT_DATE
      ORDER BY end_date ASC
    `
    return { success: true, data: result }
  } catch (error) {
    console.error("Erreur lors de la récupération des défis:", error)
    return { success: false, error: "Impossible de récupérer les défis" }
  }
}

export async function joinChallenge(challengeId: number, userId: number) {
  try {
    const sql = getSql()
    const result = await sql`
      INSERT INTO challenge_participants (challenge_id, user_id)
      VALUES (${challengeId}, ${userId})
      ON CONFLICT (challenge_id, user_id) DO NOTHING
      RETURNING *
    `
    revalidatePath("/dashboard")
    return { success: true, data: result[0] }
  } catch (error) {
    console.error("Erreur lors de l'inscription au défi:", error)
    return { success: false, error: "Impossible de s'inscrire au défi" }
  }
}

export async function updateChallengeProgress(challengeId: number, userId: number, progress: number) {
  try {
    const sql = getSql()

    // Vérifier si le défi est complété
    const challenge = await sql`
      SELECT target_distance FROM challenges WHERE id = ${challengeId}
    `
    const isCompleted = progress >= challenge[0].target_distance

    const result = await sql`
      UPDATE challenge_participants
      SET 
        progress = ${progress},
        completed = ${isCompleted},
        completed_at = ${isCompleted ? new Date() : null}
      WHERE challenge_id = ${challengeId} AND user_id = ${userId}
      RETURNING *
    `

    // Si complété, créer une récompense
    if (isCompleted && result[0] && !result[0].completed) {
      await sql`
        INSERT INTO rewards (user_id, reward_type, amount, description)
        VALUES (
          ${userId},
          'challenge_completion',
          ${challenge[0].reward_amount},
          ${"Défi complété : " + challenge[0].name}
        )
      `
    }

    return { success: true, data: result[0] }
  } catch (error) {
    console.error("Erreur lors de la mise à jour du progrès:", error)
    return { success: false, error: "Impossible de mettre à jour le progrès" }
  }
}

// ========== ACTIONS COMMENTAIRES ==========

export async function createComment(userId: number, comment: string) {
  try {
    const sql = getSql()
    const result = await sql`
      INSERT INTO comments (user_id, comment)
      VALUES (${userId}, ${comment})
      RETURNING *
    `
    revalidatePath("/dashboard")
    return { success: true, data: result[0] }
  } catch (error) {
    console.error("Erreur lors de la création du commentaire:", error)
    return { success: false, error: "Impossible de créer le commentaire" }
  }
}

export async function getRecentComments(limit = 10) {
  try {
    const sql = getSql()
    const result = await sql`
      SELECT 
        c.*,
        u.username,
        u.wallet_address
      FROM comments c
      JOIN users u ON c.user_id = u.id
      ORDER BY c.created_at DESC
      LIMIT ${limit}
    `
    return { success: true, data: result }
  } catch (error) {
    console.error("Erreur lors de la récupération des commentaires:", error)
    return { success: false, error: "Impossible de récupérer les commentaires" }
  }
}

// ========== STATISTIQUES GLOBALES ==========

export async function getUserStats(userId: number) {
  try {
    const sql = getSql()
    const stats = await sql`
      SELECT 
        COUNT(DISTINCT ca.id) as total_activities,
        COALESCE(SUM(ca.distance), 0) as total_distance,
        COALESCE(SUM(ca.duration), 0) as total_duration,
        COALESCE(SUM(ca.calories_burned), 0) as total_calories,
        COALESCE(SUM(ca.fix_tokens_earned), 0) as total_tokens,
        COUNT(DISTINCT nb.id) as total_bikes,
        COUNT(DISTINCT cp.challenge_id) as active_challenges
      FROM users u
      LEFT JOIN cycling_activities ca ON u.id = ca.user_id
      LEFT JOIN nft_bikes nb ON u.id = nb.user_id
      LEFT JOIN challenge_participants cp ON u.id = cp.user_id AND cp.completed = false
      WHERE u.id = ${userId}
      GROUP BY u.id
    `
    return { success: true, data: stats[0] || {} }
  } catch (error) {
    console.error("Erreur lors de la récupération des statistiques:", error)
    return { success: false, error: "Impossible de récupérer les statistiques" }
  }
}
