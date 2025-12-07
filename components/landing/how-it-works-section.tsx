import { Upload, Cpu, FileText, CheckCircle } from "lucide-react"

export function HowItWorksSection() {
  const steps = [
    {
      icon: Upload,
      step: "01",
      title: "Upload Your Contract",
      description: "Drag and drop your PDF, Word doc, or scanned image. We support all major formats.",
    },
    {
      icon: Cpu,
      step: "02",
      title: "AI Analyzes Everything",
      description: "Our AI extracts text, identifies fees, calculates totals, and flags risky clauses.",
    },
    {
      icon: FileText,
      step: "03",
      title: "Get Your Report",
      description: "Receive a detailed breakdown with hidden fees highlighted and total costs calculated.",
    },
    {
      icon: CheckCircle,
      step: "04",
      title: "Make Informed Decisions",
      description: "Use our negotiation tips and venue comparison to get the best deal.",
    },
  ]

  return (
    <section id="how-it-works" className="py-20 md:py-32 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4 text-balance">How ContractScan Works</h2>
          <p className="text-lg text-muted-foreground text-pretty">
            Get from confusion to clarity in four simple steps
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((item, index) => (
            <div key={index} className="relative">
              <div className="flex flex-col items-center text-center">
                <div className="relative mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <item.icon className="h-8 w-8 text-primary" />
                  </div>
                  <span className="absolute -top-2 -right-2 text-xs font-bold text-primary bg-primary/20 rounded-full w-6 h-6 flex items-center justify-center">
                    {item.step}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </div>
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-8 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-primary/50 to-transparent" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
