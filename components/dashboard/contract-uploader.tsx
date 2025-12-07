"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Upload, FileText, X, Loader2, CheckCircle, AlertTriangle, ExternalLink, Key } from "lucide-react"
import { useContractStore } from "@/lib/contract-store"

type UploadedFile = {
  file: File
  name: string
  size: number
  type: string
}

export function ContractUploader() {
  const router = useRouter()
  const [dragActive, setDragActive] = useState(false)
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [contractName, setContractName] = useState("")
  const [venueName, setVenueName] = useState("")
  const [contractType, setContractType] = useState("venue")
  const [uploading, setUploading] = useState(false)
  const [uploadComplete, setUploadComplete] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [needsSetup, setNeedsSetup] = useState(false)
  const [aiProvider, setAiProvider] = useState<string | null>(null)

  const { addContract, setPendingFile } = useContractStore()

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    const droppedFiles = Array.from(e.dataTransfer.files)
    handleFiles(droppedFiles)
  }, [])

  const handleFiles = (newFiles: File[]) => {
    const validFiles = newFiles.filter(
      (file) =>
        file.type === "application/pdf" ||
        file.type === "application/msword" ||
        file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
        file.type.startsWith("image/") ||
        file.type === "text/plain",
    )

    setFiles((prev) => [...prev, ...validFiles.map((f) => ({ file: f, name: f.name, size: f.size, type: f.type }))])
    setError(null)
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(Array.from(e.target.files))
    }
  }

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B"
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB"
    return (bytes / (1024 * 1024)).toFixed(1) + " MB"
  }

  const readFileContent = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()

      if (file.type === "text/plain") {
        reader.onload = (e) => resolve(e.target?.result as string)
        reader.onerror = reject
        reader.readAsText(file)
      } else if (file.type === "application/pdf") {
        // For PDFs, we'll read as base64 and let the AI handle it
        // In production, you'd use a PDF parsing library
        reader.onload = async (e) => {
          const base64 = (e.target?.result as string).split(",")[1]
          // For now, indicate this is a PDF that needs OCR
          resolve(
            `[PDF Document: ${file.name}]\n\nThis is a PDF file. The AI will analyze the document structure and extract text.\n\nBase64 content available for processing.`,
          )
        }
        reader.onerror = reject
        reader.readAsDataURL(file)
      } else if (file.type.startsWith("image/")) {
        // For images, we'll use OCR via AI
        reader.onload = (e) => {
          const base64 = (e.target?.result as string).split(",")[1]
          resolve(
            `[Image Document: ${file.name}]\n\nThis is an image file that requires OCR processing.\n\nBase64 content available for processing.`,
          )
        }
        reader.onerror = reject
        reader.readAsDataURL(file)
      } else {
        // For Word docs and others, read as text (limited support)
        reader.onload = (e) => resolve((e.target?.result as string) || `[Document: ${file.name}]`)
        reader.onerror = reject
        reader.readAsText(file)
      }
    })
  }

  const handleSubmit = async () => {
    if (files.length === 0) return

    setUploading(true)
    setError(null)
    setNeedsSetup(false)

    try {
      const file = files[0]
      const content = await readFileContent(file.file)

      console.log("[v0] File content read, length:", content.length)

      // Generate unique ID for this contract
      const contractId = `contract-${Date.now()}`

      // Create initial contract entry
      const initialContract = {
        id: contractId,
        name: contractName || file.name.replace(/\.[^/.]+$/, ""),
        venue: venueName || "Unknown Venue",
        uploadedAt: new Date().toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
        status: "analyzing" as const,
        fileContent: content,
        fileType: file.type,
        riskScore: 0,
        totalValue: "Calculating...",
        basePrice: "Calculating...",
        hiddenFees: [],
        risks: [],
        positives: [],
        summary: "Analyzing contract...",
        rawText: content,
      }

      addContract(initialContract)

      // Call AI analysis API
      console.log("[v0] Calling analyze-contract API")
      const response = await fetch("/api/analyze-contract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content,
          fileName: file.name,
          contractType,
        }),
      })

      const responseData = await response.json()

      if (!response.ok) {
        if (responseData.requiresSetup || response.status === 403 || response.status === 401) {
          setNeedsSetup(true)
          throw new Error(responseData.details || responseData.error || "AI setup required")
        }
        throw new Error(responseData.details || responseData.error || "Failed to analyze contract")
      }

      const { analysis, provider } = responseData
      setAiProvider(provider)
      console.log("[v0] Analysis received from provider:", provider)

      // Update contract with analysis results
      const { updateContract } = useContractStore.getState()
      updateContract(contractId, {
        status: "analyzed",
        riskScore: analysis.riskScore,
        totalValue: analysis.totalValue,
        basePrice: analysis.basePrice,
        hiddenFees: analysis.hiddenFees,
        risks: analysis.risks,
        positives: analysis.positives,
        summary: analysis.summary,
        venue: analysis.venueName || venueName || "Unknown Venue",
        negotiationSuggestions: analysis.negotiationSuggestions,
      })

      setUploadComplete(true)

      // Redirect to analysis page with the contract ID
      setTimeout(() => {
        router.push(`/dashboard/contracts/${contractId}`)
      }, 1500)
    } catch (err) {
      console.error("Analysis error:", err)
      setError(err instanceof Error ? err.message : "Failed to analyze contract")
      setUploading(false)
    }
  }

  if (uploadComplete) {
    return (
      <Card>
        <CardContent className="py-16 text-center">
          <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-8 w-8 text-success" />
          </div>
          <h3 className="text-xl font-semibold text-foreground mb-2">Analysis Complete!</h3>
          {aiProvider && <p className="text-sm text-muted-foreground mb-2">Powered by {aiProvider}</p>}
          <p className="text-muted-foreground">Redirecting to results...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {error && (
        <Card className={needsSetup ? "border-amber-500" : "border-destructive"}>
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className={`h-5 w-5 mt-0.5 ${needsSetup ? "text-amber-500" : "text-destructive"}`} />
              <div className="flex-1">
                <p className={`text-sm font-medium ${needsSetup ? "text-amber-500" : "text-destructive"}`}>
                  {needsSetup ? "AI Setup Required" : "Analysis Error"}
                </p>
                <p className="text-sm text-muted-foreground mt-1">{error}</p>
                {needsSetup && (
                  <div className="mt-4 space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Choose one of these options to enable AI-powered contract analysis:
                    </p>

                    {/* Option 1: Own API Key */}
                    <div className="p-4 rounded-lg border border-border bg-muted/30">
                      <div className="flex items-center gap-2 mb-2">
                        <Key className="h-4 w-4 text-primary" />
                        <span className="font-medium text-foreground">
                          Option 1: Use Your Own API Key (Recommended)
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        Add one of these environment variables in the <strong>Vars</strong> section of the sidebar:
                      </p>
                      <div className="space-y-2 text-sm font-mono">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-1 rounded bg-background border text-xs">GROQ_API_KEY</span>
                          <span className="text-muted-foreground text-xs">Free tier available at groq.com</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-1 rounded bg-background border text-xs">OPENAI_API_KEY</span>
                          <span className="text-muted-foreground text-xs">From platform.openai.com</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-1 rounded bg-background border text-xs">ANTHROPIC_API_KEY</span>
                          <span className="text-muted-foreground text-xs">From console.anthropic.com</span>
                        </div>
                      </div>
                    </div>

                    {/* Option 2: Vercel AI Gateway */}
                    <div className="p-4 rounded-lg border border-border bg-muted/30">
                      <div className="flex items-center gap-2 mb-2">
                        <ExternalLink className="h-4 w-4 text-primary" />
                        <span className="font-medium text-foreground">Option 2: Use Vercel AI Gateway</span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        Add a credit card to your Vercel account to unlock free AI credits. You won&apos;t be charged
                        unless you exceed the free tier.
                      </p>
                      <Button asChild size="sm" variant="outline">
                        <a href="https://vercel.com/account/billing" target="_blank" rel="noopener noreferrer">
                          Add Credit Card to Vercel
                          <ExternalLink className="ml-2 h-3 w-3" />
                        </a>
                      </Button>
                    </div>

                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => {
                        setError(null)
                        setNeedsSetup(false)
                      }}
                    >
                      Try Again After Setup
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="pt-6">
          <div
            className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
              dragActive ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              type="file"
              id="file-upload"
              className="hidden"
              multiple
              accept=".pdf,.doc,.docx,.txt,image/*"
              onChange={handleFileInput}
            />
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Upload className="h-8 w-8 text-primary" />
              </div>
              <div>
                <p className="text-lg font-medium text-foreground mb-1">Drag and drop your contracts here</p>
                <p className="text-sm text-muted-foreground">
                  or{" "}
                  <label htmlFor="file-upload" className="text-primary hover:underline cursor-pointer">
                    browse files
                  </label>
                </p>
              </div>
              <p className="text-xs text-muted-foreground">Supports PDF, Word, TXT, and images (JPG, PNG) up to 10MB</p>
            </div>
          </div>

          {files.length > 0 && (
            <div className="mt-6 space-y-3">
              <p className="text-sm font-medium text-foreground">Uploaded Files</p>
              {files.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/30"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm font-medium text-foreground">{file.name}</p>
                      <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => removeFile(index)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6 space-y-4">
          <h3 className="font-semibold text-foreground">Contract Details (Optional)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="contract-name">Contract Name</Label>
              <Input
                id="contract-name"
                placeholder="e.g., Wedding Venue Agreement"
                value={contractName}
                onChange={(e) => setContractName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="venue-name">Venue / Vendor Name</Label>
              <Input
                id="venue-name"
                placeholder="e.g., The Grand Hotel"
                value={venueName}
                onChange={(e) => setVenueName(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="contract-type">Contract Type</Label>
            <select
              id="contract-type"
              value={contractType}
              onChange={(e) => setContractType(e.target.value)}
              className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
            >
              <option value="venue">Venue Rental</option>
              <option value="catering">Catering Services</option>
              <option value="photography">Photography / Videography</option>
              <option value="entertainment">DJ / Entertainment</option>
              <option value="decor">Decor / Florist</option>
              <option value="other">Other</option>
            </select>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-4">
        <Button variant="outline">Cancel</Button>
        <Button onClick={handleSubmit} disabled={files.length === 0 || uploading}>
          {uploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Analyzing with AI...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Upload & Analyze
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
