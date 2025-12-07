import { ContractAnalysis } from "@/components/dashboard/contract-analysis"

export default async function ContractDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  return (
    <div className="space-y-6">
      <ContractAnalysis contractId={id} />
    </div>
  )
}
