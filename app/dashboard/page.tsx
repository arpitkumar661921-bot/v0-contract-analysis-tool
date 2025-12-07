import { DashboardOverview } from "@/components/dashboard/overview"
import { RecentContracts } from "@/components/dashboard/recent-contracts"
import { QuickActions } from "@/components/dashboard/quick-actions"

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back! Here's your contract analysis overview.</p>
      </div>
      <DashboardOverview />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RecentContracts />
        </div>
        <div>
          <QuickActions />
        </div>
      </div>
    </div>
  )
}
