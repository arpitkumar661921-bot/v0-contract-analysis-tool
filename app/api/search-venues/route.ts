export async function POST(req: Request) {
  try {
    const { query, location } = await req.json()

    const apiKey = process.env.XAI_API_KEY
    if (!apiKey) {
      return Response.json(
        { error: "xAI API key not configured. Please add XAI_API_KEY to environment variables." },
        { status: 500 },
      )
    }

    const prompt = `You are a wedding venue expert. Search for REAL wedding venues matching:

Query: ${query}
Location: ${location || "India"}

Return 6 REAL venues as JSON array. Each venue MUST have:
- Real venue name and accurate location
- Realistic price range in Indian Rupees (₹)
- Real features and capacity
- A detailed imageKeyword for finding images (e.g., "taj palace hotel delhi ballroom", "leela palace bangalore wedding lawn")

All prices in ₹ with Indian numbering (₹10,00,000 = 10 lakhs).

JSON FORMAT:
[{
  "name": "Real Venue Name",
  "location": "City, State, India",
  "type": "Hotel/Palace/Resort/Banquet/Garden",
  "capacity": "200-500 guests",
  "priceRange": "₹10,00,000 - ₹25,00,000",
  "rating": 4.5,
  "features": ["Feature 1", "Feature 2", "Feature 3"],
  "bestFor": "Large traditional Indian weddings",
  "contact": "www.venue-website.com",
  "imageKeyword": "specific search term for this venue type",
  "description": "2-3 sentences about the venue",
  "amenities": ["Parking", "Catering", "Decor"],
  "venueHighlights": ["Celebrity weddings hosted", "Award-winning chef"]
}]

Return ONLY the JSON array.`

    const response = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "grok-3-mini-fast",
        messages: [
          {
            role: "system",
            content: "You are a wedding venue expert. Return valid JSON array only. All prices in ₹.",
          },
          { role: "user", content: prompt },
        ],
        temperature: 0.5,
        max_tokens: 3000,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`xAI API error: ${response.status} - ${errorText}`)
    }

    const data = await response.json()
    const text = data.choices?.[0]?.message?.content

    if (!text) {
      throw new Error("No response from xAI API")
    }

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
