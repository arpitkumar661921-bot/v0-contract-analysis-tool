"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  FileStack,
  Upload,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Loader2,
  Trophy,
  ArrowRight,
  DollarSign,
} from "lucide-react"

type ContractAnalysis = {
  id: string
  name: string
  fileName: string
  riskScore: number
  basePrice: string
  totalValue: string
  hiddenFees: { name: string; amount: string; severity: string }[]
  risks: { title: string; severity: string; description: string }[]
  positives: string[]
}

export default function CompareContractsPage() {
  const [contracts, setContracts] = useState<ContractAnalysis[]>([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || contracts.length >= 3) return

    setIsAnalyzing(true)

    for (const file of Array.from(files)) {
      if (contracts.length >= 3) break

      const content = await file.text()

      try {
        const response = await fetch("/api/analyze-contract", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            content,
            fileName: file.name,
            contractType: "venue",
          }),
        })

        const data = await response.json()

        if (data.analysis) {
          setContracts((prev) => [
            ...prev,
            {
              id: Date.now().toString(),
              name: data.analysis.venueName || file.name.replace(/\.[^/.]+$/, ""),
              fileName: file.name,
              ...data.analysis,
            },
          ])
        }
      } catch (error) {
        console.error("Analysis error:", error)
      }
    }

    setIsAnalyzing(false)
  }

  const removeContract = (id: string) => {
    setContracts((prev) => prev.filter((c) => c.id !== id))
  }

  const getBestValue = () => {
    if (contracts.length < 2) return null
    return contracts.reduce((best, current) => {
      const bestTotal = Number.parseFloat(best.totalValue.replace(/[^0-9.]/g, "")) || 999999
      const currentTotal = Number.parseFloat(current.totalValue.replace(/[^0-9.]/g, "")) || 999999
      return currentTotal < bestTotal ? current : best
    })
  }

  const getLowestRisk = () => {
    if (contracts.length < 2) return null
    return contracts.reduce((lowest, current) => (current.riskScore < lowest.riskScore ? current : lowest))
  }

  const bestValue = getBestValue()
  const lowestRisk = getLowestRisk()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Compare Contracts</h1>
        <p className="text-muted-foreground">Upload and compare up to 3 contracts side by side</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileStack className="h-5 w-5" />
            Upload Contracts to Compare ({contracts.length}/3)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <label className="cursor-pointer">
              <input
                type="file"
                className="hidden"
                accept=".txt,.pdf,.doc,.docx"
                multiple
                onChange={handleFileUpload}
                disabled={isAnalyzing || contracts.length >= 3}
              />
              <Button asChild disabled={isAnalyzing || contracts.length >= 3}>
                <span>
                  {isAnalyzing ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Upload className="h-4 w-4 mr-2" />
                  )}
                  {isAnalyzing ? "Analyzing..." : "Upload Contracts"}
                </span>
              </Button>
            </label>
            <span className="text-sm text-muted-foreground">Upload up to 3 contracts for comparison</span>
          </div>
        </CardContent>
      </Card>

      {contracts.length > 0 && (
        <>
          {/* Quick Insights */}
          {contracts.length >= 2 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="border-green-500/50 bg-green-500/5">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <Trophy className="h-8 w-8 text-green-500" />
                    <div>
                      <p className="text-sm text-muted-foreground">Best Value</p>
                      <p className="font-semibold text-foreground">{bestValue?.name}</p>
                      <p className="text-sm text-green-500">{bestValue?.totalValue}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-blue-500/50 bg-blue-500/5">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-8 w-8 text-blue-500" />
                    <div>
                      <p className="text-sm text-muted-foreground">Lowest Risk</p>
                      <p className="font-semibold text-foreground">{lowestRisk?.name}</p>
                      <p className="text-sm text-blue-500">Risk Score: {lowestRisk?.riskScore}/10</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Contract Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {contracts.map((contract) => (
              <Card key={contract.id} className="relative">
                {bestValue?.id === contract.id && (
                  <Badge className="absolute top-2 left-2 bg-green-600">Best Value</Badge>
                )}
                {lowestRisk?.id === contract.id && bestValue?.id !== contract.id && (
                  <Badge className="absolute top-2 left-2 bg-blue-600">Lowest Risk</Badge>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2"
                  onClick={() => removeContract(contract.id)}
                >
                  <XCircle className="h-4 w-4" />
                </Button>

                <CardHeader className="pt-10">
                  <CardTitle className="text-lg">{contract.name}</CardTitle>
                  <p className="text-xs text-muted-foreground">{contract.fileName}</p>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Pricing */}
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Base Price</span>
                      <span className="font-medium">{contract.basePrice}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Total Value</span>
                      <span className="font-bold text-primary">{contract.totalValue}</span>
                    </div>
                  </div>

                  {/* Risk Score */}
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <span className="text-sm">Risk Score</span>
                    <Badge
                      variant={
                        contract.riskScore > 6 ? "destructive" : contract.riskScore > 4 ? "default" : "secondary"
                      }
                    >
                      {contract.riskScore}/10
                    </Badge>
                  </div>

                  {/* Hidden Fees */}
                  <div>
                    <p className="text-sm font-medium mb-2">Hidden Fees ({contract.hiddenFees.length})</p>
                    <div className="space-y-1 max-h-32 overflow-y-auto">
                      {contract.hiddenFees.slice(0, 4).map((fee, i) => (
                        <div key={i} className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">{fee.name}</span>
                          <Badge
                            variant={
                              fee.severity === "high"
                                ? "destructive"
                                : fee.severity === "medium"
                                  ? "default"
                                  : "secondary"
                            }
                            className="text-xs"
                          >
                            {fee.amount}
                          </Badge>
                        </div>
                      ))}
                      {contract.hiddenFees.length > 4 && (
                        <p className="text-xs text-muted-foreground">+{contract.hiddenFees.length - 4} more</p>
                      )}
                    </div>
                  </div>

                  {/* Risks */}
                  <div>
                    <p className="text-sm font-medium mb-2">Risk Factors ({contract.risks.length})</p>
                    <div className="space-y-1">
                      {contract.risks.slice(0, 3).map((risk, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs">
                          <AlertTriangle
                            className={`h-3 w-3 ${risk.severity === "high" ? "text-destructive" : "text-yellow-500"}`}
                          />
                          <span className="text-muted-foreground truncate">{risk.title}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Positives */}
                  <div>
                    <p className="text-sm font-medium mb-2">Positives</p>
                    <div className="space-y-1">
                      {contract.positives.slice(0, 2).map((positive, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs">
                          <CheckCircle className="h-3 w-3 text-green-500" />
                          <span className="text-muted-foreground">{positive}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {contracts.length < 3 && (
              <Card className="border-dashed flex items-center justify-center min-h-[400px]">
                <label className="cursor-pointer">
                  <input
                    type="file"
                    className="hidden"
                    accept=".txt,.pdf,.doc,.docx"
                    onChange={handleFileUpload}
                    disabled={isAnalyzing}
                  />
                  <Button variant="ghost" className="flex-col h-auto py-8" asChild>
                    <span>
                      <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                      <span className="text-muted-foreground">Add Contract</span>
                    </span>
                  </Button>
                </label>
              </Card>
            )}
          </div>

          {/* AI Recommendation */}
          {contracts.length >= 2 && (
            <Card className="border-primary/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-primary" />
                  AI Recommendation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Based on the analysis, <strong className="text-foreground">{bestValue?.name}</strong> offers the best
                  overall value with competitive pricing and manageable risk. However, if risk mitigation is your
                  priority, <strong className="text-foreground">{lowestRisk?.name}</strong> has the lowest risk score of{" "}
                  {lowestRisk?.riskScore}/10.
                </p>
                <Button className="mt-4">
                  Get Detailed AI Analysis <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  )
}
