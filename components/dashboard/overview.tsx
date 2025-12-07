import { Card, CardContent } from "@/components/ui/card"
import { FileText, AlertTriangle, DollarSign, TrendingUp } from "lucide-react"

export function DashboardOverview() {
  const stats = [
    {
      title: "Total Contracts",
      value: "12",
      change: "+3 this month",
      icon: FileText,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "Hidden Fees Found",
      value: "$8,450",
      change: "Across all contracts",
      icon: AlertTriangle,
      color: "text-destructive",
      bgColor: "bg-destructive/10",
    },
    {
      title: "Money Saved",
      value: "$4,200",
      change: "Through negotiations",
      icon: DollarSign,
      color: "text-success",
      bgColor: "bg-success/10",
    },
    {
      title: "Scans Remaining",
      value: "47",
      change: "Pro plan - unlimited",
      icon: TrendingUp,
      color: "text-chart-2",
      bgColor: "bg-chart-2/10",
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <Card key={index}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
            </div>
            <p className="text-2xl font-bold text-foreground">{stat.value}</p>
            <p className="text-sm text-muted-foreground mt-1">{stat.title}</p>
            <p className="text-xs text-muted-foreground/70 mt-2">{stat.change}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
