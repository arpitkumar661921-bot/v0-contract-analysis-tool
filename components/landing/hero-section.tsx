"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Play, Shield, Zap, FileSearch } from "lucide-react"

export function HeroSection() {
  return (
    <section className="relative overflow-hidden py-20 md:py-32">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background" />

      <div className="container relative mx-auto px-4">
        <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/50 px-4 py-1.5 text-sm mb-8">
            <span className="text-primary font-medium">New</span>
            <span className="text-muted-foreground">AI-Powered Contract Analysis</span>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-foreground mb-6 text-balance">
            Never Miss a <span className="text-primary">Hidden Fee</span> Again
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-10 text-pretty">
            Upload your venue contracts and let AI detect hidden charges, compare costs, and provide negotiation tips.
            Trusted by 10,000+ wedding planners and couples.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mb-16">
            <Link href="/signup">
              <Button size="lg" className="gap-2 text-base px-8">
                Start Free Trial
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="gap-2 text-base px-8 bg-transparent">
              <Play className="h-4 w-4" />
              Watch Demo
            </Button>
          </div>

          <div className="flex flex-wrap justify-center gap-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary" />
              <span>Bank-level security</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-primary" />
              <span>Results in 30 seconds</span>
            </div>
            <div className="flex items-center gap-2">
              <FileSearch className="h-4 w-4 text-primary" />
              <span>99% accuracy rate</span>
            </div>
          </div>
        </div>

        {/* Dashboard Preview */}
        <div className="mt-16 relative">
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10 pointer-events-none" />
          <div className="rounded-xl border border-border bg-card shadow-2xl overflow-hidden">
            <div className="bg-muted/50 border-b border-border px-4 py-3 flex items-center gap-2">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-destructive/60" />
                <div className="w-3 h-3 rounded-full bg-warning/60" />
                <div className="w-3 h-3 rounded-full bg-success/60" />
              </div>
              <span className="text-xs text-muted-foreground ml-2">ContractScan Dashboard</span>
            </div>
            <div className="p-6 bg-card">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="rounded-lg border border-border bg-muted/30 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-foreground">Hidden Fees Detected</span>
                    <span className="text-xs bg-destructive/20 text-destructive px-2 py-0.5 rounded">High Risk</span>
                  </div>
                  <p className="text-3xl font-bold text-destructive">$2,450</p>
                  <p className="text-xs text-muted-foreground mt-1">5 hidden charges found</p>
                </div>
                <div className="rounded-lg border border-border bg-muted/30 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-foreground">Total Contract Value</span>
                    <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded">Analyzed</span>
                  </div>
                  <p className="text-3xl font-bold text-foreground">$18,500</p>
                  <p className="text-xs text-muted-foreground mt-1">Including all fees & taxes</p>
                </div>
                <div className="rounded-lg border border-border bg-muted/30 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-foreground">Risk Score</span>
                    <span className="text-xs bg-warning/20 text-warning px-2 py-0.5 rounded">Medium</span>
                  </div>
                  <p className="text-3xl font-bold text-warning">6.5/10</p>
                  <p className="text-xs text-muted-foreground mt-1">3 clauses need attention</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
