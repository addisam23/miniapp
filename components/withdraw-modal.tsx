"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/hooks/use-toast"
import { Building, CreditCard, Smartphone } from "lucide-react"

interface WithdrawModalProps {
  isOpen: boolean
  onClose: () => void
  balance: number
  userId: string
}

const withdrawMethods = [
  { id: "telebirr", name: "Telebirr", icon: Smartphone, fee: "1%" },
  { id: "cbe", name: "CBE", icon: Building, fee: "1.5%" },
  { id: "boa", name: "BOA", icon: Building, fee: "1.5%" },
  { id: "chapa", name: "Chapa", icon: CreditCard, fee: "1.2%" },
]

export default function WithdrawModal({ isOpen, onClose, balance, userId }: WithdrawModalProps) {
  const [selectedMethod, setSelectedMethod] = useState("")
  const [amount, setAmount] = useState("")
  const [accountInfo, setAccountInfo] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedMethod || !amount || !accountInfo) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      })
      return
    }

    const withdrawAmount = Number.parseFloat(amount)
    if (isNaN(withdrawAmount) || withdrawAmount <= 0 || withdrawAmount > balance) {
      toast({
        title: "Error",
        description: "Invalid withdrawal amount",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch("/api/withdraw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          method: selectedMethod,
          amount: withdrawAmount,
          accountInfo,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Success",
          description: `ETB ${withdrawAmount} withdrawal to ${selectedMethod.toUpperCase()} requested!`,
        })
        onClose()
        setSelectedMethod("")
        setAmount("")
        setAccountInfo("")
      } else {
        throw new Error(data.error || "Withdrawal failed")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to process withdrawal",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getPlaceholder = () => {
    switch (selectedMethod) {
      case "telebirr":
        return "Telebirr phone number"
      case "cbe":
        return "CBE account number"
      case "boa":
        return "BOA account number"
      case "chapa":
        return "Chapa account number"
      default:
        return "Phone number or account ID"
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Withdraw Funds</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Select Withdrawal Method</Label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {withdrawMethods.map((method) => {
                const Icon = method.icon
                return (
                  <button
                    key={method.id}
                    type="button"
                    onClick={() => setSelectedMethod(method.id)}
                    className={`p-3 border rounded-lg text-center transition-colors ${
                      selectedMethod === method.id
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-950/20"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <Icon className="w-6 h-6 mx-auto mb-1 text-blue-600" />
                    <div className="text-sm font-medium">{method.name}</div>
                    <div className="text-xs text-muted-foreground">Fee: {method.fee}</div>
                  </button>
                )
              })}
            </div>
          </div>

          <div>
            <Label htmlFor="amount">Amount (ETB)</Label>
            <Input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount to withdraw"
              min="10"
              max={balance}
            />
            <p className="text-sm text-muted-foreground mt-1">Available: ETB {balance.toFixed(2)}</p>
          </div>

          <div>
            <Label htmlFor="accountInfo">Account Information</Label>
            <Input
              id="accountInfo"
              value={accountInfo}
              onChange={(e) => setAccountInfo(e.target.value)}
              placeholder={getPlaceholder()}
            />
            <p className="text-sm text-muted-foreground mt-1">
              Enter your {selectedMethod || "payment"} account details
            </p>
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Processing..." : "Confirm Withdrawal"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
