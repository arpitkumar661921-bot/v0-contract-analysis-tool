"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  AlertTriangle,
  DollarSign,
  FileText,
  Download,
  Share2,
  MessageSquare,
  CheckCircle,
  XCircle,
  Sparkles,
  Loader2,
} from "lucide-react"
import Link from "next/link"
import { useContractStore, type AnalyzedContract } from "@/lib/contract-store"

const mockContract: AnalyzedContract = {
  id: "demo",
  name: "Demo Contract",
  venue: "Sample Venue",
  uploadedAt: "Nov 28, 2025",
  status: "analyzed",
  fileContent: "",
  fileType: "",
  riskScore: 7.5,
  totalValue: "$18,500",
  basePrice: "$15,000",
  rawText: "",
  hiddenFees: [
    {
      name: "Service Charge (22%)",
      amount: "$3,300",
      severity: "high",
      description: "Automatically added to all services",
    },
    { name: "Venue Cleaning Fee", amount: "$500", severity: "medium", description: "Charged after event ends" },
    {
      name: "Parking Attendant Fee",
      amount: "$300",
      severity: "medium",
      description: "Required for events over 100 guests",
    },
  ],
  risks: [
    { title: "Strict Cancellation Policy", severity: "high", description: "100% non-refundable within 90 days" },
    {
      title: "Weather Clause Missing",
      severity: "medium",
      description: "No provisions for outdoor event weather issues",
    },
  ],
  positives: ["Flexible payment schedule", "Free venue coordinator included", "Setup time included"],
  summary: "This is a demo contract analysis. Upload your own contract to see real results.",
}

export function ContractAnalysis({ contractId }: { contractId: string }) {
  const [activeTab, setActiveTab] = useState("overview")
  const { contracts } = useContractStore()
  const [contract, setContract] = useState<AnalyzedContract | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Try to get contract from store
    const storedContract = contracts.get(contractId)
    if (storedContract) {
      console.log("[v0] Found contract in store:", storedContract.name)
      setContract(storedContract)
    } else if (contractId === "new" || contractId === "demo") {
      // Use mock data for demo
      setContract(mockContract)
    } else {
      // Contract not found - check if it might still be in the store
      console.log("[v0] Contract not found:", contractId)
      setContract(mockContract)
    }
    setLoading(false)
  }, [contractId, contracts])

  // Subscribe to store updates
  useEffect(() => {
    const unsubscribe = useContractStore.subscribe((state) => {
      const updatedContract = state.contracts.get(contractId)
      if (updatedContract) {
        setContract(updatedContract)
      }
    })
    return unsubscribe
  }, [contractId])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">Loading analysis...</span>
      </div>
    )
  }

  if (!contract) {
    return (
      <Card>
        <CardContent className="py-16 text-center">
          <p className="text-muted-foreground">Contract not found</p>
          <Link href="/dashboard/upload">
            <Button className="mt-4">Upload a Contract</Button>
          </Link>
        </CardContent>
      </Card>
    )
  }

  if (contract.status === "analyzing") {
    return (
      <Card>
        <CardContent className="py-16 text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-foreground mb-2">Analyzing Your Contract...</h3>
          <p className="text-muted-foreground">Our AI is scanning for hidden fees, risks, and key terms.</p>
        </CardContent>
      </Card>
    )
  }

  const getRiskLabel = (score: number) => {
    if (score >= 7) return { label: "High Risk", variant: "destructive" as const }
    if (score >= 4) return { label: "Medium Risk", variant: "default" as const }
    return { label: "Low Risk", variant: "secondary" as const }
  }

  const riskInfo = getRiskLabel(contract.riskScore)

  // Calculate total hidden fees
  const totalHiddenFees = contract.hiddenFees.reduce((sum, fee) => {
    const amount = fee.amount.replace(/[^0-9.]/g, "")
    const num = Number.parseFloat(amount) || 0
    return sum + num
  }, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="outline">Analyzed</Badge>
            <Badge variant={riskInfo.variant}>{riskInfo.label}</Badge>
          </div>
          <h1 className="text-2xl font-bold text-foreground">{contract.name}</h1>
          <p className="text-muted-foreground">
            {contract.venue} • Uploaded {contract.uploadedAt}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
          <Link href="/dashboard/chat">
            <Button size="sm">
              <MessageSquare className="h-4 w-4 mr-2" />
              Ask AI
            </Button>
          </Link>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div
                className={`p-2 rounded-lg ${contract.riskScore >= 7 ? "bg-destructive/10" : contract.riskScore >= 4 ? "bg-warning/10" : "bg-success/10"}`}
              >
                <AlertTriangle
                  className={`h-5 w-5 ${contract.riskScore >= 7 ? "text-destructive" : contract.riskScore >= 4 ? "text-warning" : "text-success"}`}
                />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Risk Score</p>
                <p className="text-2xl font-bold text-foreground">{contract.riskScore}/10</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <DollarSign className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Base Price</p>
                <p className="text-2xl font-bold text-foreground">{contract.basePrice}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-destructive/10">
                <AlertTriangle className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Hidden Fees</p>
                <p className="text-2xl font-bold text-destructive">
                  {totalHiddenFees > 0
                    ? `$${totalHiddenFees.toLocaleString()}+`
                    : contract.hiddenFees.length > 0
                      ? "Found"
                      : "None"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-warning/10">
                <DollarSign className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">True Total</p>
                <p className="text-2xl font-bold text-foreground">{contract.totalValue}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="fees">Hidden Fees</TabsTrigger>
          <TabsTrigger value="risks">Risk Analysis</TabsTrigger>
          <TabsTrigger value="negotiate">Negotiate</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Contract Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">{contract.summary}</p>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-destructive">
                  <XCircle className="h-5 w-5" />
                  Key Concerns ({contract.risks.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {contract.risks.length > 0 ? (
                  contract.risks.map((risk, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-3 rounded-lg bg-destructive/5 border border-destructive/20"
                    >
                      <AlertTriangle
                        className={`h-4 w-4 mt-0.5 ${
                          risk.severity === "high"
                            ? "text-destructive"
                            : risk.severity === "medium"
                              ? "text-warning"
                              : "text-muted-foreground"
                        }`}
                      />
                      <div>
                        <p className="font-medium text-foreground text-sm">{risk.title}</p>
                        <p className="text-xs text-muted-foreground">{risk.description}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No major concerns found.</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-success">
                  <CheckCircle className="h-5 w-5" />
                  Positives ({contract.positives.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {contract.positives.length > 0 ? (
                  contract.positives.map((positive, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-3 rounded-lg bg-success/5 border border-success/20"
                    >
                      <CheckCircle className="h-4 w-4 text-success mt-0.5" />
                      <p className="text-sm text-foreground">{positive}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No notable positives identified.</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="fees">
          <Card>
            <CardHeader>
              <CardTitle>Hidden Fees Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {contract.hiddenFees.length > 0 ? (
                <>
                  {contract.hiddenFees.map((fee, index) => (
                    <div
                      key={index}
                      className={`flex items-center justify-between p-4 rounded-lg border ${
                        fee.severity === "high"
                          ? "bg-destructive/5 border-destructive/30"
                          : fee.severity === "medium"
                            ? "bg-warning/5 border-warning/30"
                            : "bg-muted/30 border-border"
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-2 h-2 rounded-full ${
                            fee.severity === "high"
                              ? "bg-destructive"
                              : fee.severity === "medium"
                                ? "bg-warning"
                                : "bg-muted-foreground"
                          }`}
                        />
                        <div>
                          <p className="font-medium text-foreground">{fee.name}</p>
                          <p className="text-sm text-muted-foreground">{fee.description}</p>
                        </div>
                      </div>
                      <p
                        className={`text-lg font-bold ${
                          fee.severity === "high"
                            ? "text-destructive"
                            : fee.severity === "medium"
                              ? "text-warning"
                              : "text-foreground"
                        }`}
                      >
                        {fee.amount}
                      </p>
                    </div>
                  ))}

                  <div className="pt-4 border-t border-border">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-foreground">Estimated Total Hidden Fees</p>
                      <p className="text-xl font-bold text-destructive">
                        {totalHiddenFees > 0 ? `$${totalHiddenFees.toLocaleString()}+` : "Variable"}
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">* Some fees may depend on actual usage</p>
                  </div>
                </>
              ) : (
                <p className="text-muted-foreground text-center py-8">No hidden fees detected in this contract.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="risks">
          <Card>
            <CardHeader>
              <CardTitle>Risk Analysis</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {contract.risks.length > 0 ? (
                contract.risks.map((risk, index) => (
                  <div key={index} className="p-4 rounded-lg border border-border bg-card">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            risk.severity === "high"
                              ? "destructive"
                              : risk.severity === "medium"
                                ? "default"
                                : "secondary"
                          }
                        >
                          {risk.severity} risk
                        </Badge>
                        <h4 className="font-medium text-foreground">{risk.title}</h4>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{risk.description}</p>
                    <Link href="/dashboard/chat">
                      <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                        <MessageSquare className="h-4 w-4" />
                        Ask AI about this
                      </Button>
                    </Link>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-center py-8">No significant risks identified.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="negotiate">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                AI Negotiation Suggestions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {contract.hiddenFees
                .filter((f) => f.severity === "high")
                .map((fee, index) => (
                  <div key={index} className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                    <h4 className="font-medium text-foreground mb-2">Negotiate: {fee.name}</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      This fee ({fee.amount}) may be negotiable. Consider asking for a reduction or cap.
                    </p>
                    <p className="text-xs text-primary font-medium">Potential savings: 10-25% reduction</p>
                  </div>
                ))}

              {contract.risks
                .filter((r) => r.severity === "high")
                .map((risk, index) => (
                  <div key={index} className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                    <h4 className="font-medium text-foreground mb-2">Address: {risk.title}</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      {risk.description}. Consider requesting modifications to this clause.
                    </p>
                    <p className="text-xs text-primary font-medium">Risk reduction: High</p>
                  </div>
                ))}

              {contract.hiddenFees.filter((f) => f.severity === "high").length === 0 &&
                contract.risks.filter((r) => r.severity === "high").length === 0 && (
                  <p className="text-muted-foreground text-center py-8">
                    No major items requiring negotiation. This contract looks reasonable!
                  </p>
                )}

              <div className="flex gap-2 pt-4">
                <Button className="gap-2">
                  <Download className="h-4 w-4" />
                  Download Negotiation Script
                </Button>
                <Link href="/dashboard/chat">
                  <Button variant="outline" className="gap-2 bg-transparent">
                    <MessageSquare className="h-4 w-4" />
                    Discuss with AI
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
