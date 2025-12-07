import { ContractsList } from "@/components/dashboard/contracts-list"

export default function ContractsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">My Contracts</h1>
          <p className="text-muted-foreground">View and manage all your analyzed contracts</p>
        </div>
      </div>
      <ContractsList />
    </div>
  )
}
