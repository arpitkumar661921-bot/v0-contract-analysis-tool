import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Upload, GitCompare, MessageSquare, FileText } from "lucide-react"
import Link from "next/link"

export function QuickActions() {
  const actions = [
    {
      icon: Upload,
      label: "Upload Contract",
      description: "Scan a new contract",
      href: "/dashboard/upload",
      color: "text-primary",
    },
    {
      icon: GitCompare,
      label: "Compare Venues",
      description: "Side-by-side analysis",
      href: "/dashboard/compare",
      color: "text-chart-2",
    },
    {
      icon: MessageSquare,
      label: "Ask AI",
      description: "Get instant answers",
      href: "/dashboard/chat",
      color: "text-chart-3",
    },
    {
      icon: FileText,
      label: "Templates",
      description: "Generate contracts",
      href: "/dashboard/templates",
      color: "text-chart-5",
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {actions.map((action, index) => (
          <Link key={index} href={action.href}>
            <Button variant="outline" className="w-full justify-start gap-3 h-auto py-3 bg-transparent">
              <action.icon className={`h-5 w-5 ${action.color}`} />
              <div className="text-left">
                <p className="font-medium">{action.label}</p>
                <p className="text-xs text-muted-foreground">{action.description}</p>
              </div>
            </Button>
          </Link>
        ))}
      </CardContent>
    </Card>
  )
}
