import { TeamManagement } from "@/components/dashboard/team-management"

export default function TeamPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Team Management</h1>
        <p className="text-muted-foreground">Manage your team members and client access</p>
      </div>
      <TeamManagement />
    </div>
  )
}
