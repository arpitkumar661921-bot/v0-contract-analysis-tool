export async function POST(req: Request) {
  try {
    const { message, contractContext } = await req.json()

    const apiKey = process.env.OPENAI_API_KEY || process.env.OPENAI_KEY
    if (!apiKey) {
      return Response.json(
        { error: "OpenAI API key not configured. Please add OPENAI_API_KEY to environment variables." },
        { status: 500 },
      )
    }

    const systemPrompt = `You are an expert wedding/event contract analyst for ContractScan.

CRITICAL RULES:
1. ALL monetary amounts MUST be in Indian Rupees (₹)
2. Use Indian number format: ₹1,00,000 (one lakh), ₹10,00,000 (ten lakhs), ₹1,00,00,000 (one crore)
3. If you see USD ($) amounts, convert them: $1 = ₹83
4. Provide SPECIFIC answers using ACTUAL data from the contract
5. Quote exact numbers, dates, percentages from the contract
6. If information is not in the contract, clearly state "This is not mentioned in the contract"

${
  contractContext
    ? `
═══════════════════════════════════════════════════════
CURRENT CONTRACT DATA:
═══════════════════════════════════════════════════════
${contractContext}
═══════════════════════════════════════════════════════

Use this contract data to answer questions. Be specific with numbers and terms.
`
    : "No specific contract loaded. You can help with general questions about wedding venue contracts."
}

When calculating total cost:
1. Start with Base Price
2. Add all fees (service charge %, GST %, etc.)
3. Add any per-person costs × number of guests
4. Show step-by-step breakdown
5. Display all amounts in ₹ (Indian Rupees)`

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message },
        ],
        temperature: 0.7,
        max_tokens: 2000,
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

    return Response.json({ response: text })
  } catch (error) {
    console.error("AI Chat error:", error instanceof Error ? error.message : error)
    return Response.json(
      { error: "Failed to get AI response", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
