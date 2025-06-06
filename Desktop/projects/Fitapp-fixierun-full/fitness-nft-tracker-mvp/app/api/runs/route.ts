import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { verifyToken } from "@/utils/auth"

const prisma = new PrismaClient()

export async function POST(req: Request) {
  try {
    const token = req.headers.get("Authorization")?.split(" ")[1]
    if (!token) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 })
    }

    const userId = verifyToken(token)
    if (!userId) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const { distance, duration, cryptoEarned, startTime, endTime } = await req.json()

    const run = await prisma.run.create({
      data: {
        userId,
        distance,
        duration,
        cryptoEarned,
        startTime,
        endTime,
      },
    })

    await prisma.user.update({
      where: { id: userId },
      data: { cryptoBalance: { increment: cryptoEarned } },
    })

    return NextResponse.json({ run })
  } catch (error) {
    return NextResponse.json({ error: "Error saving run" }, { status: 500 })
  }
}

export async function GET(req: Request) {
  try {
    const token = req.headers.get("Authorization")?.split(" ")[1]
    if (!token) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 })
    }

    const userId = verifyToken(token)
    if (!userId) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const runs = await prisma.run.findMany({
      where: { userId },
      orderBy: { startTime: "desc" },
    })

    return NextResponse.json({ runs })
  } catch (error) {
    return NextResponse.json({ error: "Error fetching runs" }, { status: 500 })
  }
}

