import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const base64Data = body.fileData || body.base64

    if (!base64Data) {
      return NextResponse.json({ error: "No PDF data provided" }, { status: 400 })
    }

    // Convert base64 to Uint8Array
    const binaryString = atob(base64Data)
    const bytes = new Uint8Array(binaryString.length)
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i)
    }

    let extractedText = ""
    let extractionMethod = "unknown"

    try {
      const { extractText } = await import("unpdf")
      const result = await extractText(bytes)
      extractedText = result.text || ""
      extractionMethod = "unpdf"
      console.log("[v0] unpdf extraction successful, length:", extractedText.length)
      console.log("[v0] unpdf text preview:", extractedText.substring(0, 500))
    } catch (unpdfError) {
      console.log("[v0] unpdf import/extraction failed:", unpdfError)

      try {
        const { getDocumentProxy } = await import("unpdf")
        const pdf = await getDocumentProxy(bytes)
        const textParts: string[] = []

        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i)
          const textContent = await page.getTextContent()
          const pageText = textContent.items.map((item: any) => item.str || "").join(" ")
          textParts.push(pageText)
        }

        extractedText = textParts.join("\n\n")
        extractionMethod = "unpdf-pages"
        console.log("[v0] unpdf page-by-page extraction, length:", extractedText.length)
      } catch (pdfJsError) {
        console.log("[v0] PDF.js style extraction failed:", pdfJsError)
        extractedText = ""
      }
    }

    // Clean up extracted text
    extractedText = extractedText
      .replace(/\s+/g, " ")
      .replace(/ReportLab Generated PDF document[^.]*\./gi, "")
      .replace(/http:\/\/www\.reportlab\.com/gi, "")
      .trim()

    console.log("[v0] Final extracted text length:", extractedText.length)
    console.log("[v0] Final text preview:", extractedText.substring(0, 500))

    // Check if we got meaningful text
    if (extractedText.length < 50) {
      return NextResponse.json(
        {
          error:
            "Could not extract readable text from this PDF. The file may be scanned/image-based or use non-standard encoding. Please copy-paste the contract text using the 'Paste Text' tab for best results.",
          text: "",
          method: extractionMethod,
        },
        { status: 400 },
      )
    }

    return NextResponse.json({
      text: extractedText,
      pages: 1,
      method: extractionMethod,
    })
  } catch (error) {
    console.error("[v0] PDF extraction error:", error)
    return NextResponse.json(
      {
        error:
          "Failed to process PDF. Please use the 'Paste Text' tab to copy-paste your contract text directly for the most accurate analysis.",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
