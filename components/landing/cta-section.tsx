import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export function CTASection() {
  return (
    <section className="py-20 md:py-32">
      <div className="container mx-auto px-4">
        <div className="rounded-2xl bg-primary/10 border border-primary/20 p-8 md:p-16 text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4 text-balance">
            Ready to uncover hidden fees?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8 text-pretty">
            Join 10,000+ wedding planners and couples who trust ContractLens. Start your free trial today - no credit
            card required.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup">
              <Button size="lg" className="gap-2">
                Start Free Trial
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/demo">
              <Button size="lg" variant="outline">
                Request Demo
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
