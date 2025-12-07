import { SettingsPage } from "@/components/dashboard/settings-page"

export default function Settings() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground">Manage your account and preferences</p>
      </div>
      <SettingsPage />
    </div>
  )
}
