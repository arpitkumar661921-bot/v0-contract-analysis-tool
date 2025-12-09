import { type NextRequest, NextResponse } from "next/server"

type HiddenFee = {
  name: string
  amount: string
  severity: "high" | "medium" | "low"
  description: string
}

type Risk = {
  title: string
  severity: "high" | "medium" | "low"
  description: string
}

async function analyzeImageWithOpenAI(imageBase64: string, fileName: string, contractType: string, apiKey: string) {
  const prompt = `You are an expert contract analyst for Indian wedding/event venues. This is an image of a contract document. Read ALL the text in this image carefully and extract the contract details.

CONTRACT FILE: ${fileName}
CONTRACT TYPE: ${contractType}

YOUR TASK: Read every word in this contract image and extract ALL specific information.

SEARCH FOR THESE SPECIFIC ITEMS:
1. VENUE NAME: Hotel name, hall name, banquet name, resort name
2. EVENT DATE: Any date mentioned (DD/MM/YYYY, Month Day Year, etc.)
3. GUEST COUNT: Number of guests, pax, persons, covers, minimum guarantee
4. PRICING - Search for these keywords:
   - "Rental" / "Hall charges" / "Venue fee" = Base Price
   - "Per plate" / "Per person" / "F&B" / "Food" = Food cost
   - "Service charge" / "Service tax" = Usually 10-15%
   - "GST" / "Tax" = Usually 18%
   - "Total" / "Grand total" / "Amount payable"
5. DEPOSITS: Booking amount, advance, security deposit
6. PAYMENT TERMS: When payments are due
7. CANCELLATION: Penalties, refund policy

CRITICAL RULES:
- Extract EXACT numbers from the image - do not estimate or make up values
- If you find "Rs. 5,00,000" or "₹500000" or "5 lakhs" → report as "₹5,00,000"
- If you find "$10,000" → convert to INR: "₹8,30,000" (multiply by 83)
- Use Indian number format: ₹1,00,000 (one lakh), ₹10,00,000 (ten lakhs)
- If a value is NOT visible in the image, use null (not "Not mentioned")

Return this EXACT JSON structure:
{
  "venueName": "exact name found or null",
  "eventDate": "exact date found or null",
  "guestCapacity": "exact number or null",
  "basePrice": "₹X,XX,XXX format or null",
  "foodCostPerPlate": "₹X,XXX per plate or null",
  "serviceCharge": "X% or ₹amount or null",
  "gst": "X% or null",
  "totalValue": "₹X,XX,XXX (sum of all costs) or null",
  "securityDeposit": "₹amount or null",
  "advancePayment": "₹amount or null",
  "riskScore": 1-10,
  "hiddenFees": [
    {"name": "fee name", "amount": "₹X or X%", "severity": "high/medium/low", "description": "what this fee covers"}
  ],
  "risks": [
    {"title": "risk name", "severity": "high/medium/low", "description": "specific concern"}
  ],
  "positives": ["good term 1", "good term 2"],
  "summary": "2-3 sentence summary with KEY NUMBERS from the contract",
  "paymentSchedule": "exact payment terms or null",
  "cancellationPolicy": "exact cancellation terms or null",
  "negotiationSuggestions": [
    {"clause": "what to negotiate", "suggestion": "what to ask for", "priority": "high/medium/low"}
  ],
  "extractedText": "Full text you read from the image (for reference)"
}

IMPORTANT: Read the entire image carefully. Return valid JSON only, no markdown.`

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content:
            "You are an expert Indian wedding contract analyst with OCR capabilities. You can read text from images perfectly. Extract EXACT values from contract images - never make up or estimate numbers. All amounts must be in Indian Rupees (₹) with Indian number formatting. Return valid JSON only.",
        },
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            {
              type: "image_url",
              image_url: {
                url: imageBase64.startsWith("data:") ? imageBase64 : `data:image/png;base64,${imageBase64}`,
                detail: "high",
              },
            },
          ],
        },
      ],
      temperature: 0.1,
      max_tokens: 4000,
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error("[v0] OpenAI Vision API error:", response.status, errorText)
    throw new Error(`OpenAI Vision API error: ${response.status}`)
  }

  const data = await response.json()
  const responseContent = data.choices?.[0]?.message?.content

  if (!responseContent) {
    throw new Error("No response from OpenAI Vision API")
  }

  console.log("[v0] OpenAI Vision response:", responseContent.substring(0, 500))

  // Parse JSON response
  let jsonStr = responseContent.trim()
  if (jsonStr.startsWith("```json")) {
    jsonStr = jsonStr.replace(/^```json\s*/, "").replace(/\s*```$/, "")
  } else if (jsonStr.startsWith("```")) {
    jsonStr = jsonStr.replace(/^```\s*/, "").replace(/\s*```$/, "")
  }

  const jsonMatch = jsonStr.match(/\{[\s\S]*\}/)
  if (!jsonMatch) {
    throw new Error("Could not parse JSON from Vision response")
  }

  return JSON.parse(jsonMatch[0])
}

async function analyzeWithOpenAI(content: string, fileName: string, contractType: string, apiKey: string) {
  const cleanedContent = content
    .replace(/\s+/g, " ")
    .replace(/[^\x20-\x7E₹\u0900-\u097F\n]/g, " ")
    .trim()

  const prompt = `You are an expert contract analyst for Indian wedding/event venues. Analyze this contract and extract ALL specific information.

CONTRACT FILE: ${fileName}
CONTRACT TYPE: ${contractType}

═══════════════════════════════════════════════════
CONTRACT TEXT (Read carefully line by line):
═══════════════════════════════════════════════════
${cleanedContent.substring(0, 25000)}
═══════════════════════════════════════════════════

YOUR TASK: Extract EXACT values from the contract above. Read every sentence carefully.

SEARCH FOR THESE SPECIFIC ITEMS:
1. VENUE NAME: Hotel name, hall name, banquet name, resort name
2. EVENT DATE: Any date mentioned (DD/MM/YYYY, Month Day Year, etc.)
3. GUEST COUNT: Number of guests, pax, persons, covers, minimum guarantee
4. PRICING - Search for these keywords:
   - "Rental" / "Hall charges" / "Venue fee" = Base Price
   - "Per plate" / "Per person" / "F&B" / "Food" = Food cost
   - "Service charge" / "Service tax" = Usually 10-15%
   - "GST" / "Tax" = Usually 18%
   - "Total" / "Grand total" / "Amount payable"
5. DEPOSITS: Booking amount, advance, security deposit
6. PAYMENT TERMS: When payments are due
7. CANCELLATION: Penalties, refund policy

CRITICAL RULES:
- Extract EXACT numbers from the text - do not estimate or make up values
- If you find "Rs. 5,00,000" or "₹500000" or "5 lakhs" → report as "₹5,00,000"
- If you find "$10,000" → convert to INR: "₹8,30,000" (multiply by 83)
- Use Indian number format: ₹1,00,000 (one lakh), ₹10,00,000 (ten lakhs)
- If a value is NOT in the contract, use null (not "Not mentioned")

Return this EXACT JSON structure:
{
  "venueName": "exact name found or null",
  "eventDate": "exact date found or null",
  "guestCapacity": "exact number or null",
  "basePrice": "₹X,XX,XXX format or null",
  "foodCostPerPlate": "₹X,XXX per plate or null",
  "serviceCharge": "X% or ₹amount or null",
  "gst": "X% or null",
  "totalValue": "₹X,XX,XXX (sum of all costs) or null",
  "securityDeposit": "₹amount or null",
  "advancePayment": "₹amount or null",
  "riskScore": 1-10,
  "hiddenFees": [
    {"name": "fee name", "amount": "₹X or X%", "severity": "high/medium/low", "description": "what this fee covers"}
  ],
  "risks": [
    {"title": "risk name", "severity": "high/medium/low", "description": "specific concern"}
  ],
  "positives": ["good term 1", "good term 2"],
  "summary": "2-3 sentence summary with KEY NUMBERS",
  "paymentSchedule": "exact payment terms or null",
  "cancellationPolicy": "exact cancellation terms or null",
  "negotiationSuggestions": [
    {"clause": "what to negotiate", "suggestion": "what to ask for", "priority": "high/medium/low"}
  ]
}

IMPORTANT: Only include what you actually find. Return valid JSON only, no markdown.`

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are an expert Indian wedding contract analyst. You extract EXACT values from contracts - never make up or estimate numbers. All amounts must be in Indian Rupees (₹) with Indian number formatting (lakhs, crores). If a specific value is not found in the contract text, return null for that field. Be thorough - read every line. Return valid JSON only.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.1,
      max_tokens: 4000,
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error("[v0] OpenAI API error:", response.status, errorText)
    throw new Error(`OpenAI API error: ${response.status}`)
  }

  const data = await response.json()
  const responseContent = data.choices?.[0]?.message?.content

  if (!responseContent) {
    throw new Error("No response from OpenAI API")
  }

  console.log("[v0] OpenAI raw response:", responseContent.substring(0, 500))

  let jsonStr = responseContent.trim()
  if (jsonStr.startsWith("```json")) {
    jsonStr = jsonStr.replace(/^```json\s*/, "").replace(/\s*```$/, "")
  } else if (jsonStr.startsWith("```")) {
    jsonStr = jsonStr.replace(/^```\s*/, "").replace(/\s*```$/, "")
  }

  const jsonMatch = jsonStr.match(/\{[\s\S]*\}/)
  if (!jsonMatch) {
    throw new Error("Could not parse JSON from response")
  }

  return JSON.parse(jsonMatch[0])
}

// Fallback local analysis
function analyzeContractLocally(content: string, fileName: string) {
  const hiddenFees: HiddenFee[] = []
  const risks: Risk[] = []
  const positives: string[] = []

  const rupeePattern = /(?:Rs\.?|₹|INR)\s*([\d,]+(?:\.\d{2})?)/gi
  const lakhPattern = /(\d+(?:\.\d+)?)\s*(?:lakh|lac|L)/gi

  const allPrices: number[] = []

  let match
  while ((match = rupeePattern.exec(content)) !== null) {
    const num = Number.parseFloat(match[1].replace(/,/g, ""))
    if (!isNaN(num) && num > 0) allPrices.push(num)
  }

  while ((match = lakhPattern.exec(content)) !== null) {
    const num = Number.parseFloat(match[1]) * 100000
    if (!isNaN(num) && num > 0) allPrices.push(num)
  }

  let basePrice = null
  let totalValue = null

  if (allPrices.length > 0) {
    const maxPrice = Math.max(...allPrices)
    if (maxPrice >= 10000) {
      basePrice = `₹${maxPrice.toLocaleString("en-IN")}`
      const total = allPrices.reduce((sum, p) => sum + p, 0)
      totalValue = `₹${total.toLocaleString("en-IN")}`
    }
  }

  const serviceMatch = content.match(/service\s*(?:charge|tax)[:\s]*(\d+(?:\.\d+)?)\s*%/i)
  if (serviceMatch) {
    hiddenFees.push({
      name: "Service Charge",
      amount: `${serviceMatch[1]}%`,
      severity: Number.parseFloat(serviceMatch[1]) > 12 ? "high" : "medium",
      description: "Service charge on total billing",
    })
  }

  const gstMatch = content.match(/gst[:\s]*(\d+(?:\.\d+)?)\s*%/i)
  if (gstMatch) {
    hiddenFees.push({
      name: "GST",
      amount: `${gstMatch[1]}%`,
      severity: "medium",
      description: "Goods and Services Tax",
    })
  }

  if (/non[\s-]?refundable/i.test(content)) {
    risks.push({ title: "Non-Refundable Deposit", severity: "high", description: "Some payments are non-refundable" })
  }
  if (/cancellation/i.test(content) && /penalty|forfeit/i.test(content)) {
    risks.push({ title: "Cancellation Penalty", severity: "high", description: "Cancellation may incur penalties" })
  }

  if (/complimentary|free|included/i.test(content)) positives.push("Some services included at no extra cost")
  if (/flexible/i.test(content)) positives.push("Flexible terms mentioned")
  if (positives.length === 0) positives.push("Standard contract terms")

  const venueMatch = content.match(
    /(?:hotel|resort|palace|banquet|hall|venue)[:\s]+([A-Z][A-Za-z\s&'-]+?)(?:\s*,|\s*\.|$)/i,
  )

  return {
    riskScore: Math.min(10, 3 + risks.filter((r) => r.severity === "high").length * 2 + hiddenFees.length),
    basePrice,
    totalValue,
    hiddenFees,
    risks,
    positives,
    summary: `Local analysis found ${hiddenFees.length} fees and ${risks.length} risk factors.`,
    venueName: venueMatch?.[1]?.trim() || null,
    eventDate: null,
    guestCapacity: null,
    negotiationSuggestions: [],
    paymentSchedule: null,
    cancellationPolicy: null,
  }
}

function formatAnalysisResponse(parsed: any) {
  const formatPrice = (value: any) => {
    if (!value || value === "null" || value === null) return "Not mentioned in contract"
    return value
  }

  return {
    riskScore: parsed.riskScore || 5,
    basePrice: formatPrice(parsed.basePrice),
    totalValue: formatPrice(parsed.totalValue),
    foodCostPerPlate: formatPrice(parsed.foodCostPerPlate),
    serviceCharge: formatPrice(parsed.serviceCharge),
    gst: formatPrice(parsed.gst),
    securityDeposit: formatPrice(parsed.securityDeposit),
    advancePayment: formatPrice(parsed.advancePayment),
    hiddenFees: parsed.hiddenFees || [],
    risks: parsed.risks || [],
    positives: parsed.positives?.length > 0 ? parsed.positives : ["Contract received for analysis"],
    summary: parsed.summary || "Contract analysis completed.",
    venueName: parsed.venueName || null,
    eventDate: parsed.eventDate || null,
    guestCapacity: parsed.guestCapacity || null,
    negotiationSuggestions: parsed.negotiationSuggestions || [],
    paymentSchedule: parsed.paymentSchedule || null,
    cancellationPolicy: parsed.cancellationPolicy || null,
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { content, fileName, contractType, imageData, pdfImages } = body

    const apiKey = process.env.OPENAI_API_KEY || process.env.OPENAI_KEY

    if (pdfImages && pdfImages.length > 0 && apiKey) {
      console.log("[v0] Analyzing PDF as images using OpenAI Vision, pages:", pdfImages.length)

      try {
        // Analyze first page (usually contains most important info)
        const parsed = await analyzeImageWithOpenAI(
          pdfImages[0],
          fileName || "contract.pdf",
          contractType || "venue",
          apiKey,
        )
        const analysis = formatAnalysisResponse(parsed)
        console.log("[v0] Vision analysis successful")
        return NextResponse.json({ analysis, provider: "OpenAI GPT-4o Vision" })
      } catch (visionError) {
        console.error("[v0] Vision analysis failed:", visionError)
        // Fall through to text analysis if available
      }
    }

    if (imageData && apiKey) {
      console.log("[v0] Analyzing image using OpenAI Vision")

      try {
        const parsed = await analyzeImageWithOpenAI(imageData, fileName || "contract", contractType || "venue", apiKey)
        const analysis = formatAnalysisResponse(parsed)
        return NextResponse.json({ analysis, provider: "OpenAI GPT-4o Vision" })
      } catch (visionError) {
        console.error("[v0] Vision analysis failed:", visionError)
      }
    }

    // Handle text content
    if (!content) {
      return NextResponse.json({ error: "No content provided" }, { status: 400 })
    }

    console.log("[v0] Contract content length:", content.length)

    const readableTextRatio = (content.match(/[a-zA-Z0-9\s,.!?₹]/g) || []).length / content.length
    console.log("[v0] Readable text ratio:", readableTextRatio)

    if (readableTextRatio < 0.5) {
      return NextResponse.json(
        {
          error: "Could not extract readable text from file",
          details: "Please use the 'Paste Text' tab to copy and paste your contract text directly.",
        },
        { status: 400 },
      )
    }

    if (content.length < 100) {
      return NextResponse.json(
        {
          error: "Contract text is too short",
          details: "Please upload a complete contract or paste more text.",
        },
        { status: 400 },
      )
    }

    if (!apiKey) {
      console.log("[v0] No OpenAI API key found, using local analysis")
      const localAnalysis = analyzeContractLocally(content, fileName)
      return NextResponse.json({ analysis: localAnalysis, provider: "Local Analysis (No API key)" })
    }

    try {
      console.log("[v0] Starting AI analysis with OpenAI GPT-4o-mini")
      const parsed = await analyzeWithOpenAI(content, fileName, contractType || "venue", apiKey)
      const analysis = formatAnalysisResponse(parsed)
      console.log("[v0] AI analysis successful")
      return NextResponse.json({ analysis, provider: "OpenAI GPT-4o-mini" })
    } catch (aiError) {
      console.error("[v0] AI analysis failed:", aiError instanceof Error ? aiError.message : aiError)
      const localAnalysis = analyzeContractLocally(content, fileName)
      return NextResponse.json({ analysis: localAnalysis, provider: "Local Analysis (AI fallback)" })
    }
  } catch (error) {
    console.error("[v0] Contract analysis error:", error)
    return NextResponse.json(
      { error: "Failed to analyze contract", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
