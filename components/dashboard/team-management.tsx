"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { UserPlus, Mail, Shield, Users, Link2, Send, Check, Loader2, Trash2 } from "lucide-react"

type TeamMember = {
  id: string
  name: string
  email: string
  role: "Admin" | "Member" | "Viewer"
  status: "active" | "pending"
  contracts: number
}

type SharedClient = {
  id: string
  name: string
  email: string
  contracts: number
  sharedAt: string
}

export function TeamManagement() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([
    { id: "1", name: "You (Owner)", email: "you@email.com", role: "Admin", status: "active", contracts: 12 },
  ])
  const [sharedClients, setSharedClients] = useState<SharedClient[]>([])
  const [showInviteDialog, setShowInviteDialog] = useState(false)
  const [showClientDialog, setShowClientDialog] = useState(false)
  const [inviteEmail, setInviteEmail] = useState("")
  const [inviteRole, setInviteRole] = useState<"Member" | "Admin" | "Viewer">("Member")
  const [clientName, setClientName] = useState("")
  const [clientEmail, setClientEmail] = useState("")
  const [isSending, setIsSending] = useState(false)
  const [inviteSent, setInviteSent] = useState(false)

  const handleSendInvite = async () => {
    if (!inviteEmail.trim()) return

    setIsSending(true)

    // Simulate sending invite
    await new Promise((resolve) => setTimeout(resolve, 1500))

    const newMember: TeamMember = {
      id: Date.now().toString(),
      name: inviteEmail.split("@")[0],
      email: inviteEmail,
      role: inviteRole,
      status: "pending",
      contracts: 0,
    }

    setTeamMembers((prev) => [...prev, newMember])
    setIsSending(false)
    setInviteSent(true)

    setTimeout(() => {
      setShowInviteDialog(false)
      setInviteEmail("")
      setInviteSent(false)
    }, 1500)
  }

  const handleShareWithClient = async () => {
    if (!clientEmail.trim() || !clientName.trim()) return

    setIsSending(true)
    await new Promise((resolve) => setTimeout(resolve, 1500))

    const newClient: SharedClient = {
      id: Date.now().toString(),
      name: clientName,
      email: clientEmail,
      contracts: 0,
      sharedAt: "Just now",
    }

    setSharedClients((prev) => [...prev, newClient])
    setIsSending(false)
    setInviteSent(true)

    setTimeout(() => {
      setShowClientDialog(false)
      setClientName("")
      setClientEmail("")
      setInviteSent(false)
    }, 1500)
  }

  const removeMember = (id: string) => {
    if (id === "1") return // Can't remove owner
    setTeamMembers((prev) => prev.filter((m) => m.id !== id))
  }

  const removeClient = (id: string) => {
    setSharedClients((prev) => prev.filter((c) => c.id !== id))
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Team Members ({teamMembers.length})
            </CardTitle>
            <Button size="sm" onClick={() => setShowInviteDialog(true)}>
              <UserPlus className="h-4 w-4 mr-2" />
              Invite Member
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {teamMembers.map((member) => (
                <div key={member.id} className="flex items-center justify-between p-4 rounded-lg border border-border">
                  <div className="flex items-center gap-4">
                    <Avatar>
                      <AvatarFallback>
                        {member.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-foreground">{member.name}</p>
                        {member.role === "Admin" && <Shield className="h-4 w-4 text-primary" />}
                      </div>
                      <p className="text-sm text-muted-foreground">{member.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right hidden sm:block">
                      <Badge variant={member.status === "active" ? "default" : "outline"}>
                        {member.status === "pending" ? "Pending" : member.role}
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">{member.contracts} contracts</p>
                    </div>
                    {member.id !== "1" && (
                      <Button variant="ghost" size="icon" onClick={() => removeMember(member.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Link2 className="h-5 w-5" />
              Shared with Clients ({sharedClients.length})
            </CardTitle>
            <Button size="sm" variant="outline" onClick={() => setShowClientDialog(true)}>
              <UserPlus className="h-4 w-4 mr-2" />
              Share with Client
            </Button>
          </CardHeader>
          <CardContent>
            {sharedClients.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No clients yet. Share contracts with your clients to collaborate.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {sharedClients.map((client) => (
                  <div
                    key={client.id}
                    className="flex items-center justify-between p-4 rounded-lg border border-border"
                  >
                    <div className="flex items-center gap-4">
                      <Avatar>
                        <AvatarFallback>
                          {client.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-foreground">{client.name}</p>
                        <p className="text-sm text-muted-foreground">{client.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right hidden sm:block">
                        <p className="text-sm text-foreground">{client.contracts} contracts shared</p>
                        <p className="text-xs text-muted-foreground">{client.sharedAt}</p>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => removeClient(client.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Quick Invite</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Input
                type="email"
                placeholder="colleague@agency.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <select
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value as "Member" | "Admin" | "Viewer")}
              >
                <option value="Member">Member</option>
                <option value="Admin">Admin</option>
                <option value="Viewer">Viewer (read-only)</option>
              </select>
            </div>
            <Button className="w-full" onClick={handleSendInvite} disabled={!inviteEmail.trim() || isSending}>
              {isSending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Mail className="h-4 w-4 mr-2" />}
              Send Invitation
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Plan Usage</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">Team Members</span>
                <span className="text-foreground font-medium">{teamMembers.length} / 10</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full" style={{ width: `${teamMembers.length * 10}%` }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">Client Shares</span>
                <span className="text-foreground font-medium">{sharedClients.length} / 25</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full" style={{ width: `${sharedClients.length * 4}%` }} />
              </div>
            </div>
            <Button variant="outline" className="w-full bg-transparent">
              Upgrade Plan
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Invite Team Member Dialog */}
      <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite Team Member</DialogTitle>
            <DialogDescription>Send an invitation to join your team on ContractScan.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="colleague@company.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <select
                id="role"
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value as "Member" | "Admin" | "Viewer")}
              >
                <option value="Member">Member - Can upload and analyze contracts</option>
                <option value="Admin">Admin - Full access including billing</option>
                <option value="Viewer">Viewer - Read-only access</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowInviteDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSendInvite} disabled={!inviteEmail.trim() || isSending}>
              {inviteSent ? (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Sent!
                </>
              ) : isSending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Send Invite
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Share with Client Dialog */}
      <Dialog open={showClientDialog} onOpenChange={setShowClientDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share with Client</DialogTitle>
            <DialogDescription>Invite a client to view their contract analysis.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="clientName">Client Name</Label>
              <Input
                id="clientName"
                placeholder="John & Jane"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="clientEmail">Email Address</Label>
              <Input
                id="clientEmail"
                type="email"
                placeholder="client@email.com"
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowClientDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleShareWithClient} disabled={!clientEmail.trim() || !clientName.trim() || isSending}>
              {inviteSent ? (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Shared!
                </>
              ) : isSending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Sharing...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Share Access
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
