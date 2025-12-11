"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Check, Copy, CheckCircle, ArrowLeft, Upload, Loader2, Building2, CreditCard } from "lucide-react"

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

export default function SubscribePage() {
  const router = useRouter()
  const [selectedPlan, setSelectedPlan] = useState<PlanType | null>(null)
  const [transactionId, setTransactionId] = useState("")
  const [screenshot, setScreenshot] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [copiedField, setCopiedField] = useState<string | null>(null)

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text)
    setCopiedField(field)
    setTimeout(() => setCopiedField(null), 2000)
  }

  const copyAllDetails = () => {
    const details = `Account Name: ${BANK_DETAILS.accountName}
Account Number: ${BANK_DETAILS.accountNumber}
IFSC Code: ${BANK_DETAILS.ifscCode}
Payment Note: Subscription for ContractLens User`
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
    setIsSubmitting(false)
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-background py-12">
        <div className="container mx-auto px-4 max-w-2xl">
          <Card className="border-green-500/50">
            <CardContent className="pt-8 text-center">
              <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-2">Payment Submitted!</h2>
              <p className="text-muted-foreground mb-6">
                Your payment is under review. You will be notified once approved.
              </p>
              <p className="text-sm text-muted-foreground mb-6">
                This usually takes less than 24 hours during business days.
              </p>
              <Button onClick={() => router.push("/dashboard")}>Go to Dashboard</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <Link href="/" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-8">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Link>

        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Choose Your Plan</h1>
          <p className="text-muted-foreground">Select a plan and complete payment via bank transfer</p>
        </div>

        {/* Plan Selection */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {(Object.entries(PLANS) as [PlanType, (typeof PLANS)["individual"]][]).map(([key, plan]) => (
            <Card
              key={key}
              className={`cursor-pointer transition-all ${
                selectedPlan === key ? "border-primary ring-2 ring-primary/20" : "border-border hover:border-primary/50"
              } ${key === "planner" ? "relative" : ""}`}
              onClick={() => setSelectedPlan(key)}
            >
              {key === "planner" && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-medium px-3 py-1 rounded-full">
                  Most Popular
                </span>
              )}
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-foreground">{plan.name}</h3>
                  {selectedPlan === key && (
                    <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                      <Check className="h-4 w-4 text-primary-foreground" />
                    </div>
                  )}
                </div>
                <div className="mb-4">
                  <span className="text-3xl font-bold text-foreground">₹{plan.price.toLocaleString()}</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
                <ul className="space-y-2">
                  {plan.features.slice(0, 4).map((feature, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Payment Instructions */}
        {selectedPlan && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-primary" />
                  Bank Transfer Details
                </CardTitle>
                <CardDescription>
                  Transfer ₹{PLANS[selectedPlan].price.toLocaleString()} to the account below
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4">
                  <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50 border border-border">
                    <div>
                      <p className="text-sm text-muted-foreground">Account Name</p>
                      <p className="font-semibold text-foreground">{BANK_DETAILS.accountName}</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(BANK_DETAILS.accountName, "name")}
                    >
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
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(BANK_DETAILS.accountNumber, "number")}
                    >
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

                  <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                    <p className="text-sm text-muted-foreground">Payment Note (Add this to your transfer)</p>
                    <p className="font-medium text-foreground">
                      Subscription for ContractLens - {PLANS[selectedPlan].name}
                    </p>
                  </div>
                </div>

                <Button variant="outline" className="w-full bg-transparent" onClick={copyAllDetails}>
                  {copiedField === "all" ? (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                      Copied All Details!
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-2" />
                      Copy All Details
                    </>
                  )}
                </Button>

                <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
                  <p className="text-sm text-amber-600 dark:text-amber-400">
                    <strong>Amount to Transfer:</strong> ₹{PLANS[selectedPlan].price.toLocaleString()}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Payment Proof Submission */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-primary" />
                  Submit Payment Proof
                </CardTitle>
                <CardDescription>
                  After making the payment, submit your transaction details for verification
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="transaction-id">Transaction ID / UTR Number *</Label>
                  <Input
                    id="transaction-id"
                    placeholder="Enter your transaction ID"
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="screenshot">Payment Screenshot (Optional)</Label>
                  <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                    <input
                      type="file"
                      id="screenshot"
                      className="hidden"
                      accept="image/*"
                      onChange={handleScreenshotChange}
                    />
                    {screenshot ? (
                      <div className="flex items-center justify-center gap-3">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        <span className="text-sm text-foreground">{screenshot.name}</span>
                        <Button variant="ghost" size="sm" onClick={() => setScreenshot(null)}>
                          Remove
                        </Button>
                      </div>
                    ) : (
                      <label htmlFor="screenshot" className="cursor-pointer">
                        <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">Click to upload payment screenshot</p>
                      </label>
                    )}
                  </div>
                </div>

                <Button className="w-full" size="lg" onClick={handleSubmit} disabled={!transactionId || isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Submit for Verification"
                  )}
                </Button>

                <p className="text-xs text-muted-foreground text-center">
                  Your subscription will be activated within 24 hours after verification.
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
