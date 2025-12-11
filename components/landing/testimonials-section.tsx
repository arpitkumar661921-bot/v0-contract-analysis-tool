import { Star } from "lucide-react"

export function TestimonialsSection() {
  const testimonials = [
    {
      quote: "ContractLens saved me over $3,000 on my wedding venue. I had no idea there were so many hidden fees!",
      author: "Sarah M.",
      role: "Bride, NYC",
      rating: 5,
    },
    {
      quote:
        "As a wedding planner, this tool has become essential. I can analyze contracts in seconds and give clients confidence.",
      author: "James K.",
      role: "Wedding Planner, LA",
      rating: 5,
    },
    {
      quote: "The AI chat is incredible. I asked about a confusing clause and got a clear explanation instantly.",
      author: "Priya S.",
      role: "Event Coordinator, Mumbai",
      rating: 5,
    },
  ]

  return (
    <section className="py-20 md:py-32 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4 text-balance">Trusted by thousands</h2>
          <p className="text-lg text-muted-foreground text-pretty">
            See what wedding planners and couples say about ContractLens
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="rounded-xl border border-border bg-card p-6">
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                ))}
              </div>
              <p className="text-foreground mb-6 text-pretty">"{testimonial.quote}"</p>
              <div>
                <p className="font-semibold text-foreground">{testimonial.author}</p>
                <p className="text-sm text-muted-foreground">{testimonial.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
