"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Upload, FileText, X, Loader2, CheckCircle, AlertTriangle, FileUp, Type, Camera } from "lucide-react"
import { useContractStore } from "@/lib/contract-store"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

type UploadedFile = {
  file: File
  name: string
  size: number
  type: string
}

async function extractTextFromPDFServer(file: File): Promise<string> {
  // Convert file to base64
  const arrayBuffer = await file.arrayBuffer()
  const base64 = btoa(new Uint8Array(arrayBuffer).reduce((data, byte) => data + String.fromCharCode(byte), ""))

  // Send to server for extraction
  const response = await fetch("/api/extract-pdf", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fileData: base64, fileName: file.name }),
  })

  const result = await response.json()

  if (!response.ok) {
    console.log("[v0] PDF extraction failed:", result)
    throw new Error(
      result.error ||
        "PDF text extraction failed. For best results, please open your PDF, select all text (Ctrl+A), copy it (Ctrl+C), and paste it in the 'Paste Text' tab.",
    )
  }

  if (!result.text || result.text.length < 50) {
    throw new Error(
      "Could not extract enough text from PDF. Please use the 'Paste Text' tab - open your PDF, copy all the text, and paste it there for accurate analysis.",
    )
  }

  console.log("[v0] PDF extracted via method:", result.method)
  return result.text
}

async function renderPDFToImages(file: File): Promise<string[]> {
  const pdfjsLib = await import("pdfjs-dist")

  pdfjsLib.GlobalWorkerOptions.workerSrc = ""

  const arrayBuffer = await file.arrayBuffer()

  const pdf = await pdfjsLib.getDocument({
    data: arrayBuffer,
    useWorkerFetch: false,
    isEvalSupported: false,
    useSystemFonts: true,
  }).promise

  const images: string[] = []
  const numPages = Math.min(pdf.numPages, 3) // Only first 3 pages

  for (let i = 1; i <= numPages; i++) {
    const page = await pdf.getPage(i)
    const scale = 2.0 // Higher resolution for better OCR
    const viewport = page.getViewport({ scale })

    const canvas = document.createElement("canvas")
    const context = canvas.getContext("2d")!
    canvas.height = viewport.height
    canvas.width = viewport.width

    await page.render({
      canvasContext: context,
      viewport: viewport,
    }).promise

    // Convert to base64 PNG
    const imageData = canvas.toDataURL("image/png")
    images.push(imageData)
  }

  return images
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
  const [aiProvider, setAiProvider] = useState<string | null>(null)
  const [extractionStatus, setExtractionStatus] = useState<string>("")
  const [pastedText, setPastedText] = useState("")
  const [uploadMode, setUploadMode] = useState<"file" | "text">("text")

  const { addContract } = useContractStore()

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

  const handleSubmit = async () => {
    if (uploadMode === "file" && files.length === 0) return
    if (uploadMode === "text" && pastedText.trim().length < 100) {
      setError("Please paste at least 100 characters of contract text")
      return
    }

    setUploading(true)
    setError(null)
    setExtractionStatus("")

    try {
      const requestBody: any = {
        fileName: contractName || (uploadMode === "file" ? files[0]?.name : "Pasted Contract"),
        contractType,
      }

      if (uploadMode === "text") {
        requestBody.content = pastedText.trim()
        setExtractionStatus("Analyzing contract text with AI...")
      } else {
        const file = files[0]

        if (file.type === "application/pdf") {
          setExtractionStatus("Converting PDF to images for AI analysis...")
          try {
            const pdfImages = await renderPDFToImages(file.file)
            console.log("[v0] PDF rendered to", pdfImages.length, "images")
            requestBody.pdfImages = pdfImages
            setExtractionStatus("Analyzing PDF with AI Vision...")
          } catch (pdfError) {
            console.error("[v0] PDF rendering failed:", pdfError)
            setError(
              "Could not process PDF file. Please try:\n1. Opening the PDF and copying all text (Ctrl+A, Ctrl+C)\n2. Paste it in the 'Paste Text' tab\n\nThis gives the most accurate results.",
            )
            setUploading(false)
            return
          }
        } else if (file.type.startsWith("image/")) {
          setExtractionStatus("Analyzing image with AI Vision...")
          const arrayBuffer = await file.file.arrayBuffer()
          const base64 = btoa(new Uint8Array(arrayBuffer).reduce((data, byte) => data + String.fromCharCode(byte), ""))
          requestBody.imageData = `data:${file.type};base64,${base64}`
        } else if (file.type === "text/plain") {
          // Text file - read content
          const content = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader()
            reader.onload = (e) => resolve(e.target?.result as string)
            reader.onerror = reject
            reader.readAsText(file.file)
          })
          requestBody.content = content
          setExtractionStatus("Analyzing text with AI...")
        } else {
          setError("Unsupported file type. Please use PDF, image, or text files.")
          setUploading(false)
          return
        }
      }

      const contractId = `contract-${Date.now()}`

      const initialContract = {
        id: contractId,
        name: contractName || requestBody.fileName.replace(/\.[^/.]+$/, ""),
        venue: venueName || "Unknown Venue",
        uploadedAt: new Date().toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
        status: "analyzing" as const,
        fileContent: requestBody.content || "[PDF/Image analyzed by AI Vision]",
        fileType: uploadMode === "text" ? "text/plain" : files[0]?.type || "text/plain",
        riskScore: 0,
        totalValue: "Calculating...",
        basePrice: "Calculating...",
        hiddenFees: [],
        risks: [],
        positives: [],
        summary: "Analyzing contract...",
        rawText: requestBody.content || "",
      }

      addContract(initialContract)

      console.log("[v0] Sending to analyze-contract API")
      const response = await fetch("/api/analyze-contract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      })

      const responseData = await response.json()

      if (!response.ok) {
        throw new Error(responseData.details || responseData.error || "Failed to analyze contract")
      }

      const { analysis, provider } = responseData
      setAiProvider(provider)
      console.log("[v0] Analysis received from provider:", provider)

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
        eventDate: analysis.eventDate,
        guestCapacity: analysis.guestCapacity,
        paymentSchedule: analysis.paymentSchedule,
        cancellationPolicy: analysis.cancellationPolicy,
      })

      setUploadComplete(true)

      setTimeout(() => {
        router.push(`/dashboard/contracts/${contractId}`)
      }, 1500)
    } catch (err) {
      console.error("[v0] Analysis error:", err)
      setError(err instanceof Error ? err.message : "Failed to analyze contract")
      setUploading(false)
      setExtractionStatus("")
    }
  }

  if (uploadComplete) {
    return (
      <Card>
        <CardContent className="py-16 text-center">
          <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-8 w-8 text-green-500" />
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
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 mt-0.5 text-destructive" />
              <div className="flex-1">
                <p className="text-sm font-medium text-destructive">Analysis Error</p>
                <p className="text-sm text-muted-foreground mt-1 whitespace-pre-line">{error}</p>
                <Button variant="outline" size="sm" className="mt-3 bg-transparent" onClick={() => setError(null)}>
                  Try Again
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="pt-6">
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
                  <Label htmlFor="contract-text" className="text-base font-medium">
                    Paste Your Contract Text
                  </Label>
                  <p className="text-sm text-muted-foreground mb-3">
                    Copy and paste the full contract text from your document. This gives the most accurate AI analysis.
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
- Food & Beverage (₹1,500 per plate x 500 guests): ₹7,50,000
- Service Charge (10%): ₹1,25,000
- GST (18%): ₹2,47,500
- Security Deposit: ₹1,00,000

TOTAL: ₹17,22,500

Payment Terms:
- 50% advance at booking
- 50% balance 7 days before event

Cancellation Policy:
- 30+ days: 80% refund
- 15-30 days: 50% refund
- Less than 15 days: No refund`}
                    className="min-h-[350px] font-mono text-sm"
                    value={pastedText}
                    onChange={(e) => setPastedText(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    {pastedText.length} characters {pastedText.length < 100 && "(minimum 100 required)"}
                  </p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="file">
              <div className="space-y-4">
                <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                  <div className="flex items-start gap-2">
                    <Camera className="h-4 w-4 mt-0.5 text-primary" />
                    <div>
                      <p className="text-sm font-medium text-primary">AI Vision Enabled</p>
                      <p className="text-xs text-muted-foreground">
                        PDFs and images are analyzed directly by OpenAI Vision AI - no text extraction needed!
                      </p>
                    </div>
                  </div>
                </div>

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
                    <p className="text-xs text-muted-foreground">
                      Supports PDF, images (JPG, PNG), and text files up to 10MB
                    </p>
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
              </div>
            </TabsContent>
          </Tabs>

          {uploading && extractionStatus && (
            <div className="mt-4 p-3 rounded-lg bg-primary/5 border border-primary/20">
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                <p className="text-sm text-primary">{extractionStatus}</p>
              </div>
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
        <Button
          variant="outline"
          onClick={() => {
            setFiles([])
            setPastedText("")
            setError(null)
          }}
        >
          Clear
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={
            (uploadMode === "file" && files.length === 0) ||
            (uploadMode === "text" && pastedText.trim().length < 100) ||
            uploading
          }
        >
          {uploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {extractionStatus ? "Processing..." : "Analyzing with AI..."}
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Analyze Contract
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
