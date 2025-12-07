import { ContractTemplates } from "@/components/dashboard/contract-templates"

export default function TemplatesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Contract Templates</h1>
        <p className="text-muted-foreground">Generate professional contracts and addendums</p>
      </div>
      <ContractTemplates />
    </div>
  )
}
