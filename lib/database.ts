import type { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

// Lazy initialization of Prisma client
let prisma: PrismaClient | null = null

async function getPrismaClient() {
  if (!prisma) {
    // Dynamic import to avoid build-time initialization
    const { PrismaClient } = await import("@prisma/client")
    prisma = new PrismaClient({
      log: process.env.NODE_ENV === "development" ? ["error"] : ["error"],
    })
  }
  return prisma
}

// Helper function to safely execute database operations
async function safeDbOperation<T>(operation: () => Promise<T>, fallback: T): Promise<T> {
  // Skip database operations during build time
  if (typeof window === "undefined" && !process.env.DATABASE_URL) {
    console.warn("Database operation skipped - no DATABASE_URL")
    return fallback
  }

  try {
    return await operation()
  } catch (error) {
    console.error("Database operation failed:", error)
    return fallback
  }
}

// User functions
export async function getUserByEmail(email: string) {
  return await safeDbOperation(async () => {
    const client = await getPrismaClient()
    return await client.user.findUnique({ where: { email } })
  }, null)
}

export async function verifyPassword(password: string, hashedPassword: string) {
  try {
    return await bcrypt.compare(password, hashedPassword)
  } catch (error) {
    console.error("Password verification failed:", error)
    return false
  }
}

// Create user with payment proof (for new registration flow)
export async function createUserWithPaymentProof(data: {
  name: string
  email: string
  phone: string
  telegramUsername?: string | null
  password: string
  imageUrl: string
}) {
  return await safeDbOperation(async () => {
    const client = await getPrismaClient()

    // Check if user already exists
    const existingUser = await client.user.findUnique({
      where: { email: data.email },
    })

    if (existingUser) {
      throw new Error("User with this email already exists")
    }

    // Generate unique referral code
    const referralCode = `USER${Date.now().toString().slice(-6)}`

    // Create user and payment proof in a transaction
    const result = await client.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name: data.name,
          email: data.email,
          password: data.password,
          role: "user",
          referralCode,
          telegramUsername: data.telegramUsername,
          isVerified: false,
        },
      })

      const paymentProof = await tx.paymentProof.create({
        data: {
          userId: user.id,
          imageUrl: data.imageUrl,
          status: "pending",
        },
      })

      return { userId: user.id, paymentProofId: paymentProof.id }
    })

    return result
  }, null)
}

export async function getUserByIdWithStats(userId: string) {
  return await safeDbOperation(async () => {
    const client = await getPrismaClient()
    const user = await client.user.findUnique({
      where: { id: userId },
      include: {
        referrals: true,
        withdrawRequests: true,
      },
    })

    if (!user) return null

    const successfulReferrals = user.referrals.filter((r) => r.status === "completed").length
    const pendingReferrals = user.referrals.filter((r) => r.status === "pending").length

    return {
      ...user,
      successfulReferrals,
      pendingReferrals,
    }
  }, null)
}

export async function getUserStats(userId: string) {
  return await safeDbOperation(
    async () => {
      const client = await getPrismaClient()
      const user = await client.user.findUnique({
        where: { id: userId },
        include: {
          referrals: true,
          withdrawRequests: true,
        },
      })

      if (!user) return null

      const successfulReferrals = user.referrals.filter((r) => r.status === "completed").length
      const pendingReferrals = user.referrals.filter((r) => r.status === "pending").length

      return {
        successfulReferrals,
        pendingReferrals,
        balance: user.balance,
        totalEarnings: user.totalEarnings,
      }
    },
    {
      successfulReferrals: 0,
      pendingReferrals: 0,
      balance: 0,
      totalEarnings: 0,
    },
  )
}

export async function getUserReferrals(userId: string) {
  return await safeDbOperation(async () => {
    const client = await getPrismaClient()
    return await client.referral.findMany({
      where: { referrerId: userId },
      include: {
        referred: true,
      },
      orderBy: { createdAt: "desc" },
    })
  }, [])
}

export async function getUserByReferralCode(referralCode: string) {
  return await safeDbOperation(async () => {
    const client = await getPrismaClient()
    return await client.user.findUnique({
      where: { referralCode },
      select: {
        id: true,
        name: true,
        email: true,
        referralCode: true,
      },
    })
  }, null)
}

export async function createReferral(data: {
  referrerId: string
  referredId: string
  status: string
  reward: number
}) {
  return await safeDbOperation(async () => {
    const client = await getPrismaClient()
    try {
      return await client.referral.create({ data })
    } catch (error: any) {
      // Handle unique constraint violation (referral already exists)
      if (error?.code === "P2002") {
        console.log("Referral relationship already exists")
        return null
      }
      throw error
    }
  }, null)
}

// Admin functions
export async function createAdminUser(data: {
  name: string
  email: string
  password: string
}) {
  return await safeDbOperation(async () => {
    const client = await getPrismaClient()

    // Generate unique referral code for admin
    const referralCode = `ADMIN${Date.now().toString().slice(-6)}`

    return await client.user.create({
      data: {
        ...data,
        role: "admin",
        referralCode,
        isVerified: true,
      },
    })
  }, null)
}

export async function getAdminStats() {
  return await safeDbOperation(
    async () => {
      const client = await getPrismaClient()

      try {
        const [totalUsers, activeReferrals, totalPayouts, recentActivities] = await Promise.allSettled([
          client.user.count({ where: { role: "user" } }),
          client.referral.count({ where: { status: "completed" } }),
          client.withdrawRequest.aggregate({
            where: { status: "completed" },
            _sum: { amount: true },
          }),
          client.referral.findMany({
            take: 5,
            orderBy: { createdAt: "desc" },
            include: {
              referrer: { select: { name: true, email: true } },
              referred: { select: { name: true, email: true } },
            },
          }),
        ])

        return {
          totalUsers: totalUsers.status === "fulfilled" ? totalUsers.value : 0,
          activeReferrals: activeReferrals.status === "fulfilled" ? activeReferrals.value : 0,
          totalPayouts: totalPayouts.status === "fulfilled" ? totalPayouts.value._sum.amount || 0 : 0,
          recentActivities:
            recentActivities.status === "fulfilled"
              ? recentActivities.value.map((activity) => ({
                  user: activity.referrer?.name || activity.referrer?.email || "Unknown User",
                  activity: "Referral Signup",
                  date: activity.createdAt.toLocaleDateString(),
                  status: activity.status === "completed" ? "Completed" : "Pending",
                }))
              : [],
        }
      } catch (error) {
        console.error("Error fetching admin stats:", error)
        return {
          totalUsers: 0,
          activeReferrals: 0,
          totalPayouts: 0,
          recentActivities: [],
        }
      }
    },
    {
      totalUsers: 0,
      activeReferrals: 0,
      totalPayouts: 0,
      recentActivities: [],
    },
  )
}

export async function getAllUsers() {
  return await safeDbOperation(async () => {
    const client = await getPrismaClient()
    try {
      const users = await client.user.findMany({
        where: { role: "user" },
        select: {
          id: true,
          name: true,
          email: true,
          telegramUsername: true,
          createdAt: true,
          status: true,
          isVerified: true,
          balance: true,
          totalEarnings: true,
        },
        orderBy: { createdAt: "desc" },
      })

      return users.map((user) => ({
        id: user.id,
        name: user.name || "Unknown",
        email: user.email || "No email",
        telegram: user.telegramUsername || "Not provided",
        joinDate: user.createdAt ? user.createdAt.toLocaleDateString() : "Unknown",
        status: user.status || "Active",
        isVerified: user.isVerified || false,
        balance: user.balance || 0,
        totalEarnings: user.totalEarnings || 0,
      }))
    } catch (error) {
      console.error("Error fetching users:", error)
      return []
    }
  }, [])
}

export async function getAllAdmins() {
  return await safeDbOperation(async () => {
    const client = await getPrismaClient()
    const admins = await client.user.findMany({
      where: { role: "admin" },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        status: true,
      },
      orderBy: { createdAt: "desc" },
    })

    return admins.map((admin) => ({
      id: admin.id,
      name: admin.name || "Unknown",
      email: admin.email,
      joinDate: admin.createdAt.toLocaleDateString(),
      status: admin.status || "Active",
    }))
  }, [])
}

export async function getAllReferrals() {
  return await safeDbOperation(async () => {
    const client = await getPrismaClient()
    const referrals = await client.user.findMany({
      where: { role: "user" }, // Only get regular users, not admins
      include: {
        referrals: true,
        _count: {
          select: {
            referrals: true,
          },
        },
      },
    })

    return referrals.map((user) => ({
      user: user.name || user.email,
      total: user._count.referrals,
      successful: user.referrals.filter((r) => r.status === "completed").length,
      pending: user.referrals.filter((r) => r.status === "pending").length,
      earned: user.totalEarnings,
      status: "Active",
    }))
  }, [])
}

// Withdrawal functions
export async function createWithdrawRequest(data: {
  userId: string
  method: string
  amount: number
  accountInfo: string
  status: string
}) {
  return await safeDbOperation(async () => {
    const client = await getPrismaClient()
    return await client.withdrawRequest.create({ data })
  }, null)
}

// Payment proof functions
export async function getUserPaymentProof(userId: string) {
  return await safeDbOperation(async () => {
    const client = await getPrismaClient()
    return await client.paymentProof.findFirst({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: {
        admin: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    })
  }, null)
}

export async function createPaymentProof(data: {
  userId: string
  imageUrl: string
  status: string
}) {
  return await safeDbOperation(async () => {
    const client = await getPrismaClient()
    return await client.paymentProof.create({ data })
  }, null)
}

export async function getAllPaymentProofs() {
  return await safeDbOperation(async () => {
    const client = await getPrismaClient()
    try {
      return await client.paymentProof.findMany({
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          admin: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      })
    } catch (error) {
      console.error("Error fetching payment proofs:", error)
      return []
    }
  }, [])
}

export async function updatePaymentProofStatus(data: {
  proofId: string
  status: string
  adminId: string
  adminNote?: string
}) {
  return await safeDbOperation(async () => {
    const client = await getPrismaClient()
    return await client.paymentProof.update({
      where: { id: data.proofId },
      data: {
        status: data.status,
        adminId: data.adminId,
        adminNote: data.adminNote,
        updatedAt: new Date(),
      },
      include: {
        user: true,
      },
    })
  }, null)
}

export async function updateUserVerificationStatus(userId: string, isVerified: boolean) {
  return await safeDbOperation(async () => {
    const client = await getPrismaClient()
    return await client.user.update({
      where: { id: userId },
      data: { isVerified },
    })
  }, null)
}
