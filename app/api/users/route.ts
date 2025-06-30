import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser()

    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { id, email, name } = body

    // Create or update user
    const user = await prisma.user.upsert({
      where: { email }, // upsert sur l'email, qui est unique
      update: { name },
      create: {
        id,
        email,
        name,
      },
    })

    return NextResponse.json(user)
  } catch (error) {
    console.error("Error creating/updating user:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
