"use client"

import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Wallet, Shield, MessageCircle, CheckCircle } from "lucide-react"

export default function LandingPage() {
  const router = useRouter()

  const handleUserStart = () => {
    router.push("/verify-payment")
  }

  const handleAdminAccess = () => {
    router.push("/auth/admin-signin")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl overflow-hidden">
        <CardContent className="p-0">
          {/* Header */}
          <div className="bg-gradient-to-r from-slate-800 to-slate-700 text-white text-center p-8">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl font-bold">S</span>
            </div>
            <h1 className="text-4xl font-bold mb-2">Welcome to Safon</h1>
            <p className="text-xl text-slate-200">Ethiopia's Premier Referral Platform</p>
          </div>

          {/* Content */}
          <div className="p-8">
            <div className="text-center mb-8">
              <p className="text-lg text-muted-foreground mb-6">
                Join thousands of Ethiopians earning ETB by sharing Safon with friends and family. Build your network,
                track your referrals, and withdraw your earnings through trusted Ethiopian payment methods.
              </p>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-6 mb-8">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">50 ETB</div>
                  <div className="text-sm text-muted-foreground">Per Successful Referral</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">1000+</div>
                  <div className="text-sm text-muted-foreground">Active Users</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">24/7</div>
                  <div className="text-sm text-muted-foreground">Support Available</div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 justify-center mb-8">
                <Button
                  onClick={handleUserStart}
                  size="lg"
                  className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                >
                  Start Earning Today
                </Button>
                <Button
                  onClick={handleAdminAccess}
                  size="lg"
                  variant="outline"
                  className="border-red-200 text-red-600 hover:bg-red-50"
                >
                  <Shield className="w-4 h-4 mr-2" />
                  Admin Access
                </Button>
              </div>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              <div className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
                <Wallet className="w-12 h-12 text-green-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Earn ETB Instantly</h3>
                <p className="text-sm text-muted-foreground">
                  Get 50 ETB for every friend who joins and completes verification. No limits on earnings!
                </p>
              </div>

              <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
                <MessageCircle className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Share Easily</h3>
                <p className="text-sm text-muted-foreground">
                  Share your referral link through Telegram, WhatsApp, or any social platform with one click.
                </p>
              </div>

              <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
                <CheckCircle className="w-12 h-12 text-purple-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Secure & Trusted</h3>
                <p className="text-sm text-muted-foreground">
                  Enterprise-grade security with admin verification ensures all referrals are legitimate.
                </p>
              </div>
            </div>

            {/* Payment Methods */}
            <div className="text-center">
              <h4 className="text-lg font-semibold mb-4">Supported Ethiopian Payment Methods</h4>
              <div className="flex justify-center gap-4 flex-wrap">
                <div className="bg-slate-100 px-4 py-2 rounded-lg text-sm font-medium">Telebirr</div>
                <div className="bg-slate-100 px-4 py-2 rounded-lg text-sm font-medium">CBE Birr</div>
                <div className="bg-slate-100 px-4 py-2 rounded-lg text-sm font-medium">Bank of Abyssinia</div>
                <div className="bg-slate-100 px-4 py-2 rounded-lg text-sm font-medium">Chapa</div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gradient-to-r from-slate-100 to-slate-200 p-4 text-center text-sm text-slate-600">
            Safon Referral Platform • Made for Ethiopia
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
