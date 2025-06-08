"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Users,
  Shield,
  Network,
  Wallet,
  TrendingUp,
  Search,
  Eye,
  Edit,
  Plus,
  Download,
  Menu,
  X,
  CheckCircle,
  LogOut,
} from "lucide-react"
import AdminPaymentApprovals from "./admin-payment-approvals"
import { signOut } from "next-auth/react"
import { toast } from "@/hooks/use-toast"

interface AdminDashboardProps {
  stats: any
  users: any[]
  referrals: any[]
  paymentProofs: any[]
  admins?: any[]
}

export default function AdminDashboard({ stats, users, referrals, paymentProofs, admins = [] }: AdminDashboardProps) {
  const [activeSection, setActiveSection] = useState("dashboard")
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: TrendingUp },
    { id: "users", label: "Users", icon: Users },
    { id: "admins", label: "Admins", icon: Shield },
    { id: "referrals", label: "Referrals", icon: Network },
    { id: "payouts", label: "Payouts", icon: Wallet },
    { id: "payment-approvals", label: "Payment Approvals", icon: CheckCircle },
  ]

  const handleSignOut = async () => {
    try {
      await signOut({ callbackUrl: "/auth/admin-signin" })
      toast({
        title: "Signed Out",
        description: "You have been successfully signed out",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to sign out",
        variant: "destructive",
      })
    }
  }

  const renderContent = () => {
    switch (activeSection) {
      case "dashboard":
        return <DashboardContent stats={stats} />
      case "users":
        return <UsersContent users={users} />
      case "admins":
        return <AdminsContent admins={admins} />
      case "referrals":
        return <ReferralsContent referrals={referrals} />
      case "payouts":
        return <PayoutsContent />
      case "payment-approvals":
        return <PaymentApprovalsContent paymentProofs={paymentProofs} />
      default:
        return <DashboardContent stats={stats} />
    }
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-800 text-white transform ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}
      >
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8 text-red-400" />
            <h1 className="text-xl font-bold">Safon Admin</h1>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-white hover:bg-slate-700"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search..."
              className="pl-10 bg-slate-700 border-slate-600 text-white placeholder-slate-400"
            />
          </div>
        </div>

        <nav className="mt-4">
          <div className="px-4 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">Management</div>
          {menuItems.map((item) => {
            const Icon = item.icon
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveSection(item.id)
                  setSidebarOpen(false)
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-slate-700 transition-colors ${
                  activeSection === item.id ? "bg-slate-700 border-r-2 border-red-400" : ""
                }`}
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </button>
            )
          })}
        </nav>

        {/* Sign Out Button */}
        <div className="absolute bottom-4 left-4 right-4">
          <Button
            onClick={handleSignOut}
            variant="outline"
            className="w-full bg-red-600 hover:bg-red-700 text-white border-red-600"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(true)} className="lg:hidden">
                <Menu className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {menuItems.find((item) => item.id === activeSection)?.label || "Dashboard"}
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">Welcome to Safon Admin Panel</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="destructive" className="bg-red-600">
                Admin Access
              </Badge>
              <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center text-white font-bold">
                A
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6">{renderContent()}</main>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}
    </div>
  )
}

function PaymentApprovalsContent({ paymentProofs }: { paymentProofs: any[] }) {
  return <AdminPaymentApprovals paymentProofs={paymentProofs} />
}

// Update the DashboardContent function to handle undefined stats
function DashboardContent({ stats }: { stats: any }) {
  const safeStats = {
    totalUsers: stats?.totalUsers || 0,
    activeReferrals: stats?.activeReferrals || 0,
    totalPayouts: stats?.totalPayouts || 0,
    recentActivities: stats?.recentActivities || [],
  }

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{safeStats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+12.4%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Referrals</CardTitle>
            <Network className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{safeStats.activeReferrals}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+8.2%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Payouts</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">ETB {safeStats.totalPayouts.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+18.7%</span> from last month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activities */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activities</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {safeStats.recentActivities.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No recent activities</p>
            ) : (
              safeStats.recentActivities.map((activity: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">{activity.user || "Unknown User"}</p>
                    <p className="text-sm text-muted-foreground">{activity.activity || "Activity"}</p>
                    <p className="text-xs text-muted-foreground">{activity.date || "Unknown Date"}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={activity.status === "Completed" ? "default" : "secondary"}>
                      {activity.status || "Unknown"}
                    </Badge>
                    <Button variant="outline" size="sm">
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Update UsersContent to handle empty users array
function UsersContent({ users }: { users: any[] }) {
  const safeUsers = users || []

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>User Management ({safeUsers.length})</CardTitle>
          <div className="flex gap-2">
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {safeUsers.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No users found</p>
            ) : (
              safeUsers.map((user, index) => (
                <div key={user.id || index} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <Users className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium">{user.name || "Unknown"}</p>
                        <p className="text-sm text-muted-foreground">{user.email || "No email"}</p>
                        <p className="text-xs text-muted-foreground">Joined: {user.joinDate || "Unknown"}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm font-medium">ETB {(user.balance || 0).toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground">Balance</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={user.isVerified ? "default" : "secondary"}>
                        {user.isVerified ? "Verified" : "Pending"}
                      </Badge>
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function AdminsContent({ admins }: { admins: any[] }) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Admin Management</CardTitle>
          <Button className="bg-red-600 hover:bg-red-700">
            <Plus className="w-4 h-4 mr-2" />
            Add Admin
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {admins.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No admin users found</p>
            ) : (
              admins.map((admin, index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                      <Shield className="w-5 h-5 text-red-600" />
                    </div>
                    <div>
                      <p className="font-medium">{admin.name}</p>
                      <p className="text-sm text-muted-foreground">{admin.email}</p>
                      <p className="text-xs text-muted-foreground">Joined: {admin.joinDate}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="destructive">Admin</Badge>
                    <Button variant="outline" size="sm">
                      <Edit className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function ReferralsContent({ referrals }: { referrals: any[] }) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Referral Statistics</CardTitle>
          <Button>
            <Download className="w-4 h-4 mr-2" />
            Export Data
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {referrals.map((referral, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">{referral.user}</p>
                  <p className="text-sm text-muted-foreground">
                    {referral.successful} successful, {referral.pending} pending
                  </p>
                  <p className="text-xs text-muted-foreground">Earned: ETB {referral.earned}</p>
                </div>
                <Badge variant={referral.status === "Active" ? "default" : "secondary"}>{referral.status}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function PayoutsContent() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Payout Management</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Payout management functionality will be implemented here.</p>
        </CardContent>
      </Card>
    </div>
  )
}
