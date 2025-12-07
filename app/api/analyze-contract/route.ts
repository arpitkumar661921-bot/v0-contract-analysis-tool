import { generateObject } from "ai"
import { createOpenAI } from "@ai-sdk/openai"
import { z } from "zod"

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

type NegotiationSuggestion = {
  clause: string
  suggestion: string
  priority: "high" | "medium" | "low"
}

// Pattern matching for common contract fees and terms
const feePatterns = [
  {
    regex: /service\s*(?:charge|fee)[:\s]*(\$?[\d,]+(?:\.\d{2})?|\d+\s*%)/gi,
    name: "Service Charge",
    severity: "medium" as const,
  },
  { regex: /cleaning\s*(?:fee|charge)[:\s]*(\$?[\d,]+(?:\.\d{2})?)/gi, name: "Cleaning Fee", severity: "low" as const },
  {
    regex: /overtime\s*(?:fee|charge|rate)[:\s]*(\$?[\d,]+(?:\.\d{2})?(?:\s*per\s*hour)?)/gi,
    name: "Overtime Fee",
    severity: "high" as const,
  },
  { regex: /gratuity[:\s]*(\$?[\d,]+(?:\.\d{2})?|\d+\s*%)/gi, name: "Gratuity", severity: "medium" as const },
  {
    regex: /admin(?:istrative|istration)?\s*(?:fee|charge)[:\s]*(\$?[\d,]+(?:\.\d{2})?|\d+\s*%)/gi,
    name: "Administrative Fee",
    severity: "medium" as const,
  },
  {
    regex: /security\s*(?:deposit|fee)[:\s]*(\$?[\d,]+(?:\.\d{2})?)/gi,
    name: "Security Deposit",
    severity: "low" as const,
  },
  {
    regex: /damage\s*(?:deposit|waiver)[:\s]*(\$?[\d,]+(?:\.\d{2})?)/gi,
    name: "Damage Deposit",
    severity: "low" as const,
  },
  { regex: /setup\s*(?:fee|charge)[:\s]*(\$?[\d,]+(?:\.\d{2})?)/gi, name: "Setup Fee", severity: "medium" as const },
  {
    regex: /breakdown\s*(?:fee|charge)[:\s]*(\$?[\d,]+(?:\.\d{2})?)/gi,
    name: "Breakdown Fee",
    severity: "medium" as const,
  },
  {
    regex: /cancellation\s*(?:fee|penalty)[:\s]*(\$?[\d,]+(?:\.\d{2})?|\d+\s*%)/gi,
    name: "Cancellation Fee",
    severity: "high" as const,
  },
  {
    regex: /late\s*(?:fee|penalty|charge)[:\s]*(\$?[\d,]+(?:\.\d{2})?|\d+\s*%)/gi,
    name: "Late Fee",
    severity: "high" as const,
  },
  { regex: /corkage\s*(?:fee)?[:\s]*(\$?[\d,]+(?:\.\d{2})?)/gi, name: "Corkage Fee", severity: "medium" as const },
  {
    regex: /cake\s*cutting\s*(?:fee)?[:\s]*(\$?[\d,]+(?:\.\d{2})?)/gi,
    name: "Cake Cutting Fee",
    severity: "low" as const,
  },
  { regex: /valet\s*(?:parking)?[:\s]*(\$?[\d,]+(?:\.\d{2})?)/gi, name: "Valet Parking", severity: "low" as const },
  {
    regex: /insurance\s*(?:fee|requirement)?[:\s]*(\$?[\d,]+(?:\.\d{2})?)/gi,
    name: "Insurance Requirement",
    severity: "medium" as const,
  },
  {
    regex: /minimum\s*(?:spend|spending|purchase)[:\s]*(\$?[\d,]+(?:\.\d{2})?)/gi,
    name: "Minimum Spend",
    severity: "high" as const,
  },
  { regex: /tax(?:es)?[:\s]*(\d+(?:\.\d+)?\s*%)/gi, name: "Taxes", severity: "low" as const },
]

const riskPatterns = [
  {
    regex: /non[\s-]?refundable/gi,
    title: "Non-Refundable Deposit",
    severity: "high" as const,
    description: "Deposits or payments marked as non-refundable pose a financial risk if plans change.",
  },
  {
    regex: /no\s+cancellation|cannot\s+(?:be\s+)?cancel/gi,
    title: "No Cancellation Policy",
    severity: "high" as const,
    description: "The contract may not allow cancellations, which limits your flexibility.",
  },
  {
    regex: /force\s+majeure/gi,
    title: "Force Majeure Clause",
    severity: "medium" as const,
    description: "Check what events are covered and how refunds are handled.",
  },
  {
    regex: /indemnif(?:y|ication)/gi,
    title: "Indemnification Clause",
    severity: "high" as const,
    description: "You may be required to cover certain liabilities or legal costs.",
  },
  {
    regex: /waiv(?:e|er)\s+(?:all\s+)?(?:right|claim|liability)/gi,
    title: "Liability Waiver",
    severity: "high" as const,
    description: "You may be waiving important legal rights or protections.",
  },
  {
    regex: /automatic(?:ally)?\s+renew/gi,
    title: "Auto-Renewal",
    severity: "medium" as const,
    description: "The contract may automatically renew if not cancelled within a specific timeframe.",
  },
  {
    regex: /exclusive\s+(?:vendor|caterer|photographer)/gi,
    title: "Exclusive Vendor Requirement",
    severity: "medium" as const,
    description: "You may be restricted to using only approved vendors.",
  },
  {
    regex: /binding\s+arbitration/gi,
    title: "Binding Arbitration",
    severity: "medium" as const,
    description: "Disputes must be resolved through arbitration rather than court.",
  },
  {
    regex: /penalty|penalt(?:y|ies)\s+(?:for|of)/gi,
    title: "Penalty Clauses",
    severity: "high" as const,
    description: "The contract includes financial penalties for certain breaches.",
  },
  {
    regex: /forfeit/gi,
    title: "Forfeiture Terms",
    severity: "high" as const,
    description: "Certain payments or deposits may be forfeited under specific conditions.",
  },
  {
    regex: /subject\s+to\s+change|prices?\s+(?:may|subject\s+to)\s+change/gi,
    title: "Price Subject to Change",
    severity: "medium" as const,
    description: "Prices are not fixed and may increase before your event.",
  },
  {
    regex: /weather\s+(?:cancellation|policy)/gi,
    title: "Weather Policy",
    severity: "low" as const,
    description: "Review how weather-related issues are handled.",
  },
]

const positivePatterns = [
  { regex: /full\s+refund/gi, text: "Full refund policy available under certain conditions" },
  { regex: /flexible\s+(?:cancellation|reschedul)/gi, text: "Flexible cancellation or rescheduling options" },
  { regex: /payment\s+plan|installment/gi, text: "Payment plan or installment options available" },
  { regex: /complimentary|included\s+at\s+no/gi, text: "Complimentary services or amenities included" },
  { regex: /rain\s+(?:date|backup)|backup\s+(?:date|plan)/gi, text: "Backup date or rain plan available" },
  { regex: /discount|reduced\s+rate/gi, text: "Discounts or reduced rates mentioned" },
  { regex: /satisfaction\s+guarantee/gi, text: "Satisfaction guarantee offered" },
  { regex: /free\s+(?:parking|wifi|setup)/gi, text: "Free amenities included" },
]

function extractPrices(content: string): { basePrice: string; totalEstimate: number } {
  // Look for common price patterns
  const priceMatches = content.match(/\$[\d,]+(?:\.\d{2})?/g) || []
  const prices = priceMatches.map((p) => Number.parseFloat(p.replace(/[$,]/g, ""))).filter((p) => !isNaN(p))

  // Also look for written amounts
  const rentalMatch = content.match(/(?:rental|venue|total|price|cost|fee)[:\s]*\$?([\d,]+(?:\.\d{2})?)/gi)

  let basePrice = "Not specified"
  let totalEstimate = 0

  if (prices.length > 0) {
    // Assume largest price is total, or use most prominent
    const sortedPrices = [...prices].sort((a, b) => b - a)
    totalEstimate = sortedPrices[0]
    basePrice = `$${sortedPrices[sortedPrices.length > 1 ? 1 : 0].toLocaleString()}`
  }

  return { basePrice, totalEstimate }
}

function analyzeContract(content: string, fileName: string, contractType: string) {
  const hiddenFees: HiddenFee[] = []
  const risks: Risk[] = []
  const positives: string[] = []

  // Extract fees
  for (const pattern of feePatterns) {
    const matches = content.matchAll(pattern.regex)
    for (const match of matches) {
      const amount = match[1] || "See contract"
      if (!hiddenFees.some((f) => f.name === pattern.name)) {
        hiddenFees.push({
          name: pattern.name,
          amount: amount.trim(),
          severity: pattern.severity,
          description: `Found reference to ${pattern.name.toLowerCase()} in the contract.`,
        })
      }
    }
  }

  // Extract risks
  for (const pattern of riskPatterns) {
    if (pattern.regex.test(content)) {
      if (!risks.some((r) => r.title === pattern.title)) {
        risks.push({
          title: pattern.title,
          severity: pattern.severity,
          description: pattern.description,
        })
      }
    }
  }

  // Extract positives
  for (const pattern of positivePatterns) {
    if (pattern.regex.test(content)) {
      if (!positives.includes(pattern.text)) {
        positives.push(pattern.text)
      }
    }
  }

  // Add default positive if none found
  if (positives.length === 0) {
    positives.push("Standard contract terms detected")
  }

  // Calculate risk score based on findings
  let riskScore = 3 // Base score
  const highRisks = risks.filter((r) => r.severity === "high").length
  const mediumRisks = risks.filter((r) => r.severity === "medium").length
  const highFees = hiddenFees.filter((f) => f.severity === "high").length

  riskScore += highRisks * 1.5
  riskScore += mediumRisks * 0.5
  riskScore += highFees * 1
  riskScore = Math.min(10, Math.max(1, Math.round(riskScore)))

  // Extract prices
  const { basePrice, totalEstimate } = extractPrices(content)

  // Calculate total with fees estimate
  let feeTotal = 0
  for (const fee of hiddenFees) {
    const numMatch = fee.amount.match(/[\d,]+(?:\.\d{2})?/)
    if (numMatch) {
      const num = Number.parseFloat(numMatch[0].replace(/,/g, ""))
      if (fee.amount.includes("%")) {
        feeTotal += totalEstimate * (num / 100)
      } else {
        feeTotal += num
      }
    }
  }

  const totalValue =
    totalEstimate > 0
      ? `$${Math.round(totalEstimate + feeTotal).toLocaleString()}`
      : "Unable to calculate - review contract manually"

  // Generate summary
  const summaryParts = []
  if (hiddenFees.length > 0) {
    summaryParts.push(`Found ${hiddenFees.length} potential fee${hiddenFees.length > 1 ? "s" : ""} in the contract.`)
  }
  if (risks.length > 0) {
    summaryParts.push(`Identified ${risks.length} risk factor${risks.length > 1 ? "s" : ""} to review.`)
  }
  if (highRisks > 0) {
    summaryParts.push(
      `${highRisks} high-priority item${highRisks > 1 ? "s" : ""} require${highRisks === 1 ? "s" : ""} attention.`,
    )
  }
  if (summaryParts.length === 0) {
    summaryParts.push("Contract appears straightforward. Review all terms before signing.")
  }

  const summary = summaryParts.join(" ")

  // Try to extract venue name
  const venueMatch = content.match(/(?:venue|hotel|estate|manor|hall|ballroom|garden)[:\s]+["']?([A-Z][^"'\n,]{2,40})/i)
  const venueName = venueMatch ? venueMatch[1].trim() : undefined

  // Generate negotiation suggestions
  const negotiationSuggestions: NegotiationSuggestion[] = []
  for (const risk of risks) {
    if (risk.severity === "high") {
      negotiationSuggestions.push({
        clause: risk.title,
        suggestion: `Consider negotiating a more favorable ${risk.title.toLowerCase()} clause.`,
        priority: "high" as const,
      })
    }
  }

  for (const fee of hiddenFees) {
    if (fee.severity === "high") {
      negotiationSuggestions.push({
        clause: fee.name,
        suggestion: `Negotiate for a lower ${fee.name.toLowerCase()} or a refundable deposit.`,
        priority: "high" as const,
      })
    }
  }

  return {
    riskScore,
    basePrice,
    totalValue,
    hiddenFees,
    risks,
    positives,
    summary,
    venueName,
    negotiationSuggestions,
  }
}

const contractAnalysisSchema = z.object({
  riskScore: z.number().min(1).max(10).describe("Overall risk score from 1-10, where 10 is highest risk"),
  basePrice: z.string().describe("The base price or rental fee mentioned in the contract"),
  totalValue: z.string().describe("Estimated total cost including all fees and charges"),
  hiddenFees: z
    .array(
      z.object({
        name: z.string().describe("Name of the fee"),
        amount: z.string().describe("Amount or percentage of the fee"),
        severity: z.enum(["high", "medium", "low"]).describe("How concerning this fee is"),
        description: z.string().describe("Explanation of what this fee covers and why it matters"),
      }),
    )
    .describe("List of hidden or additional fees found in the contract"),
  risks: z
    .array(
      z.object({
        title: z.string().describe("Short title for the risk"),
        severity: z.enum(["high", "medium", "low"]).describe("How serious this risk is"),
        description: z.string().describe("Detailed explanation of the risk and its implications"),
      }),
    )
    .describe("List of potential risks or concerning clauses"),
  positives: z.array(z.string()).describe("Positive aspects or favorable terms in the contract"),
  summary: z.string().describe("Brief 2-3 sentence summary of the contract analysis"),
  venueName: z.string().optional().describe("Name of the venue if mentioned"),
  negotiationSuggestions: z
    .array(
      z.object({
        clause: z.string().describe("The clause or term to negotiate"),
        suggestion: z.string().describe("How to negotiate this term"),
        priority: z.enum(["high", "medium", "low"]).describe("How important this negotiation is"),
      }),
    )
    .describe("Suggestions for negotiating better terms"),
})

const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(req: Request) {
  try {
    const { content, fileName, contractType } = await req.json()

    if (!content) {
      return Response.json({ error: "No content provided" }, { status: 400 })
    }

    if (!process.env.OPENAI_API_KEY) {
      console.log("[v0] No OPENAI_API_KEY found, using local analysis")
      const localAnalysis = analyzeContract(content, fileName, contractType || "venue")
      return Response.json({ analysis: localAnalysis, provider: "Local Analysis" })
    }

    // Try AI analysis with OpenAI
    try {
      console.log("[v0] Starting OpenAI analysis")

      const { object: analysis } = await generateObject({
        model: openai("gpt-4o-mini"),
        schema: contractAnalysisSchema,
        prompt: `You are an expert contract analyst specializing in event and venue contracts. Analyze this ${contractType || "venue"} contract thoroughly and provide detailed insights.

Contract file: ${fileName}

Contract content:
${content.substring(0, 12000)}

Analyze the contract for:
1. ALL hidden fees - service charges, gratuity, overtime, cleaning, setup, breakdown, cancellation fees, corkage, cake cutting, valet, insurance, minimum spend, taxes, etc.
2. Risk factors - non-refundable terms, liability waivers, indemnification, cancellation policies, force majeure, auto-renewal, exclusive vendor requirements, binding arbitration, penalty clauses
3. Positive aspects - refund policies, flexibility, payment plans, complimentary services, guarantees
4. Negotiation opportunities - clauses that can be negotiated for better terms
5. Overall risk assessment on a 1-10 scale (10 = highest risk)

Be thorough, specific, and extract actual amounts mentioned in the contract. Provide actionable insights.`,
      })

      console.log("[v0] OpenAI analysis successful")
      return Response.json({ analysis, provider: "OpenAI GPT-4o-mini" })
    } catch (aiError) {
      console.error("[v0] AI analysis failed:", aiError instanceof Error ? aiError.message : aiError)
      // Fallback to local analysis
      const localAnalysis = analyzeContract(content, fileName, contractType || "venue")
      return Response.json({ analysis: localAnalysis, provider: "Local Analysis (AI fallback)" })
    }
  } catch (error) {
    console.error("[v0] Contract analysis error:", error)
    return Response.json(
      { error: "Failed to analyze contract", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
