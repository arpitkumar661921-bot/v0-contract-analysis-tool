"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Check, Copy, CheckCircle, Building2, Upload, Loader2, Clock, AlertCircle } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { useUserStore } from "@/lib/user-store"
import { usePaymentStore, type PaymentRequest } from "@/lib/payment-store"

const PLANS = {
  individual: {
    name: "Individual",
    price: 99,
    features: ["5 contract scans/month", "Hidden fee detection", "Cost calculator", "1-page summary PDF"],
  },
  planner: {
    name: "Planner",
    price: 1999,
    features: [
      "Unlimited contract scans",
      "AI negotiation suggestions",
      "Venue comparison (up to 5)",
      "Contract templates",
      "Budget planner",
      "Priority support",
    ],
  },
  enterprise: {
    name: "Enterprise",
    price: 4999,
    features: [
      "Everything in Planner",
      "Team dashboard (10 users)",
      "Client sharing links",
      "API access",
      "Whitelabel branding",
      "Dedicated support",
    ],
  },
}

const BANK_DETAILS = {
  accountName: "Arpit Kumar",
  accountNumber: "1285538701",
  ifscCode: "AIRP0000001",
  upiId: "arpitkumar@upi",
}

type PlanType = "individual" | "planner" | "enterprise"

export function BillingPage() {
  const { user, setPendingSubscription, activateSubscription } = useUserStore()
  const { addPaymentRequest, getPaymentsByEmail, getApprovedPaymentForUser } = usePaymentStore()
  const [showPaymentDialog, setShowPaymentDialog] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<PlanType | null>(null)
  const [transactionId, setTransactionId] = useState("")
  const [screenshot, setScreenshot] = useState<File | null>(null)
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)
  const [userPayments, setUserPayments] = useState<PaymentRequest[]>([])

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (user?.email) {
      const approvedPayment = getApprovedPaymentForUser(user.email)
      if (approvedPayment && user.subscriptionStatus !== "active") {
        activateSubscription(approvedPayment.plan)
      }
      setUserPayments(getPaymentsByEmail(user.email))
    }
  }, [user, getApprovedPaymentForUser, getPaymentsByEmail, activateSubscription])

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text)
    setCopiedField(field)
    setTimeout(() => setCopiedField(null), 2000)
  }

  const copyAllDetails = () => {
    const details = `Account Name: ${BANK_DETAILS.accountName}
Account Number: ${BANK_DETAILS.accountNumber}
IFSC Code: ${BANK_DETAILS.ifscCode}
UPI ID: ${BANK_DETAILS.upiId}`
    navigator.clipboard.writeText(details)
    setCopiedField("all")
    setTimeout(() => setCopiedField(null), 2000)
  }

  const handleScreenshotChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setScreenshot(file)
      // Create preview URL
      const reader = new FileReader()
      reader.onloadend = () => {
        setScreenshotPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async () => {
    if (!selectedPlan || !transactionId || !user) return

    setIsSubmitting(true)

    // Add payment request for admin review
    addPaymentRequest({
      userId: user.id || user.email,
      userEmail: user.email,
      userName: user.name,
      plan: selectedPlan,
      amount: PLANS[selectedPlan].price,
      transactionId,
      screenshotUrl: screenshotPreview || undefined,
    })

    // Set user subscription status to pending
    setPendingSubscription(selectedPlan)

    await new Promise((resolve) => setTimeout(resolve, 1000))

    setIsSubmitting(false)
    setSubmitted(true)

    setTimeout(() => {
      setShowPaymentDialog(false)
      setSubmitted(false)
      setTransactionId("")
      setScreenshot(null)
      setScreenshotPreview(null)
      setSelectedPlan(null)
      // Refresh payments list
      if (user?.email) {
        setUserPayments(getPaymentsByEmail(user.email))
      }
    }, 2000)
  }

  const openPaymentDialog = (plan: PlanType) => {
    setSelectedPlan(plan)
    setShowPaymentDialog(true)
  }

  const formatPrice = (price: number) => `₹${price.toLocaleString("en-IN")}`

  const getPlanLabel = (plan: string) => {
    const labels: Record<string, string> = {
      free: "Free Trial",
      individual: "Individual",
      planner: "Planner",
      enterprise: "Enterprise",
    }
    return labels[plan] || plan
  }

  const getStatusBadge = (status: PaymentRequest["status"]) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600">
            <Clock className="h-3 w-3 mr-1" />
            Pending Review
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
            <AlertCircle className="h-3 w-3 mr-1" />
            Rejected
          </Badge>
        )
    }
  }

  if (!mounted) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="h-6 w-48 bg-muted animate-pulse rounded" />
          </CardHeader>
          <CardContent>
            <div className="h-10 w-32 bg-muted animate-pulse rounded" />
          </CardContent>
        </Card>
      </div>
    )
  }

  const currentPlan = user?.plan || "free"
  const subscriptionStatus = user?.subscriptionStatus || "expired"

  return (
    <div className="space-y-6">
      {/* Current Subscription Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Current Plan
            <Badge variant={currentPlan === "free" ? "outline" : "default"}>{getPlanLabel(currentPlan)}</Badge>
            {subscriptionStatus === "pending" && (
              <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600">
                <Clock className="h-3 w-3 mr-1" />
                Payment Under Review
              </Badge>
            )}
          </CardTitle>
          <CardDescription>
            {subscriptionStatus === "pending"
              ? "Your payment is being verified. You'll get access once approved."
              : currentPlan === "free"
                ? "Upgrade to unlock premium features"
                : `You are on the ${getPlanLabel(currentPlan)} plan`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {user && currentPlan !== "free" && subscriptionStatus === "active" && (
            <div className="mb-4 p-4 rounded-lg bg-muted/50">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">Scans Used</span>
                <span className="font-medium">
                  {user.scansUsed} /{" "}
                  {user.scansLimit === 999 || user.scansLimit === 9999 ? "Unlimited" : user.scansLimit}
                </span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full"
                  style={{ width: `${Math.min((user.scansUsed / user.scansLimit) * 100, 100)}%` }}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment Requests Status */}
      {userPayments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Your Payment Requests</CardTitle>
            <CardDescription>Track the status of your subscription payments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {userPayments.map((payment) => (
                <div
                  key={payment.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-muted/50 border border-border"
                >
                  <div>
                    <p className="font-medium">{PLANS[payment.plan].name} Plan</p>
                    <p className="text-sm text-muted-foreground">
                      {formatPrice(payment.amount)} • ID: {payment.transactionId}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Submitted: {new Date(payment.submittedAt).toLocaleDateString()}
                    </p>
                  </div>
                  {getStatusBadge(payment.status)}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Available Plans */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {(Object.entries(PLANS) as [PlanType, (typeof PLANS)["individual"]][]).map(([key, plan]) => {
          const isCurrentPlan = currentPlan === key && subscriptionStatus === "active"
          const hasPendingPayment = userPayments.some((p) => p.plan === key && p.status === "pending")
          return (
            <Card
              key={key}
              className={`relative ${key === "planner" ? "border-primary ring-2 ring-primary/20" : ""} ${isCurrentPlan ? "bg-primary/5" : ""}`}
            >
              {key === "planner" && !isCurrentPlan && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-medium px-3 py-1 rounded-full">
                  Most Popular
                </span>
              )}
              {isCurrentPlan && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-green-600 text-white text-xs font-medium px-3 py-1 rounded-full">
                  Current Plan
                </span>
              )}
              <CardContent className="pt-8">
                <h3 className="text-xl font-semibold mb-1">{plan.name}</h3>
                <div className="mb-6">
                  <span className="text-4xl font-bold">{formatPrice(plan.price)}</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
                <ul className="space-y-2 mb-6">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  className="w-full"
                  variant={isCurrentPlan ? "secondary" : key === "planner" ? "default" : "outline"}
                  onClick={() => !isCurrentPlan && !hasPendingPayment && openPaymentDialog(key)}
                  disabled={isCurrentPlan || hasPendingPayment}
                >
                  {isCurrentPlan ? "Current Plan" : hasPendingPayment ? "Payment Pending" : "Subscribe"}
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Payment Method Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            Payment Method
          </CardTitle>
          <CardDescription>We accept payments via bank transfer and UPI</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50 border border-border">
              <div>
                <p className="text-sm text-muted-foreground">Account Name</p>
                <p className="font-semibold text-foreground">{BANK_DETAILS.accountName}</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => copyToClipboard(BANK_DETAILS.accountName, "name")}>
                {copiedField === "name" ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50 border border-border">
              <div>
                <p className="text-sm text-muted-foreground">Account Number</p>
                <p className="font-semibold text-foreground font-mono">{BANK_DETAILS.accountNumber}</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => copyToClipboard(BANK_DETAILS.accountNumber, "number")}>
                {copiedField === "number" ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50 border border-border">
              <div>
                <p className="text-sm text-muted-foreground">IFSC Code</p>
                <p className="font-semibold text-foreground font-mono">{BANK_DETAILS.ifscCode}</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => copyToClipboard(BANK_DETAILS.ifscCode, "ifsc")}>
                {copiedField === "ifsc" ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg bg-primary/10 border border-primary/20">
              <div>
                <p className="text-sm text-muted-foreground">UPI ID</p>
                <p className="font-semibold text-foreground font-mono">{BANK_DETAILS.upiId}</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => copyToClipboard(BANK_DETAILS.upiId, "upi")}>
                {copiedField === "upi" ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>

            <Button variant="outline" onClick={copyAllDetails}>
              {copiedField === "all" ? (
                <>
                  <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy All Details
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Payment Dialog */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {submitted ? "Payment Submitted!" : `Subscribe to ${selectedPlan && PLANS[selectedPlan].name}`}
            </DialogTitle>
            <DialogDescription>
              {submitted
                ? "Your payment is under review. You'll be notified once approved."
                : `Transfer ${selectedPlan && formatPrice(PLANS[selectedPlan].price)} and submit proof`}
            </DialogDescription>
          </DialogHeader>

          {submitted ? (
            <div className="flex flex-col items-center py-8">
              <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mb-4">
                <Clock className="h-8 w-8 text-yellow-500" />
              </div>
              <p className="text-lg font-medium text-foreground">Payment Under Review</p>
              <p className="text-sm text-muted-foreground text-center">
                We'll verify your payment and activate your subscription within 24 hours.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-muted/50 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Amount:</span>
                  <span className="font-bold text-foreground">
                    {selectedPlan && formatPrice(PLANS[selectedPlan].price)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Account:</span>
                  <span className="font-mono text-foreground">{BANK_DETAILS.accountNumber}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">UPI:</span>
                  <span className="font-mono text-foreground">{BANK_DETAILS.upiId}</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="txn-id">Transaction ID / UTR Number *</Label>
                <Input
                  id="txn-id"
                  placeholder="Enter transaction ID or UTR number"
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Payment Screenshot *</Label>
                <div className="border-2 border-dashed border-border rounded-lg p-4 text-center">
                  <input
                    type="file"
                    id="ss-upload"
                    className="hidden"
                    accept="image/*"
                    onChange={handleScreenshotChange}
                  />
                  {screenshotPreview ? (
                    <div className="space-y-2">
                      <img
                        src={screenshotPreview || "/placeholder.svg"}
                        alt="Payment screenshot"
                        className="max-h-40 mx-auto rounded"
                      />
                      <p className="text-sm text-muted-foreground">{screenshot?.name}</p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setScreenshot(null)
                          setScreenshotPreview(null)
                        }}
                      >
                        Remove
                      </Button>
                    </div>
                  ) : (
                    <label htmlFor="ss-upload" className="cursor-pointer">
                      <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">Upload payment screenshot</p>
                      <p className="text-xs text-muted-foreground">Required for verification</p>
                    </label>
                  )}
                </div>
              </div>

              <Button
                className="w-full"
                onClick={handleSubmit}
                disabled={!transactionId || !screenshotPreview || isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit for Verification"
                )}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
