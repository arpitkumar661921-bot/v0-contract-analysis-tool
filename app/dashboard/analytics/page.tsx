import { AnalyticsDashboard } from "@/components/dashboard/analytics-dashboard"

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
        <p className="text-muted-foreground">Track your contract analysis metrics and insights</p>
      </div>
      <AnalyticsDashboard />
    </div>
  )
}
