import type { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { SiweMessage } from "siwe"
import { prisma } from "@/lib/prisma"
import { PrismaAdapter } from "@next-auth/prisma-adapter"

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      id: "web3",
      name: "Web3",
      credentials: {
        message: { label: "Message", type: "text" },
        signature: { label: "Signature", type: "text" },
      },
      async authorize(credentials, req) {
        if (!credentials?.message || !credentials?.signature) {
          return null
        }

        try {
          const siwe = new SiweMessage(JSON.parse(credentials.message))
          const result = await siwe.verify({
            signature: credentials.signature,
          })

          if (!result.success) {
            return null
          }

          // Get or create user
          const address = siwe.address
          let user = await prisma.user.findUnique({
            where: { walletAddress: address.toLowerCase() },
          })

          if (!user) {
            user = await prisma.user.create({
              data: {
                walletAddress: address.toLowerCase(),
                name: `${address.slice(0, 6)}...${address.slice(-4)}`,
              },
            })
          }

          return {
            id: user.id,
            name: user.name,
            walletAddress: user.walletAddress,
          }
        } catch (error) {
          console.error("SIWE authorization error", error)
          return null
        }
      },
    }),
    CredentialsProvider({
      id: "credentials",
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        })

        if (!user) {
          return null
        }

        // In a real app, you'd check the password hash here
        // This is just a placeholder for demonstration
        const isValidPassword = true // Replace with actual password verification

        if (!isValidPassword) {
          return null
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
        }
      },
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      if (token.sub && session.user) {
        session.user.id = token.sub
      }
      if (token.walletAddress && session.user) {
        session.user.walletAddress = token.walletAddress as string
      }
      return session
    },
    async jwt({ token, user }) {
      if (user) {
        token.walletAddress = (user as any).walletAddress
      }
      return token
    },
  },
}
