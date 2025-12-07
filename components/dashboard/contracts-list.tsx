"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { FileText, Eye, Trash2, Download, Search, Plus } from "lucide-react"
import Link from "next/link"

const allContracts = [
  {
    id: "1",
    name: "Grand Ballroom Venue Contract",
    venue: "The Grand Hotel",
    uploadedAt: "Nov 26, 2025",
    status: "analyzed",
    riskLevel: "high",
    hiddenFees: "$2,450",
    totalValue: "$18,500",
    type: "Venue Rental",
  },
  {
    id: "2",
    name: "Catering Services Agreement",
    venue: "Elite Catering Co.",
    uploadedAt: "Nov 25, 2025",
    status: "analyzed",
    riskLevel: "medium",
    hiddenFees: "$890",
    totalValue: "$8,200",
    type: "Catering",
  },
  {
    id: "3",
    name: "Photography Package Contract",
    venue: "Moment Studios",
    uploadedAt: "Nov 23, 2025",
    status: "analyzed",
    riskLevel: "low",
    hiddenFees: "$150",
    totalValue: "$3,500",
    type: "Photography",
  },
  {
    id: "4",
    name: "DJ & Entertainment Agreement",
    venue: "SoundWave Entertainment",
    uploadedAt: "Nov 19, 2025",
    status: "analyzed",
    riskLevel: "low",
    hiddenFees: "$75",
    totalValue: "$1,800",
    type: "Entertainment",
  },
  {
    id: "5",
    name: "Florist & Decor Contract",
    venue: "Bloom & Petal",
    uploadedAt: "Nov 15, 2025",
    status: "analyzed",
    riskLevel: "medium",
    hiddenFees: "$340",
    totalValue: "$4,200",
    type: "Decor",
  },
]

export function ContractsList() {
  const [searchQuery, setSearchQuery] = useState("")
  const [filterType, setFilterType] = useState("all")

  const filteredContracts = allContracts.filter((contract) => {
    const matchesSearch =
      contract.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contract.venue.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFilter = filterType === "all" || contract.type.toLowerCase().includes(filterType.toLowerCase())
    return matchesSearch && matchesFilter
  })

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <CardTitle>All Contracts ({allContracts.length})</CardTitle>
          <div className="flex items-center gap-2">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search contracts..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <select
              className="h-10 px-3 rounded-md border border-input bg-background text-sm"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="all">All Types</option>
              <option value="venue">Venue</option>
              <option value="catering">Catering</option>
              <option value="photography">Photography</option>
              <option value="entertainment">Entertainment</option>
              <option value="decor">Decor</option>
            </select>
            <Link href="/dashboard/upload">
              <Button size="icon">
                <Plus className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Contract</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground hidden md:table-cell">
                  Type
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground hidden sm:table-cell">
                  Hidden Fees
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground hidden lg:table-cell">
                  Total Value
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Risk</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredContracts.map((contract) => (
                <tr key={contract.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <FileText className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground text-sm">{contract.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {contract.venue} • {contract.uploadedAt}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4 hidden md:table-cell">
                    <span className="text-sm text-muted-foreground">{contract.type}</span>
                  </td>
                  <td className="py-4 px-4 hidden sm:table-cell">
                    <span className="text-sm font-medium text-destructive">{contract.hiddenFees}</span>
                  </td>
                  <td className="py-4 px-4 hidden lg:table-cell">
                    <span className="text-sm text-foreground">{contract.totalValue}</span>
                  </td>
                  <td className="py-4 px-4">
                    <Badge
                      variant={
                        contract.riskLevel === "high"
                          ? "destructive"
                          : contract.riskLevel === "medium"
                            ? "default"
                            : "secondary"
                      }
                    >
                      {contract.riskLevel}
                    </Badge>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center justify-end gap-1">
                      <Link href={`/dashboard/contracts/${contract.id}`}>
                        <Button variant="ghost" size="icon">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button variant="ghost" size="icon">
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
