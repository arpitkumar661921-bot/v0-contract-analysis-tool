"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FileText, Eye, MoreVertical } from "lucide-react"
import Link from "next/link"

const contracts = [
  {
    id: "1",
    name: "Grand Ballroom Venue Contract",
    venue: "The Grand Hotel",
    uploadedAt: "2 hours ago",
    status: "analyzed",
    riskLevel: "high",
    hiddenFees: "$2,450",
  },
  {
    id: "2",
    name: "Catering Services Agreement",
    venue: "Elite Catering Co.",
    uploadedAt: "1 day ago",
    status: "analyzed",
    riskLevel: "medium",
    hiddenFees: "$890",
  },
  {
    id: "3",
    name: "Photography Package Contract",
    venue: "Moment Studios",
    uploadedAt: "3 days ago",
    status: "analyzed",
    riskLevel: "low",
    hiddenFees: "$150",
  },
  {
    id: "4",
    name: "DJ & Entertainment Agreement",
    venue: "SoundWave Entertainment",
    uploadedAt: "1 week ago",
    status: "pending",
    riskLevel: "pending",
    hiddenFees: "Analyzing...",
  },
]

export function RecentContracts() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Recent Contracts</CardTitle>
        <Link href="/dashboard/contracts">
          <Button variant="ghost" size="sm">
            View All
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {contracts.map((contract) => (
            <div
              key={contract.id}
              className="flex items-center justify-between p-4 rounded-lg border border-border bg-muted/30 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="p-2 rounded-lg bg-primary/10">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground">{contract.name}</p>
                  <p className="text-sm text-muted-foreground">{contract.venue}</p>
                  <p className="text-xs text-muted-foreground/70 mt-1">{contract.uploadedAt}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right hidden sm:block">
                  <Badge
                    variant={
                      contract.riskLevel === "high"
                        ? "destructive"
                        : contract.riskLevel === "medium"
                          ? "default"
                          : contract.riskLevel === "low"
                            ? "secondary"
                            : "outline"
                    }
                  >
                    {contract.riskLevel === "pending" ? "Pending" : `${contract.riskLevel} risk`}
                  </Badge>
                  <p className="text-sm text-muted-foreground mt-1">{contract.hiddenFees}</p>
                </div>
                <Link href={`/dashboard/contracts/${contract.id}`}>
                  <Button variant="ghost" size="icon">
                    <Eye className="h-4 w-4" />
                  </Button>
                </Link>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
