"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { usePaymentStore, type PaymentRequest } from "@/lib/payment-store"
import { CheckCircle, XCircle, Clock, Eye, Shield, Users, TrendingUp, AlertTriangle } from "lucide-react"

const ADMIN_PASSWORD = "ContractScan@2024"

export default function AdminPage() {
  const { paymentRequests, approvePayment, rejectPayment, getPendingPayments } = usePaymentStore()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState("")
  const [authError, setAuthError] = useState("")
  const [selectedPayment, setSelectedPayment] = useState<PaymentRequest | null>(null)
  const [reviewNote, setReviewNote] = useState("")
  const [mounted, setMounted] = useState(false)
  const [actionSuccess, setActionSuccess] = useState<string | null>(null)

  useEffect(() => {
    setMounted(true)
    const auth = sessionStorage.getItem("admin_auth")
    if (auth === "true") {
      setIsAuthenticated(true)
    }
  }, [])

  const handleLogin = () => {
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true)
      sessionStorage.setItem("admin_auth", "true")
      setAuthError("")
    } else {
      setAuthError("Invalid password")
    }
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    sessionStorage.removeItem("admin_auth")
  }

  const handleApprove = (payment: PaymentRequest) => {
    approvePayment(payment.id, reviewNote)
    setSelectedPayment(null)
    setReviewNote("")
    setActionSuccess(`Payment approved for ${payment.userName}. Their ${payment.plan} plan is now active.`)
    setTimeout(() => setActionSuccess(null), 5000)
  }

  const handleReject = (payment: PaymentRequest) => {
    rejectPayment(payment.id, reviewNote)
    setSelectedPayment(null)
    setReviewNote("")
    setActionSuccess(`Payment rejected for ${payment.userName}.`)
    setTimeout(() => setActionSuccess(null), 5000)
  }

  const formatPrice = (price: number) => `₹${price.toLocaleString("en-IN")}`

  const getStatusBadge = (status: PaymentRequest["status"]) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        )
      case "approved":
        return (
          <Badge variant="outline" className="bg-green-500/10 text-green-600">
            <CheckCircle className="h-3 w-3 mr-1" />
            Approved
          </Badge>
        )
      case "rejected":
        return (
          <Badge variant="outline" className="bg-red-500/10 text-red-600">
            <XCircle className="h-3 w-3 mr-1" />
            Rejected
          </Badge>
        )
    }
  }

  if (!mounted) {
    return <div className="flex items-center justify-center min-h-[60vh]">Loading...</div>
  }

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <CardTitle>Admin Access</CardTitle>
            <CardDescription>Enter password to access the admin panel</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              type="password"
              placeholder="Enter admin password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            />
            {authError && <p className="text-sm text-red-500">{authError}</p>}
            <Button className="w-full" onClick={handleLogin}>
              Login
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const pendingPayments = getPendingPayments()
  const approvedPayments = paymentRequests.filter((p) => p.status === "approved")
  const rejectedPayments = paymentRequests.filter((p) => p.status === "rejected")
  const totalRevenue = approvedPayments.reduce((sum, p) => sum + p.amount, 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage payment verifications and subscriptions</p>
        </div>
        <Button variant="outline" onClick={handleLogout}>
          Logout
        </Button>
      </div>

      {/* Success Message */}
      {actionSuccess && (
        <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center gap-3">
          <CheckCircle className="h-5 w-5 text-green-600" />
          <p className="text-green-600">{actionSuccess}</p>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-yellow-500/10 rounded-full flex items-center justify-center">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{pendingPayments.length}</p>
                <p className="text-sm text-muted-foreground">Pending Reviews</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-green-500/10 rounded-full flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{approvedPayments.length}</p>
                <p className="text-sm text-muted-foreground">Approved</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-red-500/10 rounded-full flex items-center justify-center">
                <XCircle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{rejectedPayments.length}</p>
                <p className="text-sm text-muted-foreground">Rejected</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-emerald-500/10 rounded-full flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{formatPrice(totalRevenue)}</p>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Payments */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
            Pending Payment Verifications ({pendingPayments.length})
          </CardTitle>
          <CardDescription>Review and approve/reject payment requests</CardDescription>
        </CardHeader>
        <CardContent>
          {pendingPayments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <CheckCircle className="h-12 w-12 mx-auto mb-3 text-green-500/50" />
              <p>No pending payments to review</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingPayments.map((payment) => (
                <div
                  key={payment.id}
                  className="flex items-start justify-between p-4 rounded-lg bg-yellow-500/5 border border-yellow-500/20"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold">{payment.userName}</p>
                      <Badge variant="secondary">{payment.plan}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{payment.userEmail}</p>
                    <p className="text-sm">
                      <span className="text-muted-foreground">Amount:</span>{" "}
                      <span className="font-bold text-green-600">{formatPrice(payment.amount)}</span>
                    </p>
                    <p className="text-sm">
                      <span className="text-muted-foreground">Transaction ID:</span>{" "}
                      <span className="font-mono bg-muted px-2 py-0.5 rounded">{payment.transactionId}</span>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Submitted: {new Date(payment.submittedAt).toLocaleString()}
                    </p>
                  </div>
                  <Button variant="default" size="sm" onClick={() => setSelectedPayment(payment)}>
                    <Eye className="h-4 w-4 mr-1" />
                    Review
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* All Payments History */}
      <Card>
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
          <CardDescription>Complete history of all payment requests</CardDescription>
        </CardHeader>
        <CardContent>
          {paymentRequests.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No payment requests yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">User</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Plan</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Amount</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Transaction ID</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Date</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paymentRequests.map((payment) => (
                    <tr key={payment.id} className="border-b border-border last:border-0 hover:bg-muted/50">
                      <td className="py-4 px-4">
                        <div>
                          <p className="font-medium">{payment.userName}</p>
                          <p className="text-sm text-muted-foreground">{payment.userEmail}</p>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <Badge variant="outline" className="capitalize">
                          {payment.plan}
                        </Badge>
                      </td>
                      <td className="py-4 px-4 font-medium">{formatPrice(payment.amount)}</td>
                      <td className="py-4 px-4 font-mono text-sm">{payment.transactionId}</td>
                      <td className="py-4 px-4">{getStatusBadge(payment.status)}</td>
                      <td className="py-4 px-4 text-sm text-muted-foreground">
                        {new Date(payment.submittedAt).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-4">
                        <Button variant="ghost" size="sm" onClick={() => setSelectedPayment(payment)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Review Dialog */}
      <Dialog open={!!selectedPayment} onOpenChange={() => setSelectedPayment(null)}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Review Payment</DialogTitle>
            <DialogDescription>Verify the payment details and approve or reject</DialogDescription>
          </DialogHeader>

          {selectedPayment && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 p-4 rounded-lg bg-muted/50">
                <div>
                  <p className="text-sm text-muted-foreground">User</p>
                  <p className="font-medium">{selectedPayment.userName}</p>
                  <p className="text-sm text-muted-foreground">{selectedPayment.userEmail}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Plan</p>
                  <p className="font-medium capitalize">{selectedPayment.plan}</p>
                  <p className="text-xl font-bold text-green-600">{formatPrice(selectedPayment.amount)}</p>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground mb-1">Transaction ID / UTR</p>
                <p className="font-mono font-medium text-lg">{selectedPayment.transactionId}</p>
              </div>

              <div className="p-4 rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground mb-1">Submitted On</p>
                <p className="font-medium">{new Date(selectedPayment.submittedAt).toLocaleString()}</p>
              </div>

              <div className="p-4 rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground mb-1">Current Status</p>
                {getStatusBadge(selectedPayment.status)}
                {selectedPayment.reviewNote && <p className="text-sm mt-2">Note: {selectedPayment.reviewNote}</p>}
              </div>

              {selectedPayment.screenshotUrl && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Payment Screenshot</p>
                  <img
                    src={selectedPayment.screenshotUrl || "/placeholder.svg"}
                    alt="Payment screenshot"
                    className="w-full rounded-lg border border-border"
                  />
                </div>
              )}

              {selectedPayment.status === "pending" && (
                <>
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Review Note (Optional)</p>
                    <Textarea
                      placeholder="Add a note about this payment..."
                      value={reviewNote}
                      onChange={(e) => setReviewNote(e.target.value)}
                    />
                  </div>

                  <div className="flex gap-3">
                    <Button className="flex-1" variant="destructive" onClick={() => handleReject(selectedPayment)}>
                      <XCircle className="h-4 w-4 mr-2" />
                      Reject
                    </Button>
                    <Button className="flex-1" onClick={() => handleApprove(selectedPayment)}>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Approve & Activate
                    </Button>
                  </div>
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
