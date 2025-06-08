import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import bcrypt from "bcryptjs"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

export async function POST(request: NextRequest) {
  try {
    const { createAdminUser, getUserByEmail } = await import("@/lib/database")

    const body = await request.json()
    const { name, email, password } = body

    // Validate required fields
    if (!name || !email || !password) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 })
    }

    // Validate password length
    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters long" }, { status: 400 })
    }

    // Check if user already exists
    const existingUser = await getUserByEmail(email)
    if (existingUser) {
      return NextResponse.json({ error: "User with this email already exists" }, { status: 400 })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create admin user
    const adminUser = await createAdminUser({
      name,
      email,
      password: hashedPassword,
    })

    if (!adminUser) {
      return NextResponse.json({ error: "Failed to create admin user" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "Admin account created successfully",
      adminId: adminUser.id,
    })
  } catch (error) {
    console.error("Admin signup error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
