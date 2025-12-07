import { VenueComparison } from "@/components/dashboard/venue-comparison"

export default function ComparePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Venue Comparison</h1>
        <p className="text-muted-foreground">Compare up to 3 contracts side by side</p>
      </div>
      <VenueComparison />
    </div>
  )
}
