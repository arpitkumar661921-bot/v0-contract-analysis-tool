"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Check, Copy, CheckCircle, Download, FileText, Building2, Upload, Loader2 } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { useUserStore } from "@/lib/user-store"

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
}

type PlanType = "individual" | "planner" | "enterprise"

export function BillingPage() {
  const { user, upgradePlan } = useUserStore()
  const [showPaymentDialog, setShowPaymentDialog] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<PlanType | null>(null)
  const [transactionId, setTransactionId] = useState("")
  const [screenshot, setScreenshot] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text)
    setCopiedField(field)
    setTimeout(() => setCopiedField(null), 2000)
  }

  const copyAllDetails = () => {
    const details = `Account Name: ${BANK_DETAILS.accountName}
Account Number: ${BANK_DETAILS.accountNumber}
IFSC Code: ${BANK_DETAILS.ifscCode}`
    navigator.clipboard.writeText(details)
    setCopiedField("all")
    setTimeout(() => setCopiedField(null), 2000)
  }

  const handleScreenshotChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setScreenshot(e.target.files[0])
    }
  }

  const handleSubmit = async () => {
    if (!selectedPlan || !transactionId) return

    setIsSubmitting(true)
    await new Promise((resolve) => setTimeout(resolve, 1500))

    upgradePlan(selectedPlan)

    setIsSubmitting(false)
    setSubmitted(true)

    setTimeout(() => {
      setShowPaymentDialog(false)
      setSubmitted(false)
      setTransactionId("")
      setScreenshot(null)
      setSelectedPlan(null)
    }, 2000)
  }

  const openPaymentDialog = (plan: PlanType) => {
    setSelectedPlan(plan)
    setShowPaymentDialog(true)
  }

  const formatPrice = (price: number) => `₹${price.toLocaleString()}`

  const getPlanLabel = (plan: string) => {
    const labels: Record<string, string> = {
      free: "Free Trial",
      individual: "Individual",
      planner: "Planner",
      enterprise: "Enterprise",
    }
    return labels[plan] || plan
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="pt-8">
                <div className="space-y-4">
                  <div className="h-6 w-24 bg-muted animate-pulse rounded" />
                  <div className="h-10 w-32 bg-muted animate-pulse rounded" />
                  <div className="space-y-2">
                    {[1, 2, 3, 4].map((j) => (
                      <div key={j} className="h-4 w-full bg-muted animate-pulse rounded" />
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  const currentPlan = user?.plan || "free"
  const invoices =
    currentPlan !== "free"
      ? [
          {
            id: "INV-001",
            date: new Date().toLocaleDateString(),
            amount: formatPrice(PLANS[currentPlan as PlanType]?.price || 0),
            status: "Paid",
          },
        ]
      : []

  return (
    <div className="space-y-6">
      {/* Current Subscription Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Current Plan
            <Badge variant={currentPlan === "free" ? "outline" : "default"}>{getPlanLabel(currentPlan)}</Badge>
          </CardTitle>
          <CardDescription>
            {currentPlan === "free"
              ? "Upgrade to unlock premium features"
              : `You are on the ${getPlanLabel(currentPlan)} plan`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {user && currentPlan !== "free" && (
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
          {currentPlan === "free" && (
            <Link href="/subscribe">
              <Button>Choose a Plan</Button>
            </Link>
          )}
        </CardContent>
      </Card>

      {/* Available Plans */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {(Object.entries(PLANS) as [PlanType, (typeof PLANS)["individual"]][]).map(([key, plan]) => {
          const isCurrentPlan = currentPlan === key
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
                  onClick={() => !isCurrentPlan && openPaymentDialog(key)}
                  disabled={isCurrentPlan}
                >
                  {isCurrentPlan ? "Current Plan" : "Subscribe"}
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
          <CardDescription>We accept payments via bank transfer only</CardDescription>
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

      {/* Billing History */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Billing History</CardTitle>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </CardHeader>
        <CardContent>
          {invoices.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Invoice</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Date</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Amount</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Download</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((invoice) => (
                    <tr key={invoice.id} className="border-b border-border last:border-0">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{invoice.id}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-muted-foreground">{invoice.date}</td>
                      <td className="py-4 px-4 font-medium">{invoice.amount}</td>
                      <td className="py-4 px-4">
                        <Badge variant="secondary" className="bg-green-500/10 text-green-500">
                          {invoice.status}
                        </Badge>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <Button variant="ghost" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No billing history yet</p>
            </div>
          )}
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
                ? "Your subscription is now active!"
                : `Transfer ${selectedPlan && formatPrice(PLANS[selectedPlan].price)} and submit proof`}
            </DialogDescription>
          </DialogHeader>

          {submitted ? (
            <div className="flex flex-col items-center py-8">
              <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mb-4">
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
              <p className="text-lg font-medium text-foreground">Subscription Activated!</p>
              <p className="text-sm text-muted-foreground">Enjoy your premium features.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-muted/50 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Account:</span>
                  <span className="font-mono text-foreground">{BANK_DETAILS.accountNumber}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">IFSC:</span>
                  <span className="font-mono text-foreground">{BANK_DETAILS.ifscCode}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Name:</span>
                  <span className="text-foreground">{BANK_DETAILS.accountName}</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="txn-id">Transaction ID *</Label>
                <Input
                  id="txn-id"
                  placeholder="Enter transaction ID"
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Screenshot (Optional)</Label>
                <div className="border-2 border-dashed border-border rounded-lg p-4 text-center">
                  <input
                    type="file"
                    id="ss-upload"
                    className="hidden"
                    accept="image/*"
                    onChange={handleScreenshotChange}
                  />
                  {screenshot ? (
                    <div className="flex items-center justify-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm text-foreground">{screenshot.name}</span>
                    </div>
                  ) : (
                    <label htmlFor="ss-upload" className="cursor-pointer">
                      <Upload className="h-6 w-6 text-muted-foreground mx-auto mb-1" />
                      <p className="text-xs text-muted-foreground">Upload screenshot</p>
                    </label>
                  )}
                </div>
              </div>

              <Button className="w-full" onClick={handleSubmit} disabled={!transactionId || isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Activate Subscription"
                )}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
