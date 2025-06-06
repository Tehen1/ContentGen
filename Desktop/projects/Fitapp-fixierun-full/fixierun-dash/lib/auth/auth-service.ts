import { neon } from "@neondatabase/serverless"
import bcrypt from "bcryptjs"
import { SignJWT, jwtVerify } from "jose"
import { cookies } from "next/headers"
import { cache } from "react"

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "your-secret-key")
const TOKEN_EXPIRY = "7d"

export interface User {
  id: string
  walletAddress: string
  username?: string
  email?: string
  role: "user" | "admin" | "moderator"
  isActive: boolean
}

export interface Session {
  user: User
  sessionId: string
  expiresAt: Date
}

// Fonction utilitaire pour obtenir la connexion SQL
const getSql = () => {
  const databaseUrl = process.env.DATABASE_URL
  if (!databaseUrl) {
    throw new Error("DATABASE_URL n'est pas définie")
  }
  return neon(databaseUrl)
}

// ========== AUTHENTIFICATION ==========

export async function createUser(
  walletAddress: string,
  username?: string,
  email?: string,
  password?: string,
): Promise<{ success: boolean; user?: User; error?: string }> {
  try {
    const sql = getSql()

    // Hacher le mot de passe si fourni
    const passwordHash = password ? await bcrypt.hash(password, 10) : null

    const result = await sql`
      INSERT INTO users (wallet_address, username, email, password_hash)
      VALUES (${walletAddress}, ${username}, ${email}, ${passwordHash})
      RETURNING id, wallet_address, username, email, role, is_active
    `

    const user = result[0]
    return { success: true, user: mapDbUserToUser(user) }
  } catch (error: any) {
    console.error("Erreur lors de la création de l'utilisateur:", error)

    if (error.code === "23505") {
      if (error.constraint === "users_wallet_address_key") {
        return { success: false, error: "Cette adresse de portefeuille existe déjà" }
      }
      if (error.constraint === "users_username_key") {
        return { success: false, error: "Ce nom d'utilisateur est déjà pris" }
      }
      if (error.constraint === "users_email_key") {
        return { success: false, error: "Cette adresse email est déjà utilisée" }
      }
    }

    return { success: false, error: "Impossible de créer l'utilisateur" }
  }
}

export async function authenticateWithWallet(
  walletAddress: string,
): Promise<{ success: boolean; session?: Session; error?: string }> {
  try {
    const sql = getSql()

    // Vérifier si l'utilisateur existe
    const userResult = await sql`
      SELECT id, wallet_address, username, email, role, is_active
      FROM users
      WHERE LOWER(wallet_address) = LOWER(${walletAddress})
    `

    if (userResult.length === 0) {
      // Créer automatiquement l'utilisateur
      const createResult = await createUser(walletAddress)
      if (!createResult.success || !createResult.user) {
        return { success: false, error: createResult.error }
      }
      return createSession(createResult.user)
    }

    const user = mapDbUserToUser(userResult[0])

    if (!user.isActive) {
      return { success: false, error: "Compte désactivé" }
    }

    return createSession(user)
  } catch (error) {
    console.error("Erreur d'authentification:", error)
    return { success: false, error: "Erreur d'authentification" }
  }
}

export async function authenticateWithPassword(
  emailOrUsername: string,
  password: string,
): Promise<{ success: boolean; session?: Session; error?: string }> {
  try {
    const sql = getSql()

    const userResult = await sql`
      SELECT id, wallet_address, username, email, role, is_active, password_hash
      FROM users
      WHERE LOWER(email) = LOWER(${emailOrUsername}) 
         OR LOWER(username) = LOWER(${emailOrUsername})
    `

    if (userResult.length === 0) {
      return { success: false, error: "Identifiants invalides" }
    }

    const dbUser = userResult[0]

    if (!dbUser.password_hash) {
      return { success: false, error: "Connexion par mot de passe non configurée" }
    }

    const isValidPassword = await bcrypt.compare(password, dbUser.password_hash)
    if (!isValidPassword) {
      return { success: false, error: "Identifiants invalides" }
    }

    if (!dbUser.is_active) {
      return { success: false, error: "Compte désactivé" }
    }

    const user = mapDbUserToUser(dbUser)
    return createSession(user)
  } catch (error) {
    console.error("Erreur d'authentification:", error)
    return { success: false, error: "Erreur d'authentification" }
  }
}

async function createSession(user: User): Promise<{ success: boolean; session?: Session; error?: string }> {
  try {
    const sql = getSql()

    // Créer le JWT
    const token = await new SignJWT({ userId: user.id })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime(TOKEN_EXPIRY)
      .setIssuedAt()
      .sign(JWT_SECRET)

    // Hacher le token pour le stockage
    const tokenHash = await bcrypt.hash(token, 10)

    // Créer la session en base
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 jours

    const sessionResult = await sql`
      INSERT INTO user_sessions (user_id, token_hash, expires_at, ip_address, user_agent)
      VALUES (${user.id}, ${tokenHash}, ${expiresAt}, ${getClientIp()}, ${getUserAgent()})
      RETURNING id
    `

    // Mettre à jour last_login_at
    await sql`
      UPDATE users SET last_login_at = CURRENT_TIMESTAMP WHERE id = ${user.id}
    `

    // Stocker le token dans un cookie httpOnly
    cookies().set("session-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 jours
      path: "/",
    })

    const session: Session = {
      user,
      sessionId: sessionResult[0].id,
      expiresAt,
    }

    return { success: true, session }
  } catch (error) {
    console.error("Erreur lors de la création de session:", error)
    return { success: false, error: "Impossible de créer la session" }
  }
}

// Fonction cachée pour obtenir la session courante
export const getCurrentSession = cache(async (): Promise<Session | null> => {
  try {
    const token = cookies().get("session-token")?.value
    if (!token) return null

    // Vérifier le JWT
    const { payload } = await jwtVerify(token, JWT_SECRET)
    const userId = payload.userId as string

    const sql = getSql()

    // Récupérer la session et l'utilisateur
    const result = await sql`
      SELECT 
        s.id as session_id,
        s.expires_at,
        u.id,
        u.wallet_address,
        u.username,
        u.email,
        u.role,
        u.is_active
      FROM user_sessions s
      JOIN users u ON s.user_id = u.id
      WHERE s.user_id = ${userId}
        AND s.expires_at > CURRENT_TIMESTAMP
        AND u.is_active = TRUE
      ORDER BY s.created_at DESC
      LIMIT 1
    `

    if (result.length === 0) return null

    const data = result[0]

    return {
      user: {
        id: data.id,
        walletAddress: data.wallet_address,
        username: data.username,
        email: data.email,
        role: data.role,
        isActive: data.is_active,
      },
      sessionId: data.session_id,
      expiresAt: new Date(data.expires_at),
    }
  } catch (error) {
    console.error("Erreur lors de la récupération de session:", error)
    return null
  }
})

export async function logout(): Promise<void> {
  const session = await getCurrentSession()
  if (session) {
    const sql = getSql()
    // Supprimer la session de la base
    await sql`DELETE FROM user_sessions WHERE id = ${session.sessionId}`
  }

  // Supprimer le cookie
  cookies().delete("session-token")
}

// ========== VALIDATION DES DONNÉES ==========

export interface ValidationResult {
  isValid: boolean
  errors: Record<string, string>
}

export function validateUsername(username: string): ValidationResult {
  const errors: Record<string, string> = {}

  if (!username || username.length < 3) {
    errors.username = "Le nom d'utilisateur doit contenir au moins 3 caractères"
  } else if (username.length > 30) {
    errors.username = "Le nom d'utilisateur ne peut pas dépasser 30 caractères"
  } else if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    errors.username = "Le nom d'utilisateur ne peut contenir que des lettres, chiffres et underscores"
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  }
}

export function validateEmail(email: string): ValidationResult {
  const errors: Record<string, string> = {}
  const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/

  if (!email || !emailRegex.test(email)) {
    errors.email = "Adresse email invalide"
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  }
}

export function validateWalletAddress(address: string): ValidationResult {
  const errors: Record<string, string> = {}
  const walletRegex = /^0x[a-fA-F0-9]{40}$/

  if (!address || !walletRegex.test(address)) {
    errors.walletAddress = "Adresse de portefeuille invalide"
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  }
}

export function validatePassword(password: string): ValidationResult {
  const errors: Record<string, string> = {}

  if (!password || password.length < 8) {
    errors.password = "Le mot de passe doit contenir au moins 8 caractères"
  } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
    errors.password = "Le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre"
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  }
}

// ========== UTILITAIRES ==========

function mapDbUserToUser(dbUser: any): User {
  return {
    id: dbUser.id,
    walletAddress: dbUser.wallet_address,
    username: dbUser.username,
    email: dbUser.email,
    role: dbUser.role,
    isActive: dbUser.is_active,
  }
}

function getClientIp(): string | null {
  // Dans un environnement réel, récupérer l'IP depuis les headers
  return null
}

function getUserAgent(): string | null {
  // Dans un environnement réel, récupérer le user agent depuis les headers
  return null
}

// ========== MIDDLEWARE DE SÉCURITÉ ==========

export async function requireAuth(): Promise<Session> {
  const session = await getCurrentSession()
  if (!session) {
    throw new Error("Authentification requise")
  }
  return session
}

export async function requireRole(role: "admin" | "moderator"): Promise<Session> {
  const session = await requireAuth()
  if (session.user.role !== role && session.user.role !== "admin") {
    throw new Error("Permissions insuffisantes")
  }
  return session
}

// ========== AUDIT ==========

export async function logAuditEvent(
  action: string,
  tableName?: string,
  recordId?: string,
  oldValues?: any,
  newValues?: any,
): Promise<void> {
  try {
    const sql = getSql()
    const session = await getCurrentSession()

    await sql`
      INSERT INTO audit_logs (
        user_id, action, table_name, record_id, 
        old_values, new_values, ip_address, user_agent
      ) VALUES (
        ${session?.user.id || null},
        ${action},
        ${tableName},
        ${recordId},
        ${oldValues ? JSON.stringify(oldValues) : null},
        ${newValues ? JSON.stringify(newValues) : null},
        ${getClientIp()},
        ${getUserAgent()}
      )
    `
  } catch (error) {
    console.error("Erreur lors de l'enregistrement de l'audit:", error)
  }
}
