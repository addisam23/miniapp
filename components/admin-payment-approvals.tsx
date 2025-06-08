"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { toast } from "@/hooks/use-toast"
import { CheckCircle, XCircle, Eye, Clock, User } from "lucide-react"
import { useRouter } from "next/navigation"

interface PaymentApprovalProps {
  paymentProofs: any[]
}

// Add proper error handling and data validation at the top of the component
export default function AdminPaymentApprovals({ paymentProofs }: PaymentApprovalProps) {
  const [selectedProof, setSelectedProof] = useState<any>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [adminNote, setAdminNote] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const router = useRouter()

  // Ensure paymentProofs is always an array
  const safePaymentProofs = Array.isArray(paymentProofs) ? paymentProofs : []

  const handleViewProof = (proof: any) => {
    setSelectedProof(proof)
    setAdminNote(proof?.adminNote || "")
    setIsModalOpen(true)
  }

  const handleApproval = async (proofId: string, status: "approved" | "rejected") => {
    if (!proofId) {
      toast({
        title: "Error",
        description: "Invalid payment proof ID",
        variant: "destructive",
      })
      return
    }

    setIsProcessing(true)

    try {
      const response = await fetch("/api/admin/approve-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          proofId,
          status,
          adminNote: adminNote.trim() || null,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to update payment proof")
      }

      const data = await response.json()

      toast({
        title: "Success",
        description: `Payment proof ${status} successfully`,
      })
      setIsModalOpen(false)
      router.refresh()
    } catch (error) {
      console.error("Approval error:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update payment proof",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>
      case "rejected":
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>
      default:
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
    }
  }

  const pendingProofs = safePaymentProofs.filter((proof) => proof?.status === "pending")
  const processedProofs = safePaymentProofs.filter((proof) => proof?.status !== "pending")

  return (
    <div className="space-y-6">
      {/* Pending Approvals */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-yellow-600" />
            Pending Payment Approvals ({pendingProofs.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pendingProofs.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No pending payment proofs</p>
          ) : (
            <div className="space-y-4">
              {pendingProofs.map((proof) => (
                <div
                  key={proof?.id || Math.random()}
                  className="flex items-center justify-between p-4 border rounded-lg bg-yellow-50"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">{proof?.user?.name || proof?.user?.email || "Unknown User"}</p>
                      <p className="text-sm text-muted-foreground">
                        Submitted {proof?.createdAt ? new Date(proof.createdAt).toLocaleDateString() : "Unknown date"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(proof?.status || "pending")}
                    <Button variant="outline" size="sm" onClick={() => handleViewProof(proof)}>
                      <Eye className="w-4 h-4 mr-1" />
                      Review
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Rest of the component remains the same but with better null checks */}
      {/* Processed Approvals */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Processed Approvals</CardTitle>
        </CardHeader>
        <CardContent>
          {processedProofs.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No processed payment proofs</p>
          ) : (
            <div className="space-y-4">
              {processedProofs.slice(0, 10).map((proof) => (
                <div key={proof.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">{proof.user?.name || proof.user?.email || "Unknown User"}</p>
                      <p className="text-sm text-muted-foreground">
                        Processed {new Date(proof.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(proof.status)}
                    <Button variant="outline" size="sm" onClick={() => handleViewProof(proof)}>
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Review Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Review Payment Proof</DialogTitle>
          </DialogHeader>

          {selectedProof && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">User:</span>{" "}
                  {selectedProof.user?.name || selectedProof.user?.email || "Unknown User"}
                </div>
                <div>
                  <span className="font-medium">Status:</span> {getStatusBadge(selectedProof.status)}
                </div>
                <div>
                  <span className="font-medium">Submitted:</span> {new Date(selectedProof.createdAt).toLocaleString()}
                </div>
                <div>
                  <span className="font-medium">Email:</span> {selectedProof.user?.email || "N/A"}
                </div>
              </div>

              <div className="border rounded-lg p-4">
                <p className="font-medium mb-2">Payment Proof Image:</p>
                <img
                  src={selectedProof.imageUrl || "/placeholder.svg"}
                  alt="Payment proof"
                  className="max-w-full max-h-96 rounded-lg border"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.src = "/placeholder.svg"
                  }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Admin Note (Optional)</label>
                <Textarea
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  placeholder="Add a note for the user..."
                  rows={3}
                />
              </div>

              {selectedProof.status === "pending" && (
                <div className="flex gap-3">
                  <Button
                    onClick={() => handleApproval(selectedProof.id, "rejected")}
                    disabled={isProcessing}
                    variant="destructive"
                    className="flex-1"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    {isProcessing ? "Processing..." : "Reject"}
                  </Button>
                  <Button
                    onClick={() => handleApproval(selectedProof.id, "approved")}
                    disabled={isProcessing}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    {isProcessing ? "Processing..." : "Approve"}
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
