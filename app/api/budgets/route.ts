import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const currentDate = new Date()
    const month = currentDate.getMonth() + 1
    const year = currentDate.getFullYear()

    const budgets = await prisma.budget.findMany({
      where: {
        userId: user.id,
        month,
        year,
      },
      include: { category: true },
    })

    return NextResponse.json(budgets)
  } catch (error) {
    console.error("Error fetching budgets:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { categoryId, limit } = body

    const currentDate = new Date()
    const month = currentDate.getMonth() + 1
    const year = currentDate.getFullYear()

    const budget = await prisma.budget.upsert({
      where: {
        userId_categoryId_month_year: {
          userId: user.id,
          categoryId,
          month,
          year,
        },
      },
      update: {
        limit: Number.parseFloat(limit),
      },
      create: {
        userId: user.id,
        categoryId,
        limit: Number.parseFloat(limit),
        month,
        year,
      },
      include: { category: true },
    })

    return NextResponse.json(budget)
  } catch (error) {
    console.error("Error creating/updating budget:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
