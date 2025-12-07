"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { User, Bell, Globe, Shield, Check, Loader2 } from "lucide-react"
import { useUserStore } from "@/lib/user-store"

export function SettingsPage() {
  const { user, updateUser } = useUserStore()
  const [isSaving, setIsSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [mounted, setMounted] = useState(false)

  const [profile, setProfile] = useState({
    name: "",
    email: "",
    company: "",
    phone: "",
  })

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (user) {
      setProfile({
        name: user.name,
        email: user.email,
        company: user.company,
        phone: user.phone,
      })
    }
  }, [user])

  const [notifications, setNotifications] = useState({
    emailAnalysis: true,
    emailPayments: true,
    emailMarketing: false,
    pushAnalysis: true,
    pushReminders: true,
  })

  const [language, setLanguage] = useState("en")

  const handleSaveProfile = async () => {
    setIsSaving(true)
    await new Promise((resolve) => setTimeout(resolve, 1000))
    updateUser(profile)
    setIsSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const getPlanLabel = (plan: string) => {
    const labels: Record<string, string> = {
      free: "Free Trial",
      individual: "Individual",
      planner: "Planner",
      enterprise: "Enterprise",
    }
    return labels[plan] || plan
  }

  if (!mounted) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-64 bg-muted animate-pulse rounded-lg" />
        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-muted animate-pulse" />
              <div className="space-y-2">
                <div className="h-5 w-32 bg-muted animate-pulse rounded" />
                <div className="h-4 w-48 bg-muted animate-pulse rounded" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="h-10 bg-muted animate-pulse rounded" />
              <div className="h-10 bg-muted animate-pulse rounded" />
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <Tabs defaultValue="profile" className="space-y-6">
      <TabsList>
        <TabsTrigger value="profile" className="gap-2">
          <User className="h-4 w-4" />
          Profile
        </TabsTrigger>
        <TabsTrigger value="notifications" className="gap-2">
          <Bell className="h-4 w-4" />
          Notifications
        </TabsTrigger>
        <TabsTrigger value="preferences" className="gap-2">
          <Globe className="h-4 w-4" />
          Preferences
        </TabsTrigger>
        <TabsTrigger value="security" className="gap-2">
          <Shield className="h-4 w-4" />
          Security
        </TabsTrigger>
      </TabsList>

      <TabsContent value="profile">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="text-lg bg-primary text-primary-foreground">
                    {user ? getInitials(user.name) : "?"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle>{user?.name || "Guest User"}</CardTitle>
                  <CardDescription>{user?.email || "Please log in"}</CardDescription>
                </div>
              </div>
              {user && <Badge variant={user.plan === "free" ? "outline" : "default"}>{getPlanLabel(user.plan)}</Badge>}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  placeholder="Enter your name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  placeholder="Enter your email"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company">Company / Business Name</Label>
                <Input
                  id="company"
                  value={profile.company}
                  onChange={(e) => setProfile({ ...profile, company: e.target.value })}
                  placeholder="Enter company name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  placeholder="Enter phone number"
                />
              </div>
            </div>

            {user && (
              <div className="pt-4 border-t border-border">
                <h4 className="font-medium mb-2">Account Stats</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="text-2xl font-bold text-foreground">{user.scansUsed}</p>
                    <p className="text-xs text-muted-foreground">Contracts Analyzed</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="text-2xl font-bold text-foreground">
                      {user.scansLimit === 999 || user.scansLimit === 9999 ? "∞" : user.scansLimit - user.scansUsed}
                    </p>
                    <p className="text-xs text-muted-foreground">Scans Remaining</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="text-2xl font-bold text-foreground capitalize">{getPlanLabel(user.plan)}</p>
                    <p className="text-xs text-muted-foreground">Current Plan</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="text-2xl font-bold text-foreground capitalize">{user.role}</p>
                    <p className="text-xs text-muted-foreground">Account Type</p>
                  </div>
                </div>
              </div>
            )}

            <Button onClick={handleSaveProfile} disabled={isSaving}>
              {saved ? (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Saved!
                </>
              ) : isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="notifications">
        <Card>
          <CardHeader>
            <CardTitle>Notification Preferences</CardTitle>
            <CardDescription>Choose how you want to be notified</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4 className="font-medium mb-4">Email Notifications</h4>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">Contract Analysis Complete</p>
                    <p className="text-sm text-muted-foreground">Get notified when your contract analysis is ready</p>
                  </div>
                  <Switch
                    checked={notifications.emailAnalysis}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, emailAnalysis: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">Payment Confirmations</p>
                    <p className="text-sm text-muted-foreground">Receive payment and subscription updates</p>
                  </div>
                  <Switch
                    checked={notifications.emailPayments}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, emailPayments: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">Marketing & Tips</p>
                    <p className="text-sm text-muted-foreground">Contract tips and product updates</p>
                  </div>
                  <Switch
                    checked={notifications.emailMarketing}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, emailMarketing: checked })}
                  />
                </div>
              </div>
            </div>
            <div className="border-t border-border pt-6">
              <h4 className="font-medium mb-4">Push Notifications</h4>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">Analysis Alerts</p>
                    <p className="text-sm text-muted-foreground">Instant notifications for completed analyses</p>
                  </div>
                  <Switch
                    checked={notifications.pushAnalysis}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, pushAnalysis: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">Contract Reminders</p>
                    <p className="text-sm text-muted-foreground">Reminders for contract deadlines</p>
                  </div>
                  <Switch
                    checked={notifications.pushReminders}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, pushReminders: checked })}
                  />
                </div>
              </div>
            </div>
            <Button>Save Preferences</Button>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="preferences">
        <Card>
          <CardHeader>
            <CardTitle>Language & Region</CardTitle>
            <CardDescription>Set your preferred language and regional settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="language">Preferred Language</Label>
              <select
                id="language"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
              >
                <option value="en">English</option>
                <option value="hi">Hindi</option>
                <option value="ta">Tamil</option>
                <option value="te">Telugu</option>
                <option value="mr">Marathi</option>
                <option value="bn">Bengali</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <select id="currency" className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm">
                <option value="inr">INR (₹)</option>
                <option value="usd">USD ($)</option>
                <option value="gbp">GBP (£)</option>
                <option value="eur">EUR (€)</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="timezone">Timezone</Label>
              <select id="timezone" className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm">
                <option value="asia/kolkata">India Standard Time (IST)</option>
                <option value="america/new_york">Eastern Time (ET)</option>
                <option value="america/los_angeles">Pacific Time (PT)</option>
                <option value="europe/london">Greenwich Mean Time (GMT)</option>
              </select>
            </div>
            <Button>Save Preferences</Button>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="security">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>Update your password regularly for security</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current-password">Current Password</Label>
                <Input id="current-password" type="password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <Input id="new-password" type="password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm New Password</Label>
                <Input id="confirm-password" type="password" />
              </div>
              <Button>Update Password</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Two-Factor Authentication</CardTitle>
              <CardDescription>Add an extra layer of security to your account</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Enable 2FA</p>
                  <p className="text-sm text-muted-foreground">Require a verification code when logging in</p>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>

          <Card className="border-destructive/50">
            <CardHeader>
              <CardTitle className="text-destructive">Danger Zone</CardTitle>
              <CardDescription>Irreversible actions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Delete Account</p>
                  <p className="text-sm text-muted-foreground">Permanently delete your account and all data</p>
                </div>
                <Button variant="destructive">Delete Account</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </TabsContent>
    </Tabs>
  )
}
