import { generateText } from "ai"
import { createOpenAI } from "@ai-sdk/openai"

const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY || "",
})

export async function POST(req: Request) {
  try {
    const { query, location } = await req.json()

    if (!process.env.OPENAI_API_KEY) {
      return Response.json({ error: "OpenAI API key not configured" }, { status: 500 })
    }

    const { text } = await generateText({
      model: openai("gpt-4o-mini"),
      prompt: `You are a wedding venue expert in India. Search and provide information about wedding venues based on this query:

Query: ${query}
Location preference: ${location || "India"}

Provide 6 real wedding venues that match this query. For each venue include accurate, real information.

Format as JSON array:
[{
  "name": "Venue Name",
  "location": "City, State",
  "type": "Hotel/Resort/Banquet/Palace/Beach",
  "capacity": "100-500 guests",
  "priceRange": "5L - 15L",
  "rating": 4.5,
  "features": ["feature1", "feature2", "feature3"],
  "bestFor": "Large traditional weddings",
  "contact": "website or phone"
}]

Only return the JSON array, no other text.`,
    })

    const jsonMatch = text.match(/\[[\s\S]*\]/)
    if (jsonMatch) {
      const venues = JSON.parse(jsonMatch[0])
      return Response.json({ venues })
    }

    return Response.json({ venues: [], error: "Could not parse venues" })
  } catch (error) {
    console.error("Venue search error:", error)
    return Response.json(
      { error: "Failed to search venues", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
