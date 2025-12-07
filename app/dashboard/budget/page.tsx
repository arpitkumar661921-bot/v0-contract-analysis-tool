import { BudgetPlanner } from "@/components/dashboard/budget-planner"

export default function BudgetPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Budget Planner</h1>
        <p className="text-muted-foreground">Track and manage your total event budget</p>
      </div>
      <BudgetPlanner />
    </div>
  )
}
