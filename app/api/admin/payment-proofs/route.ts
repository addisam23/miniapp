import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

export async function GET(request: NextRequest) {
  try {
    // Dynamic imports to avoid build-time issues
    const { getServerSession } = await import("next-auth")
    const { authOptions } = await import("@/lib/auth")
    const { getAllPaymentProofs } = await import("@/lib/database")

    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const paymentProofs = await getAllPaymentProofs()
    return NextResponse.json(paymentProofs || [])
  } catch (error) {
    console.error("Fetch payment proofs error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
