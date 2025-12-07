"use client"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Check } from "lucide-react"

export function PricingSection() {
  const plans = [
    {
      name: "Individual",
      description: "Perfect for couples",
      price: "₹99",
      period: "/month",
      features: [
        "5 contract scans/month",
        "Hidden fee detection",
        "Cost calculator",
        "1-page summary PDF",
        "Email support",
      ],
      cta: "Get Started",
      popular: false,
    },
    {
      name: "Planner",
      description: "For wedding planners",
      price: "₹1,999",
      period: "/month",
      features: [
        "Unlimited contract scans",
        "AI negotiation suggestions",
        "Venue comparison (up to 5)",
        "Contract templates",
        "Budget planner",
        "Multi-language support",
        "Priority support",
      ],
      cta: "Start Free Trial",
      popular: true,
    },
    {
      name: "Enterprise",
      description: "For agencies & venues",
      price: "₹4,999",
      period: "/month",
      features: [
        "Everything in Planner",
        "Team dashboard (10 users)",
        "Client sharing links",
        "API access",
        "Whitelabel branding",
        "Admin analytics",
        "Dedicated support",
      ],
      cta: "Contact Sales",
      popular: false,
    },
  ]

  return (
    <section id="pricing" className="py-20 md:py-32">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/50 px-4 py-1.5 text-sm mb-6">
            <span className="text-primary font-medium">Pricing</span>
            <span className="text-muted-foreground">Simple & Transparent</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4 text-balance">Choose Your Plan</h2>
          <p className="text-lg text-muted-foreground text-pretty">
            Start analyzing contracts today. Pay via bank transfer and get instant access after verification.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`rounded-xl border ${plan.popular ? "border-primary ring-2 ring-primary/20" : "border-border"} bg-card p-8 relative`}
            >
              {plan.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-medium px-3 py-1 rounded-full">
                  Most Popular
                </span>
              )}
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-foreground mb-1">{plan.name}</h3>
                <p className="text-sm text-muted-foreground">{plan.description}</p>
              </div>
              <div className="mb-6">
                <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                <span className="text-muted-foreground">{plan.period}</span>
              </div>
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-sm text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
              <Link href="/subscribe">
                <Button className="w-full" variant={plan.popular ? "default" : "outline"}>
                  {plan.cta}
                </Button>
              </Link>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-sm text-muted-foreground">
            All payments are processed via bank transfer. Your subscription will be activated within 24 hours after
            verification.
          </p>
        </div>
      </div>
    </section>
  )
}
