import { BillingPage } from "@/components/dashboard/billing-page"

export default function Billing() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Billing & Subscription</h1>
        <p className="text-muted-foreground">Manage your subscription and payment methods</p>
      </div>
      <BillingPage />
    </div>
  )
}
