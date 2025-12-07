import { generateText } from "ai"
import { createOpenAI } from "@ai-sdk/openai"

const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY || "",
})

export async function POST(req: Request) {
  try {
    const { message, contractContext } = await req.json()

    if (!process.env.OPENAI_API_KEY) {
      return Response.json({ error: "OpenAI API key not configured" }, { status: 500 })
    }

    const { text } = await generateText({
      model: openai("gpt-4o-mini"),
      system: `You are an expert contract analyst assistant for ContractScan, a wedding and event contract analysis platform.

You help users:
- Understand contract terms and clauses
- Identify hidden fees and charges
- Assess risks and red flags
- Provide negotiation strategies
- Calculate total costs
- Compare different venues

${contractContext ? `Current context:\n${contractContext}` : ""}

Provide helpful, accurate, and actionable advice. Use markdown formatting with bullet points, bold text, and tables where appropriate.`,
      prompt: message,
    })

    return Response.json({ response: text })
  } catch (error) {
    console.error("AI Chat error:", error)
    return Response.json(
      { error: "Failed to get AI response", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
