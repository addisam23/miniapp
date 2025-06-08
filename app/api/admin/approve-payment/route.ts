import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

export async function POST(request: NextRequest) {
  try {
    // Dynamic imports to avoid build-time issues
    const { getServerSession } = await import("next-auth")
    const { authOptions } = await import("@/lib/auth")
    const { updatePaymentProofStatus, updateUserVerificationStatus } = await import("@/lib/database")

    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 })
    }

    const body = await request.json()
    const { proofId, status, adminNote } = body

    // Validate input
    if (!proofId || typeof proofId !== "string") {
      return NextResponse.json({ error: "Invalid proof ID" }, { status: 400 })
    }

    if (!status || !["approved", "rejected"].includes(status)) {
      return NextResponse.json({ error: "Invalid status. Must be 'approved' or 'rejected'" }, { status: 400 })
    }

    // Update payment proof status
    const updatedProof = await updatePaymentProofStatus({
      proofId,
      status,
      adminId: session.user.id,
      adminNote: adminNote || null,
    })

    if (!updatedProof) {
      return NextResponse.json({ error: "Payment proof not found or update failed" }, { status: 404 })
    }

    // If approved, update user verification status
    if (status === "approved" && updatedProof.userId) {
      await updateUserVerificationStatus(updatedProof.userId, true)
    }

    return NextResponse.json({
      success: true,
      proof: {
        id: updatedProof.id,
        status: updatedProof.status,
        adminNote: updatedProof.adminNote,
      },
    })
  } catch (error) {
    console.error("Approval error:", error)
    return NextResponse.json(
      {
        error: "Internal server error. Please try again.",
      },
      { status: 500 },
    )
  }
}
