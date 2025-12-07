export function StatsSection() {
  const stats = [
    { value: "$12M+", label: "Hidden fees detected", company: "For our users" },
    { value: "10,000+", label: "Contracts analyzed", company: "Monthly" },
    { value: "98%", label: "Customer satisfaction", company: "Rating" },
    { value: "30 sec", label: "Average analysis time", company: "Per contract" },
  ]

  return (
    <section className="border-y border-border bg-muted/30">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <p className="text-3xl md:text-4xl font-bold text-foreground mb-1">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              <p className="text-xs text-muted-foreground/70 mt-1">{stat.company}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
