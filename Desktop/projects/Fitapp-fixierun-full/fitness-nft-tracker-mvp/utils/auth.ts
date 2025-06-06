import { verify } from "jsonwebtoken"

export function verifyToken(token: string): string | null {
  try {
    const decoded = verify(token, process.env.JWT_SECRET!)
    return (decoded as any).userId
  } catch (error) {
    return null
  }
}

