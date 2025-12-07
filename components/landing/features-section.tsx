import { FileSearch, AlertTriangle, Calculator, GitCompare, MessageSquare, Globe, Users, Sparkles } from "lucide-react"

export function FeaturesSection() {
  const features = [
    {
      icon: FileSearch,
      title: "Smart Contract Upload",
      description: "Upload PDF, Word, or scanned images. Our OCR extracts every detail automatically.",
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      icon: AlertTriangle,
      title: "Hidden Fee Detection",
      description: "AI detects service charges, gratuity, corkage fees, overtime costs, and more.",
      color: "text-destructive",
      bgColor: "bg-destructive/10",
    },
    {
      icon: Calculator,
      title: "Total Cost Calculator",
      description: "See the true cost including all hidden fees, taxes, and optional charges.",
      color: "text-warning",
      bgColor: "bg-warning/10",
    },
    {
      icon: GitCompare,
      title: "Venue Comparison",
      description: "Compare up to 3 venues side-by-side. See fee differences instantly.",
      color: "text-chart-2",
      bgColor: "bg-chart-2/10",
    },
    {
      icon: MessageSquare,
      title: "AI Chat Assistant",
      description: "Ask questions about your contract. Get instant, plain-English explanations.",
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      icon: Sparkles,
      title: "Negotiation Tips",
      description: "AI-generated suggestions to help you negotiate better terms.",
      color: "text-chart-5",
      bgColor: "bg-chart-5/10",
    },
    {
      icon: Globe,
      title: "Multi-Language Support",
      description: "Analyze contracts in English, Hindi, Tamil, Telugu, and more.",
      color: "text-chart-3",
      bgColor: "bg-chart-3/10",
    },
    {
      icon: Users,
      title: "Team Collaboration",
      description: "Share contracts with clients. Perfect for wedding planners and agencies.",
      color: "text-chart-4",
      bgColor: "bg-chart-4/10",
    },
  ]

  return (
    <section id="features" className="py-20 md:py-32">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4 text-balance">
            Everything you need to analyze contracts
          </h2>
          <p className="text-lg text-muted-foreground text-pretty">
            From upload to insights in seconds. Our AI-powered platform handles the complexity so you don't have to.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group rounded-xl border border-border bg-card p-6 hover:border-primary/50 transition-all duration-300 hover:shadow-lg"
            >
              <div className={`w-12 h-12 rounded-lg ${feature.bgColor} flex items-center justify-center mb-4`}>
                <feature.icon className={`h-6 w-6 ${feature.color}`} />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
