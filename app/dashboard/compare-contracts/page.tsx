"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import {
  FileStack,
  Upload,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Loader2,
  Trophy,
  ArrowRight,
  Sparkles,
  Type,
  FileUp,
  Plus,
} from "lucide-react"
import { parseCurrencyValue } from "@/lib/currency"

type ContractAnalysis = {
  id: string
  name: string
  fileName: string
  riskScore: number
  basePrice: string
  totalValue: string
  hiddenFees: { name: string; amount: string; severity: string; description?: string }[]
  risks: { title: string; severity: string; description: string }[]
  positives: string[]
  summary?: string
  negotiationSuggestions?: { clause: string; suggestion: string; priority: string }[]
  originalContent?: string
}

export default function CompareContractsPage() {
  const [contracts, setContracts] = useState<ContractAnalysis[]>([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [aiComparison, setAiComparison] = useState<string | null>(null)
  const [isComparing, setIsComparing] = useState(false)
  const [uploadMode, setUploadMode] = useState<"file" | "text">("text")
  const [pastedText, setPastedText] = useState("")
  const [contractName, setContractName] = useState("")

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
              id: Date.now().toString() + Math.random(),
              name: data.analysis.venueName || file.name.replace(/\.[^/.]+$/, ""),
              fileName: file.name,
              originalContent: content,
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

  const handlePastedTextSubmit = async () => {
    if (pastedText.length < 100 || contracts.length >= 3) return

    setIsAnalyzing(true)
    const fileName = contractName.trim() || `Contract ${contracts.length + 1}`

    try {
      const response = await fetch("/api/analyze-contract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: pastedText,
          fileName: fileName,
          contractType: "venue",
        }),
      })

      const data = await response.json()

      if (data.analysis) {
        setContracts((prev) => [
          ...prev,
          {
            id: Date.now().toString() + Math.random(),
            name: data.analysis.venueName || fileName,
            fileName: fileName,
            originalContent: pastedText,
            ...data.analysis,
          },
        ])
        // Clear inputs after successful addition
        setPastedText("")
        setContractName("")
      }
    } catch (error) {
      console.error("Analysis error:", error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const removeContract = (id: string) => {
    setContracts((prev) => prev.filter((c) => c.id !== id))
    setAiComparison(null)
  }

  const getAIComparison = async () => {
    if (contracts.length < 2) return

    setIsComparing(true)
    try {
      const contractsForComparison = contracts.map((c) => ({
        name: c.name,
        fileName: c.fileName,
        riskScore: c.riskScore,
        basePrice: c.basePrice,
        totalValue: c.totalValue,
        hiddenFees: c.hiddenFees,
        risks: c.risks,
        positives: c.positives,
        summary: c.summary,
        negotiationSuggestions: c.negotiationSuggestions,
        // Include a snippet of original content for context
        contentSnippet: c.originalContent?.substring(0, 2000),
      }))

      const response = await fetch("/api/compare-contracts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contracts: contractsForComparison }),
      })

      const data = await response.json()
      setAiComparison(data.comparison || "Unable to generate comparison.")
    } catch (error) {
      console.error("Comparison error:", error)
      setAiComparison("Failed to generate AI comparison. Please try again.")
    } finally {
      setIsComparing(false)
    }
  }

  const getBestValue = () => {
    if (contracts.length < 2) return null
    return contracts.reduce((best, current) => {
      const bestTotal = parseCurrencyValue(best.totalValue)
      const currentTotal = parseCurrencyValue(current.totalValue)
      if (bestTotal === 0) return current
      if (currentTotal === 0) return best
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
        <p className="text-muted-foreground">
          Upload or paste up to 3 contracts to compare side by side with AI insights (All prices in ₹)
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileStack className="h-5 w-5" />
            Add Contracts to Compare ({contracts.length}/3)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={uploadMode} onValueChange={(v) => setUploadMode(v as "file" | "text")}>
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="text" className="flex items-center gap-2">
                <Type className="h-4 w-4" />
                Paste Text (Recommended)
              </TabsTrigger>
              <TabsTrigger value="file" className="flex items-center gap-2">
                <FileUp className="h-4 w-4" />
                Upload File
              </TabsTrigger>
            </TabsList>

            <TabsContent value="text">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="contract-name" className="text-base font-medium">
                    Contract/Venue Name (Optional)
                  </Label>
                  <Input
                    id="contract-name"
                    placeholder="e.g., Grand Palace Hotel, Taj Banquet Hall..."
                    className="mt-2"
                    value={contractName}
                    onChange={(e) => setContractName(e.target.value)}
                    disabled={contracts.length >= 3}
                  />
                </div>
                <div>
                  <Label htmlFor="contract-text" className="text-base font-medium">
                    Paste Contract Text
                  </Label>
                  <p className="text-sm text-muted-foreground mb-3">
                    Copy and paste the full contract text. This gives the most accurate AI analysis for comparison.
                  </p>
                  <Textarea
                    id="contract-text"
                    placeholder={`Paste your contract text here...

Example format for best results:

VENUE RENTAL AGREEMENT
Grand Palace Hotel, Mumbai

Event Date: 15th March 2025
Guest Count: 500 persons

PRICING:
- Venue Rental: ₹5,00,000
- Food & Beverage (₹1,500 per plate): ₹7,50,000
- Service Charge (10%): ₹1,25,000
- GST (18%): ₹2,47,500

TOTAL: ₹17,22,500

Cancellation Policy:
- 30+ days: 80% refund
- Less than 15 days: No refund`}
                    className="min-h-[250px] font-mono text-sm"
                    value={pastedText}
                    onChange={(e) => setPastedText(e.target.value)}
                    disabled={contracts.length >= 3}
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    {pastedText.length} characters {pastedText.length < 100 && "(minimum 100 required)"}
                  </p>
                </div>
                <Button
                  onClick={handlePastedTextSubmit}
                  disabled={isAnalyzing || pastedText.length < 100 || contracts.length >= 3}
                  className="w-full"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Analyzing Contract...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Contract for Comparison
                    </>
                  )}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="file">
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                <label className="cursor-pointer">
                  <input
                    type="file"
                    className="hidden"
                    accept=".txt,.pdf,.doc,.docx"
                    multiple
                    onChange={handleFileUpload}
                    disabled={isAnalyzing || contracts.length >= 3}
                  />
                  <div className="flex flex-col items-center gap-4">
                    {isAnalyzing ? (
                      <Loader2 className="h-12 w-12 text-muted-foreground animate-spin" />
                    ) : (
                      <Upload className="h-12 w-12 text-muted-foreground" />
                    )}
                    <div>
                      <p className="font-medium text-foreground">
                        {isAnalyzing ? "Analyzing..." : "Click to upload contracts"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Support for TXT files. You can select multiple files.
                      </p>
                    </div>
                    <Button disabled={isAnalyzing || contracts.length >= 3}>
                      {isAnalyzing ? "Analyzing..." : "Select Files"}
                    </Button>
                  </div>
                </label>
              </div>
              <p className="text-xs text-muted-foreground mt-4 text-center">
                Note: For best results with PDF files, use the "Paste Text" option by copying text from your PDF.
              </p>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {contracts.length > 0 && (
        <>
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
                <div className="text-center p-6">
                  <Plus className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-2">Add another contract</p>
                  <p className="text-xs text-muted-foreground">Use the form above to paste text or upload a file</p>
                </div>
              </Card>
            )}
          </div>

          {contracts.length >= 2 && (
            <Card className="border-primary/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  AI-Powered Comparison
                </CardTitle>
              </CardHeader>
              <CardContent>
                {aiComparison ? (
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    <div className="whitespace-pre-wrap text-muted-foreground">{aiComparison}</div>
                  </div>
                ) : (
                  <p className="text-muted-foreground mb-4">
                    Get a detailed AI analysis comparing all your uploaded contracts, including recommendations on which
                    venue offers the best value and lowest risk.
                  </p>
                )}
                <Button className="mt-4" onClick={getAIComparison} disabled={isComparing}>
                  {isComparing ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      {aiComparison ? "Refresh" : "Get"} AI Analysis <ArrowRight className="h-4 w-4 ml-2" />
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  )
}
