export async function POST(req: Request) {
  try {
    const { contracts } = await req.json()

    if (!contracts || contracts.length < 2) {
      return Response.json({ error: "At least 2 contracts required for comparison" }, { status: 400 })
    }

    const apiKey = process.env.OPENAI_API_KEY || process.env.OPENAI_KEY
    if (!apiKey) {
      return Response.json(
        { error: "OpenAI API key not configured. Please add OPENAI_API_KEY to environment variables." },
        { status: 500 },
      )
    }

    const contractSummaries = contracts
      .map(
        (c: any, i: number) => `
════════════════════════════════════════════════════════════════
CONTRACT ${i + 1}: ${c.name}
════════════════════════════════════════════════════════════════
File: ${c.fileName}

💰 PRICING (Indian Rupees ₹):
   • Base Price: ${c.basePrice || "Not extracted"}
   • Total Estimated Value: ${c.totalValue || "Not extracted"}
   • Risk Score: ${c.riskScore}/10

💸 HIDDEN FEES IDENTIFIED:
${
  c.hiddenFees?.length > 0
    ? c.hiddenFees
        .map((f: any) => `   • ${f.name}: ${f.amount} [${f.severity.toUpperCase()}] - ${f.description || ""}`)
        .join("\n")
    : "   None identified"
}

⚠️ RISK FACTORS:
${
  c.risks?.length > 0
    ? c.risks.map((r: any) => `   • ${r.title} [${r.severity.toUpperCase()}]: ${r.description}`).join("\n")
    : "   None identified"
}

✅ POSITIVE ASPECTS:
${c.positives?.length > 0 ? c.positives.map((p: string) => `   • ${p}`).join("\n") : "   None identified"}

📋 SUMMARY: ${c.summary || "No summary available"}

${c.contentSnippet ? `\n📄 CONTRACT TEXT EXCERPT:\n${c.contentSnippet.substring(0, 3000)}` : ""}
────────────────────────────────────────────────────────────────`,
      )
      .join("\n\n")

    const prompt = `You are an expert Indian wedding contract analyst. Compare these ${contracts.length} venue contracts and provide a comprehensive comparison.

${contractSummaries}

═══════════════════════════════════════════════════════════════════
PROVIDE DETAILED COMPARISON REPORT
═══════════════════════════════════════════════════════════════════

Based on the ACTUAL DATA provided above, create this comparison:

## 💰 PRICE COMPARISON
Create a clear comparison showing:
- Venue Name | Base Price | Total Hidden Fees | Final Estimated Cost | Risk Score
Use EXACT amounts from the contracts in ₹.

## 📊 DETAILED COST BREAKDOWN
For EACH contract:
- List every fee with exact amount
- Calculate total of all fees
- Show hidden fees as % of base price

## ⚠️ RISK ANALYSIS
- Compare risk scores
- List most critical risks from each
- Identify any deal-breakers

## ✅ PROS AND CONS
For EACH venue:
- Top 3 advantages
- Top 3 disadvantages

## 🤝 NEGOTIATION OPPORTUNITIES
For EACH contract:
- What terms can be negotiated
- Potential savings
- Specific suggestions

## 🏆 RECOMMENDATION
- RECOMMENDED: [Venue Name]
- WHY: [Specific data-backed reasons]
- POTENTIAL SAVINGS: [Amount in ₹]

Use ONLY actual data from the contracts. ALL amounts in Indian Rupees (₹).`

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
              "You are an expert Indian wedding contract analyst. Analyze using ONLY the actual data provided. Be specific with numbers. All amounts in Indian Rupees (₹) with Indian formatting. Use markdown for formatting.",
          },
          { role: "user", content: prompt },
        ],
        temperature: 0.2,
        max_tokens: 4000,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("[v0] OpenAI API error:", response.status, errorText)
      throw new Error(`OpenAI API error: ${response.status} - ${errorText}`)
    }

    const data = await response.json()
    const text = data.choices?.[0]?.message?.content

    if (!text) {
      throw new Error("No response from OpenAI API")
    }

    return Response.json({ comparison: text })
  } catch (error) {
    console.error("Compare contracts error:", error)
    return Response.json(
      { error: "Failed to compare contracts", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
